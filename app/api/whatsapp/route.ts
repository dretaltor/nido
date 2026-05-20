import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nido-webhook-2026'
const WA_TOKEN = process.env.WHATSAPP_TOKEN || ''
const PHONE_ID = process.env.WHATSAPP_PHONE_ID || ''

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
${userName ? `Estás hablando con ${userName}, ${userType} de NIDO.` : 'Es un usuario nuevo — podría ser comprador, vendedor o asesor.'}
Ayudás con: consultas sobre propiedades, proceso de compra/venta, información sobre NIDO, agendar visitas.
Siempre terminá con una pregunta o siguiente paso concreto.
Si preguntan por propiedades específicas, deciles que visiten www.nido-cr.com/propiedades`

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: sistemaPrompt,
        messages: [{ role: 'user', content: text }]
      })
    })

    const aiData = await aiRes.json()
    const reply = aiData.content?.[0]?.text || 'Hola, soy Valeria de NIDO 🏠 ¿En qué puedo ayudarte?'

    await sendWA(from, reply)

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
