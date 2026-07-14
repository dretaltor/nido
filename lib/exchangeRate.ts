// Tipo de cambio referencial USD → CRC para mostrar un estimado en colones
// junto al precio en dólares. No es una cotización en tiempo real: se basa en
// el tipo de cambio de venta de referencia del BCCR (bccr.fi.cr) al
// 2026-07-13 y debe actualizarse manualmente de tanto en tanto, o
// reemplazarse en el futuro por una consulta en vivo a la API del BCCR.
export const TIPO_CAMBIO_USD_CRC = 455

export function usdACrc(usd: number): number {
  return Math.round(usd * TIPO_CAMBIO_USD_CRC)
}

export function crcAUsd(crc: number): number {
  return Math.round(crc / TIPO_CAMBIO_USD_CRC)
}

export function fmtCrc(n: number): string {
  return '₡' + Math.round(n).toLocaleString('es-CR')
}
