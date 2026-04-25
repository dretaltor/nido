import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('app/dashboard/crm', { recursive: true })

const page = `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Lead {
  id: string
  nombre: string
  email: string
  telefono: string
  mensaje: string
  zona_interes: string
  presupuesto: string
  tipo_busqueda: string
  estado: string
  created_at: string
}

const ESTADOS = ['nuevo', 'contactado', 'interesado', 'visita', 'oferta', 'cerrado', 'perdido']
const COLORES: Record<string, string> = {
  nuevo: '#3b82f6', contactado: '#8b5cf6', interesado: '#f59e0b',
  visita: '#06b6d4', oferta: '#f97316', cerrado: '#15803d', perdido: '#6b7280'
}

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      cargarLeads()
    }
    getUser()
  }, [])

  const cargarLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from('leads').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
    setLeads(leads.map(l => l.id === id ? { ...l, estado } : l))
    if (leadSeleccionado?.id === id) setLeadSeleccionado({ ...leadSeleccionado, estado })
  }

  const filtrados = filtro === 'todos' ? leads : leads.filter(l => l.estado === filtro)

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d', margin: 0 }}>CRM — Gestión de Leads</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>{leads.length} leads en total</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFiltro('todos')} style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', backgroundColor: filtro === 'todos' ? '#14532d' : '#e5e7eb', color: filtro === 'todos' ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Todos ({leads.length})
          </button>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltro(e)} style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', backgroundColor: filtro === e ? COLORES[e] : '#e5e7eb', color: filtro === e ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {e} ({leads.filter(l => l.estado === e).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: leadSeleccionado ? '1fr 380px' : '1fr', gap: '1.5rem' }}>
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>Cargando leads...</p>
            ) : filtrados.length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>📭</p>
                <p style={{ color: '#374151', fontWeight: 'bold' }}>No hay leads {filtro !== 'todos' ? 'en este estado' : 'aún'}</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Los leads llegan cuando clientes consultan propiedades</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {filtrados.map(lead => (
                  <div key={lead.id} onClick={() => setLeadSeleccionado(leadSeleccionado?.id === lead.id ? null : lead)} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', border: leadSeleccionado?.id === lead.id ? '2px solid #15803d' : '2px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#14532d' }}>{lead.nombre || 'Sin nombre'}</h3>
                          <span style={{ backgroundColor: COLORES[lead.estado] + '20', color: COLORES[lead.estado], padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{lead.estado}</span>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 0.3rem' }}>📧 {lead.email} {lead.telefono ? '· 📞 ' + lead.telefono : ''}</p>
                        {lead.mensaje && <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: 0 }}>💬 {lead.mensaje.substring(0, 80)}{lead.mensaje.length > 80 ? '...' : ''}</p>}
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                        {new Date(lead.created_at).toLocaleDateString('es-CR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {leadSeleccionado && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, color: '#14532d', fontSize: '1.1rem' }}>Detalle del lead</h3>
                <button onClick={() => setLeadSeleccionado(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.2rem' }}>✕</button>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', color: '#111827', margin: '0 0 0.8rem', fontSize: '1.1rem' }}>{leadSeleccionado.nombre || 'Sin nombre'}</p>
                {leadSeleccionado.email && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 0.4rem' }}>📧 {leadSeleccionado.email}</p>}
                {leadSeleccionado.telefono && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 0.4rem' }}>📞 {leadSeleccionado.telefono}</p>}
                {leadSeleccionado.zona_interes && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 0.4rem' }}>📍 {leadSeleccionado.zona_interes}</p>}
                {leadSeleccionado.presupuesto && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 0.4rem' }}>💰 {leadSeleccionado.presupuesto}</p>}
                {leadSeleccionado.mensaje && (
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '0.8rem', marginTop: '0.8rem' }}>
                    <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>{leadSeleccionado.mensaje}</p>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.6rem' }}>Cambiar estado:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {ESTADOS.map(e => (
                    <button key={e} onClick={() => cambiarEstado(leadSeleccionado.id, e)} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', border: 'none', backgroundColor: leadSeleccionado.estado === e ? COLORES[e] : '#f3f4f6', color: leadSeleccionado.estado === e ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem' }}>
                {leadSeleccionado.email && (
                  <a href={'mailto:' + leadSeleccionado.email} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>
                    Enviar email
                  </a>
                )}
                {leadSeleccionado.telefono && (
                  <a href={'tel:' + leadSeleccionado.telefono} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', backgroundColor: '#0ea5e9', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>
                    Llamar
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}`

writeFileSync('app/dashboard/crm/page.tsx', page)
console.log('CRM creado exitosamente')
