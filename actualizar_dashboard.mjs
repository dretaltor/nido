import { writeFileSync } from 'fs'

const dashboard = `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const leadsNuevos = leads.filter(l => l.estado === 'nuevo').length
  const leadsCerrados = leads.filter(l => l.estado === 'cerrado').length

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
            { icon: '👥', label: 'Total leads', value: leads.length },
            { icon: '🔥', label: 'Leads nuevos', value: leadsNuevos },
            { icon: '✅', label: 'Cierres', value: leadsCerrados },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>{stat.icon}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{stat.value}</p>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { href: '/dashboard/agent', icon: '🤖', title: 'NIDO Agent', desc: 'Tu asistente IA — redacta emails, analiza leads y genera contenido', color: '#7c3aed' },
            { href: '/dashboard/crm', icon: '📊', title: 'CRM de Leads', desc: 'Gestiona todos tus prospectos y su estado en el pipeline', color: '#0ea5e9' },
            { href: '/dashboard/nueva-propiedad', icon: '➕', title: 'Publicar propiedad', desc: 'Agrega una nueva propiedad al portal de NIDO', color: '#15803d' },
            { href: '/propiedades', icon: '🏡', title: 'Ver portal', desc: 'Mira cómo ven tus clientes las propiedades en NIDO', color: '#f59e0b' },
            { href: '/chat', icon: '💬', title: 'Asesor IA', desc: 'Prueba el chat de IA que usan tus clientes', color: '#06b6d4' },
            { href: '/contacto', icon: '📬', title: 'Formulario leads', desc: 'Comparte este link con tus clientes para capturar leads', color: '#ec4899' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'block', transition: 'transform 0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <p style={{ margin: 0, fontWeight: 'bold', color: item.color, fontSize: '1rem' }}>{item.title}</p>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#14532d', margin: 0 }}>Últimos leads</h2>
          <a href="/dashboard/crm" style={{ color: '#15803d', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>Ver todos →</a>
        </div>

        {leads.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Aún no tienes leads. Comparte el link de contacto con tus clientes.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {leads.slice(0, 5).map((lead, i) => (
              <div key={lead.id} style={{ padding: '1rem 1.5rem', borderBottom: i < Math.min(leads.length, 5) - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#14532d', fontSize: '0.95rem' }}>{lead.nombre || 'Sin nombre'}</p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{lead.email} · {lead.zona_interes || 'Sin zona'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: lead.estado === 'nuevo' ? '#dbeafe' : lead.estado === 'cerrado' ? '#dcfce7' : '#fef3c7', color: lead.estado === 'nuevo' ? '#1d4ed8' : lead.estado === 'cerrado' ? '#15803d' : '#92400e', textTransform: 'capitalize' }}>
                    {lead.estado}
                  </span>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.75rem' }}>{new Date(lead.created_at).toLocaleDateString('es-CR')}</p>
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
console.log('Dashboard actualizado exitosamente')
