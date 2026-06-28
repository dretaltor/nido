// Configuración central de planes NIDO — límites y features por plan
// Los IDs internos (gratis/pro/enterprise) nunca cambian, solo los nombres públicos

export interface PlanConfig {
  nombrePublico: string
  maxPropiedades: number // Infinity = ilimitado
  valeriaIA: boolean
  academiaCompleta: boolean
  soportePrioritario: boolean
  toursIlimitados: boolean
}

export const PLANES: Record<string, PlanConfig> = {
  gratis: {
    nombrePublico: 'Despega',
    maxPropiedades: 5,
    valeriaIA: false,
    academiaCompleta: false,
    soportePrioritario: false,
    toursIlimitados: false,
  },
  pro: {
    nombrePublico: 'Elite',
    maxPropiedades: 15,
    valeriaIA: true,
    academiaCompleta: true,
    soportePrioritario: false,
    toursIlimitados: false,
  },
  enterprise: {
    nombrePublico: 'Black',
    maxPropiedades: Infinity,
    valeriaIA: true,
    academiaCompleta: true,
    soportePrioritario: true,
    toursIlimitados: true,
  },
}

export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  return PLANES[planId || 'gratis'] || PLANES.gratis
}
