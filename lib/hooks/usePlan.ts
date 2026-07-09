'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export type Plan = 'gratis' | 'pro' | 'enterprise'

export interface SuscripcionActiva {
  plan: Plan
  periodo: 'mensual' | 'anual'
  activo: boolean
  stripe_subscription_id: string | null
}

export function usePlan() {
  const [plan, setPlan] = useState<Plan>('gratis')
  const [suscripcion, setSuscripcion] = useState<SuscripcionActiva | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      
      const { data } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('correo', user.email!)
        .eq('activo', true)
        .maybeSingle()

      if (data) {
        setPlan(data.plan as Plan)
        setSuscripcion(data)
      }
      setLoading(false)
    })
  }, [])

  const esPro = plan === 'pro' || plan === 'enterprise'
  const esEnterprise = plan === 'enterprise'

  const limites = {
    gratis:     { propiedades: 2,  tours: 0,  crm: false, academia: false, soporte: 'email' },
    pro:        { propiedades: 15, tours: 0,  crm: true,  academia: true,  soporte: '24h' },
    enterprise: { propiedades: 999, tours: 1, crm: true, academia: true, soporte: '2h' },
  }

  return { plan, suscripcion, loading, esPro, esEnterprise, limites: limites[plan] }
}
