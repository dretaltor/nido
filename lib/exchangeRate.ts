import { supabase } from './supabase'

// Valor de respaldo si todavía no se pudo leer el tipo de cambio en vivo desde
// la tabla `tipo_cambio` (por ejemplo, en el primer render antes de que
// resuelva la consulta, o si la consulta falla). La tabla se actualiza a
// diario vía el cron /api/tipo-cambio, que consulta la API pública del
// Ministerio de Hacienda (referenciada al tipo de cambio de venta del BCCR).
export const TIPO_CAMBIO_USD_CRC = 455

export function usdACrc(usd: number, tipoCambio: number = TIPO_CAMBIO_USD_CRC): number {
  return Math.round(usd * tipoCambio)
}

export function crcAUsd(crc: number, tipoCambio: number = TIPO_CAMBIO_USD_CRC): number {
  return Math.round(crc / tipoCambio)
}

export function fmtCrc(n: number): string {
  return '₡' + Math.round(n).toLocaleString('es-CR')
}

// Lee el tipo de cambio vigente guardado en Supabase. Devuelve el valor de
// respaldo si la fila no existe todavía o si falla la consulta.
export async function obtenerTipoCambioActual(): Promise<number> {
  try {
    const { data } = await supabase.from('tipo_cambio').select('valor').eq('id', true).maybeSingle()
    return data?.valor ? Number(data.valor) : TIPO_CAMBIO_USD_CRC
  } catch {
    return TIPO_CAMBIO_USD_CRC
  }
}
