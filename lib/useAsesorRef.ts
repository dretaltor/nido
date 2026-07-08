'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from './supabase'

interface AsesorRef {
  asesorEmail: string | null
  asesorNombre: string | null
}

// Lee ?ref=correo@asesor.com de la URL (link personalizado que un asesor comparte
// con sus prospectos) y lo valida contra asesores_publicos antes de confiar en él,
// para no asignar leads a un correo arbitrario pasado por query string.
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
    supabase.from('asesores_publicos').select('correo,nombre').eq('correo', ref).maybeSingle().then(({ data }) => {
      if (!activo) return
      setAsesor(data?.correo ? { asesorEmail: data.correo, asesorNombre: data.nombre } : { asesorEmail: null, asesorNombre: null })
    })
    return () => { activo = false }
  }, [ref])

  return asesor
}
