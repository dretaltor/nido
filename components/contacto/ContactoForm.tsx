'use client'
import { useState } from 'react'

interface ContactoFormProps {
  propiedadId: string
  propiedadTitulo: string
  asesorEmail: string
  asesorTelefono?: string
  asesorNombre: string
  asesorWhatsapp?: string
}

export function ContactoForm({ propiedadId, propiedadTitulo, asesorEmail, asesorNombre, asesorTelefono, asesorWhatsapp }: ContactoFormProps) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const enviar = async () => {
    if (!form.nombre || !form.email || !form.telefono) {
      setError('Por favor completá nombre, correo y teléfono.')
      return
    }
    setEnviando(true); setError('')
    
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: asesorEmail,
        tipo: 'nuevo_lead',
        data: {
          asesor_nombre: asesorNombre,
          comprador_nombre: form.nombre,
          comprador_email: form.email,
          comprador_telefono: form.telefono,
          mensaje: form.mensaje,
          propiedad: propiedadTitulo,
          propiedad_id: propiedadId,
          asesor_telefono: asesorTelefono || asesorWhatsapp,
        }
      })
    })

    if (res.ok) {
      setExito(true)
      setForm({ nombre: '', email: '', telefono: '', mensaje: '' })
    } else {
      setError('Error al enviar. Intentá de nuevo.')
    }
    setEnviando(false)
  }

  const CSS = `
    .cl-input{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:13px;font-family:var(--sans);color:var(--ink);outline:none;transition:border-color 0.2s;box-sizing:border-box;background:white}
    .cl-input:focus{border-color:var(--accent)}
    .cl-input::placeholder{color:var(--ink-3)}
  `

  if (exito) return (
    <div style={{padding:'20px',background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:12,textAlign:'center'}}>
      <style>{CSS}</style>
      <div style={{fontSize:24,marginBottom:8}}>✓</div>
      <div style={{fontFamily:'var(--serif)',fontSize:18,color:'var(--accent)',marginBottom:4}}>¡Mensaje enviado!</div>
      <p style={{fontSize:13,color:'var(--ink-2)',lineHeight:1.6}}>
        {asesorNombre} recibirá tu consulta y te contactará pronto.
      </p>
      {asesorWhatsapp && (
        <a href={'https://wa.me/'+asesorWhatsapp.replace(/[^0-9]/g,'')} target="_blank" style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:12,padding:'8px 16px',borderRadius:999,background:'#22c55e',color:'white',fontSize:13,fontWeight:500,textDecoration:'none'}}>
          💬 También podés escribir por WhatsApp
        </a>
      )}
    </div>
  )

  return (
    <div>
      <style>{CSS}</style>
      <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:12}}>Consultar sin registro</div>

      {error && <div style={{marginBottom:12,padding:'8px 12px',background:'oklch(0.97 0.03 20)',border:'1px solid oklch(0.85 0.06 20)',borderRadius:8,fontSize:12,color:'oklch(0.45 0.08 20)'}}>{error}</div>}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <input className="cl-input" placeholder="Tu nombre completo *" value={form.nombre} onChange={e => set('nombre', e.target.value)}/>
        <input className="cl-input" type="email" placeholder="Tu correo electrónico *" value={form.email} onChange={e => set('email', e.target.value)}/>
        <input className="cl-input" placeholder="Tu teléfono / WhatsApp *" value={form.telefono} onChange={e => set('telefono', e.target.value)}/>
        <textarea className="cl-input" placeholder="¿Alguna pregunta específica? (opcional)" value={form.mensaje} onChange={e => set('mensaje', e.target.value)} rows={3} style={{resize:'vertical'}}/>
        
        <button onClick={enviar} disabled={enviando} style={{width:'100%',padding:'12px',borderRadius:999,background:'var(--accent)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',opacity:enviando?0.6:1,fontFamily:'var(--sans)'}}>
          {enviando ? 'Enviando...' : 'Enviar consulta →'}
        </button>
        
        <p style={{fontSize:11,color:'var(--ink-3)',textAlign:'center',lineHeight:1.5}}>
          Tu información solo se compartirá con el asesor de esta propiedad.
        </p>
      </div>
    </div>
  )
}
