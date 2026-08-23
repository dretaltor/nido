import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notificarAsesorBlack, TipoNotificacionWA } from '../../../lib/whatsappNotify'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Endpoint rate-limitado que notifica por WhatsApp a un asesor plan Black.
// 'nuevo_lead' se llama desde formularios anonimos de leads (por diseño, sin auth) y
// esta gateado internamente — si el destinatario no es Black no se envia nada.
// El resto de los tipos (kyc_aprobado/rechazado, ticket_respondido, nueva_comision)
// solo se disparan desde paneles autenticados (admin o dashboard de asesor) — sin
// esta verificacion, cualquiera en internet podia mandar mensajes de WhatsApp
// falsos (ej. "comision de $50,000 registrada" o "tu KYC fue rechazado") a nombre
// de NIDO a cualquier asesor Black cuyo correo conociera, usando este endpoint como
// relay abierto. Ver auditoria de seguridad.
const TIPOS_SOLO_ADMIN: TipoNotificacionWA[] = ['kyc_aprobado', 'kyc_rechazado', 'ticket_respondido', 'escalamiento_confirmado', 'tarea_vencida', 'match_propiedad', 'lead_sin_seguimiento']

export async function POST(req: NextRequest) {
  const permitido = await checkRateLimit('whatsapp-notify:' + getClientIp(req), 20, 10)
  if (!permitido) {
    return NextResponse.json({ ok: false, error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  try {
    const { correo, tipo, data } = await req.json()
    if (!correo || !tipo) return NextResponse.json({ ok: false, error: 'Faltan campos' }, { status: 400 })

    if (tipo !== 'nuevo_lead') {
      // Cualquier tipo que no sea el flujo publico de leads requiere una sesion real.
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      if (!token) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 })
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      if (authError || !user) return NextResponse.json({ ok: false, error: 'Sesion invalida' }, { status: 401 })

      if (TIPOS_SOLO_ADMIN.includes(tipo as TipoNotificacionWA)) {
        const { data: esAdmin } = await supabaseAdmin.from('admins').select('correo').eq('correo', user.email).maybeSingle()
        if (!esAdmin) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 })
      }
      // 'nueva_comision' solo exige sesion valida (no necesariamente admin ni ser el
      // destinatario) porque el flujo legitimo de colaboradores notifica a otro asesor.
    }

    const resultado = await notificarAsesorBlack(supabaseAdmin, correo, tipo as TipoNotificacionWA, data || {})
    return NextResponse.json({ ok: true, sent: resultado.sent })
  } catch (e) {
    console.error('whatsapp-notify error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
