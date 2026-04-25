'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>NIDO</a>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.3rem' }}>Bienvenido de vuelta</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 2rem' }}>Ingresa a tu cuenta de asesor</p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>Correo electrónico</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.4rem' }}>Contraseña</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
          No tienes cuenta? <a href="/registro" style={{ color: '#15803d', fontWeight: 'bold', textDecoration: 'none' }}>Regístrate aquí</a>
        </p>
      </div>
    </main>
  )
}