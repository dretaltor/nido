import { usdACrc, fmtCrc, TIPO_CAMBIO_USD_CRC } from './exchangeRate'

// Toda propiedad guarda `precio` siempre en USD (valor canónico usado para
// filtros, orden, comisiones y métricas de admin -- eso nunca cambia). Si el
// asesor la tasó en colones al publicarla, `moneda` es 'CRC' y
// `precio_moneda_original` guarda el monto exacto que escribió, congelado en
// ese momento (no se recalcula con el tipo de cambio del día). Estas
// funciones deciden qué mostrar como precio principal y cuál como referencia
// secundaria en cualquier vista pública.

export interface PropiedadConPrecio {
  precio?: number | null
  moneda?: string | null
  precio_moneda_original?: number | null
}

export function precioPrincipal(p: PropiedadConPrecio): string {
  if (p.moneda === 'CRC' && p.precio_moneda_original) {
    return fmtCrc(p.precio_moneda_original)
  }
  return '$' + Math.round(p.precio || 0).toLocaleString('en-US')
}

// Referencia en la otra moneda, para mostrar en chico junto al precio
// principal. Usa el tipo de cambio vigente (recibido como parámetro) solo
// para esta conversión de referencia -- el precio principal nunca depende de
// un tipo de cambio que cambie día a día.
export function precioSecundario(p: PropiedadConPrecio, tipoCambio: number = TIPO_CAMBIO_USD_CRC): string {
  if (p.moneda === 'CRC' && p.precio_moneda_original) {
    return '$' + Math.round(p.precio || 0).toLocaleString('en-US')
  }
  return fmtCrc(usdACrc(p.precio || 0, tipoCambio))
}

// Texto plano sin símbolos de formato, útil para mensajes de WhatsApp/email
// donde ya se antepone el símbolo manualmente o se necesita solo el número.
export function precioPrincipalPlano(p: PropiedadConPrecio): string {
  if (p.moneda === 'CRC' && p.precio_moneda_original) {
    return Math.round(p.precio_moneda_original).toLocaleString('es-CR')
  }
  return Math.round(p.precio || 0).toLocaleString('en-US')
}

export function simboloPrincipal(p: PropiedadConPrecio): string {
  return p.moneda === 'CRC' && p.precio_moneda_original ? '₡' : '$'
}
