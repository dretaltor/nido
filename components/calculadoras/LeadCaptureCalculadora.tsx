'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface LeadCaptureCalculadoraProps {
  fuente: string
  tipoBusqueda?: string
  presupuesto?: string
  mensaje: string
  titulo?: string
  textoBoton?: string
  asesorEmail?: string | null
  asesorNombre?: string | null
  alertaPrecioMax?: number
}

export function LeadCaptureCalculadora({ fuente, tipoBusqueda, presupuesto, mensaje, titulo, textoBoton, asesorEmail, asesorNombre, alertaPrecioMax }: LeadCaptureCalculadoraProps) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const enviar = async () => {
    if (!form.nombre || !form.email) {
      setError('Completá al menos tu nombre y correo.')
      return
    }
    setEnviando(true)
    setError('')
    const { error: err } = await supabase.from('leads').insert({
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono || null,
      mensaje,
      presupuesto: presupuesto || null,
      tipo_busqueda: tipoBusqueda || null,
      estado: 'nuevo',
      fuente,
      asesor_email: asesorEmail || null,
    })
    if (err) {
      setError('No pudimos guardar tu resultado. Intentá de nuevo.')
      setEnviando(false)
      return
    }
    // Además del lead, guardamos una alerta de búsqueda para que le avisemos
    // automáticamente si se publica una propiedad dentro de este presupuesto.
    if (alertaPrecioMax) {
      await supabase.from('alertas_busqueda').insert({
        email: form.email,
        zona: null,
        tipo: null,
        operacion: 'venta',
        precio_max: alertaPrecioMax,
      })
    }
    setEnviado(true)
    setEnviando(false)
  }

  const CSS = `
    .lcc-input{width:100%;padding:11px 14px;border:1px solid rgba(27,94,59,0.15);border-radius:8px;font-size:13px;font-family:inherit;color:#0D1F15;outline:none;transition:border-color 0.2s;box-sizing:border-box;background:#FAFAF8}
    .lcc-input:focus{border-color:#1B5E3B}
    .lcc-input::placeholder{color:#9CA3AF}
  `

  if (enviado) return (
    <div style={{ padding: '24px', background: 'rgba(27,94,59,0.06)', border: '1px solid rgba(27,94,59,0.15)', borderRadius: 14, textAlign: 'center' }}>
      <style>{CSS}</style>
      <div style={{ fontSize: 26, marginBottom: 8 }}>✓</div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: '#1B5E3B', marginBottom: 4 }}>¡Listo!</div>
      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
        Guardamos tu resultado. {asesorNombre ? `${asesorNombre} va a contactarte` : 'Un asesor NIDO va a contactarte'} pronto para ayudarte con el siguiente paso.
        {alertaPrecioMax ? ' También te vamos a avisar por correo apenas se publique una propiedad dentro de tu presupuesto.' : ''}
      </p>
    </div>
  )

  return (
    <div style={{ padding: '24px', background: 'white', border: '1px solid rgba(27,94,59,0.1)', borderRadius: 14 }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 19, color: '#0D1F15', marginBottom: 4 }}>
        {titulo || 'Guardá tu resultado'}
      </div>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
        Dejanos tus datos y un asesor NIDO te contacta con opciones a tu medida. Sin costo ni compromiso.
      </p>

      {error && <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 12, color: '#B91C1C' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="lcc-input" placeholder="Tu nombre completo" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
        <input className="lcc-input" type="email" placeholder="Tu correo electrónico" value={form.email} onChange={e => set('email', e.target.value)} />
        <input className="lcc-input" placeholder="Tu teléfono / WhatsApp (opcional)" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
        <button onClick={enviar} disabled={enviando} style={{ width: '100%', padding: '12px', borderRadius: 999, background: '#1B5E3B', color: 'white', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: enviando ? 0.6 : 1, fontFamily: 'inherit' }}>
          {enviando ? 'Enviando...' : (textoBoton || 'Enviar mi resultado →')}
        </button>
      </div>
    </div>
  )
}
