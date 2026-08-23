import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { notificarAsesorBlack } from '../../../lib/whatsappNotify'
import { registrarOptOut, quitarOptOut } from '../../../lib/whatsapp'

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

// ─────────────────────────────────────────────────────────────────────────
// Fase 0 "Director de Operaciones IA": arquitectura real de tool-calling.
// En vez de un unico JSON de accion extraido por regex, Valeria recibe un
// arreglo de "tools" de Anthropic y puede invocar una o varias por mensaje
// (encadenar acciones). Cada tool handler devuelve `isFinal:true` cuando su
// texto ya es la respuesta lista para el usuario (asi mantenemos, byte a
// byte, la redaccion cuidada que ya teniamos para cada accion existente).
// Fase 1 podra agregar tools que devuelvan datos crudos (`isFinal:false`)
// para que el propio modelo redacte una respuesta que resuma varias
// acciones encadenadas — el loop de abajo ya esta preparado para eso.
// ─────────────────────────────────────────────────────────────────────────

interface ToolResult {
  text: string
  isFinal: boolean
  mostrarBotones?: boolean
}

const MAX_TOOL_ITERACIONES = 4

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
    let text = message.text?.body || ''
    const msgType = message.type

    // Mensajes interactivos (respuesta a un boton que mandamos nosotros): extraemos el id
    // del boton y el titulo como si fuera el texto que "escribio" el usuario.
    let botonId: string | null = null
    if (msgType === 'interactive') {
      botonId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id || null
      text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || text
    }

    // Palabras clave de consentimiento — se procesan ANTES que cualquier otra cosa y sin IA,
    // para que el opt-out/opt-in sea 100% confiable (compliance de Meta / buenas practicas).
    // Esto solo afecta a los mensajes PROACTIVOS (recordatorios, notificaciones Black, briefing);
    // Valeria le sigue respondiendo normal si el usuario le vuelve a escribir.
    if (msgType === 'text') {
      const comando = text.trim().toUpperCase()
      if (['BAJA', 'STOP', 'CANCELAR', 'DETENER', 'UNSUBSCRIBE'].includes(comando)) {
        await registrarOptOut(from, 'Palabra clave: ' + comando)
        await sendWA(from, '✅ Listo, no vas a recibir más mensajes automáticos de NIDO por este WhatsApp (recordatorios, notificaciones, etc). Si me escribís vos, te sigo respondiendo normal.\n\nSi te arrepentís, escribí *ALTA* para reactivarlos.')
        return NextResponse.json({ ok: true })
      }
      if (['ALTA', 'ACTIVAR', 'SUBSCRIBE', 'REACTIVAR'].includes(comando)) {
        await quitarOptOut(from)
        await sendWA(from, '✅ Listo, reactivé los mensajes automáticos de NIDO por este WhatsApp. 🏠')
        return NextResponse.json({ ok: true })
      }
    }

    if (msgType !== 'text' && msgType !== 'interactive') {
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

    // Boton presionado: se resuelve directo, sin pasar por la IA (mas confiable y rapido).
    if (botonId) {
      let finalReplyBoton: string
      if (botonId === 'nido_btn_asesor') {
        finalReplyBoton = await ejecutarConectarAsesor({ from, text: 'Quiero hablar con un asesor (vía botón de WhatsApp)', userName })
      } else if (botonId === 'nido_btn_soporte') {
        const correoContacto = asesor?.correo || propietario?.correo || (from + '@whatsapp.nido-cr.com')
        finalReplyBoton = await ejecutarEscalarSoporte({ from, text: 'Solicitud de soporte (vía botón de WhatsApp)', userName, userType, correoContacto, motivo: 'Solicitud de soporte desde botón de WhatsApp', esAsesorBlack })
      } else {
        finalReplyBoton = 'Recibido 👍 ¿En qué más puedo ayudarte?'
      }
      const envioBoton = await sendWA(from, finalReplyBoton)
      try {
        await supabaseAdmin.from('whatsapp_logs').insert({ from_number: from, message: text, reply: finalReplyBoton, user_type: userType, user_name: userName, wa_send_ok: envioBoton.ok, wa_send_error: envioBoton.error || null })
      } catch (_) {}
      return NextResponse.json({ ok: true })
    }

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

    // Contexto ampliado para asesores: Valeria ve sus visitas y leads recientes, no solo
    // los ultimos mensajes crudos. Esto es lo que le permite entender referencias como
    // "la visita de mañana" o "el lead de Escazú" sin que el asesor tenga que repetir datos.
    let contextoAsesor = ''
    if (userType === 'asesor' && asesor?.correo) {
      const hoy = new Date().toISOString().split('T')[0]
      const enUnaSemana = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      const [{ data: visitasProx }, { data: leadsRecientes }] = await Promise.all([
        supabaseAdmin.from('visitas').select('propiedad_titulo, comprador_nombre, fecha, hora, estado').eq('asesor_email', asesor.correo).gte('fecha', hoy).lte('fecha', enUnaSemana).order('fecha', { ascending: true }).limit(5),
        supabaseAdmin.from('leads').select('nombre, zona_interes, estado, created_at').eq('asesor_email', asesor.correo).order('created_at', { ascending: false }).limit(8),
      ])

      if (visitasProx && visitasProx.length > 0) {
        contextoAsesor += '\n\nVisitas de ' + userName + ' en los próximos 7 días:\n' + visitasProx.map(v => `- ${v.fecha} ${v.hora} — ${v.propiedad_titulo} con ${v.comprador_nombre} (${v.estado})`).join('\n')
      }
      if (leadsRecientes && leadsRecientes.length > 0) {
        contextoAsesor += '\n\nLeads recientes de ' + userName + ':\n' + leadsRecientes.map(l => `- ${l.nombre || 'Sin nombre'} — ${l.zona_interes || 'sin zona'} (${l.estado})`).join('\n')
      }
      if (contextoAsesor) {
        contextoAsesor = '\n\nCONTEXTO ACTUAL DEL ASESOR (usalo para responder con precisión si pregunta por su agenda o sus leads, o si hace referencia a algo de esta lista):' + contextoAsesor
      }
    }

    // Sistema prompt: mas corto que antes porque la logica de "que accion tomar" ahora
    // vive en la descripcion de cada tool, no en un bloque gigante de instrucciones de JSON.
    const sistemaPrompt = `Sos Valeria, la asistente IA de NIDO — plataforma inmobiliaria premium de Costa Rica. Tu rol es actuar como directora de operaciones de apoyo al asesor: entendés lo que te piden y ejecutás la accion correcta usando las herramientas disponibles.
Respondés por WhatsApp — mensajes cortos, claros y directos. Máximo 3 párrafos.
IDIOMA: respondé siempre en el mismo idioma en el que te escribe el usuario (si te escribe en inglés, respondé en inglés; si es en español, en español). Costa Rica recibe muchos compradores extranjeros — no asumas que todos hablan español.
${userName ? 'Estás hablando con ' + userName + ', ' + userType + ' de NIDO.' : 'Es un usuario nuevo — podría ser comprador, vendedor o asesor.'}
${userType === 'asesor' ? `Este es un ASESOR registrado en NIDO (plan ${esAsesorBlack ? 'Black' : asesor?.plan || 'Despega'}). Si pregunta cómo mejorar sus ventas o "capacitarme", mencioná la Academia NIDO en nido-cr.com/academia. Dudas sobre comisiones, KYC, contratos o el funcionamiento de NIDO las respondés vos misma en texto.${!esAsesorBlack ? ' Si pregunta por precios de mercado, tendencias de zona, un CMA, asesoría de inversión, o algo legal/notarial, respondé en texto que eso es un beneficio exclusivo del plan Black y que puede hacer upgrade en nido-cr.com/precios (no uses ninguna herramienta para esto).' : ''}` : ''}
${userType === 'propietario' ? 'Es un PROPIETARIO con al menos una propiedad publicada en NIDO. Preguntas generales sobre cómo funciona NIDO (comisión, proceso de venta, KYC, plazos) las respondés vos en texto, breve.' : ''}
${userType === 'comprador' ? 'Es un COMPRADOR.' : ''}
Ayudás con: consultas sobre propiedades, proceso de compra/venta, información sobre NIDO, agendar visitas. Siempre terminá con una pregunta o siguiente paso concreto cuando respondas en texto libre.
Para cualquier consulta que no tenga una herramienta asociada, respondé normalmente en texto.
Podés usar más de una herramienta en un mismo turno si el mensaje del usuario lo requiere.${contextoAsesor}`

    const tools = construirTools({ userType, esAsesorBlack, tieneCorreoAsesor: !!asesor?.correo })

    const messages: { role: 'user' | 'assistant'; content: unknown }[] = [...historialMensajes, { role: 'user', content: text }]

    let finalReply = 'Hola, soy Valeria de NIDO 🏠 ¿En qué puedo ayudarte?'
    let mostrarBotones = false

    for (let iter = 0; iter < MAX_TOOL_ITERACIONES; iter++) {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: sistemaPrompt,
          tools,
          messages,
        })
      })

      const aiData = await aiRes.json()
      const contenido: Array<{ type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }> = aiData.content || []
      const toolUses = contenido.filter(b => b.type === 'tool_use')
      const textoModelo = contenido.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()

      if (toolUses.length === 0) {
        // Sin llamada a herramientas: es una respuesta conversacional normal.
        finalReply = textoModelo || finalReply
        break
      }

      const resultados: { id: string; result: ToolResult }[] = []
      for (const tu of toolUses) {
        const result = await ejecutarTool(tu.name || '', tu.input || {}, { from, text, userName, userType, asesor, propietario, esAsesorBlack })
        resultados.push({ id: tu.id || '', result })
        if (result.mostrarBotones) mostrarBotones = true
      }

      const todasFinales = resultados.every(r => r.result.isFinal)
      if (todasFinales) {
        // Todas las herramientas invocadas ya devuelven texto listo para el usuario —
        // lo usamos directo, sin pedirle al modelo que lo reformule (asi conservamos
        // exactamente la redacción cuidada de cada acción).
        finalReply = resultados.map(r => r.result.text).join('\n\n')
        break
      }

      // Alguna herramienta devolvió datos crudos (no texto final): seguimos el loop para
      // que el modelo los use y redacte una respuesta que encadene las acciones. (No
      // aplica todavía a ninguna tool de Fase 0, pero deja la arquitectura lista para
      // las tools de Fase 1 que sí necesitan esto.)
      messages.push({ role: 'assistant', content: contenido })
      messages.push({
        role: 'user',
        content: resultados.map(r => ({ type: 'tool_result', tool_use_id: r.id, content: r.result.text })),
      })
    }

    const envioResultado = await sendWA(from, finalReply)

    if (mostrarBotones) {
      await sendWABotones(from, '¿Qué querés hacer?', [
        { id: 'nido_btn_asesor', title: '🤝 Hablar con asesor' },
        { id: 'nido_btn_soporte', title: '🆘 Soporte NIDO' },
      ])
    }

    // Log message (incluye si el envio real a Meta funciono o no, para poder diagnosticar sin acceso a los logs de Vercel).
    // Guardamos finalReply (lo que de verdad se le mandó al usuario) en vez del texto crudo del
    // modelo, para que el historial que le pasamos a Valeria en el próximo turno tenga sentido.
    try {
      await supabaseAdmin.from('whatsapp_logs').insert({
        from_number: from,
        message: text,
        reply: finalReply,
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

// ─────────────────────────────────────────────────────────────────────────
// Definición de tools (formato Anthropic) — condicionadas por tipo de
// usuario y plan, igual que antes vivía en los distintos bloques del
// sistemaPrompt condicional.
// ─────────────────────────────────────────────────────────────────────────
function construirTools(ctx: { userType: string; esAsesorBlack: boolean; tieneCorreoAsesor: boolean }) {
  const tools: Array<{ name: string; description: string; input_schema: Record<string, unknown> }> = []

  tools.push({
    name: 'buscar_propiedades',
    description: 'Buscar propiedades disponibles en el catálogo de NIDO que NO sean del propio asesor (marketplace general). Usala cuando el usuario pregunta por propiedades disponibles sin mostrar todavía intención concreta de comprar/agendar.',
    input_schema: {
      type: 'object',
      properties: {
        zona: { type: 'string', description: 'Zona o cantón mencionado, si lo hay' },
        tipo: { type: 'string', enum: ['casa', 'apartamento', 'lote', 'local'], description: 'Tipo de propiedad, si lo mencionó' },
        precio_max: { type: 'number', description: 'Precio máximo en USD, si lo mencionó' },
      },
      required: [],
    },
  })

  tools.push({
    name: 'escalar_soporte',
    description: 'Crear un ticket de soporte con el equipo NIDO para una queja o problema que vos no podés resolver directamente.',
    input_schema: {
      type: 'object',
      properties: { motivo: { type: 'string', description: 'Resumen breve del problema o consulta' } },
      required: ['motivo'],
    },
  })

  if (ctx.userType === 'asesor' && ctx.esAsesorBlack) {
    tools.push({
      name: 'consulta_mercado',
      description: 'Responder como mentora experta del mercado inmobiliario costarricense: precios, precio por m², tendencias de una zona, en qué zona conviene invertir, o comparación entre zonas. Exclusivo para asesores plan Black.',
      input_schema: {
        type: 'object',
        properties: {
          zona: { type: 'string', description: 'Zona mencionada, si la hay' },
          pregunta: { type: 'string', description: 'Resumen breve de lo que pregunta el asesor' },
        },
        required: ['pregunta'],
      },
    })
    tools.push({
      name: 'cma_propiedad',
      description: 'Armar un CMA (análisis comparativo de mercado) o sugerir precio de listado para una propiedad específica que el asesor describe (ubicación, tipo, m², habitaciones, condición). Exclusivo para asesores plan Black.',
      input_schema: {
        type: 'object',
        properties: {
          zona: { type: 'string', description: 'Zona de la propiedad' },
          descripcion: { type: 'string', description: 'Resumen de las características que dio el asesor' },
        },
        required: ['descripcion'],
      },
    })
    if (ctx.tieneCorreoAsesor) {
      tools.push({
        name: 'consulta_legal',
        description: 'Conectar al asesor con el equipo legal de NIDO ante cualquier duda legal o notarial (cláusulas, cierre/escritura, arrendamiento, poderes, documentos). NO improvises una respuesta legal vos misma — usá siempre esta herramienta para estos casos. Exclusivo para asesores plan Black.',
        input_schema: {
          type: 'object',
          properties: { motivo: { type: 'string', description: 'Resumen breve de la consulta legal' } },
          required: ['motivo'],
        },
      })
    }
  }

  if (ctx.userType === 'asesor' && ctx.tieneCorreoAsesor) {
    tools.push({
      name: 'mis_propiedades',
      description: 'Mostrar las propiedades propias que el asesor tiene publicadas en NIDO. Usala cuando pregunte "mis propiedades", "lo que tengo publicado", etc.',
      input_schema: { type: 'object', properties: {}, required: [] },
    })
  }

  if (ctx.userType === 'comprador') {
    tools.push({
      name: 'conectar_asesor',
      description: 'Conectar al comprador con el asesor a cargo. Usala cuando muestre intención concreta: quiere que lo contacten, quiere agendar visita, elige una propiedad específica de las que le mostraste, pide condiciones/negociación, o pide hablar con un asesor.',
      input_schema: {
        type: 'object',
        properties: {
          zona: { type: 'string', description: 'Zona de interés, si la hay' },
          tipo: { type: 'string', description: 'Tipo de propiedad, si lo hay' },
          nombre: { type: 'string', description: 'Nombre del comprador, si lo mencionó' },
          propiedad_id: { type: 'string', description: 'Id de la propiedad si eligió una de las que le mostraste antes, usando el historial de la conversación' },
        },
        required: [],
      },
    })
  }

  if (ctx.userType === 'propietario') {
    tools.push({
      name: 'mis_propiedades_propietario',
      description: 'Mostrar el estado de la(s) propiedad(es) publicadas por este propietario. Usala cuando pregunte por el estado de su propiedad o "cómo va mi propiedad".',
      input_schema: { type: 'object', properties: {}, required: [] },
    })
    tools.push({
      name: 'redirigir_asesor_propietario',
      description: 'Conectar al propietario con el asesor NIDO a cargo de su propiedad. Usala para CUALQUIER cosa que no sea consultar el estado básico: negociar con un comprador, cambiar precio o condiciones, agendar o reprogramar una visita, quejas, dudas específicas de su contrato.',
      input_schema: {
        type: 'object',
        properties: { motivo: { type: 'string', description: 'Resumen breve de lo que pide' } },
        required: ['motivo'],
      },
    })
  }

  return tools
}

// Ejecuta una tool por nombre y devuelve su resultado. Centraliza el registro en la
// bitácora de actividad — así ningún handler se olvida de dejar rastro.
async function ejecutarTool(
  nombre: string,
  input: Record<string, unknown>,
  ctx: {
    from: string
    text: string
    userName: string | null
    userType: string
    asesor: { nombre?: string; correo?: string; telefono?: string; plan?: string } | null
    propietario: { nombre?: string; correo?: string } | null
    esAsesorBlack: boolean
  }
): Promise<ToolResult> {
  const { from, text, userName, userType, asesor, propietario, esAsesorBlack } = ctx

  switch (nombre) {
    case 'buscar_propiedades':
      return ejecutarBuscarPropiedades({ from, userType, asesorCorreo: asesor?.correo || null }, input)

    case 'consulta_mercado':
      return ejecutarConsultaMercado({ userName, asesorCorreo: asesor?.correo || null }, input)

    case 'cma_propiedad':
      return ejecutarCmaPropiedad({ userName, text, asesorCorreo: asesor?.correo || null }, input)

    case 'escalar_soporte': {
      const correoContacto = asesor?.correo || propietario?.correo || (from + '@whatsapp.nido-cr.com')
      const motivo = String(input.motivo || 'Consulta desde WhatsApp')
      const respuesta = await ejecutarEscalarSoporte({ from, text, userName, userType, correoContacto, motivo, esAsesorBlack })
      return { text: respuesta, isFinal: true }
    }

    case 'consulta_legal': {
      if (!asesor?.correo) return { text: 'Necesito tu correo registrado en NIDO para escalar esto — escribime desde tu número asociado a tu cuenta.', isFinal: true }
      const motivo = String(input.motivo || 'Consulta legal desde WhatsApp')
      const respuesta = await ejecutarConsultaLegal({ from, text, userName, correoContacto: asesor.correo, motivo })
      return { text: respuesta, isFinal: true }
    }

    case 'conectar_asesor': {
      const respuesta = await ejecutarConectarAsesor({
        from,
        text,
        userName,
        zona: (input.zona as string) || null,
        tipo: (input.tipo as string) || null,
        nombre: (input.nombre as string) || null,
        propiedadId: (input.propiedad_id as string) || null,
      })
      return { text: respuesta, isFinal: true }
    }

    case 'mis_propiedades_propietario':
      return ejecutarMisPropiedadesPropietario({ propietarioCorreo: propietario?.correo || null })

    case 'redirigir_asesor_propietario': {
      if (!propietario?.correo) return { text: 'No encuentro una propiedad asociada a tu número — ¿me confirmás con qué correo te registraste en NIDO?', isFinal: true }
      const motivo = String(input.motivo || text)
      const respuesta = await ejecutarRedirigirAsesorPropietario({ propietarioCorreo: propietario.correo, from, text: motivo, userName })
      return { text: respuesta, isFinal: true }
    }

    case 'mis_propiedades':
      return ejecutarMisPropiedades({ asesorCorreo: asesor?.correo || null })

    default:
      return { text: 'No pude procesar esa solicitud — ¿me la repetís de otra forma?', isFinal: true }
  }
}

async function ejecutarBuscarPropiedades(
  ctx: { from: string; userType: string; asesorCorreo: string | null },
  input: Record<string, unknown>
): Promise<ToolResult> {
  const { from } = ctx
  const zona = input.zona ? String(input.zona) : null
  const tipo = input.tipo ? String(input.tipo) : null
  const precioMax = typeof input.precio_max === 'number' ? input.precio_max : null

  // imagen_url es una columna legacy que el wizard de publicacion ya no llena —
  // las fotos reales viven en `fotos` (jsonb, array de URLs de Supabase Storage).
  // Usamos imagen_url si existe (compatibilidad con datos viejos) y si no, la
  // primera foto de `fotos`.
  let query = supabaseAdmin.from('propiedades').select('id, titulo, zona, precio, tipo, operacion, ref_id, imagen_url, fotos').eq('disponible', true).eq('verificacion_estado', 'aprobada').limit(3)
  if (zona) query = query.ilike('zona', '%' + zona + '%')
  if (tipo) query = query.eq('tipo', tipo)
  if (precioMax) query = query.lte('precio', precioMax)

  const { data: propsRaw } = await query
  const props = (propsRaw || []).map(p => ({ ...p, foto: p.imagen_url || (Array.isArray(p.fotos) ? p.fotos[0] : null) as string | null }))

  await registrarBitacora({
    asesorEmail: ctx.userType === 'asesor' ? ctx.asesorCorreo : null,
    tipoAccion: 'buscar_propiedades',
    resumen: 'Búsqueda de propiedades' + (zona ? ' en ' + zona : '') + (tipo ? ' (' + tipo + ')' : ''),
    detalle: { zona, tipo, precio_max: precioMax, resultados: props.length },
    propiedadId: props[0]?.id || null,
  })

  if (props.length === 0) {
    return { text: '🔍 No encontré propiedades con esos criterios en este momento.\n\nPodés ver todas las opciones disponibles en:\n🌐 www.nido-cr.com/propiedades\n\n¿Querés que amplíe la búsqueda?', isFinal: true }
  }

  // Cada propiedad con foto va como mensaje de imagen con su ficha en el caption —
  // mucho mas persuasivo que un bloque de texto con un link. La que no tenga foto
  // se agrega igual al resumen de texto final.
  for (const p of props) {
    const caption = `🏠 *${p.titulo}*\n📍 ${p.zona} | ${p.tipo}\n💰 $${Number(p.precio).toLocaleString()} USD\n🔖 ${p.ref_id || ''}\n🔗 nido-cr.com/propiedades/${p.id}`
    if (p.foto) {
      await sendWAImagen(from, p.foto, caption)
    }
  }
  const sinFoto = props.filter(p => !p.foto)
  const texto = (sinFoto.length > 0
    ? '🏠 *Más opciones:*\n\n' + sinFoto.map(p => `*${p.titulo}*\n📍 ${p.zona} | ${p.tipo}\n💰 $${Number(p.precio).toLocaleString()} USD\n🔗 nido-cr.com/propiedades/${p.id}`).join('\n\n') + '\n\n'
    : '') + '¿Te interesa alguna? Puedo darte más detalles o agendar una visita. 😊'

  return { text: texto, isFinal: true, mostrarBotones: ctx.userType === 'comprador' }
}

async function ejecutarConsultaMercado(
  ctx: { userName: string | null; asesorCorreo: string | null },
  input: Record<string, unknown>
): Promise<ToolResult> {
  const zona = input.zona ? String(input.zona) : null
  const pregunta = input.pregunta ? String(input.pregunta) : ''

  // Complementamos el conocimiento general del mercado (lo que ya sabe el modelo)
  // con datos reales de NIDO cuando hay suficientes propiedades activas en la zona.
  let datosInternos = 'No mencionó una zona especifica o no hay suficientes propiedades activas de NIDO ahi — respondé solo con tu conocimiento general del mercado costarricense.'
  if (zona) {
    const { data: comps } = await supabaseAdmin.from('propiedades').select('precio, metros').eq('disponible', true).eq('verificacion_estado', 'aprobada').ilike('zona', '%' + zona + '%').gt('metros', 0)
    const validos = (comps || []).filter(p => p.precio && p.metros)
    if (validos.length > 0) {
      const promedios = validos.map(p => Number(p.precio) / Number(p.metros))
      const promedioM2 = promedios.reduce((a, b) => a + b, 0) / promedios.length
      datosInternos = `Dato real de NIDO para ${zona}: precio promedio $${Math.round(promedioM2).toLocaleString()}/m² sobre ${validos.length} propiedad${validos.length === 1 ? '' : 'es'} activa${validos.length === 1 ? '' : 's'}. Usalo como un dato más dentro de tu análisis, no como tu única fuente — complementalo con tu conocimiento general del mercado de esa zona.`
    }
  }

  const mentorRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `Sos Valeria, mentora experta del mercado inmobiliario de Costa Rica, asesorando por WhatsApp a ${ctx.userName || 'un asesor'}, agente profesional del plan Black de NIDO. Respondé como lo haría un analista de mercado sénior conversando con un colega: cifras orientativas, tendencias, factores de valorización (infraestructura, turismo, nómadas digitales, oferta/demanda), comparación con zonas similares si aplica, y una recomendación práctica y accionable. Usá tu conocimiento general del mercado inmobiliario costarricense — no te limites a lo que hay publicado en NIDO. ${datosInternos} Formato WhatsApp: directo, sin relleno, máximo 4 párrafos cortos, terminá con una pregunta o siguiente paso concreto.`,
      messages: [{ role: 'user', content: pregunta }]
    })
  })
  const mentorData = await mentorRes.json()
  const texto = mentorData.content?.[0]?.text || 'No pude armar el análisis en este momento — ¿me lo repetís de otra forma?'

  await registrarBitacora({
    asesorEmail: ctx.asesorCorreo,
    tipoAccion: 'consulta_mercado',
    resumen: 'Consulta de mercado' + (zona ? ' — ' + zona : ''),
    detalle: { zona, pregunta },
  })

  return { text: texto, isFinal: true }
}

