import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Solo asesores con sesion activa — previene uso gratuito de Anthropic Vision
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 })

    const permitido = await checkRateLimit('foto-feedback:' + user.email, 15, 10)
    if (!permitido) {
      return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
    }

    const { imageBase64, mediaType } = await req.json()
    if (!imageBase64) {
      return NextResponse.json({ error: 'Falta imagen' }, { status: 400 })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
            {
              type: 'text',
              text: `Evaluá esta foto como foto de perfil profesional para un asesor inmobiliario en una plataforma premium (tipo LinkedIn pero más cálido).

Respondé SOLO con un objeto JSON, sin texto adicional, con este formato exacto:
{"buena": true_o_false, "mensaje": "feedback breve en español, máximo 2 oraciones"}

Criterios para "buena": rostro visible y centrado, buena iluminación, fondo no muy distractor, expresión profesional pero amigable (no necesita ser foto de estudio).
Si NO es buena, en "mensaje" dá 1-2 sugerencias concretas y breves (ej: "Probá con mejor luz natural de frente" o "Acercate más, que se vea bien tu rostro" o "Evitá selfies con flash o fondos muy ocupados, buscá algo neutro").
Si SI es buena, en "mensaje" poné un elogio breve y genuino.`
            }
          ]
        }]
      })
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''

    let parsed = { buena: true, mensaje: '' }
    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { buena: true, mensaje: '' }
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    return NextResponse.json({ buena: true, mensaje: '', error: err.message }, { status: 200 })
  }
}
