'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

interface UserContext {
  user: User | null
  tipo: 'asesor' | 'propietario' | null
  loading: boolean
  isAsesor: boolean
  isPropietario: boolean
}

const AuthContext = createContext<UserContext>({
  user: null, tipo: null, loading: true, isAsesor: false, isPropietario: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tipo, setTipo] = useState<'asesor' | 'propietario' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const tipoLocal = typeof window !== 'undefined' ? localStorage.getItem('nido_user_tipo') : null
        const tipoMeta = session.user.user_metadata?.tipo
        const t = (tipoLocal || tipoMeta || 'asesor') as 'asesor' | 'propietario'
        setTipo(t)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const tipoLocal = typeof window !== 'undefined' ? localStorage.getItem('nido_user_tipo') : null
        const tipoMeta = session.user.user_metadata?.tipo
        const t = (tipoLocal || tipoMeta || 'asesor') as 'asesor' | 'propietario'
        setTipo(t)
      } else {
        setUser(null)
        setTipo(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      user, tipo, loading,
      isAsesor: tipo === 'asesor',
      isPropietario: tipo === 'propietario'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
