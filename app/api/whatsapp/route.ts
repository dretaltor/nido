import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { notificarAsesorBlack } from '../../../lib/whatsappNotify'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nido-webhook-2026'
const WA_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_ID = process.env.WHATSAPP_PHONE_ID || '1156099824249418'

// Verificación webhook Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// Recibir mensajes
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Verificar que el mensaje viene realmente de Meta (HMAC-SHA256), no de cualquiera
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (appSecret) {
    const signature = req.headers.get('x-hub-signature-256') || ''
    const expectedSig = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSig)
    const valido = sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    if (!valido) {
      console.error('Firma de webhook WhatsApp invalida — posible solicitud falsa')
      return NextResponse.json({ error: 'Firma invalida' }, { status: 401 })
    }
  } else {
    console.warn('WHATSAPP_APP_SECRET no configurado — el webhook no esta verificando el origen de los mensajes')
  }

  const body = JSON.parse(rawBody)

  try {
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    if (!message) return NextResponse.json({ ok: true })

    const from = message.from
    const text = message.text?.body || ''
    const msgType = message.type

    if (msgType !== 'text') {
      const msg = msgType === 'audio'
        ? 'Hola, soy Valeria de NIDO 🏠 Todavía no puedo escuchar notas de voz — ¿me lo escribís en texto? Así te respondo al toque.'
        : 'Hola, soy Valeria de NIDO 🏠 Por ahora solo proceso mensajes de texto. ¿En qué puedo ayudarte?'
      await sendWA(from, msg)
      return NextResponse.json({ ok: true })
    }

    // Check if user exists in system
    const [{ data: asesor }, { data: propietario }] = await Promise.all([
      supabaseAdmin.from('perfiles').select('nombre, correo, telefono, plan').eq('telefono', from).maybeSingle(),
      supabaseAdmin.from('propietarios').select('nombre, correo').eq('telefono', from).maybeSingle(),
    ])

    const userName = asesor?.nombre || propietario?.nombre || null
    const userType = asesor ? 'asesor' : propietario ? 'propietario' : 'comprador'
    const esAsesorBlack = asesor?.plan === 'enterprise'

    // Historial reciente de esta conversacion — sin esto Valeria no tiene memoria entre mensajes
    // y no puede entender referencias como "sí, contactame" o "la segunda opción".
    const { data: historialRows } = await supabaseAdmin
      .from('whatsapp_logs')
      .select('message, reply, created_at')
      .eq('from_number', from)
      .order('created_at', { ascending: false })
      .limit(6)

    const historialMensajes = (historialRows || [])
      .slice()
      .reverse()
      .flatMap((h) => [
        { role: 'user' as const, content: h.message },
        { role: 'assistant' as const, content: h.reply },
      ])

    // Call Valeria AI
    const sistemaPrompt = `Sos Valeria, la asistente IA de NIDO — plataforma inmobiliaria premium de Costa Rica.
Respondés por WhatsApp — mensajes cortos, claros y directos. Máximo 3 párrafos.
${userName ? 'Estás hablando con ' + userName + ', ' + userType + ' de NIDO.' : 'Es un usuario nuevo — podría ser comprador, vendedor o asesor.'}
${userType === 'asesor' ? `
Este es un ASESOR registrado en NIDO (plan ${esAsesorBlack ? 'Black' : asesor?.plan || 'Despega'}). Además de lo de comprador, podés ayudarlo con:
- Ver SUS propias propiedades publicadas (si pregunta "mis propiedades", "lo que tengo publicado", etc): respondé con {"action":"mis_propiedades"}
- Capacitación: si pregunta cómo mejorar sus ventas, usar la plataforma, o "capacitarme", mencioná la Academia NIDO en nido-cr.com/academia con cursos y certificaciones.
- Dudas sobre comisiones, KYC, contratos o el funcionamiento de NIDO.
${esAsesorBlack ? `- Es plan Black: actuás como su MENTOR experto del mercado inmobiliario costarricense — no solo con datos de NIDO, sino con tu conocimiento general del mercado (como si le respondieras a un colega en un chat). Si pregunta por precios, precio por m², tendencias de una zona, en qué zona conviene invertir, comparación entre zonas, o cualquier duda de mercado/inversión, respondé con {"action":"consulta_mercado","zona":"zona mencionada o null","pregunta":"resumen breve de lo que pregunta"}.
- Es plan Black: si te pide un CMA (análisis comparativo de mercado) o "cuánto le pongo de precio" a una propiedad específica que te describe (ubicación, tipo, m², habitaciones, condición, etc), respondé con {"action":"cma_propiedad","zona":"zona mencionada","descripcion":"resumen de las características que te dio"}.
- Es plan Black: si te pide redactar algo (descripción de una propiedad, mensaje de seguimiento para un lead, post para redes sociales, respuesta a un cliente), escribíselo vos misma directo en texto, bien redactado y listo para copiar/pegar — no hace falta JSON para esto, es parte de tu rol de asistente.
- Es plan Black: si te pide hablar con una persona del equipo NIDO, escalar un problema, o algo que vos no puedas resolver, respondé con {"action":"escalar_soporte","motivo":"resumen breve del problema"} — se crea un ticket con prioridad alta.` : `- NO es plan Black: si pregunta por precios de mercado, tendencias de zona, pide un CMA, o pide asesoría de inversión, respondé en texto que Valeria como mentora de mercado en tiempo real es un beneficio exclusivo del plan Black, y que puede hacer upgrade en nido-cr.com/precios. Si pide hablar con una persona del equipo NIDO, respondé con {"action":"escalar_soporte","motivo":"resumen breve del problema"}.`}
` : ''}
${userType === 'comprador' ? `
Es un COMPRADOR. Si en algún momento de la conversación muestra intención concreta (quiere que lo contacten, quiere agendar visita, elige una propiedad específica de las que le mostraste, pide condiciones/negociación, o pide hablar con un asesor), respondé con el JSON: {"action":"conectar_asesor","zona":"zona de interés o null","tipo":"tipo de propiedad o null","nombre":"nombre si lo mencionó o null","propiedad_id":"id de la propiedad si eligió una de las que le mostraste antes, o null"} — esto te permite conectarlo con el asesor a cargo. Usá el historial de la conversación para saber a qué propiedad se refiere.
Si tiene una queja o problema que no podés resolver vos (no relacionado a buscar propiedades), respondé con {"action":"escalar_soporte","motivo":"resumen breve del problema"}.
` : ''}
Ayudás con: consultas sobre propiedades, proceso de compra/venta, información sobre NIDO, agendar visitas.
Siempre terminá con una pregunta o siguiente paso concreto.
Si el usuario pregunta por propiedades (que NO sean las suyas si es asesor) sin mostrar intención concreta todavía, DEBES responder con el JSON especial: {"action":"buscar_propiedades","zona":"zona mencionada o null","tipo":"casa/apartamento/lote/local o null","precio_max":numero_o_null}
Para cualquier otra consulta, responde normalmente en texto.`

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: sistemaPrompt,
        messages: [...historialMensajes, { role: 'user', content: text }]
      })
    })

    const aiData = await aiRes.json()
    const reply = aiData.content?.[0]?.text || 'Hola, soy Valeria de NIDO 🏠 ¿En qué puedo ayudarte?'

    // Check if Valeria returned a JSON action
    let finalReply = reply
    try {
      const jsonMatch = reply.match(/\{[^}]*"action"[^}]*\}/)
      if (jsonMatch) {
        const action = JSON.parse(jsonMatch[0])
        
        if (action.action === 'buscar_propiedades') {
          let query = supabaseAdmin.from('propiedades').select('id, titulo, zona, precio, tipo, operacion, ref_id').eq('disponible', true).eq('verificacion_estado', 'aprobada').limit(3)
          if (action.zona) query = query.ilike('zona', '%' + action.zona + '%')
          if (action.tipo) query = query.eq('tipo', action.tipo)
          if (action.precio_max) query = query.lte('precio', action.precio_max)
          
          const { data: props } = await query
          
          if (props && props.length > 0) {
            finalReply = '🏠 *Propiedades disponibles en NIDO:*\n\n' + props.map((p, i) => 
              `${i+1}. *${p.titulo}*\n📍 ${p.zona} | ${p.tipo}\n💰 $${Number(p.precio).toLocaleString()} USD\n🔖 ${p.ref_id || ''}\n🔗 nido-cr.com/propiedades/${p.id}`
            ).join('\n\n') + '\n\n¿Te interesa alguna? Puedo darte más detalles o agendar una visita. 😊'
          } else {
            finalReply = '🔍 No encontré propiedades con esos criterios en este momento.\n\nPodés ver todas las opciones disponibles en:\n🌐 www.nido-cr.com/propiedades\n\n¿Querés que amplíe la búsqueda?'
          }
        } else if (action.action === 'consulta_mercado' && esAsesorBlack) {
          // Complementamos el conocimiento general del mercado (lo que ya sabe el modelo)
          // con datos reales de NIDO cuando hay suficientes propiedades activas en la zona.
          let datosInternos = 'No mencionó una zona especifica o no hay suficientes propiedades activas de NIDO ahi — respondé solo con tu conocimiento general del mercado costarricense.'
          if (action.zona) {
            const { data: comps } = await supabaseAdmin.from('propiedades').select('precio, metros').eq('disponible', true).eq('verificacion_estado', 'aprobada').ilike('zona', '%' + action.zona + '%').gt('metros', 0)
            const validos = (comps || []).filter(p => p.precio && p.metros)
            if (validos.length > 0) {
              const promedios = validos.map(p => Number(p.precio) / Number(p.metros))
              const promedioM2 = promedios.reduce((a, b) => a + b, 0) / promedios.length
              datosInternos = `Dato real de NIDO para ${action.zona}: precio promedio $${Math.round(promedioM2).toLocaleString()}/m² sobre ${validos.length} propiedad${validos.length === 1 ? '' : 'es'} activa${validos.length === 1 ? '' : 's'}. Usalo como un dato más dentro de tu análisis, no como tu única fuente — complementalo con tu conocimiento general del mercado de esa zona.`
            }
          }

          const mentorRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 500,
              system: `Sos Valeria, mentora experta del mercado inmobiliario de Costa Rica, asesorando por WhatsApp a ${userName || 'un asesor'}, agente profesional del plan Black de NIDO. Respondé como lo haría un analista de mercado sénior conversando con un colega: cifras orientativas, tendencias, factores de valorización (infraestructura, turismo, nómadas digitales, oferta/demanda), comparación con zonas similares si aplica, y una recomendación práctica y accionable. Usá tu conocimiento general del mercado inmobiliario costarricense — no te limites a lo que hay publicado en NIDO. ${datosInternos} Formato WhatsApp: directo, sin relleno, máximo 4 párrafos cortos, terminá con una pregunta o siguiente paso concreto.`,
              messages: [{ role: 'user', content: action.pregunta || text }]
            })
          })
          const mentorData = await mentorRes.json()
          finalReply = mentorData.content?.[0]?.text || 'No pude armar el análisis en este momento — ¿me lo repetís de otra forma?'
        } else if (action.action === 'cma_propiedad' && esAsesorBlack) {
          let datosComps = 'No hay suficientes propiedades comparables activas en NIDO en esa zona — respondé solo con tu conocimiento general del mercado.'
          if (action.zona) {
            const { data: comps } = await supabaseAdmin.from('propiedades').select('titulo, precio, metros, tipo, operacion').eq('disponible', true).eq('verificacion_estado', 'aprobada').ilike('zona', '%' + action.zona + '%').gt('metros', 0).limit(5)
            if (comps && comps.length > 0) {
              datosComps = `Comparables reales activos en NIDO en ${action.zona}:\n` + comps.map(c => `- ${c.titulo}: $${Number(c.precio).toLocaleString()} (${c.metros}m², ${c.tipo}, ${c.operacion}) = $${Math.round(Number(c.precio) / Number(c.metros)).toLocaleString()}/m²`).join('\n') + '\n\nUsalos como referencia real, combinados con tu conocimiento general del mercado.'
            }
          }

          const cmaRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 500,
              system: `Sos Valeria, mentora experta del mercado inmobiliario de Costa Rica, ayudando por WhatsApp a ${userName || 'un asesor'} (plan Black de NIDO) a armar un CMA (análisis comparativo de mercado) rápido para una propiedad que va a tasar/listar. El asesor te describió la propiedad así: "${action.descripcion || text}". ${datosComps} Dale un rango de precio sugerido (mínimo-óptimo-máximo), la lógica detrás (comparables, m², condición, ubicación), y un consejo de posicionamiento. Formato WhatsApp: directo, máximo 4-5 párrafos cortos, terminá preguntando si querés que ajuste algo.`,
              messages: [{ role: 'user', content: action.descripcion || text }]
            })
          })
          const cmaData = await cmaRes.json()
          finalReply = cmaData.content?.[0]?.text || 'No pude armar el CMA en este momento — ¿me repetís las características de la propiedad?'
        } else if (action.action === 'escalar_soporte') {
          const ticketId = crypto.randomUUID()
          const prioridad = esAsesorBlack ? 'alta' : 'media'
          const correoContacto = asesor?.correo || propietario?.correo || (from + '@whatsapp.nido-cr.com')

          await supabaseAdmin.from('soporte_tickets').insert({
            id: ticketId,
            usuario_email: correoContacto,
            usuario_nombre: userName,
            usuario_telefono: from,
            usuario_tipo: userType,
            canal: 'whatsapp',
            asunto: action.motivo || 'Consulta desde WhatsApp',
            estado: 'abierto',
            prioridad,
          })
          await supabaseAdmin.from('soporte_mensajes').insert({ ticket_id: ticketId, remitente: 'usuario', contenido: text })

          const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://www.nido-cr.com'
          fetch(baseUrl + '/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'hola@nido-cr.com',
              tipo: 'nuevo_ticket_soporte',
              data: { usuario_nombre: userName, usuario_email: correoContacto, usuario_telefono: from, usuario_tipo: userType, asunto: action.motivo || 'Consulta desde WhatsApp', resumen: 'Usuario: ' + text + (prioridad === 'alta' ? '\n\n⚠️ PRIORIDAD ALTA (plan Black)' : '') },
            }),
          }).catch(() => {})

          finalReply = esAsesorBlack
            ? `🆘 Listo, ya escalé tu consulta con *prioridad alta* al equipo NIDO. Te van a responder pronto por acá o por correo.\n\n¿Necesitás algo más mientras tanto?`
            : `🆘 Listo, ya le avisé al equipo NIDO sobre tu consulta. Te van a responder pronto.\n\n¿Necesitás algo más mientras tanto?`
        } else if (action.action === 'conectar_asesor') {
          let asesorEmailDestino: string | null = null
          let propTitulo: string | null = null

          if (action.propiedad_id) {
            const { data: prop } = await supabaseAdmin.from('propiedades').select('titulo, asesor_email').eq('id', action.propiedad_id).maybeSingle()
            if (prop) { asesorEmailDestino = prop.asesor_email; propTitulo = prop.titulo }
          }

          const { data: leadInsertado } = await supabaseAdmin.from('leads').insert({
            nombre: userName || action.nombre || 'Comprador WhatsApp',
            telefono: from,
            mensaje: text,
            zona_interes: action.zona || null,
            tipo_busqueda: action.tipo || 'compra',
            fuente: 'whatsapp_ia',
            estado: 'nuevo',
            asesor_email: asesorEmailDestino,
            propiedad_id: action.propiedad_id || null,
          }).select('asesor_email').single()

          const asesorFinal = leadInsertado?.asesor_email || asesorEmailDestino

          if (asesorFinal) {
            const { data: asesorContacto } = await supabaseAdmin.from('perfiles').select('nombre, telefono').eq('correo', asesorFinal).maybeSingle()
            notificarAsesorBlack(supabaseAdmin, asesorFinal, 'nuevo_lead', {
              nombre: userName || action.nombre || 'Comprador WhatsApp',
              telefono: from,
              zona_interes: action.zona,
              mensaje: text,
              propiedad_titulo: propTitulo || undefined,
            }).catch(() => {})

            finalReply = `🤝 ¡Perfecto! Te conecté con *${asesorContacto?.nombre || 'un asesor NIDO'}*${propTitulo ? ' para ' + propTitulo : ''}. Te va a escribir por acá pronto.${asesorContacto?.telefono ? `\n\nSi preferís escribirle directo: wa.me/${asesorContacto.telefono.replace(/[^0-9]/g, '')}` : ''}\n\n¿Necesitás algo más mientras tanto?`
          } else {
            finalReply = `🤝 ¡Perfecto! Ya dejé registrado tu interés y un asesor NIDO te va a contactar pronto por este mismo WhatsApp.\n\n¿Necesitás algo más mientras tanto?`
          }
        } else if (action.action === 'mis_propiedades' && asesor?.correo) {
          const { data: misProps } = await supabaseAdmin.from('propiedades').select('id, titulo, zona, precio, disponible, verificacion_estado').eq('asesor_email', asesor.correo).order('created_at', { ascending: false }).limit(8)

          if (misProps && misProps.length > 0) {
            finalReply = '🏠 *Tus propiedades en NIDO:*\n\n' + misProps.map((p, i) => {
              const estado = p.verificacion_estado === 'pendiente_verificacion' ? '⏳ Pendiente de aprobación' : p.disponible ? '✅ Activa' : '⏸️ Pausada'
              return `${i+1}. *${p.titulo}*\n📍 ${p.zona} | $${Number(p.precio).toLocaleString()}\n${estado}\n🔗 nido-cr.com/propiedades/${p.id}`
            }).join('\n\n') + '\n\n¿Querés que te ayude con alguna de ellas?'
          } else {
            finalReply = '📋 Todavía no tenés propiedades publicadas.\n\nPodés publicar la primera acá:\n🌐 nido-cr.com/dashboard/nueva-propiedad'
          }
        }
      }
    } catch {}

    const envioResultado = await sendWA(from, finalReply)

    // Log message (incluye si el envio real a Meta funciono o no, para poder diagnosticar sin acceso a los logs de Vercel)
    try {
      await supabaseAdmin.from('whatsapp_logs').insert({
        from_number: from,
        message: text,
        reply,
        user_type: userType,
        user_name: userName,
        wa_send_ok: envioResultado.ok,
        wa_send_error: envioResultado.error || null,
      })
    } catch (_) {}

  } catch (err) {
    console.error('WA webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}

async function sendWA(to: string, message: string): Promise<{ ok: boolean; error?: string }> {
  if (!WA_TOKEN) {
    const msg = 'WHATSAPP_TOKEN no configurado en Vercel'
    console.error(msg)
    return { ok: false, error: msg }
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WA_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      })
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error('WhatsApp send error:', res.status, errBody)
      return { ok: false, error: `HTTP ${res.status}: ${errBody.slice(0, 500)}` }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('WhatsApp send exception:', msg)
    return { ok: false, error: msg }
  }
}
