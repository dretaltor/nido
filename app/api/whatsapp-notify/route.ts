import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notificarAsesorBlack, TipoNotificacionWA } from '../../../lib/whatsappNotify'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Endpoint publico y rate-limitado: notifica por WhatsApp a un asesor plan Black.
// No requiere auth (se llama desde formularios anonimos de leads), pero esta
// gateado internamente — si el destinatario no es Black no se envia nada.
export async function POST(req: NextRequest) {
  const permitido = await checkRateLimit('whatsapp-notify:' + getClientIp(req), 20, 10)
  if (!permitido) {
    return NextResponse.json({ ok: false, error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  try {
    const { correo, tipo, data } = await req.json()
    if (!correo || !tipo) return NextResponse.json({ ok: false, error: 'Faltan campos' }, { status: 400 })

    const resultado = await notificarAsesorBlack(supabaseAdmin, correo, tipo as TipoNotificacionWA, data || {})
    return NextResponse.json({ ok: true, sent: resultado.sent })
  } catch (e) {
    console.error('whatsapp-notify error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
