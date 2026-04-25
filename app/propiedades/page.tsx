'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Propiedad {
  id: string
  titulo: string
  descripcion: string
  precio: number
  tipo: string
  operacion: string
  habitaciones: number
  banos: number
  metros: number
  zona: string
  direccion: string
  disponible: boolean
}

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    cargarPropiedades()
  }, [])

  const cargarPropiedades = async () => {
    const { data } = await supabase
      .from('propiedades')
      .select('*')
      .eq('disponible', true)
      .order('created_at', { ascending: false })
    setPropiedades(data || [])
    setLoading(false)
  }

  const filtradas = propiedades.filter(p => filtro === 'todas' ? true : p.operacion === filtro)

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <a href="/contacto" style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Hablar con Asesor IA</a>
      </nav>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14532d', marginBottom: '0.5rem' }}>Propiedades disponibles</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Encuentra tu propiedad ideal en Costa Rica</p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {['todas', 'venta', 'alquiler'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #15803d', backgroundColor: filtro === f ? '#15803d' : 'white', color: filtro === f ? 'white' : '#15803d', cursor: 'pointer', fontWeight: 'bold' }}>
              {f === 'todas' ? 'Todas' : f === 'venta' ? 'En venta' : 'En alquiler'}
            </button>
          ))}
        </div>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando propiedades...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filtradas.map(p => (
              <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ backgroundColor: '#dcfce7', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                  {p.tipo === 'casa' ? '🏠' : p.tipo === 'apartamento' ? '🏢' : '🏗️'}
                </div>
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#14532d' }}>{p.titulo}</h3>
                    <span style={{ backgroundColor: p.operacion === 'venta' ? '#dcfce7' : '#dbeafe', color: p.operacion === 'venta' ? '#15803d' : '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                      {p.operacion === 'venta' ? 'Venta' : 'Alquiler'}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 0.8rem' }}>📍 {p.zona} — {p.direccion}</p>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: '0 0 1rem', lineHeight: '1.5' }}>{p.descripcion}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                    <span>🛏 {p.habitaciones} hab</span>
                    <span>🚿 {p.banos} baños</span>
                    <span>📐 {p.metros}m²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#15803d' }}>
                      {p.operacion === 'alquiler' ? '$' + p.precio.toLocaleString() + '/mes' : '$' + p.precio.toLocaleString()}
                    </p>
                    <a href="/contacto" style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>Consultar</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}