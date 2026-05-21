import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsApp } from '../../../lib/whatsapp'

export async function POST(req: NextRequest) {
  const { to, message } = await req.json()
  if (!to || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const ok = await sendWhatsApp(to, message)
  return NextResponse.json({ ok })
}
