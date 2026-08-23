import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '../../../lib/whatsapp'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const permitido = await checkRateLimit('wa-send:' + getClientIp(req), 15, 10)
  if (!permitido) {
    return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
  }

  const { to, message, visitaId, notificarPropietario } = await req.json()
  if (!to || !message) return NextResponse.json({ error: 'Faltan campos requeridos (to, message)' }, { status: 400 })

  // Antes: cualquiera podia mandar WA a cualquier numero usando el numero oficial de NIDO.
  // Ahora: el destino debe coincidir con un registro real de visita (comprador o asesor de esa visita).
  if (!visitaId) {
    return NextResponse.json({ error: 'Falta referencia de visita' }, { status: 400 })
  }

  const { data: visita } = await supabaseAdmin.from('visitas').select('comprador_telefono,asesor_whatsapp,comprador_nombre,propiedad_id,propiedad_titulo,fecha,hora,tipo').eq('id', visitaId).maybeSingle()
  if (!visita) {
    return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
  }

  const toClean = to.replace(/[^0-9]/g, '')
  const numerosValidos = [visita.comprador_telefono, visita.asesor_whatsapp]
    .filter(Boolean)
    .map((n: string) => n.replace(/[^0-9]/g, ''))

  if (!numerosValidos.includes(toClean)) {
    return NextResponse.json({ error: 'Destinatario no coincide con la visita' }, { status: 403 })
  }

  const ok = await sendWhatsApp(to, message)

  // Coordinación de agenda: al confirmar una visita, el dashboard puede pedir que también
  // se le avise al propietario. El destino lo resuelve el servidor (propiedad -> propietario),
  // nunca lo especifica el cliente -- así no hace falta abrir el allowlist de arriba a un
  // numero elegido por el navegador.
  if (notificarPropietario && visita.propiedad_id) {
    try {
      const { data: prop } = await supabaseAdmin.from('propiedades').select('propietario_email').eq('id', visita.propiedad_id).maybeSingle()
      if (prop?.propietario_email) {
        const { data: propietarioContacto } = await supabaseAdmin.from('propietarios').select('nombre, telefono').eq('correo', prop.propietario_email).maybeSingle()
        if (propietarioContacto?.telefono) {
          const fechaLegible = (() => { try { return new Date(visita.fecha + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' }) } catch { return visita.fecha } })()
          const mensajePropietario = `🏠 *NIDO* — Hola ${propietarioContacto.nombre || ''}, te contamos que se confirmó una visita a tu propiedad "${visita.propiedad_titulo}":\n\nComprador: ${visita.comprador_nombre}\nFecha: ${fechaLegible}\nHora: ${visita.hora}\nTipo: ${visita.tipo === 'virtual' ? 'Virtual' : 'Presencial'}\n\nTu asesor NIDO está coordinando todo. Cualquier duda, escribinos por acá.`
          await sendWhatsApp(propietarioContacto.telefono, mensajePropietario)
        }
      }
    } catch (e) {
      console.error('Error notificando propietario en wa-send:', e)
    }
  }

  return NextResponse.json({ ok })
}
