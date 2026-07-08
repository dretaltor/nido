import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit'
import type { AlertaBusqueda } from '../../../../lib/database.types'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const permitido = await checkRateLimit('baja-precio:' + getClientIp(req), 30, 10)
    if (!permitido) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })

    const { propiedadId } = await req.json()
    if (!propiedadId) return NextResponse.json({ error: 'propiedadId requerido' }, { status: 400 })

    const { data: prop } = await supabaseAdmin
      .from('propiedades')
      .select('id,titulo,zona,tipo,operacion,precio,precio_anterior,disponible,verificacion_estado')
      .eq('id', propiedadId)
      .maybeSingle()

    if (!prop || !prop.disponible || prop.verificacion_estado !== 'aprobada') {
      return NextResponse.json({ ok: true, notificados: 0, motivo: 'propiedad no publicada' })
    }

    // Solo notificar si hubo una baja real de precio desde el ultimo cambio registrado por el trigger,
    // y solo una vez por baja (se "colapsa" precio_anterior al terminar).
    if (prop.precio_anterior == null || Number(prop.precio) >= Number(prop.precio_anterior)) {
      return NextResponse.json({ ok: true, notificados: 0, motivo: 'no hay baja de precio pendiente' })
    }

    const { data: alertas } = await supabaseAdmin
      .from('alertas_busqueda')
      .select('id,email,zona,tipo,operacion,precio_max')
      .eq('activa', true)

    const matches = (alertas || []).filter((a: Partial<AlertaBusqueda>) => {
      const zonaOk = !a.zona || (prop.zona && (prop.zona.toLowerCase().includes(a.zona.toLowerCase()) || a.zona.toLowerCase().includes(prop.zona.toLowerCase())))
      const tipoOk = !a.tipo || (prop.tipo && a.tipo.toLowerCase() === prop.tipo.toLowerCase())
      const operacionOk = !a.operacion || (prop.operacion && a.operacion.toLowerCase() === prop.operacion.toLowerCase())
      const precioOk = a.precio_max == null || Number(prop.precio) <= Number(a.precio_max)
      return zonaOk && tipoOk && operacionOk && precioOk
    })

    let notificados = 0
    if (matches.length > 0 && process.env.RESEND_API_KEY) {
      const base = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://www.nido-cr.com'
      await Promise.all(matches.map(async (m: Partial<AlertaBusqueda>) => {
        try {
          await fetch(base + '/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: m.email,
              tipo: 'alerta_baja_precio',
              data: {
                titulo: prop.titulo, zona: prop.zona,
                precioAnterior: prop.precio_anterior, precioNuevo: prop.precio,
                link: 'https://www.nido-cr.com/propiedades/' + prop.id,
                bajaLink: 'https://www.nido-cr.com/alertas/baja/' + m.id,
              },
            }),
          })
          notificados++
        } catch {}
      }))
      await supabaseAdmin.from('alertas_busqueda').update({ ultima_notificacion_at: new Date().toISOString() }).in('id', matches.map((m) => m.id))
    }

    // Colapsar precio_anterior para no re-notificar esta misma baja en llamadas repetidas
    await supabaseAdmin.from('propiedades').update({ precio_anterior: prop.precio }).eq('id', prop.id)

    return NextResponse.json({ ok: true, notificados })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 })
  }
}
