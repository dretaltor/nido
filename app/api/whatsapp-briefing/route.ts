import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppSmart } from '../../../lib/whatsapp'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cron diario (ver vercel.json) — briefing matutino por WhatsApp exclusivo para asesores plan Black:
// leads nuevos de las ultimas 24h, visitas del dia, y tickets de soporte abiertos.
// Tambien aprovecha esta corrida diaria para revisar si los envios de WhatsApp estan
// fallando mucho (ej. token vencido) y avisar al equipo NIDO por correo.
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== 'Bearer ' + process.env.CRON_SECRET) {
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
    const nVisitas = visitasHoy?.length || 0

    if (nLeads === 0 && nVisitas === 0 && nTickets === 0) continue // nada que reportar hoy

    let msg = `☀️ *Buenos días${a.nombre ? ', ' + a.nombre.split(' ')[0] : ''}* — tu resumen NIDO Black de hoy:\n\n`
    msg += `🔔 Leads nuevos (24h): *${nLeads}*\n`
    if (nVisitas > 0) {
      msg += `\n📅 *Visitas de hoy (${nVisitas}):*\n` + (visitasHoy || []).map(v => `• ${v.hora} — ${v.propiedad_titulo} (${v.comprador_nombre})`).join('\n') + '\n'
    } else {
      msg += `📅 Sin visitas agendadas hoy\n`
    }
    if (nTickets > 0) {
      msg += `\n🎫 Tenés ${nTickets} ticket${nTickets === 1 ? '' : 's'} de soporte abierto${nTickets === 1 ? '' : 's'}\n`
    }
    msg += `\n¿Necesitás algo? Escribime por acá. 🏠`

    const r = await sendWhatsAppSmart(a.telefono!, msg, 'nido_briefing_diario', [a.nombre?.split(' ')[0] || 'asesor', String(nLeads), String(nVisitas), String(nTickets)])
    if (r.ok) enviados++
  }

  // Alerta de salud del canal: si en las ultimas 24h hubo varios envios fallidos
  // (ej. token de WhatsApp vencido), avisamos por correo en vez de descubrirlo
  // cuando un asesor se queja de que Valeria dejo de responder.
  let alertaEnviada = false
  try {
    const { count: fallidos } = await supabaseAdmin
      .from('whatsapp_logs')
      .select('id', { count: 'exact', head: true })
      .eq('wa_send_ok', false)
      .gte('created_at', hace24h)

    if ((fallidos || 0) >= 3 && process.env.RESEND_API_KEY) {
      const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://www.nido-cr.com'
      await fetch(baseUrl + '/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'hola@nido-cr.com',
          tipo: 'alerta_whatsapp_fallando',
          data: { cantidad: fallidos },
        }),
      }).catch(() => {})
      alertaEnviada = true
    }
  } catch {}

  return NextResponse.json({ ok: true, enviados, alertaEnviada })
}
