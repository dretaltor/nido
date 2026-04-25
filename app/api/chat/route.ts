import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json()

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