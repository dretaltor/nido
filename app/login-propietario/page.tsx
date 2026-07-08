'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

function LoginPropietarioInner() {
  const params = useSearchParams()
  const refCode = params.get('ref') || ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Correo o contraseña incorrectos'); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    const tipo = user?.user_metadata?.tipo || 'propietario'
    if (typeof window !== 'undefined') localStorage.setItem('nido_user_tipo', tipo)
    window.location.href = tipo === 'asesor' ? '/dashboard' : '/dashboard/propietario'
    setLoading(false)
  }

  const handleReset = async () => {
    if (!resetEmail) { setError('Ingresá tu correo.'); return }
    setResetLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'https://www.nido-cr.com/reset-password'
    })
    if (error) { setError('Error al enviar. Verificá el correo.') }
    else { setResetSent(true) }
    setResetLoading(false)
  }

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
        @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.06)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .field-input{width:100%;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:var(--sans);color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
        .field-input:focus{border-color:var(--accent)}
        .field-input::placeholder{color:var(--ink-3)}
        .login-btn{width:100%;padding:13px;border-radius:999px;border:none;background:var(--ink);color:white;font-size:15px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
        .login-btn:hover:not(:disabled){background:oklch(0.28 0.006 80);transform:translateY(-1px)}
        .login-btn:disabled{opacity:0.6;cursor:not-allowed}
        @media(max-width:768px){.right-panel{display:none!important}.left-panel{padding:32px 24px!important;max-width:100%!important}}
      `}</style>

      {/* Panel izquierdo */}
      <div className="left-panel" style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 64px', maxWidth:560, animation:'fadeUp 0.5s ease' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:26, color:'var(--ink)', textDecoration:'none', marginBottom:48, display:'block' }}>
          NIDO<span style={{ color:'var(--accent)' }}>.</span>
        </Link>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Portal de propietarios</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1, marginBottom:8 }}>
            Bienvenido <em style={{ fontStyle:'italic', color:'var(--accent)' }}>de vuelta.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6 }}>
            Ingresá a tu cuenta para gestionar tu propiedad, leads y ofertas.
          </p>
        </div>

        {error && (
          <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'oklch(0.45 0.08 20)', fontSize:13 }}>
            {error}
          </div>
        )}

        {resetMode && (
          <div style={{ background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:12, padding:'20px', marginBottom:20 }}>
            {resetSent ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📧</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:18, marginBottom:8 }}>Correo enviado</div>
                <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6, marginBottom:16 }}>Revisá tu bandeja y seguí las instrucciones.</p>
                <button onClick={() => { setResetMode(false); setResetSent(false); setResetEmail('') }} style={{ fontSize:13, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>← Volver al login</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:8 }}>Restablecer contraseña</div>
                <input className="field-input" type="email" placeholder="tu@correo.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} style={{ marginBottom:10 }}/>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setResetMode(false); setError('') }} style={{ flex:1, padding:'9px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:13, cursor:'pointer' }}>Cancelar</button>
                  <button onClick={handleReset} disabled={resetLoading} style={{ flex:1, padding:'9px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, cursor:'pointer', opacity:resetLoading?0.6:1 }}>{resetLoading?'Enviando...':'Enviar enlace'}</button>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Correo electrónico</label>
            <input className="field-input" type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)' }}>Contraseña</label>
              <button onClick={() => { setResetMode(true); setError('') }} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0 }}>¿Olvidaste tu contraseña?</button>
            </div>
            <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()}/>
          </div>
        </div>

        {!resetMode && (
          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar a mi panel →'}
          </button>
        )}

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--ink-3)' }}>
          ¿No tenés cuenta? <a href={refCode ? `/registro-propietario?ref=${refCode}` : '/registro-propietario'} style={{ color:'var(--accent)', fontWeight:500, textDecoration:'none' }}>Registrate aquí</a>
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:12, color:'var(--ink-3)' }}>
          ¿Sos asesor? <a href="/login" style={{ color:'var(--ink-2)', textDecoration:'none' }}>Ingresar como asesor →</a>
        </p>
      </div>

      {/* Panel derecho */}
      <div className="right-panel" style={{ flex:1, position:'relative', overflow:'hidden', background:'#060D08', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:48 }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2, animation:'slow-zoom 20s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.3) 0%, rgba(6,13,8,0.85) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[
              { val:'2', label:'propiedades activas' },
              { val:'3', label:'leads este mes' },
              { val:'$370K', label:'mejor oferta recibida' },
              { val:'+8.4%', label:'valorización anual' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 16px', backdropFilter:'blur(12px)' }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:'white', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 22px', backdropFilter:'blur(16px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:12, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
              <span style={{ fontSize:13, fontWeight:500, color:'white' }}>Valeria</span>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>En línea
              </span>
            </div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.65, fontStyle:'italic' }}>
              &quot;Tu propiedad en Santa Ana está por encima del promedio de zona. Tenés 1 oferta pendiente que vale la pena revisar.&quot;
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPropietario() {
  return (
    <Suspense fallback={<div style={{padding:40,fontFamily:'sans-serif',color:'#999'}}>Cargando...</div>}>
      <LoginPropietarioInner/>
    </Suspense>
  )
}
