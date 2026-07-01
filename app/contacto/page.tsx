'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150); }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .c-input{width:100%;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .c-input:focus{border-color:var(--accent)}
  .c-input::placeholder{color:var(--ink-3)}
  @media(max-width:640px){.c-grid{grid-template-columns:1fr!important}}
`

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '', presupuesto: '', zona_interes: '' })
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) {
      setError('Por favor ingresá tu nombre y email.')
      return
    }
    setError('')
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
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:460, textAlign:'center', animation:'fadeUp 0.5s ease' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', margin:'0 auto 24px', fontSize:30 }}>✓</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:400, marginBottom:12 }}>Mensaje <em style={{ fontStyle:'italic', color:'var(--accent)' }}>enviado.</em></h1>
        <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65, marginBottom:28 }}>
          Un asesor NIDO va a contactarte en las próximas horas para ayudarte a encontrar tu propiedad.
        </p>
        <a href="/propiedades" style={{ display:'inline-block', background:'var(--ink)', color:'white', padding:'13px 28px', borderRadius:999, fontSize:14, fontWeight:500 }}>Ver propiedades →</a>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1200, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <a href="/propiedades" style={{ fontSize:13, color:'var(--ink-3)' }}>← Ver propiedades</a>
        </div>
      </nav>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'56px 24px 80px', animation:'fadeUp 0.4s ease' }}>
        <div style={{ marginBottom:32, textAlign:'center' }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Hablemos</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(30px,4vw,44px)', fontWeight:400, lineHeight:1.1, marginBottom:10 }}>
            Hablá con un <em style={{ fontStyle:'italic', color:'var(--accent)' }}>asesor.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6 }}>Dejanos tus datos y te contactamos hoy mismo.</p>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--rule)', borderRadius:16, padding:'32px' }}>
          <div className="c-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Nombre completo *</label>
              <input className="c-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Tu nombre"/>
            </div>
            <div>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Email *</label>
              <input className="c-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="tu@email.com"/>
            </div>
          </div>

          <div className="c-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Teléfono</label>
              <input className="c-input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="+506 8888-8888"/>
            </div>
            <div>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Zona de interés</label>
              <input className="c-input" value={form.zona_interes} onChange={e => setForm({...form, zona_interes: e.target.value})} placeholder="Ej: Escazú, Tamarindo"/>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Presupuesto aproximado</label>
            <input className="c-input" value={form.presupuesto} onChange={e => setForm({...form, presupuesto: e.target.value})} placeholder="Ej: $150,000 o $1,500/mes"/>
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>¿Qué buscás?</label>
            <textarea className="c-input" value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} placeholder="Contanos qué tipo de propiedad buscás..." rows={4} style={{ resize:'vertical' }}/>
          </div>

          {error && <p style={{ color:'oklch(0.45 0.08 20)', fontSize:13, marginBottom:12, textAlign:'center' }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:999, border:'none', background:'var(--ink)', color:'white', fontSize:14, fontWeight:500, cursor:'pointer', opacity:loading?0.6:1 }}>
            {loading ? 'Enviando...' : 'Enviar mensaje →'}
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--ink-3)', marginTop:24 }}>
          ¿Tenés una duda de soporte en vez de buscar propiedad? <a href="/soporte" style={{ color:'var(--accent)', fontWeight:500 }}>Hablá con Valeria →</a>
        </p>
      </div>
    </main>
  )
}
