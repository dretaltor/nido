'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Propiedad {
  id: string; titulo: string; descripcion: string; precio: number; tipo: string;
  operacion: string; habitaciones: number; banos: number; metros: number;
  zona: string; direccion: string; disponible: boolean;
}

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => { cargarPropiedades() }, [])

  const cargarPropiedades = async () => {
    const { data } = await supabase.from('propiedades').select('*').eq('disponible', true).order('created_at', { ascending: false })
    setPropiedades(data || [])
    setLoading(false)
  }

  const filtradas = propiedades.filter(p => filtro === 'todas' ? true : p.operacion === filtro)

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --green: #1B5E3B; --green-light: #2D7A52; --gold: #C8A96E; --cream: #F7F4EE; --dark: #0D1F15; --gray: #6B7280; }
body { font-family: 'DM Sans', sans-serif; background: #FAFAF8; }
.nav-link { color: #6B7280; text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
.nav-link:hover { color: #1B5E3B; }
.btn-primary { background: #1B5E3B; color: white; padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-block; transition: all 0.2s; border: none; cursor: pointer; }
.btn-primary:hover { background: #2D7A52; }
.btn-outline { border: 1px solid #1B5E3B; color: #1B5E3B; padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-block; background: white; cursor: pointer; }
.card { background: white; border: 1px solid rgba(27,94,59,0.08); border-radius: 16px; overflow: hidden; transition: all 0.2s; }
.card:hover { border-color: rgba(27,94,59,0.15); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(27,94,59,0.08); }
.filter-btn { padding: 0.45rem 1.1rem; border-radius: 100px; border: 1px solid rgba(27,94,59,0.15); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; background: white; color: #6B7280; }
.filter-btn.active { background: #1B5E3B; color: white; border-color: #1B5E3B; }
input, textarea, select { font-family: 'DM Sans', sans-serif; }
`}</style>
      
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 4rem', background: 'rgba(250,250,248,0.95)', borderBottom: '1px solid rgba(27,94,59,0.08)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
    <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1B5E3B', textDecoration: 'none', letterSpacing: '-0.02em' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></a>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <a href="/propiedades" className="nav-link">Propiedades</a>
      <a href="/asesores" className="nav-link">Asesores</a>
      <a href="/academia" className="nav-link">Academia</a>
      <a href="/precios" className="nav-link">Precios</a>
    </div>
    <div style={{ display: 'flex', gap: '0.8rem' }}>
      <a href="/login" className="btn-outline">Ingresar</a>
      <a href="/registro" className="btn-primary">Registrarse</a>
    </div>
  </nav>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', fontWeight: 500, marginBottom: '0.5rem' }}>PORTAL INMOBILIARIO</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', color: '#0D1F15', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Propiedades disponibles</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Encuentra tu propiedad ideal en Costa Rica</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', alignItems: 'center' }}>
          {['todas', 'venta', 'alquiler'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={'filter-btn' + (filtro === f ? ' active' : '')}>
              {f === 'todas' ? 'Todas' : f === 'venta' ? 'En venta' : 'En alquiler'}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#9CA3AF' }}>{filtradas.length} propiedades</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>Cargando propiedades...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filtradas.map(p => (
              <div key={p.id} className="card">
                <div style={{ background: 'linear-gradient(135deg, #F7F4EE, #EAF0EA)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative' }}>
                  {p.tipo === 'casa' ? '🏠' : p.tipo === 'apartamento' ? '🏢' : '🏗️'}
                  <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: p.operacion === 'venta' ? '#1B5E3B' : '#0D1F15', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.04em' }}>
                    {p.operacion === 'venta' ? 'VENTA' : 'ALQUILER'}
                  </span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#0D1F15', marginBottom: '0.4rem' }}>{p.titulo}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.82rem', marginBottom: '0.8rem' }}>📍 {p.zona} — {p.direccion}</p>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{p.descripcion}</p>
                  <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem', fontSize: '0.82rem', color: '#9CA3AF', paddingTop: '1rem', borderTop: '1px solid rgba(27,94,59,0.06)' }}>
                    <span>🛏 {p.habitaciones} hab</span>
                    <span>🚿 {p.banos} baños</span>
                    <span>📐 {p.metros}m²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.1rem' }}>PRECIO</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#1B5E3B' }}>
                        {'$' + p.precio.toLocaleString()}{p.operacion === 'alquiler' ? <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>/mes</span> : ''}
                      </div>
                    </div>
                    <a href="/contacto" className="btn-primary">Consultar</a>
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