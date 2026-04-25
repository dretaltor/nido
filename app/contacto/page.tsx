'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '', presupuesto: '', zona_interes: '' })
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) {
      alert('Por favor ingresa tu nombre y email')
      return
    }
    setLoading(true)
    await supabase.from('leads').insert({
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      mensaje: form.mensaje,
      presupuesto: form.presupuesto,
      zona_interes: form.zona_interes,
      estado: 'nuevo'
    })
    setExito(true)
    setLoading(false)
  }

  if (exito) return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2.5rem', maxWidth: '420px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>🎉</p>
        <h2 style={{ color: '#14532d', marginBottom: '0.5rem' }}>Mensaje enviado</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Un asesor de NIDO te contactará pronto.</p>
        <a href="/propiedades" style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Ver más propiedades</a>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <a href="/propiedades" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Ver propiedades</a>
      </nav>
      <div style={{ maxWidth: '560px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.3rem' }}>Hablar con un asesor</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 2rem' }}>Déjanos tus datos y te contactamos hoy mismo</p>

          {[
            { label: 'Nombre completo *', key: 'nombre', placeholder: 'Tu nombre' },
            { label: 'Email *', key: 'email', placeholder: 'tu@email.com' },
            { label: 'Teléfono', key: 'telefono', placeholder: '+506 8888-8888' },
            { label: 'Zona de interés', key: 'zona_interes', placeholder: 'Ej: Escazú, San José' },
            { label: 'Presupuesto aproximado', key: 'presupuesto', placeholder: 'Ej: $150,000 o $1,500/mes' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>{f.label}</label>
              <input value={form[f.key as keyof typeof form]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
            </div>
          ))}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>¿Qué buscas?</label>
            <textarea value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} placeholder="Cuéntanos qué tipo de propiedad buscas..." rows={3} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', color: '#111827', resize: 'vertical' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </div>
      </div>
    </main>
  )
}