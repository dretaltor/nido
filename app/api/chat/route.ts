import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: `Eres el Asesor IA de NIDO, la plataforma inmobiliaria inteligente de Costa Rica. 
Tu rol es ayudar a los clientes a encontrar la propiedad ideal de forma conversacional y amigable.
Haz preguntas sobre: presupuesto, zona de interés, tipo de propiedad (casa/apartamento/local), 
número de habitaciones, si es para compra o alquiler, y estilo de vida.
Responde siempre en español, de forma cálida y profesional.
Cuando tengas suficiente información, describe las características ideales de la propiedad para ese cliente.
Mantén respuestas concisas, máximo 3-4 oraciones.`,
    messages: messages
  })

  return NextResponse.json({ 
    message: response.content[0].type === 'text' ? response.content[0].text : '' 
  })
}
