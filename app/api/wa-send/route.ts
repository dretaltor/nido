import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '../../../lib/whatsapp'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { to, message, visitaId } = await req.json()
  if (!to || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Antes: cualquiera podia mandar WA a cualquier numero usando el numero oficial de NIDO.
  // Ahora: el destino debe coincidir con un registro real de visita (comprador o asesor de esa visita).
  if (!visitaId) {
    return NextResponse.json({ error: 'Falta referencia de visita' }, { status: 400 })
  }

  const { data: visita } = await supabaseAdmin.from('visitas').select('comprador_telefono,asesor_whatsapp').eq('id', visitaId).maybeSingle()
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
  return NextResponse.json({ ok })
}
