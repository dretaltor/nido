'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Correo o contraseña incorrectos') } 
    else { window.location.href = '/dashboard' }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        @keyframes slow-zoom { 0%{transform:scale(1)} 100%{transform:scale(1.06)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .field-input { width:100%; padding:12px 16px; border:1px solid var(--rule); border-radius:10px; font-size:14px; font-family:var(--sans); color:var(--ink); background:white; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .field-input:focus { border-color:var(--accent); }
        .field-input::placeholder { color:var(--ink-3); }
        .login-btn { width:100%; padding:13px; border-radius:999px; border:none; background:var(--ink); color:white; font-size:15px; font-weight:500; cursor:pointer; font-family:var(--sans); transition:all 0.2s; }
        .login-btn:hover:not(:disabled) { background:oklch(0.28 0.006 80); transform:translateY(-1px); }
        .login-btn:disabled { opacity:0.6; cursor:not-allowed; }
        @media(max-width:768px) { .right-panel { display:none!important; } .left-panel { padding:32px 24px!important; } }
      `}</style>

      {/* Panel izquierdo — formulario */}
      <div className="left-panel" style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 64px', maxWidth:560, animation:'fadeUp 0.5s ease' }}>
        
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:26, color:'var(--ink)', textDecoration:'none', marginBottom:48, display:'block' }}>
          NIDO<span style={{ color:'var(--accent)' }}>.</span>
        </a>

        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Portal de asesores</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1, marginBottom:8 }}>
            Bienvenido <em style={{ fontStyle:'italic', color:'var(--accent)' }}>de vuelta.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6 }}>Ingresá a tu cuenta para gestionar propiedades, leads y conectarte con Valeria.</p>
        </div>

        {error && (
          <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:10, padding:'12px 16px', marginBottom:20, color:'oklch(0.45 0.08 20)', fontSize:13 }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Correo electrónico</label>
            <input className="field-input" type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)' }}>Contraseña</label>
              <a href="#" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none' }}>¿Olvidaste tu contraseña?</a>
            </div>
            <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()}/>
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar al dashboard →'}
        </button>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--ink-3)' }}>
          ¿No tenés cuenta? <a href="/registro" style={{ color:'var(--accent)', fontWeight:500, textDecoration:'none' }}>Registrate aquí</a>
        </p>

        <div style={{ marginTop:48, paddingTop:24, borderTop:'1px solid var(--rule)', display:'flex', gap:24 }}>
          {[{icon:'🏠', label:'Portal de propiedades', href:'/propiedades'},{icon:'👥', label:'Red de asesores', href:'/asesores'},{icon:'📚', label:'Academia NIDO', href:'/academia'}].map(l => (
            <a key={l.href} href={l.href} style={{ fontSize:12, color:'var(--ink-3)', textDecoration:'none', display:'flex', alignItems:'center', gap:5, transition:'color 0.15s' }}>
              <span>{l.icon}</span> {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* Panel derecho — imagen + info */}
      <div className="right-panel" style={{ flex:1, position:'relative', overflow:'hidden', background:'#060D08' }}>
        {/* Foto de fondo */}
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.3, animation:'slow-zoom 20s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.4) 0%, rgba(6,13,8,0.7) 100%)' }}/>
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.42 0.06 150/0.1) 0%, transparent 70%)' }}/>

        {/* Contenido panel derecho */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'48px' }}>
          
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32 }}>
            {[
              { val:'2.4×', label:'más cierres con NIDO Pro' },
              { val:'87%', label:'tasa de respuesta promedio' },
              { val:'+412', label:'propiedades activas hoy' },
              { val:'4.9★', label:'calificación promedio asesores' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 16px', backdropFilter:'blur(12px)' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'white', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4, lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quote Valeria */}
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 22px', backdropFilter:'blur(16px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'white' }}>Valeria</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
                  Mentora IA · En línea
                </div>
              </div>
            </div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.65, fontStyle:'italic' }}>
              "Los asesores que responden leads en menos de 2 horas cierran 3× más. Hoy tenés oportunidades esperándote."
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