async function ejecutarCmaPropiedad(
  ctx: { userName: string | null; text: string; asesorCorreo: string | null },
  input: Record<string, unknown>
): Promise<ToolResult> {
  const zona = input.zona ? String(input.zona) : null
  const descripcion = input.descripcion ? String(input.descripcion) : ctx.text

  let datosComps = 'No hay suficientes propiedades comparables activas en NIDO en esa zona — respondé solo con tu conocimiento general del mercado.'
  if (zona) {
    const { data: comps } = await supabaseAdmin.from('propiedades').select('titulo, precio, metros, tipo, operacion').eq('disponible', true).eq('verificacion_estado', 'aprobada').ilike('zona', '%' + zona + '%').gt('metros', 0).limit(5)
    if (comps && comps.length > 0) {
      datosComps = `Comparables reales activos en NIDO en ${zona}:\n` + comps.map(c => `- ${c.titulo}: $${Number(c.precio).toLocaleString()} (${c.metros}m², ${c.tipo}, ${c.operacion}) = $${Math.round(Number(c.precio) / Number(c.metros)).toLocaleString()}/m²`).join('\n') + '\n\nUsalos como referencia real, combinados con tu conocimiento general del mercado.'
    }
  }

  const cmaRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `Sos Valeria, mentora experta del mercado inmobiliario de Costa Rica, ayudando por WhatsApp a ${ctx.userName || 'un asesor'} (plan Black de NIDO) a armar un CMA (análisis comparativo de mercado) rápido para una propiedad que va a tasar/listar. El asesor te describió la propiedad así: "${descripcion}". ${datosComps} Dale un rango de precio sugerido (mínimo-óptimo-máximo), la lógica detrás (comparables, m², condición, ubicación), y un consejo de posicionamiento. Formato WhatsApp: directo, máximo 4-5 párrafos cortos, terminá preguntando si querés que ajuste algo.`,
      messages: [{ role: 'user', content: descripcion }]
    })
  })
  const cmaData = await cmaRes.json()
  const texto = cmaData.content?.[0]?.text || 'No pude armar el CMA en este momento — ¿me repetís las características de la propiedad?'

  await registrarBitacora({
    asesorEmail: ctx.asesorCorreo,
    tipoAccion: 'cma_propiedad',
    resumen: 'CMA' + (zona ? ' — ' + zona : ''),
    detalle: { zona, descripcion },
  })

  return { text: texto, isFinal: true }
}

