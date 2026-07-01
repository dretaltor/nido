import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '../../../lib/whatsapp'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== 'Bearer ' + (process.env.CRON_SECRET || 'nido-cron-2026-secret')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaManana = manana.toISOString().split('T')[0]

  const { data: visitas } = await supabaseAdmin
    .from('visitas')
    .select('*')
    .eq('fecha', fechaManana)
    .eq('estado', 'confirmada')
    .eq('recordatorio_enviado', false)

  let enviados = 0

  for (const v of (visitas || [])) {
    const msgAsesor = `🏠 *Recordatorio de visita NIDO*\n\nMañana tenés una visita agendada:\n\nPropiedad: ${v.propiedad_titulo}\nComprador: ${v.comprador_nombre}\nTeléfono: ${v.comprador_telefono}\nHora: ${v.hora}\nTipo: ${v.tipo === 'virtual' ? 'Virtual (videollamada)' : 'Presencial'}\n${v.notas ? 'Notas: ' + v.notas : ''}\n\nRevisá tu dashboard para más detalles.`

    const msgComprador = `🏠 *Recordatorio de visita NIDO*\n\nTe recordamos tu visita de mañana:\n\nPropiedad: ${v.propiedad_titulo}\nHora: ${v.hora}\nTipo: ${v.tipo === 'virtual' ? 'Virtual — tu asesor te enviará el link' : 'Presencial'}\nAsesor: tu asesor NIDO estará esperándote.\n\n¿Tenés alguna pregunta? Respondé este mensaje.`

    const promises = []

    if (v.asesor_whatsapp) {
      promises.push(sendWhatsApp(v.asesor_whatsapp, msgAsesor))
    }
    if (v.comprador_telefono) {
      promises.push(sendWhatsApp(v.comprador_telefono, msgComprador))
    }

    await Promise.all(promises)

    await supabaseAdmin.from('visitas').update({ recordatorio_enviado: true }).eq('id', v.id)
    enviados++
  }

  // Solicitud de resena: visitas confirmadas de ayer, sin solicitud previa. Se les pide
  // opinion un dia despues para dar tiempo a que la visita ya haya ocurrido.
  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  const fechaAyer = ayer.toISOString().split('T')[0]

  const { data: visitasParaResena } = await supabaseAdmin
    .from('visitas')
    .select('*')
    .eq('fecha', fechaAyer)
    .eq('estado', 'confirmada')
    .eq('resena_solicitada', false)

  let resenasSolicitadas = 0

  for (const v of (visitasParaResena || [])) {
    const link = 'https://www.nido-cr.com/resena/' + v.id
    const msg = `🏠 *NIDO* — ¿cómo te fue en tu visita a ${v.propiedad_titulo || 'la propiedad'}?\n\nNos encantaría conocer tu experiencia — toma menos de un minuto:\n${link}`

    if (v.comprador_telefono) {
      await sendWhatsApp(v.comprador_telefono, msg).catch(() => {})
    }
    if (v.comprador_email && process.env.RESEND_API_KEY) {
      try {
        await fetch(process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL + '/api/email' : 'https://www.nido-cr.com/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: v.comprador_email,
            tipo: 'solicitud_resena',
            data: { comprador_nombre: v.comprador_nombre, propiedad: v.propiedad_titulo, link },
          }),
        })
      } catch {}
    }

    await supabaseAdmin.from('visitas').update({ resena_solicitada: true }).eq('id', v.id)
    resenasSolicitadas++
  }

  return NextResponse.json({ ok: true, enviados, resenasSolicitadas })
}
