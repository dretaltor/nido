'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'

export default function BajaAlerta() {
  const params = useParams()
  const id = params?.id as string
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando')

  useEffect(() => {
    if (!id) return
    supabase.rpc('desactivar_alerta', { p_id: id })
      .then(({ error }) => setEstado(error ? 'error' : 'ok'))
  }, [id])

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif", background: '#F4F3EF', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, marginBottom: 16 }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></div>
        {estado === 'cargando' && <p style={{ color: '#6B7280', fontSize: 14 }}>Procesando...</p>}
        {estado === 'ok' && <p style={{ color: '#1B5E3B', fontSize: 15 }}>✓ Listo — ya no vas a recibir alertas de esta búsqueda.</p>}
        {estado === 'error' && <p style={{ color: '#c0392b', fontSize: 15 }}>No pudimos procesar tu solicitud. Escribinos a hola@nido-cr.com.</p>}
        <Link href="/propiedades" style={{ display: 'inline-block', marginTop: 20, color: '#1B5E3B', fontSize: 13, textDecoration: 'none' }}>← Volver a NIDO</Link>
      </div>
    </main>
  )
}
