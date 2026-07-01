'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function ZonaLeadForm({ zona }: { zona: string }) {
  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const enviar = async () => {
    if (!nombre.trim() || !contacto.trim()) { setError('Completá tu nombre y un correo o teléfono.'); return }
    setEnviando(true); setError('')
    const esEmail = contacto.includes('@')
    const { error: err } = await supabase.from('leads').insert({
      nombre: nombre.trim(),
      email: esEmail ? contacto.trim() : null,
      telefono: esEmail ? null : contacto.trim(),
      zona_interes: zona,
      tipo_busqueda: 'compra',
      estado: 'nuevo',
      fuente: 'seo_zona',
    })
    if (err) { setError('No pudimos guardar tu solicitud. Intentá de nuevo.') }
    else { setEnviado(true) }
    setEnviando(false)
  }

  if (enviado) return (
    <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 10, padding: '18px 20px', fontSize: 14, color: 'var(--ink-2)' }}>
      ✓ Listo — te avisamos apenas tengamos propiedades disponibles en esta zona.
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Avisame cuando haya propiedades acá</div>
      {error && <p style={{ fontSize: 12, color: 'oklch(0.5 0.15 25)', marginBottom: 10 }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        <input
          value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre"
          style={{ padding: '11px 14px', borderRadius: 8, border: '1px solid var(--rule)', fontSize: 14, fontFamily: 'inherit' }}
        />
        <input
          value={contacto} onChange={e => setContacto(e.target.value)} placeholder="Correo o teléfono"
          style={{ padding: '11px 14px', borderRadius: 8, border: '1px solid var(--rule)', fontSize: 14, fontFamily: 'inherit' }}
        />
      </div>
      <button
        onClick={enviar} disabled={enviando}
        style={{ padding: '11px 22px', borderRadius: 999, background: 'var(--ink)', color: 'white', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}
      >
        {enviando ? 'Enviando...' : 'Avisarme →'}
      </button>
    </div>
  )
}
