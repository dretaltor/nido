'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '../../lib/supabase'

const PLANES_INFO: Record<string, { nombre: string, precio: string, color: string }> = {
  pro: { nombre: 'Pro', precio: '$49/mes', color: 'var(--accent)' },
  enterprise: { nombre: 'Enterprise', precio: '$129/mes', color: 'oklch(0.52 0.08 230)' },
}

function RegistroInner() {
  const params = useSearchParams()
  const plan = params.get('plan') || ''
  const planInfo = PLANES_INFO[plan]

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleRegistro = async () => {
    if (!nombre || !email || !password) { setError('Por favor completa todos los campos.'); return }
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, plan: plan || 'gratis' } }
    })
    if (error) { setError('Error al registrarse. Intenta de nuevo.') }
    else { setExito(true) }
    setLoading(false)
  }

  if (exito) return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:460, textAlign:'center', padding:'0 24px', animation:'fadeUp 0.5s ease' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', margin:'0 auto 24px', fontSize:28 }}>✓</div>
        <h1 style={{ fontFamily:'var(--serif)', fontSize:36, fontWeight:400, marginBottom:12 }}>Cuenta <em style={{ fontStyle:'italic', color:'var(--accent)' }}>creada.</em></h1>
        <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65, marginBottom:28 }}>
          Revisas tu correo para confirmar tu cuenta. Luego podes ingresar y empezar a usar NIDO.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <a href="/login" style={{ background:'var(--ink)', color:'white', padding:'12px 24px', borderRadius:999, fontSize:14, fontWeight:500, textDecoration:'none' }}>Ingresar al dashboard →</a>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <style>{CSS}</style>

      {/* Panel izquierdo */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 64px', maxWidth:560, animation:'fadeUp 0.5s ease' }}>

        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:26, color:'var(--ink)', textDecoration:'none', marginBottom:48, display:'block' }}>
          NIDO<span style={{ color:'var(--accent)' }}>.</span>
        </a>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>
            {planInfo ? 'Crear cuenta · Plan ' + planInfo.nombre : 'Crear cuenta · Asesor'}
          </div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1, marginBottom:8 }}>
            Tu carrera empieza <em style={{ fontStyle:'italic', color:'var(--accent)' }}>hoy.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6 }}>
            Crea tu cuenta gratis y empieza a publicar propiedades con Valeria IA de tu lado.
          </p>
        </div>

        {planInfo && (
          <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', marginBottom:2 }}>Plan seleccionado</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>NIDO {planInfo.nombre} · {planInfo.precio}</div>
            </div>
            <a href="/precios" style={{ fontSize:12, color:'var(--ink-3)' }}>Cambiar</a>
          </div>
        )}

        {error && (
          <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'oklch(0.45 0.08 20)', fontSize:13 }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Nombre completo</label>
            <input className="field-input" type="text" placeholder="María Rodríguez" value={nombre} onChange={e => setNombre(e.target.value)}/>
          </div>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Correo electrónico</label>
            <input className="field-input" type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Contraseña</label>
            <input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleRegistro()}/>
          </div>
        </div>

        <button className="login-btn" onClick={handleRegistro} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
        </button>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--ink-3)' }}>
          Ya tenes cuenta? <a href="/login" style={{ color:'var(--accent)', fontWeight:500, textDecoration:'none' }}>Ingresá aquí</a>
        </p>

        <p style={{ textAlign:'center', marginTop:16, fontSize:11, color:'var(--ink-3)', lineHeight:1.6 }}>
          Al crear una cuenta aceptas los <a href="#" style={{ color:'var(--accent)' }}>Términos de uso</a> y la <a href="#" style={{ color:'var(--accent)' }}>Política de privacidad</a> de NIDO.
        </p>

        <div style={{ marginTop:40, paddingTop:24, borderTop:'1px solid var(--rule)', display:'flex', gap:20 }}>
          {[{icon:'✦', label:'Valeria IA incluida'},{icon:'◎', label:'CRM de leads'},{icon:'🏠', label:'Portal premium'}].map(l => (
            <div key={l.label} style={{ fontSize:12, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:'var(--accent)' }}>{l.icon}</span> {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', background:'#060D08', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:48 }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2, animation:'slow-zoom 20s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.3) 0%, rgba(6,13,8,0.8) 100%)' }}/>
        <div style={{ position:'absolute', top:'25%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.42 0.06 150/0.1) 0%, transparent 70%)' }}/>

        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
            {[
              { val:'87', label:'asesores activos en NIDO', suffix:'%' },
              { val:'412', label:'propiedades publicadas', suffix:'+' },
              { val:'2.4', label:'veces mas cierres con Pro', suffix:'×' },
              { val:'4.9', label:'calificacion promedio asesores', suffix:'★' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 16px', backdropFilter:'blur(12px)' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:26, color:'white', lineHeight:1 }}>{s.val}{s.suffix}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4, lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 22px', backdropFilter:'blur(16px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'white' }}>Valeria</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
                  Mentora IA de NIDO
                </div>
              </div>
            </div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.65, fontStyle:'italic' }}>
              "Bienvenido a NIDO. Desde tu primer dia, voy a ayudarte a encontrar leads, redactar descripciones y cerrar mas rapido. Empecemos."
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Registro() {
  return (
    <Suspense fallback={<div style={{padding:40,fontFamily:'sans-serif',color:'#999'}}>Cargando...</div>}>
      <RegistroInner/>
    </Suspense>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
  @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.06)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .field-input{width:100%;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:var(--sans);color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .field-input:focus{border-color:var(--accent)}
  .field-input::placeholder{color:var(--ink-3)}
  .login-btn{width:100%;padding:13px;border-radius:999px;border:none;background:var(--ink);color:white;font-size:15px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
  .login-btn:hover:not(:disabled){background:oklch(0.28 0.006 80);transform:translateY(-1px)}
  .login-btn:disabled{opacity:0.6;cursor:not-allowed}
  @media(max-width:768px){main>div:last-child{display:none!important}main>div:first-child{padding:32px 24px!important;max-width:100%!important}}
`
