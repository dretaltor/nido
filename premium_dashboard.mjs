import { writeFileSync } from 'fs'

const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --green: #1B5E3B; --gold: #C8A96E; --cream: #F7F4EE; --dark: #0D1F15; --gray: #6B7280; }
body { font-family: 'DM Sans', sans-serif; background: #FAFAF8; }
.btn-primary { background: #1B5E3B; color: white; padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-block; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: #2D7A52; }
.btn-outline { border: 1px solid rgba(27,94,59,0.2); color: #1B5E3B; padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-block; background: white; cursor: pointer; }
.card { background: white; border: 1px solid rgba(27,94,59,0.08); border-radius: 16px; padding: 1.5rem; }
.nav-link { color: #6B7280; text-decoration: none; font-size: 0.85rem; }
.module-card { background: white; border: 1px solid rgba(27,94,59,0.08); border-radius: 16px; padding: 1.5rem; text-decoration: none; display: block; transition: all 0.2s; }
.module-card:hover { border-color: rgba(27,94,59,0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(27,94,59,0.08); }
.input-field { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid rgba(27,94,59,0.15); font-size: 0.88rem; outline: none; color: #1a1a1a; background: white; box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
.input-field:focus { border-color: #1B5E3B; }
`

const dashboard = `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    setUser(user)
    const { data: props } = await supabase.from('propiedades').select('*').eq('asesor_email', user.email)
    const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setPropiedades(props || [])
    setLeads(leadsData || [])
    setLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/' }
  const leadsNuevos = leads.filter(l => l.estado === 'nuevo').length
  const leadsCerrados = leads.filter(l => l.estado === 'cerrado').length

  if (loading) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
      <p style={{ color: '#9CA3AF' }}>Cargando tu dashboard...</p>
    </main>
  )

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', minHeight: '100vh' }}>
      <style>{\`${fontStyle}\`}</style>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 4rem', background: 'rgba(250,250,248,0.95)', borderBottom: '1px solid rgba(27,94,59,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1B5E3B', textDecoration: 'none' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Hola, {user?.user_metadata?.nombre || user?.email?.split('@')[0]}</span>
          <button onClick={handleLogout} className="btn-outline" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', fontWeight: 500, marginBottom: '0.5rem' }}>PANEL DE CONTROL</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#0D1F15' }}>Tu dashboard</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '🏠', label: 'Mis propiedades', value: propiedades.length, color: '#1B5E3B' },
            { icon: '👥', label: 'Total leads', value: leads.length, color: '#0ea5e9' },
            { icon: '🔥', label: 'Leads nuevos', value: leadsNuevos, color: '#f59e0b' },
            { icon: '✅', label: 'Cierres', value: leadsCerrados, color: '#C8A96E' },
          ].map(stat => (
            <div key={stat.label} className="card">
              <div style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: stat.color, marginBottom: '0.2rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#9CA3AF', letterSpacing: '0.02em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { href: '/dashboard/agent', icon: '🤖', title: 'NIDO Agent', desc: 'Tu asistente IA — redacta, analiza y genera contenido', color: '#7c3aed' },
            { href: '/dashboard/crm', icon: '📊', title: 'CRM de Leads', desc: 'Gestiona todos tus prospectos y su estado', color: '#0ea5e9' },
            { href: '/dashboard/nueva-propiedad', icon: '➕', title: 'Publicar propiedad', desc: 'Agrega una nueva propiedad al portal', color: '#1B5E3B' },
            { href: '/propiedades', icon: '🏡', title: 'Ver portal', desc: 'Mira cómo ven tus clientes NIDO', color: '#f59e0b' },
            { href: '/chat', icon: '💬', title: 'Asesor IA', desc: 'Prueba el chat de IA de tus clientes', color: '#06b6d4' },
            { href: '/contacto', icon: '📬', title: 'Capturar leads', desc: 'Comparte este link con tus clientes', color: '#ec4899' },
          ].map(item => (
            <a key={item.href} href={item.href} className="module-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <p style={{ margin: 0, fontWeight: 500, color: item.color, fontSize: '0.95rem' }}>{item.title}</p>
              </div>
              <p style={{ color: '#9CA3AF', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, color: '#0D1F15' }}>Últimos leads</h2>
          <a href="/dashboard/crm" style={{ color: '#1B5E3B', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 500 }}>Ver todos →</a>
        </div>

        {leads.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Aún no tienes leads. Comparte el link de contacto.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(27,94,59,0.08)', overflow: 'hidden' }}>
            {leads.slice(0, 5).map((lead, i) => (
              <div key={lead.id} style={{ padding: '1rem 1.5rem', borderBottom: i < 4 ? '1px solid rgba(27,94,59,0.06)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', background: '#F7F4EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#1B5E3B', fontWeight: 500 }}>
                    {(lead.nombre || 'L')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: '#0D1F15', fontSize: '0.9rem' }}>{lead.nombre || 'Sin nombre'}</p>
                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.78rem' }}>{lead.email} · {lead.zona_interes || 'Sin zona'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '0.2rem 0.7rem', borderRadius: '100px', background: lead.estado === 'nuevo' ? '#EFF6FF' : lead.estado === 'cerrado' ? '#F0FDF4' : '#FEF3C7', color: lead.estado === 'nuevo' ? '#1D4ED8' : lead.estado === 'cerrado' ? '#1B5E3B' : '#92400E' }}>
                    {lead.estado}
                  </span>
                  <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>{new Date(lead.created_at).toLocaleDateString('es-CR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}`

writeFileSync('app/dashboard/page.tsx', dashboard)
console.log('Dashboard premium aplicado')