async function ejecutarMisPropiedadesPropietario(ctx: { propietarioCorreo: string | null }): Promise<ToolResult> {
  if (!ctx.propietarioCorreo) {
    return { text: 'No encuentro propiedades publicadas a tu nombre en NIDO. Si creés que es un error, te conecto con el equipo NIDO — decime y lo hago.', isFinal: true }
  }
  const { data: misProps } = await supabaseAdmin.from('propiedades').select('id, titulo, zona, precio, disponible, verificacion_estado').eq('propietario_email', ctx.propietarioCorreo).order('created_at', { ascending: false }).limit(8)

  await registrarBitacora({
    asesorEmail: null,
    tipoAccion: 'mis_propiedades_propietario',
    resumen: 'Propietario consultó el estado de su(s) propiedad(es)',
    detalle: { cantidad: misProps?.length || 0 },
  })

  if (misProps && misProps.length > 0) {
    const texto = '🏠 *Tu(s) propiedad(es) en NIDO:*\n\n' + misProps.map((p, i) => {
      const estado = p.verificacion_estado === 'pendiente_verificacion' ? '⏳ Pendiente de aprobación' : p.disponible ? '✅ Activa' : '⏸️ Pausada'
      return `${i + 1}. *${p.titulo}*\n📍 ${p.zona} | $${Number(p.precio).toLocaleString()}\n${estado}`
    }).join('\n\n') + '\n\nPara detalles de visitas, leads o cualquier gestión, te conecto con tu asesor. ¿Querés que lo haga?'
    return { text: texto, isFinal: true }
  }
  return { text: 'No encuentro propiedades publicadas a tu nombre en NIDO. Si creés que es un error, te conecto con el equipo NIDO — decime y lo hago.', isFinal: true }
}

