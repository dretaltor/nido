import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '../../../../lib/whatsapp'
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit'

// Reintento manual de un envio de WhatsApp que fallo (ver whatsapp_logs.wa_send_ok = false).
// La causa mas comun es un token de Meta vencido -- ya se detecta y avisa por correo desde
// api/whatsapp-briefing, pero hasta ahora reenviar el mensaje puntual requeria entrar a la
// base de datos a mano. Reenvia el mismo texto de `reply` como texto libre; si el usuario ya
// salio de la ventana de 24h, Meta lo va a rechazar igual y el error queda visible en el panel.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })

    const { data: esAdmin } = await supabaseAdmin.from('admins').select('correo').eq('correo', user.email).maybeSingle()
    if (!esAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const permitido = await checkRateLimit('reintentar-whatsapp:' + getClientIp(req), 30, 10)
    if (!permitido) return NextResponse.json({ error: 'Demasiadas solicitudes, esperá unos minutos' }, { status: 429 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Falta el id del mensaje' }, { status: 400 })

    const { data: log, error: logError } = await supabaseAdmin
      .from('whatsapp_logs')
      .select('id, from_number, reply, wa_send_ok')
      .eq('id', id)
      .maybeSingle()
    if (logError || !log) return NextResponse.json({ error: 'No se encontró ese mensaje' }, { status: 404 })
    if (!log.from_number || !log.reply) return NextResponse.json({ error: 'Ese mensaje no tiene destinatario o contenido para reenviar' }, { status: 400 })

    const ok = await sendWhatsApp(log.from_number, log.reply)
    await supabaseAdmin.from('whatsapp_logs').update({
      wa_send_ok: ok,
      wa_send_error: ok ? null : 'Reintento manual falló — ver logs de Vercel',
    }).eq('id', id)

    if (!ok) return NextResponse.json({ ok: false, error: 'Meta rechazó el reenvío (posible token vencido o fuera de ventana de 24h)' }, { status: 200 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reintentar WhatsApp error:', err)
    return NextResponse.json({ error: 'Error inesperado reenviando el mensaje' }, { status: 500 })
  }
}
