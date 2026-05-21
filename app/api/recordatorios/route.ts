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

  if (!visitas?.length) return NextResponse.json({ ok: true, enviados: 0 })

  let enviados = 0

  for (const v of visitas) {
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

  return NextResponse.json({ ok: true, enviados })
}
