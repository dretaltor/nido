import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('app/dashboard/nueva-propiedad', { recursive: true })

const page = `'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function NuevaPropiedad() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [form, setForm] = useState({
    titulo: '', descripcion: '', precio: '', tipo: 'casa',
    operacion: 'venta', habitaciones: '', banos: '', metros: '', zona: '', direccion: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubmit = async () => {
    if (!form.titulo || !form.precio || !form.zona) {
      alert('Por favor completa los campos obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('propiedades').insert({
      titulo: form.titulo,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      tipo: form.tipo,
      operacion: form.operacion,
      habitaciones: parseInt(form.habitaciones) || 0,
      banos: parseInt(form.banos) || 0,
      metros: parseInt(form.metros) || 0,
      zona: form.zona,
      direccion: form.direccion,
      asesor_nombre: user?.user_metadata?.nombre || '',
      asesor_email: user?.email || '',
      disponible: true
    })
    if (error) {
      alert('Error al publicar. Intenta de nuevo.')
    } else {
      setExito(true)
    }
    setLoading(false)
  }

  if (exito) return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2.5rem', maxWidth: '420px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>🎉</p>
        <h2 style={{ color: '#14532d', marginBottom: '0.5rem' }}>Propiedad publicada</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Tu propiedad ya está visible en NIDO</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/propiedades" style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Ver propiedades</a>
          <a href="/dashboard" style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', border: '1px solid #15803d', color: '#15803d', textDecoration: 'none', fontWeight: 'bold' }}>Mi dashboard</a>
        </div>
      </div>
    </main>
  )

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={placeholder} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Volver al dashboard</a>
      </nav>
      <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.3rem' }}>Publicar propiedad</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 2rem' }}>Completa los datos y tu propiedad aparecerá en el portal</p>

          {field('Título *', 'titulo', 'text', 'Ej: Casa moderna en Escazú')}
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Describe la propiedad..." rows={3} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none' }}>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="local">Local comercial</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>Operación</label>
              <select value={form.operacion} onChange={e => setForm({...form, operacion: e.target.value})} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none' }}>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
          </div>

          {field('Precio * (en USD)', 'precio', 'number', 'Ej: 150000')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {field('Habitaciones', 'habitaciones', 'number', '3')}
            {field('Baños', 'banos', 'number', '2')}
            {field('Metros²', 'metros', 'number', '120')}
          </div>

          {field('Zona *', 'zona', 'text', 'Ej: Escazú, San José')}
          {field('Dirección', 'direccion', 'text', 'Ej: Urbanización Los Laureles')}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
            {loading ? 'Publicando...' : 'Publicar propiedad'}
          </button>
        </div>
      </div>
    </main>
  )
}`

writeFileSync('app/dashboard/nueva-propiedad/page.tsx', page)
console.log('Formulario de nueva propiedad creado exitosamente')
