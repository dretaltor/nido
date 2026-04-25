'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    setUser(user)
    const { data } = await supabase
      .from('propiedades')
      .select('*')
      .eq('asesor_email', user.email)
      .order('created_at', { ascending: false })
    setPropiedades(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <main style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Cargando tu dashboard...</p>
    </main>
  )

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Hola, {user?.user_metadata?.nombre || user?.email}</span>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '0.85rem' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '🏠', label: 'Mis propiedades', value: propiedades.length },
            { icon: '👁️', label: 'Visitas este mes', value: '0' },
            { icon: '💬', label: 'Leads activos', value: '0' },
            { icon: '✅', label: 'Cierres', value: '0' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>{stat.icon}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{stat.value}</p>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#14532d', margin: 0 }}>Mis propiedades</h2>
          <a href="/dashboard/nueva-propiedad" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>+ Publicar propiedad</a>
        </div>

        {propiedades.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>🏡</p>
            <p style={{ color: '#374151', fontWeight: 'bold', marginBottom: '0.5rem' }}>No tienes propiedades publicadas</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Publica tu primera propiedad y empieza a recibir clientes</p>
            <a href="/dashboard/nueva-propiedad" style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Publicar primera propiedad</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {propiedades.map((p: any) => (
              <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#14532d' }}>{p.titulo}</h3>
                  <span style={{ backgroundColor: p.disponible ? '#dcfce7' : '#f3f4f6', color: p.disponible ? '#15803d' : '#6b7280', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {p.disponible ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.5rem 0' }}>📍 {p.zona}</p>
                <p style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
                  {p.operacion === 'alquiler' ? '$' + p.precio.toLocaleString() + '/mes' : '$' + p.precio.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}