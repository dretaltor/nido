import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

// Actualiza a diario (ver vercel.json) el tipo de cambio USD->CRC que usan el
// wizard de propiedades y la calculadora, consultando la API pública y sin
// autenticación del Ministerio de Hacienda de Costa Rica, que a su vez
// referencia el tipo de cambio de venta del BCCR.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const permitido = await checkRateLimit('tipo-cambio:' + getClientIp(req), 5, 10)
  if (!permitido) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  try {
    const res = await fetch('https://api.hacienda.go.cr/indicadores/tc/dolar', {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error('API Hacienda respondió ' + res.status)
    const json = await res.json()
    const valor = Number(json?.venta?.valor)
    if (!valor || Number.isNaN(valor) || valor < 100 || valor > 2000) {
      throw new Error('Valor de tipo de cambio fuera de rango razonable: ' + json?.venta?.valor)
    }

    const { error } = await supabaseAdmin.from('tipo_cambio').upsert({
      id: true,
      valor,
      fuente: 'Ministerio de Hacienda CR (ref. BCCR), fecha ' + (json?.venta?.fecha || ''),
      actualizado_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)

    return NextResponse.json({ ok: true, valor })
  } catch (e) {
    console.error('Error actualizando tipo de cambio:', e)
    return NextResponse.json({ error: 'No se pudo actualizar el tipo de cambio: ' + (e instanceof Error ? e.message : String(e)) }, { status: 500 })
  }
}