async function ejecutarMisPropiedades(ctx: { asesorCorreo: string | null }): Promise<ToolResult> {
  if (!ctx.asesorCorreo) {
    return { text: '📋 Todavía no tenés propiedades publicadas.\n\nPodés publicar la primera acá:\n🌐 nido-cr.com/dashboard/nueva-propiedad', isFinal: true }
  }
  const { data: misProps } = await supabaseAdmin.from('propiedades').select('id, titulo, zona, precio, disponible, verificacion_estado').eq('asesor_email', ctx.asesorCorreo).order('created_at', { ascending: false }).limit(8)

  await registrarBitacora({
    asesorEmail: ctx.asesorCorreo,
    tipoAccion: 'mis_propiedades',
    resumen: 'Consultó su propio catálogo de propiedades',
    detalle: { cantidad: misProps?.length || 0 },
  })

  if (misProps && misProps.length > 0) {
    const texto = '🏠 *Tus propiedades en NIDO:*\n\n' + misProps.map((p, i) => {
      const estado = p.verificacion_estado === 'pendiente_verificacion' ? '⏳ Pendiente de aprobación' : p.disponible ? '✅ Activa' : '⏸️ Pausada'
      return `${i + 1}. *${p.titulo}*\n📍 ${p.zona} | $${Number(p.precio).toLocaleString()}\n${estado}\n🔗 nido-cr.com/propiedades/${p.id}`
    }).join('\n\n') + '\n\n¿Querés que te ayude con alguna de ellas?'
    return { text: texto, isFinal: true }
  }
  return { text: '📋 Todavía no tenés propiedades publicadas.\n\nPodés publicar la primera acá:\n🌐 nido-cr.com/dashboard/nueva-propiedad', isFinal: true }
}

