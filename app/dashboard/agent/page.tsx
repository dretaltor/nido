'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

interface Lead {
  id: string
  nombre: string
  email: string
  estado: string
  mensaje: string
  zona_interes: string
  presupuesto: string
}

const ACCIONES = [
  { id: 'email_bienvenida', label: '✉️ Email de bienvenida', desc: 'Para un lead nuevo' },
  { id: 'email_seguimiento', label: '📞 Email de seguimiento', desc: 'Para lead sin respuesta' },
  { id: 'email_oferta', label: '🏠 Presentar propiedad', desc: 'Enviar propuesta formal' },
  { id: 'descripcion_propiedad', label: '✍️ Descripción de propiedad', desc: 'Generar texto para listing' },
  { id: 'analisis_pipeline', label: '📊 Analizar mi pipeline', desc: 'Recomendaciones del CRM' },
  { id: 'respuesta_consulta', label: '💬 Responder consulta', desc: 'Redactar respuesta profesional' },
]

export default function NidoAgent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [accionSeleccionada, setAccionSeleccionada] = useState('')
  const [leadSeleccionado, setLeadSeleccionado] = useState('')
  const [contextoExtra, setContextoExtra] = useState('')
  const [resultado, setResultado] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [agentError, setAgentError] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      setLeads(data || [])
    }
    getUser()
  }, [])

  const ejecutarAgent = async () => {
    if (!accionSeleccionada) { setAgentError('Seleccioná una acción antes de continuar.'); return }
    setAgentError('')
    setLoading(true)
    setResultado('')

    const lead = leads.find(l => l.id === leadSeleccionado)
    const accion = ACCIONES.find(a => a.id === accionSeleccionada)

    let prompt = ''
    if (accionSeleccionada === 'analisis_pipeline') {
      prompt = 'Analiza este pipeline inmobiliario y dame recomendaciones concretas de qué hacer hoy: ' + JSON.stringify(leads.map(l => ({ nombre: l.nombre, estado: l.estado, zona: l.zona_interes, presupuesto: l.presupuesto })))
    } else if (accionSeleccionada === 'descripcion_propiedad') {
      prompt = 'Genera una descripción profesional y atractiva para una propiedad inmobiliaria en Costa Rica con estas características: ' + contextoExtra
    } else if (lead) {
      const prompts: Record<string, string> = {
        email_bienvenida: 'Redacta un email profesional y cálido de bienvenida para este lead inmobiliario en Costa Rica. Nombre: ' + lead.nombre + '. Busca: ' + lead.mensaje + '. Zona: ' + lead.zona_interes + '. Presupuesto: ' + lead.presupuesto,
        email_seguimiento: 'Redacta un email de seguimiento amigable para este lead que no ha respondido en días. Nombre: ' + lead.nombre + '. Email: ' + lead.email + '. Contexto adicional: ' + contextoExtra,
        email_oferta: 'Redacta un email profesional presentando una propiedad a este cliente. Cliente: ' + lead.nombre + '. Busca: ' + lead.mensaje + '. Detalles de la propiedad a presentar: ' + contextoExtra,
        respuesta_consulta: 'Redacta una respuesta profesional a esta consulta inmobiliaria. Cliente: ' + lead.nombre + '. Su consulta: ' + lead.mensaje + '. Información adicional para responder: ' + contextoExtra,
      }
      prompt = prompts[accionSeleccionada] || ''
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          system: 'Eres NIDO Agent, el asistente IA de un asesor inmobiliario profesional en Costa Rica. Redactas comunicaciones profesionales, cálidas y efectivas. Siempre en español. Firma los emails como el asesor de NIDO.'
        })
      })
      const data = await res.json()
      setResultado(data.message)
    } catch {
      setResultado('Error al generar. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const copiar = () => {
    navigator.clipboard.writeText(resultado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <style>{`@media(max-width:768px){.agent-grid{grid-template-columns:1fr!important;gap:1.25rem!important}.agent-pad{padding:1.25rem!important}}`}</style>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</Link>
        <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Dashboard</a>
      </nav>

      <div className="agent-pad" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.3rem' }}>🤖 NIDO Agent</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Tu asistente IA que hace el 80% del trabajo por ti</p>
        </div>

        <div className="agent-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', color: '#374151', margin: '0 0 1rem', fontSize: '0.95rem' }}>1. Selecciona una acción</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ACCIONES.map(a => (
                  <button key={a.id} onClick={() => setAccionSeleccionada(a.id)} style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '2px solid', borderColor: accionSeleccionada === a.id ? '#15803d' : '#e5e7eb', backgroundColor: accionSeleccionada === a.id ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#14532d', fontSize: '0.9rem' }}>{a.label}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {accionSeleccionada && accionSeleccionada !== 'analisis_pipeline' && accionSeleccionada !== 'descripcion_propiedad' && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', color: '#374151', margin: '0 0 0.8rem', fontSize: '0.95rem' }}>2. Selecciona el lead</p>
                <select value={leadSeleccionado} onChange={e => setLeadSeleccionado(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#111827', outline: 'none' }}>
                  <option value="">-- Selecciona un lead --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre || l.email} — {l.estado}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', color: '#374151', margin: '0 0 0.8rem', fontSize: '0.95rem' }}>
                {accionSeleccionada === 'descripcion_propiedad' ? '2. Características de la propiedad' : 'Contexto adicional (opcional)'}
              </p>
              <textarea value={contextoExtra} onChange={e => setContextoExtra(e.target.value)} placeholder={accionSeleccionada === 'descripcion_propiedad' ? 'Ej: Casa 3 hab, 2 baños, 180m², piscina, jardín, Escazú, $285,000' : 'Agrega detalles adicionales...'} rows={3} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            {agentError && <p style={{ color:'#b91c1c', fontSize:'0.85rem', margin:'0 0 0.75rem', padding:'0.6rem 0.8rem', background:'#fef2f2', borderRadius:8, border:'1px solid #fecaca' }}>{agentError}</p>}
            <button onClick={ejecutarAgent} disabled={loading} style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? '🤖 Generando...' : '🚀 Ejecutar NIDO Agent'}
            </button>
          </div>

          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minHeight: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '0.95rem' }}>Resultado del Agent</p>
                {resultado && (
                  <button onClick={copiar} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: copiado ? '#dcfce7' : 'white', color: copiado ? '#15803d' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {copiado ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                )}
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem' }}>
                  <p style={{ fontSize: '2.5rem', margin: 0 }}>🤖</p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>NIDO Agent está trabajando...</p>
                </div>
              ) : resultado ? (
                <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', maxHeight: '500px', overflowY: 'auto' }}>
                  {resultado}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem' }}>
                  <p style={{ fontSize: '2.5rem', margin: 0 }}>🤖</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center' }}>Selecciona una acción y ejecuta el Agent para ver el resultado aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}