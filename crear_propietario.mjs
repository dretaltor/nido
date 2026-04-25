import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('app/propietario', { recursive: true })

const page = `'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Propiedad {
  id: string
  titulo: string
  precio: number
  zona: string
  operacion: string
  tipo: string
  disponible: boolean
}

export default function Propietario() {
  const [email, setEmail] = useState('')
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [seleccionada, setSeleccionada] = useState<Propiedad | null>(null)
  const [visitas, setVisitas] = useState(0)
  const [consultas, setConsultas] = useState(0)
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const buscarPropiedades = async () => {
    if (!email) { alert('Ingresa tu email'); return }
    setLoading(true)
    const { data } = await supabase
      .from('propiedades')
      .select('*')
      .ilike('asesor_email', email)
    setPropiedades(data || [])
    setBuscado(true)
    setLoading(false)
  }

  const verReporte = async (prop: Propiedad) => {
    setSeleccionada(prop)
    const { count: v } = await supabase
      .from('visitas')
      .select('*', { count: 'exact', head: true })
      .eq('propiedad_id', prop.id)
    const { count: c } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('propiedad_id', prop.id)
    setVisitas(v || 0)
    setConsultas(c || 0)
  }

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>Portal del Propietario</p>
      </nav>

      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.3rem' }}>🏠 Portal del Propietario</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Ingresa tu email para ver el reporte de tu propiedad</p>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscarPropiedades()} type="email" placeholder="tu@email.com" style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', color: '#111827' }} />
            <button onClick={buscarPropiedades} disabled={loading} style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#15803d', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Buscando...' : 'Ver reporte'}
            </button>
          </div>
        </div>

        {buscado && propiedades.length === 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🔍</p>
            <p style={{ color: '#374151', fontWeight: 'bold' }}>No encontramos propiedades con ese email</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Verifica que sea el mismo email que usaste al registrar tu propiedad</p>
          </div>
        )}

        {propiedades.length > 0 && !seleccionada && (
          <div>
            <p style={{ color: '#374151', fontWeight: 'bold', marginBottom: '1rem' }}>Selecciona una propiedad para ver su reporte:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {propiedades.map(p => (
                <div key={p.id} onClick={() => verReporte(p)} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', border: '2px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#14532d' }}>{p.titulo}</p>
                    <p style={{ margin: '0.3rem 0 0', color: '#6b7280', fontSize: '0.85rem' }}>📍 {p.zona} · {p.operacion === 'venta' ? 'Venta' : 'Alquiler'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#15803d' }}>${p.precio.toLocaleString()}</p>
                    <span style={{ fontSize: '0.75rem', color: p.disponible ? '#15803d' : '#6b7280' }}>{p.disponible ? '● Activa' : '● Inactiva'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {seleccionada && (
          <div>
            <button onClick={() => setSeleccionada(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', padding: 0 }}>← Volver</button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 1rem' }}>{seleccionada.titulo}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { icon: '👁️', label: 'Visitas totales', value: visitas },
                { icon: '💬', label: 'Consultas recibidas', value: consultas },
                { icon: '💰', label: 'Precio publicado', value: '$' + seleccionada.precio.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', margin: '0 0 0.4rem' }}>{stat.icon}</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{stat.value}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ color: '#14532d', margin: '0 0 1rem', fontSize: '1rem' }}>📊 Resumen del mes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  { label: 'Estado de la propiedad', value: seleccionada.disponible ? 'Activa y visible' : 'Inactiva', color: seleccionada.disponible ? '#15803d' : '#6b7280' },
                  { label: 'Tipo de operación', value: seleccionada.operacion === 'venta' ? 'En venta' : 'En alquiler', color: '#374151' },
                  { label: 'Zona', value: seleccionada.zona, color: '#374151' },
                  { label: 'Precio de mercado recomendado', value: 'Contáctanos para avalúo', color: '#0ea5e9' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{item.label}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: item.color, fontSize: '0.9rem' }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <a href="/contacto" style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Hablar con mi asesor</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}`

writeFileSync('app/propietario/page.tsx', page)
console.log('Dashboard del propietario creado exitosamente')
