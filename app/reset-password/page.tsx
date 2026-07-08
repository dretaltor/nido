'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [listo, setListo] = useState(false)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    // Supabase pone el token en el hash de la URL
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      // Supabase maneja automáticamente el hash y dispara PASSWORD_RECOVERY.
      // Sincroniza estado con el hash de la URL al montar — no puede calcularse en render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setListo(true)
      setVerificando(false)
    } else {
      // Escuchar el evento de Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setListo(true)
          setVerificando(false)
        }
      })
      // Timeout por si no llega el evento
      setTimeout(() => setVerificando(false), 2000)
      return () => subscription.unsubscribe()
    }
  }, [])

  const handleReset = async () => {
    if (!password || !confirm) { setError('Completá ambos campos.'); return }
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contrasenas no coinciden.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Error al actualizar. Intenta de nuevo.') }
    else { setExito(true); setTimeout(() => router.push('/login'), 3000) }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .field-input{width:100%;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:var(--sans);color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
        .field-input:focus{border-color:var(--accent)}
        .field-input::placeholder{color:var(--ink-3)}
        .reset-btn{width:100%;padding:13px;border-radius:999px;border:none;background:var(--ink);color:white;font-size:15px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
        .reset-btn:hover:not(:disabled){background:oklch(0.28 0.006 80);transform:translateY(-1px)}
        .reset-btn:disabled{opacity:0.6;cursor:not-allowed}
      `}</style>

      <div style={{ width:'100%', maxWidth:440, padding:'0 24px', animation:'fadeUp 0.5s ease' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:26, color:'var(--ink)', textDecoration:'none', display:'block', marginBottom:40, textAlign:'center' }}>
          NIDO<span style={{ color:'var(--accent)' }}>.</span>
        </Link>

        {verificando ? (
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'40px', textAlign:'center' }}>
            <p style={{ color:'var(--ink-3)', fontSize:14 }}>Verificando enlace...</p>
          </div>
        ) : exito ? (
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'40px', textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', margin:'0 auto 20px', fontSize:24, color:'white' }}>✓</div>
            <h1 style={{ fontFamily:'var(--serif)', fontSize:28, fontWeight:400, marginBottom:12 }}>Contrasena <em style={{ fontStyle:'italic', color:'var(--accent)' }}>actualizada.</em></h1>
            <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65, marginBottom:8 }}>Tu contrasena fue cambiada exitosamente.</p>
            <p style={{ fontSize:13, color:'var(--ink-3)' }}>Redirigiendo al login en 3 segundos...</p>
          </div>
        ) : !listo ? (
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:16 }}>🔗</div>
            <h1 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:12 }}>Enlace inválido</h1>
            <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65, marginBottom:24 }}>Este enlace ya fue usado o expiró. Solicitá uno nuevo desde el login.</p>
            <a href="/login" style={{ display:'inline-block', background:'var(--ink)', color:'white', padding:'12px 28px', borderRadius:999, fontSize:14, fontWeight:500, textDecoration:'none' }}>Volver al login →</a>
          </div>
        ) : (
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'40px' }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Seguridad de cuenta</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(24px,4vw,36px)', fontWeight:400, lineHeight:1.1, marginBottom:8 }}>
                Nueva <em style={{ fontStyle:'italic', color:'var(--accent)' }}>contraseña.</em>
              </h1>
              <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6 }}>Elegí una contrasena segura de al menos 6 caracteres.</p>
            </div>

            {error && (
              <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'oklch(0.45 0.08 20)', fontSize:13 }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Nueva contraseña</label>
                <input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Confirmar contraseña</label>
                <input className="field-input" type="password" placeholder="Repetí la contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key==='Enter' && handleReset()}/>
              </div>
            </div>

            <button className="reset-btn" onClick={handleReset} disabled={loading}>
              {loading ? 'Actualizando...' : 'Guardar nueva contraseña →'}
            </button>

            <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--ink-3)' }}>
              <a href="/login" style={{ color:'var(--accent)', textDecoration:'none' }}>← Volver al login</a>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
