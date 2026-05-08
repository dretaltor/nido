'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setLoading(true); setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Credenciales incorrectas.'); setLoading(false); return }

    // Verificar que es admin
    const { data: admin } = await supabase.from('admins').select('id').eq('correo', email).maybeSingle()
    if (!admin) {
      await supabase.auth.signOut()
      setError('No tenés acceso al panel de administración.')
      setLoading(false)
      return
    }

    // Use window.location to bypass AuthContext redirect
    window.location.href = '/admin'
    setLoading(false)
  }

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'#060D08', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--rule:oklch(0.88 0.006 80);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .field-input{width:100%;padding:12px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;font-family:var(--sans);color:white;background:rgba(255,255,255,0.06);outline:none;transition:border-color 0.2s;box-sizing:border-box}
        .field-input:focus{border-color:var(--accent)}
        .field-input::placeholder{color:rgba(255,255,255,0.25)}
        .login-btn{width:100%;padding:13px;border-radius:999px;border:none;background:var(--accent);color:white;font-size:15px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
        .login-btn:hover:not(:disabled){background:oklch(0.38 0.06 150)}
        .login-btn:disabled{opacity:0.6;cursor:not-allowed}
      `}</style>

      <div style={{ width:'100%', maxWidth:400, padding:'0 24px', animation:'fadeUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:32, color:'white', letterSpacing:'0.05em', marginBottom:8 }}>
            NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span>
          </div>
          <div style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
            Panel de Administración
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'32px 28px', backdropFilter:'blur(20px)' }}>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, color:'white', marginBottom:4 }}>
            Acceso restringido
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24, lineHeight:1.6 }}>
            Solo administradores autorizados de NIDO pueden ingresar.
          </p>

          {error && (
            <div style={{ background:'oklch(0.25 0.05 20)', border:'1px solid oklch(0.35 0.07 20)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'oklch(0.75 0.08 20)', fontSize:13 }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
            <div>
              <label style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:8 }}>Correo</label>
              <input className="field-input" type="email" placeholder="admin@nido-cr.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:8 }}>Contraseña</label>
              <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()}/>
            </div>
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar al panel →'}
          </button>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'rgba(255,255,255,0.2)' }}>
          Acceso no autorizado · Solo personal NIDO
        </p>
      </div>
    </main>
  )
}
