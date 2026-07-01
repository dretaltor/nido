'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Filtros {
  zona?: string
  tipo?: string
  operacion?: string
  precioMax?: number | null
}

export function GuardarBusquedaModal({ filtros, onClose }: { filtros: Filtros, onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const resumen = [
    filtros.operacion && filtros.operacion !== 'todo' ? (filtros.operacion === 'venta' ? 'En venta' : 'En alquiler') : null,
    filtros.tipo || null,
    filtros.zona ? `en "${filtros.zona}"` : null,
    filtros.precioMax ? `hasta $${filtros.precioMax.toLocaleString('en-US')}` : null,
  ].filter(Boolean).join(' · ') || 'Todas las propiedades disponibles'

  const guardar = async () => {
    if (!email.trim() || !email.includes('@')) { setError('Ingresá un correo válido.'); return }
    setEnviando(true); setError('')
    const { error: err } = await supabase.from('alertas_busqueda').insert({
      email: email.trim(),
      zona: filtros.zona || null,
      tipo: filtros.tipo || null,
      operacion: filtros.operacion && filtros.operacion !== 'todo' ? filtros.operacion : null,
      precio_max: filtros.precioMax || null,
    })
    if (err) { setError('No pudimos guardar tu búsqueda. Intentá de nuevo.') }
    else { setEnviado(true) }
    setEnviando(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'oklch(0.10 0.005 80 / 0.5)', zIndex: 90, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(420px, 90vw)', background: 'var(--bg-card, white)', borderRadius: 16, zIndex: 91, padding: '28px 28px 24px', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
        {enviado ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
            <div style={{ fontFamily: 'var(--serif, serif)', fontSize: 20, marginBottom: 8 }}>Búsqueda guardada</div>
            <p style={{ fontSize: 13, color: 'var(--ink-3, #888)', lineHeight: 1.6, marginBottom: 18 }}>Te vamos a avisar por correo apenas se publique una propiedad que coincida.</p>
            <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 999, background: 'var(--ink, #111)', color: 'white', border: 'none', fontSize: 13, cursor: 'pointer' }}>Cerrar</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--serif, serif)', fontSize: 20, marginBottom: 6 }}>Guardar esta búsqueda</div>
            <p style={{ fontSize: 12, color: 'var(--ink-3, #888)', marginBottom: 16 }}>{resumen}</p>
            {error && <p style={{ fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{error}</p>}
            <input
              value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" type="email"
              onKeyDown={e => e.key === 'Enter' && guardar()}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--rule, #ddd)', fontSize: 14, fontFamily: 'inherit', marginBottom: 14, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 999, border: '1px solid var(--rule, #ddd)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={enviando} style={{ flex: 1, padding: '10px', borderRadius: 999, background: 'var(--ink, #111)', color: 'white', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
                {enviando ? 'Guardando...' : 'Avisarme →'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
