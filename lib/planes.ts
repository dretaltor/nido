// Configuración central de planes NIDO — límites y features por plan
// Los IDs internos (gratis/pro/enterprise) nunca cambian, solo los nombres públicos

export interface PlanConfig {
  nombrePublico: string
  precioMensual: number // USD/mes, referencia sin facturación anual (0 = gratis)
  maxPropiedades: number // Infinity = ilimitado
  valeriaIA: boolean
  academiaCompleta: boolean
  soportePrioritario: boolean
  tour360PorMes: number // tours 360 incluidos gratis por mes mientras la suscripción esté activa; 0 = no incluye. Adicionales tienen costo aparte (no incluidos aquí).
}

export const PLANES: Record<string, PlanConfig> = {
  gratis: {
    nombrePublico: 'Despega',
    precioMensual: 0,
    maxPropiedades: 5,
    valeriaIA: false,
    academiaCompleta: false,
    soportePrioritario: false,
    tour360PorMes: 0,
  },
  pro: {
    nombrePublico: 'Elite',
    precioMensual: 59,
    maxPropiedades: 15,
    valeriaIA: true,
    academiaCompleta: true,
    soportePrioritario: false,
    tour360PorMes: 0,
  },
  enterprise: {
    nombrePublico: 'Black',
    precioMensual: 149,
    maxPropiedades: Infinity,
    valeriaIA: true,
    academiaCompleta: true,
    soportePrioritario: true,
    tour360PorMes: 1,
  },
}

export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  return PLANES[planId || 'gratis'] || PLANES.gratis
}
