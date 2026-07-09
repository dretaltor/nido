import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '../../../lib/whatsapp'
import { notificarAsesorBlack } from '../../../lib/whatsappNotify'
import type { Lead } from '../../../lib/database.types'

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
    let msgAsesor = `🏠 *Recordatorio de visita NIDO*\n\nMañana tenés una visita agendada:\n\nPropiedad: ${v.propiedad_titulo}\nComprador: ${v.comprador_nombre}\nTeléfono: ${v.comprador_telefono}\nHora: ${v.hora}\nTipo: ${v.tipo === 'virtual' ? 'Virtual (videollamada)' : 'Presencial'}\n${v.notas ? 'Notas: ' + v.notas : ''}\n\nRevisá tu dashboard para más detalles.`

    const msgComprador = `🏠 *Recordatorio de visita NIDO*\n\nTe recordamos tu visita de mañana:\n\nPropiedad: ${v.propiedad_titulo}\nHora: ${v.hora}\nTipo: ${v.tipo === 'virtual' ? 'Virtual — tu asesor te enviará el link' : 'Presencial'}\nAsesor: tu asesor NIDO estará esperándote.\n\n¿Tenés alguna pregunta? Respondé este mensaje.`

    // Preparacion de visitas — beneficio Black: sumamos el contexto del comprador
    // (que buscaba, presupuesto, zona) para que el asesor llegue con tarea hecha.
    if (v.asesor_email) {
      const { data: perfilAsesor } = await supabaseAdmin.from('perfiles').select('plan').eq('correo', v.asesor_email).maybeSingle()
      if (perfilAsesor?.plan === 'enterprise') {
        const { data: leadComprador } = await supabaseAdmin
          .from('leads')
          .select('mensaje, presupuesto, zona_interes, tipo_busqueda')
          .or([v.comprador_telefono && 'telefono.eq.' + v.comprador_telefono, v.comprador_email && 'email.eq.' + v.comprador_email].filter(Boolean).join(','))
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (leadComprador) {
          msgAsesor += `\n\n🎯 *Contexto del comprador (plan Black):*${leadComprador.zona_interes ? '\n📍 Interés: ' + leadComprador.zona_interes : ''}${leadComprador.presupuesto ? '\n💰 Presupuesto: ' + leadComprador.presupuesto : ''}${leadComprador.tipo_busqueda ? '\n🏠 Busca: ' + leadComprador.tipo_busqueda : ''}${leadComprador.mensaje ? '\n💬 "' + leadComprador.mensaje.slice(0, 200) + '"' : ''}`
        }
      }
    }

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

  // Seguimiento de leads frios: leads 'nuevo' con mas de 2 dias sin contacto.
  // Si tienen asesor asignado, se le avisa a el/ella; si no, se avisa al equipo NIDO para que los reparta.
  const cortesia = new Date()
  cortesia.setDate(cortesia.getDate() - 2)

  const { data: leadsFrios } = await supabaseAdmin
    .from('leads')
    .select('id,nombre,zona_interes,asesor_email,created_at')
    .eq('estado', 'nuevo')
    .eq('seguimiento_enviado', false)
    .lt('created_at', cortesia.toISOString())

  let seguimientosEnviados = 0
  const sinAsignar: Partial<Lead>[] = []

  for (const l of (leadsFrios || [])) {
    if (l.asesor_email) {
      const { data: asesor } = await supabaseAdmin.from('perfiles').select('nombre').eq('correo', l.asesor_email).maybeSingle()
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch(process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL + '/api/email' : 'https://www.nido-cr.com/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: l.asesor_email,
              tipo: 'lead_sin_seguimiento',
              data: { asesor_nombre: asesor?.nombre, lead_nombre: l.nombre, zona: l.zona_interes, dias: 2 },
            }),
          })
        } catch {}
      }
      // Seguimiento proactivo por WhatsApp — silencioso si el asesor no es plan Black
      notificarAsesorBlack(supabaseAdmin, l.asesor_email, 'lead_sin_seguimiento', { nombre: l.nombre, zona_interes: l.zona_interes || undefined, dias: 2 }).catch(() => {})
    } else {
      sinAsignar.push(l)
    }
    await supabaseAdmin.from('leads').update({ seguimiento_enviado: true }).eq('id', l.id)
    seguimientosEnviados++
  }

  if (sinAsignar.length > 0 && process.env.RESEND_API_KEY) {
    try {
      await fetch(process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL + '/api/email' : 'https://www.nido-cr.com/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'davidretanaalvarez@gmail.com',
          tipo: 'leads_sin_asignar',
          data: { cantidad: sinAsignar.length, dias: 2 },
        }),
      })
    } catch {}
  }

  return NextResponse.json({ ok: true, enviados, resenasSolicitadas, seguimientosEnviados })
}
