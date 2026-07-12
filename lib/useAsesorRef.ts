'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from './supabase'

interface AsesorRef {
  asesorEmail: string | null
  asesorNombre: string | null
}

// Lee ?ref=correo@asesor.com de la URL (link personalizado que un asesor comparte
// con sus prospectos) y lo valida antes de confiar en él, para no asignar leads a
// un correo arbitrario pasado por query string.
//
// Se valida contra `asesores_ref_validos` (solo exige verificado=true) y NO contra
// `asesores_publicos`, que además exige valeria_onboarding_completo=true y
// perfil_publico_visible=true — esos dos requisitos son para decidir qué se
// muestra en la vitrina pública, no para decidir si un asesor real puede recibir
// leads. Usar la vista pública acá rompía silenciosamente la atribución de leads
// de cualquier asesor verificado que aún no completó el onboarding de Valeria, o
// que desactivó su perfil público desde el dashboard.
export function useAsesorRef(): AsesorRef {
  const params = useSearchParams()
  const ref = params.get('ref')
  const [asesor, setAsesor] = useState<AsesorRef>({ asesorEmail: null, asesorNombre: null })

  useEffect(() => {
    if (!ref) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAsesor({ asesorEmail: null, asesorNombre: null })
      return
    }
    let activo = true
    supabase.from('asesores_ref_validos').select('correo,nombre').eq('correo', ref).maybeSingle().then(({ data }) => {
      if (!activo) return
      setAsesor(data?.correo ? { asesorEmail: data.correo, asesorNombre: data.nombre } : { asesorEmail: null, asesorNombre: null })
    })
    return () => { activo = false }
  }, [ref])

  return asesor
}
