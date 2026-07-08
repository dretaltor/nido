'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

interface PropiedadMatch {
  id: string
  titulo: string
  precio: number
  tipo: string
  zona: string
  habitaciones: number | null
  banos: number | null
  metros: number | null
  fotos: string[] | null
}

interface PropiedadesQueCalificanProps {
  precioMax: number
  precioMin?: number
  titulo?: string
  limite?: number
}

export function PropiedadesQueCalifican({ precioMax, precioMin, titulo, limite = 3 }: PropiedadesQueCalificanProps) {
  const [propiedades, setPropiedades] = useState<PropiedadMatch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!precioMax || precioMax <= 0) return
    let activo = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    let q = supabase.from('propiedades')
      .select('id,titulo,precio,tipo,zona,habitaciones,banos,metros,fotos')
      .eq('disponible', true)
      .eq('verificacion_estado', 'aprobada')
      .eq('operacion', 'venta')
      .lte('precio', precioMax)
      .order('precio', { ascending: false })
      .limit(limite)
    if (precioMin) q = q.gte('precio', precioMin)
    q.then(({ data }) => {
      if (!activo) return
      setPropiedades((data || []) as unknown as PropiedadMatch[])
      setLoading(false)
    })
    return () => { activo = false }
  }, [precioMax, precioMin, limite])

  if (!precioMax || precioMax <= 0 || loading) return null
  if (propiedades.length === 0) return null

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: '#0D1F15', marginBottom: 4 }}>
        {titulo || 'Propiedades que califican'}
      </div>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
        Encontramos {propiedades.length} propiedad{propiedades.length === 1 ? '' : 'es'} disponible{propiedades.length === 1 ? '' : 's'} dentro de tu rango.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {propiedades.map(p => {
          const foto = p.fotos?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=60'
          return (
            <Link key={p.id} href={`/propiedades/${p.id}`} style={{ display: 'block', textDecoration: 'none', border: '1px solid rgba(27,94,59,0.1)', borderRadius: 14, overflow: 'hidden', background: 'white' }}>
              <img src={foto} alt={p.titulo} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1F15', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>{p.zona}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1B5E3B' }}>${p.precio.toLocaleString('es-CR')}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
