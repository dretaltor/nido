import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

export async function POST(req: NextRequest) {
  const permitido = await checkRateLimit('valeria-crm:' + getClientIp(req), 30, 10)
  if (!permitido) {
    return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
  }

  const { prompt } = await req.json()
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  
  const data = await res.json()
  return NextResponse.json({ text: data.content?.[0]?.text || '' })
}
