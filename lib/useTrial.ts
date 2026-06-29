'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useTrial() {
  const [bloqueado, setBloqueado] = useState(false)
  const [checando, setChecando] = useState(true)
  const [planActivo, setPlanActivo] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) { setChecando(false); return }
      const { data: sus } = await supabase.from('suscripciones').select('plan,activo,es_trial,trial_fin').eq('correo', user.email).maybeSingle()
      const trialVencido = sus?.es_trial && sus?.trial_fin && new Date(sus.trial_fin) < new Date()
      const tienePlanPagoActivo = sus?.activo && !sus?.es_trial
      setBloqueado(!!(trialVencido && !tienePlanPagoActivo))
      setPlanActivo(sus?.plan || 'gratis')
      setChecando(false)
    })
  }, [])

  return { bloqueado, checando, planActivo }
}