// Registra en `valeria_bitacora` cada acción que Valeria ejecuta — es la base del panel
// "Actividad de Nido" en el dashboard del asesor y, a futuro, de la "memoria inmobiliaria".
async function registrarBitacora(params: {
  asesorEmail: string | null
  tipoAccion: string
  resumen: string
  detalle?: Record<string, unknown> | null
  leadId?: string | null
  propiedadId?: string | null
  visitaId?: string | null
  requiereAprobacion?: boolean
}) {
  try {
    await supabaseAdmin.from('valeria_bitacora').insert({
      asesor_email: params.asesorEmail,
      tipo_accion: params.tipoAccion,
      resumen: params.resumen,
      detalle: params.detalle || null,
      lead_id: params.leadId || null,
      propiedad_id: params.propiedadId || null,
      visita_id: params.visitaId || null,
      requiere_aprobacion: params.requiereAprobacion || false,
      origen: 'whatsapp',
    })
  } catch (e) {
    console.error('Error registrando bitácora de Valeria:', e)
  }
}

async function sendWABotones(to: string, bodyText: string, botones: { id: string; title: string }[]): Promise<{ ok: boolean; error?: string }> {
  if (!WA_TOKEN) return { ok: false, error: 'WHATSAPP_TOKEN no configurado en Vercel' }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WA_TOKEN}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: { buttons: botones.slice(0, 3).map(b => ({ type: 'reply', reply: { id: b.id, title: b.title.slice(0, 20) } })) },
        },
      }),
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error('WhatsApp button send error:', res.status, errBody)
      return { ok: false, error: `HTTP ${res.status}: ${errBody.slice(0, 500)}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// Escala una consulta a un ticket de soporte real (equipo NIDO). Se usa tanto desde
// la deteccion de intencion por IA como desde el boton "Soporte NIDO".
async function ejecutarEscalarSoporte(params: {
  from: string
  text: string
  userName: string | null
  userType: string
  correoContacto: string
  motivo: string
  esAsesorBlack: boolean
}): Promise<string> {
  const { from, text, userName, userType, correoContacto, motivo, esAsesorBlack } = params
  const ticketId = crypto.randomUUID()
  const prioridad = esAsesorBlack ? 'alta' : 'media'

  await supabaseAdmin.from('soporte_tickets').insert({
    id: ticketId,
    usuario_email: correoContacto,
    usuario_nombre: userName,
    usuario_telefono: from,
    usuario_tipo: userType,
    canal: 'whatsapp',
    asunto: motivo,
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
      data: { usuario_nombre: userName, usuario_email: correoContacto, usuario_telefono: from, usuario_tipo: userType, asunto: motivo, resumen: 'Usuario: ' + text + (prioridad === 'alta' ? '\n\n⚠️ PRIORIDAD ALTA (plan Black)' : '') },
    }),
  }).catch(() => {})

  await registrarBitacora({
    asesorEmail: userType === 'asesor' ? correoContacto : null,
    tipoAccion: 'escalar_soporte',
    resumen: 'Ticket de soporte creado — ' + motivo,
    detalle: { motivo, prioridad, canal: 'whatsapp' },
  })

  return esAsesorBlack
    ? `🆘 Listo, ya escalé tu consulta con *prioridad alta* al equipo NIDO. Te van a responder pronto por acá o por correo.\n\n¿Necesitás algo más mientras tanto?`
    : `🆘 Listo, ya le avisé al equipo NIDO sobre tu consulta. Te van a responder pronto.\n\n¿Necesitás algo más mientras tanto?`
}

// Asesoría legal y notarial — beneficio exclusivo de asesores plan Black. A diferencia de
// escalar_soporte (problemas operativos con NIDO), esto va etiquetado como 'legal' y se dirige
// al equipo legal (legal@nido-cr.com) en vez de al buzón general, siempre con prioridad alta.
async function ejecutarConsultaLegal(params: {
  from: string
  text: string
  userName: string | null
  correoContacto: string
  motivo: string
}): Promise<string> {
  const { from, text, userName, correoContacto, motivo } = params
  const ticketId = crypto.randomUUID()

  await supabaseAdmin.from('soporte_tickets').insert({
    id: ticketId,
    usuario_email: correoContacto,
    usuario_nombre: userName,
    usuario_telefono: from,
    usuario_tipo: 'asesor',
    canal: 'whatsapp',
    categoria: 'legal',
    asunto: motivo,
    estado: 'abierto',
    prioridad: 'alta',
  })
  await supabaseAdmin.from('soporte_mensajes').insert({ ticket_id: ticketId, remitente: 'usuario', contenido: text })

  const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://www.nido-cr.com'
  fetch(baseUrl + '/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'legal@nido-cr.com',
      tipo: 'nuevo_ticket_soporte',
      data: { usuario_nombre: userName, usuario_email: correoContacto, usuario_telefono: from, usuario_tipo: 'asesor', asunto: '⚖️ Consulta legal (Black): ' + motivo, resumen: 'Usuario: ' + text + '\n\n⚖️ Consulta legal/notarial — asesor plan Black, prioridad alta' },
    }),
  }).catch(() => {})

  await registrarBitacora({
    asesorEmail: correoContacto,
    tipoAccion: 'consulta_legal',
    resumen: 'Consulta legal escalada al equipo legal — ' + motivo,
    detalle: { motivo },
  })

  return `⚖️ Listo, ya envié tu consulta al *equipo legal de NIDO* con prioridad alta. Te van a responder pronto por acá o por correo — para temas legales/notariales es mejor que te confirmen ellos directamente, así te llega algo preciso y no una respuesta genérica mía.\n\n¿Necesitás algo más mientras tanto?`
}

// Crea el lead y conecta al comprador con el asesor a cargo (de la propiedad especifica
// si eligio una, o via el round-robin de asesores Black que ya maneja la DB). Se usa tanto
// desde la deteccion de intencion por IA como desde el boton "Hablar con asesor".
async function ejecutarConectarAsesor(params: {
  from: string
  text: string
  userName: string | null
  zona?: string | null
  tipo?: string | null
  nombre?: string | null
  propiedadId?: string | null
}): Promise<string> {
  const { from, text, userName, zona, tipo, nombre, propiedadId } = params
  let asesorEmailDestino: string | null = null
  let propTitulo: string | null = null

  if (propiedadId) {
    const { data: prop } = await supabaseAdmin.from('propiedades').select('titulo, asesor_email').eq('id', propiedadId).maybeSingle()
    if (prop) { asesorEmailDestino = prop.asesor_email; propTitulo = prop.titulo }
  }

  const { data: leadInsertado } = await supabaseAdmin.from('leads').insert({
    nombre: userName || nombre || 'Comprador WhatsApp',
    telefono: from,
    mensaje: text,
    zona_interes: zona || null,
    tipo_busqueda: tipo || 'compra',
    fuente: 'whatsapp_ia',
    estado: 'nuevo',
    asesor_email: asesorEmailDestino,
    propiedad_id: propiedadId || null,
  }).select('id, asesor_email').single()

  const asesorFinal = leadInsertado?.asesor_email || asesorEmailDestino

  await registrarBitacora({
    asesorEmail: asesorFinal,
    tipoAccion: 'conectar_asesor',
    resumen: 'Nuevo lead conectado' + (propTitulo ? ' — ' + propTitulo : ''),
    detalle: { zona, tipo, propiedad_id: propiedadId || null },
    leadId: leadInsertado?.id || null,
    propiedadId: propiedadId || null,
  })

  if (asesorFinal) {
    const { data: asesorContacto } = await supabaseAdmin.from('perfiles').select('nombre, telefono').eq('correo', asesorFinal).maybeSingle()
    notificarAsesorBlack(supabaseAdmin, asesorFinal, 'nuevo_lead', {
      nombre: userName || nombre || 'Comprador WhatsApp',
      telefono: from,
      zona_interes: zona || undefined,
      mensaje: text,
      propiedad_titulo: propTitulo || undefined,
    }).catch(() => {})

    return `🤝 ¡Perfecto! Te conecté con *${asesorContacto?.nombre || 'un asesor NIDO'}*${propTitulo ? ' para ' + propTitulo : ''}. Te va a escribir por acá pronto.${asesorContacto?.telefono ? `\n\nSi preferís escribirle directo: wa.me/${asesorContacto.telefono.replace(/[^0-9]/g, '')}` : ''}\n\n¿Necesitás algo más mientras tanto?`
  }
  return `🤝 ¡Perfecto! Ya dejé registrado tu interés y un asesor NIDO te va a contactar pronto por este mismo WhatsApp.\n\n¿Necesitás algo más mientras tanto?`
}

// Propietario pidiendo algo que no es basico: lo conecta con el asesor a cargo de su
// propiedad (o escala a soporte NIDO si todavia no tiene un asesor asignado).
async function ejecutarRedirigirAsesorPropietario(params: {
  propietarioCorreo: string
  from: string
  text: string
  userName: string | null
}): Promise<string> {
  const { propietarioCorreo, from, text, userName } = params
  const { data: miProp } = await supabaseAdmin
    .from('propiedades')
    .select('titulo, asesor_email')
    .eq('propietario_email', propietarioCorreo)
    .not('asesor_email', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (miProp?.asesor_email) {
    const { data: asesorContacto } = await supabaseAdmin.from('perfiles').select('nombre, telefono').eq('correo', miProp.asesor_email).maybeSingle()
    await registrarBitacora({
      asesorEmail: miProp.asesor_email,
      tipoAccion: 'redirigir_asesor_propietario',
      resumen: 'Propietario redirigido a su asesor — ' + text,
      detalle: { motivo: text, propiedad_titulo: miProp.titulo },
    })
    return `Para eso lo mejor es que hables directo con *${asesorContacto?.nombre || 'tu asesor NIDO'}*, quien lleva ${miProp.titulo}.${asesorContacto?.telefono ? `\n\n📞 wa.me/${asesorContacto.telefono.replace(/[^0-9]/g, '')}` : '\n\nTe recomiendo escribirle desde tu panel en nido-cr.com/dashboard'}\n\n¿Necesitás algo más que sí pueda resolver yo?`
  }

  return await ejecutarEscalarSoporte({ from, text, userName, userType: 'propietario', correoContacto: propietarioCorreo, motivo: 'Propietario sin asesor asignado — ' + text, esAsesorBlack: false })
}

async function sendWAImagen(to: string, imagenUrl: string, caption: string): Promise<{ ok: boolean; error?: string }> {
  if (!WA_TOKEN) return { ok: false, error: 'WHATSAPP_TOKEN no configurado en Vercel' }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WA_TOKEN}` },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'image', image: { link: imagenUrl, caption } })
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error('WhatsApp image send error:', res.status, errBody)
      return { ok: false, error: `HTTP ${res.status}: ${errBody.slice(0, 500)}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
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
