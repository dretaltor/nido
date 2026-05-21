import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nido-webhook-2026'
const WA_TOKEN = process.env.WHATSAPP_TOKEN || 'EAA9uUc0RdRkBRqxPkZAYTxTVtjESr7CkBC27lH9q7v3lNebwxTZA1FMcvYU0FyJRkgaynzHrtrx6Cz8kJSBJ0VZBDDmjgKP83CqquHvhw9Dazc4oKA9AcgljAFWZAOZAyMr17EMtx9AZCSqYgUjLW6tZCbCNAgkKrlsQjp8ip1zpPapqnylqFDd2KyASbjdTgZDZD'
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
  const body = await req.json()

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
      await sendWA(from, 'Hola, soy Valeria de NIDO 🏠 Por ahora solo proceso mensajes de texto. ¿En qué puedo ayudarte?')
      return NextResponse.json({ ok: true })
    }

    // Check if user exists in system
    const [{ data: asesor }, { data: propietario }] = await Promise.all([
      supabaseAdmin.from('perfiles').select('nombre, correo').eq('telefono', from).maybeSingle(),
      supabaseAdmin.from('propietarios').select('nombre, correo').eq('telefono', from).maybeSingle(),
    ])

    const userName = asesor?.nombre || propietario?.nombre || null
    const userType = asesor ? 'asesor' : propietario ? 'propietario' : 'comprador'

    // Call Valeria AI
    const sistemaPrompt = `Sos Valeria, la asistente IA de NIDO — plataforma inmobiliaria premium de Costa Rica.
Respondés por WhatsApp — mensajes cortos, claros y directos. Máximo 3 párrafos.
${userName ? 'Estás hablando con ' + userName + ', ' + userType + ' de NIDO.' : 'Es un usuario nuevo — podría ser comprador, vendedor o asesor.'}
Ayudás con: consultas sobre propiedades, proceso de compra/venta, información sobre NIDO, agendar visitas.
Siempre terminá con una pregunta o siguiente paso concreto.
Si el usuario pregunta por propiedades, DEBES responder con el JSON especial: {"action":"buscar_propiedades","zona":"zona mencionada o null","tipo":"casa/apartamento/lote/local o null","precio_max":numero_o_null}
Si el usuario quiere agendar una visita: {"action":"agendar_visita","propiedad":"nombre si mencionó alguna"}
Para cualquier otra consulta, responde normalmente en texto.`

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: sistemaPrompt,
        messages: [{ role: 'user', content: text }]
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
            finalReply = '🏠 *Propiedades disponibles en NIDO:*\n\n' + props.map((p: any, i: number) => 
              `${i+1}. *${p.titulo}*\n📍 ${p.zona} | ${p.tipo}\n💰 $${Number(p.precio).toLocaleString()} USD\n🔖 ${p.ref_id || ''}\n🔗 nido-cr.com/propiedades/${p.id}`
            ).join('\n\n') + '\n\n¿Te interesa alguna? Puedo darte más detalles o agendar una visita. 😊'
          } else {
            finalReply = '🔍 No encontré propiedades con esos criterios en este momento.\n\nPodés ver todas las opciones disponibles en:\n🌐 www.nido-cr.com/propiedades\n\n¿Querés que amplíe la búsqueda?'
          }
        } else if (action.action === 'agendar_visita') {
          finalReply = '📅 Para agendar una visita, ingresá a la ficha de la propiedad en:\n🌐 www.nido-cr.com/propiedades\n\nO decime tu nombre y teléfono y un asesor NIDO te contactará para coordinarla. 🏠'
        }
      }
    } catch {}

    await sendWA(from, finalReply)

    // Log message
    try {
      await supabaseAdmin.from('whatsapp_logs').insert({
        from_number: from,
        message: text,
        reply,
        user_type: userType,
        user_name: userName,
      })
    } catch (_) {}

  } catch (err) {
    console.error('WA webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}

async function sendWA(to: string, message: string) {
  await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
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
}
