import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  const permitido = await checkRateLimit('chat:' + getClientIp(req), 20, 10)
  if (!permitido) {
    return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
  }

  const { messages, system } = await req.json()

  // Limites basicos contra abuso de costo — sin esto, cualquiera podia mandar
  // prompts/system arbitrarios y usar la cuenta de Anthropic de NIDO como proxy gratis.
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Mensajes invalidos' }, { status: 400 })
  }
  if (messages.length > 20) {
    return NextResponse.json({ error: 'Demasiados mensajes' }, { status: 400 })
  }
  const totalChars = (system || '').length + messages.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0)
  if (totalChars > 8000) {
    return NextResponse.json({ error: 'Contenido demasiado largo' }, { status: 400 })
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: system || 'Eres el Asesor IA de NIDO, la plataforma inmobiliaria inteligente de Costa Rica. Tu rol es ayudar a los clientes a encontrar la propiedad ideal de forma conversacional y amigable. Haz preguntas sobre: presupuesto, zona de interes, tipo de propiedad, numero de habitaciones, si es para compra o alquiler, y estilo de vida. Responde siempre en espanol, de forma calida y profesional. Mantén respuestas concisas, maximo 3-4 oraciones.',
    messages: messages
  })

  return NextResponse.json({ 
    message: response.content[0].type === 'text' ? response.content[0].text : '' 
  })
}
