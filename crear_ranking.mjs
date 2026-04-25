import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('app/asesores', { recursive: true })

const page = `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Asesor {
  asesor_nombre: string
  asesor_email: string
  total: number
  disponibles: number
}

export default function Asesores() {
  const [asesores, setAsesores] = useState<Asesor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarAsesores()
  }, [])

  const cargarAsesores = async () => {
    const { data } = await supabase
      .from('propiedades')
      .select('asesor_nombre, asesor_email, disponible')
      .not('asesor_nombre', 'is', null)

    if (!data) { setLoading(false); return }

    const mapa: Record<string, Asesor> = {}
    data.forEach(p => {
      const key = p.asesor_email
      if (!mapa[key]) mapa[key] = { asesor_nombre: p.asesor_nombre, asesor_email: p.asesor_email, total: 0, disponibles: 0 }
      mapa[key].total++
      if (p.disponible) mapa[key].disponibles++
    })

    const lista = Object.values(mapa).sort((a, b) => b.total - a.total)
    setAsesores(lista)
    setLoading(false)
  }

  const medallas = ['🥇', '🥈', '🥉']

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <a href="/propiedades" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Ver propiedades</a>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.5rem' }}>🏆 Ranking de Asesores</h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>Los mejores asesores inmobiliarios de NIDO en Costa Rica</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando ranking...</p>
        ) : asesores.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>Aún no hay asesores registrados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {asesores.map((asesor, i) => (
              <div key={asesor.asesor_email} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: i === 0 ? '0 4px 16px rgba(21,128,61,0.15)' : '0 1px 4px rgba(0,0,0,0.06)', border: i === 0 ? '2px solid #15803d' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', minWidth: '50px', textAlign: 'center' }}>
                  {medallas[i] || '#' + (i + 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#14532d', fontSize: '1.1rem' }}>{asesor.asesor_nombre || 'Asesor NIDO'}</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.85rem' }}>{asesor.asesor_email}</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#15803d', fontSize: '1.3rem' }}>{asesor.total}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>Propiedades</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#0ea5e9', fontSize: '1.3rem' }}>{asesor.disponibles}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>Activas</p>
                  </div>
                </div>
                <a href={'/contacto'} style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Contactar</a>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#14532d', fontWeight: 'bold', margin: '0 0 0.5rem' }}>¿Eres asesor inmobiliario?</p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1rem' }}>Únete a NIDO Pro y aparece en el ranking</p>
          <a href="/registro" style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Unirme a NIDO</a>
        </div>
      </div>
    </main>
  )
}`

writeFileSync('app/asesores/page.tsx', page)
console.log('Ranking de asesores creado exitosamente')
