import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '../../../lib/whatsapp'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cron diario (ver vercel.json) — briefing matutino por WhatsApp exclusivo para asesores plan Black:
// leads nuevos de las ultimas 24h, visitas del dia, y tickets de soporte abiertos.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== 'Bearer ' + (process.env.CRON_SECRET || 'nido-cron-2026-secret')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: asesoresBlack } = await supabaseAdmin
    .from('perfiles')
    .select('correo, nombre, telefono')
    .eq('plan', 'enterprise')
    .eq('suspendido', false)
    .not('telefono', 'is', null)

  const hoy = new Date().toISOString().split('T')[0]
  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let enviados = 0

  for (const a of (asesoresBlack || [])) {
    const [{ data: leadsNuevos }, { data: visitasHoy }, { data: tickets }] = await Promise.all([
      supabaseAdmin.from('leads').select('nombre').eq('asesor_email', a.correo).gte('created_at', hace24h),
      supabaseAdmin.from('visitas').select('propiedad_titulo, hora, comprador_nombre').eq('asesor_email', a.correo).eq('fecha', hoy).eq('estado', 'confirmada').order('hora', { ascending: true }),
      supabaseAdmin.from('soporte_tickets').select('id').eq('usuario_email', a.correo).neq('estado', 'resuelto'),
    ])

    const nLeads = leadsNuevos?.length || 0
    const nTickets = tickets?.length || 0

    if (nLeads === 0 && (!visitasHoy || visitasHoy.length === 0) && nTickets === 0) continue // nada que reportar hoy

    let msg = `☀️ *Buenos días${a.nombre ? ', ' + a.nombre.split(' ')[0] : ''}* — tu resumen NIDO Black de hoy:\n\n`
    msg += `🔔 Leads nuevos (24h): *${nLeads}*\n`
    if (visitasHoy && visitasHoy.length > 0) {
      msg += `\n📅 *Visitas de hoy (${visitasHoy.length}):*\n` + visitasHoy.map(v => `• ${v.hora} — ${v.propiedad_titulo} (${v.comprador_nombre})`).join('\n') + '\n'
    } else {
      msg += `📅 Sin visitas agendadas hoy\n`
    }
    if (nTickets > 0) {
      msg += `\n🎫 Tenés ${nTickets} ticket${nTickets === 1 ? '' : 's'} de soporte abierto${nTickets === 1 ? '' : 's'}\n`
    }
    msg += `\n¿Necesitás algo? Escribime por acá. 🏠`

    const ok = await sendWhatsApp(a.telefono!, msg)
    if (ok) enviados++
  }

  return NextResponse.json({ ok: true, enviados })
}
