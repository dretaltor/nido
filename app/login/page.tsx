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
    if (error) { setError('Correo o contraseña incorrectos') } else { window.location.href = '/dashboard' }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', minHeight: '100vh', display: 'flex' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --green: #1B5E3B; --green-light: #2D7A52; --gold: #C8A96E; --cream: #F7F4EE; --dark: #0D1F15; --gray: #6B7280; }
body { font-family: 'DM Sans', sans-serif; background: #FAFAF8; }
.nav-link { color: #6B7280; text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
.nav-link:hover { color: #1B5E3B; }
.btn-primary { background: #1B5E3B; color: white; padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-block; transition: all 0.2s; border: none; cursor: pointer; }
.btn-primary:hover { background: #2D7A52; }
.btn-outline { border: 1px solid #1B5E3B; color: #1B5E3B; padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-block; background: white; cursor: pointer; }
.card { background: white; border: 1px solid rgba(27,94,59,0.08); border-radius: 16px; overflow: hidden; transition: all 0.2s; }
.card:hover { border-color: rgba(27,94,59,0.15); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(27,94,59,0.08); }
.filter-btn { padding: 0.45rem 1.1rem; border-radius: 100px; border: 1px solid rgba(27,94,59,0.15); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; background: white; color: #6B7280; }
.filter-btn.active { background: #1B5E3B; color: white; border-color: #1B5E3B; }
input, textarea, select { font-family: 'DM Sans', sans-serif; }

        .input-field { width: 100%; padding: 0.8rem 1.1rem; border-radius: 10px; border: 1px solid rgba(27,94,59,0.15); font-size: 0.9rem; outline: none; color: #1a1a1a; background: white; transition: border-color 0.2s; box-sizing: border-box; }
        .input-field:focus { border-color: #1B5E3B; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1B5E3B', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></a>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#0D1F15', marginBottom: '0.4rem' }}>Bienvenido de vuelta</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '2rem' }}>Ingresa a tu cuenta de asesor</p>
          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.8rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.85rem' }}>{error}</div>}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Correo electrónico</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" className="input-field" />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Contraseña</label>
            <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} type="password" placeholder="••••••••" className="input-field" />
          </div>
          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '0.85rem', borderRadius: '100px', border: 'none', background: '#1B5E3B', color: 'white', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9CA3AF' }}>
            ¿No tienes cuenta? <a href="/registro" style={{ color: '#1B5E3B', fontWeight: 500, textDecoration: 'none' }}>Regístrate aquí</a>
          </p>
        </div>
      </div>
      <div style={{ flex: 1, background: '#0D1F15', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ maxWidth: '360px' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', marginBottom: '1.5rem' }}>NIDO PRO</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'white', lineHeight: 1.3, marginBottom: '2rem' }}>La IA que trabaja mientras tú duermes</h2>
          {['CRM inteligente con score de leads', 'NIDO Agent que redacta por ti', 'Portal con tu marca personal', 'Academia inmobiliaria completa'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '20px', height: '20px', background: '#1B5E3B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', flexShrink: 0 }}>✓</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>{f}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}