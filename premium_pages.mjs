import { writeFileSync } from 'fs'

const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
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
`

const nav = (active = '') => `
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 4rem', background: 'rgba(250,250,248,0.95)', borderBottom: '1px solid rgba(27,94,59,0.08)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
    <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1B5E3B', textDecoration: 'none', letterSpacing: '-0.02em' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></a>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <a href="/propiedades" className="nav-link">Propiedades</a>
      <a href="/asesores" className="nav-link">Asesores</a>
      <a href="/academia" className="nav-link">Academia</a>
      <a href="/precios" className="nav-link">Precios</a>
    </div>
    <div style={{ display: 'flex', gap: '0.8rem' }}>
      <a href="/login" className="btn-outline">Ingresar</a>
      <a href="/registro" className="btn-primary">Registrarse</a>
    </div>
  </nav>`

const propiedades = `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Propiedad {
  id: string; titulo: string; descripcion: string; precio: number; tipo: string;
  operacion: string; habitaciones: number; banos: number; metros: number;
  zona: string; direccion: string; disponible: boolean;
}

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => { cargarPropiedades() }, [])

  const cargarPropiedades = async () => {
    const { data } = await supabase.from('propiedades').select('*').eq('disponible', true).order('created_at', { ascending: false })
    setPropiedades(data || [])
    setLoading(false)
  }

  const filtradas = propiedades.filter(p => filtro === 'todas' ? true : p.operacion === filtro)

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', minHeight: '100vh' }}>
      <style>{\`${fontStyle}\`}</style>
      ${nav('propiedades')}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', fontWeight: 500, marginBottom: '0.5rem' }}>PORTAL INMOBILIARIO</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', color: '#0D1F15', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Propiedades disponibles</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Encuentra tu propiedad ideal en Costa Rica</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', alignItems: 'center' }}>
          {['todas', 'venta', 'alquiler'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={'filter-btn' + (filtro === f ? ' active' : '')}>
              {f === 'todas' ? 'Todas' : f === 'venta' ? 'En venta' : 'En alquiler'}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#9CA3AF' }}>{filtradas.length} propiedades</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>Cargando propiedades...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filtradas.map(p => (
              <div key={p.id} className="card">
                <div style={{ background: 'linear-gradient(135deg, #F7F4EE, #EAF0EA)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative' }}>
                  {p.tipo === 'casa' ? '🏠' : p.tipo === 'apartamento' ? '🏢' : '🏗️'}
                  <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: p.operacion === 'venta' ? '#1B5E3B' : '#0D1F15', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.04em' }}>
                    {p.operacion === 'venta' ? 'VENTA' : 'ALQUILER'}
                  </span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#0D1F15', marginBottom: '0.4rem' }}>{p.titulo}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.82rem', marginBottom: '0.8rem' }}>📍 {p.zona} — {p.direccion}</p>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{p.descripcion}</p>
                  <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem', fontSize: '0.82rem', color: '#9CA3AF', paddingTop: '1rem', borderTop: '1px solid rgba(27,94,59,0.06)' }}>
                    <span>🛏 {p.habitaciones} hab</span>
                    <span>🚿 {p.banos} baños</span>
                    <span>📐 {p.metros}m²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.1rem' }}>PRECIO</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#1B5E3B' }}>
                        {'$' + p.precio.toLocaleString()}{p.operacion === 'alquiler' ? <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>/mes</span> : ''}
                      </div>
                    </div>
                    <a href="/contacto" className="btn-primary">Consultar</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}`

const chat = `'use client'
import { useState } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola! Soy tu Asesor IA de NIDO. Estoy aquí para ayudarte a encontrar la propiedad perfecta en Costa Rica. ¿Estás buscando comprar o alquilar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newMessages }) })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch { setMessages([...newMessages, { role: 'assistant', content: 'Hubo un error. Por favor intenta de nuevo.' }]) }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', minHeight: '100vh' }}>
      <style>{\`${fontStyle}\`}</style>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 4rem', background: 'rgba(250,250,248,0.95)', borderBottom: '1px solid rgba(27,94,59,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1B5E3B', textDecoration: 'none' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></a>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Asesor IA · Disponible 24/7</p>
        <a href="/propiedades" className="btn-outline" style={{ fontSize: '0.82rem' }}>Ver propiedades</a>
      </nav>
      <div style={{ maxWidth: '760px', margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', fontWeight: 500, marginBottom: '0.5rem' }}>NIDO INTELIGENCIA ARTIFICIAL</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#0D1F15' }}>Tu asesor inmobiliario personal</h1>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(27,94,59,0.08)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(27,94,59,0.06)' }}>
          <div style={{ background: '#0D1F15', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '38px', height: '38px', background: '#1B5E3B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white', fontWeight: 500 }}>IA</div>
            <div>
              <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>Asesor IA de NIDO</div>
              <div style={{ color: '#C8A96E', fontSize: '0.72rem' }}>● En línea ahora</div>
            </div>
          </div>
          <div style={{ height: '480px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '72%', padding: '0.9rem 1.1rem', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? '#1B5E3B' : '#F7F4EE', color: msg.role === 'user' ? 'white' : '#1a1a1a', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#F7F4EE', padding: '0.9rem 1.1rem', borderRadius: '16px 16px 16px 4px', color: '#9CA3AF', fontSize: '0.9rem' }}>Escribiendo...</div>
              </div>
            )}
          </div>
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(27,94,59,0.08)', display: 'flex', gap: '0.8rem' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Describe la propiedad que buscas..." style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '100px', border: '1px solid rgba(27,94,59,0.15)', fontSize: '0.9rem', outline: 'none', color: '#1a1a1a', background: '#FAFAF8' }} />
            <button onClick={sendMessage} disabled={loading} style={{ padding: '0.8rem 1.5rem', borderRadius: '100px', border: 'none', background: '#1B5E3B', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>Enviar</button>
          </div>
        </div>
      </div>
    </main>
  )
}`

const login = `'use client'
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
      <style>{\`${fontStyle}
        .input-field { width: 100%; padding: 0.8rem 1.1rem; border-radius: 10px; border: 1px solid rgba(27,94,59,0.15); font-size: 0.9rem; outline: none; color: #1a1a1a; background: white; transition: border-color 0.2s; box-sizing: border-box; }
        .input-field:focus { border-color: #1B5E3B; }
      \`}</style>
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
}`

const registro = `'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleRegistro = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } })
    if (error) { setError('Error al registrarse. Intenta de nuevo.') } else { setExito(true) }
    setLoading(false)
  }

  if (exito) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{\`${fontStyle}\`}</style>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#0D1F15', marginBottom: '0.5rem' }}>Cuenta creada</h2>
        <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>Revisa tu correo para confirmar y luego ingresa.</p>
        <a href="/login" className="btn-primary">Ir al login</a>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', minHeight: '100vh', display: 'flex' }}>
      <style>{\`${fontStyle}
        .input-field { width: 100%; padding: 0.8rem 1.1rem; border-radius: 10px; border: 1px solid rgba(27,94,59,0.15); font-size: 0.9rem; outline: none; color: #1a1a1a; background: white; transition: border-color 0.2s; box-sizing: border-box; }
        .input-field:focus { border-color: #1B5E3B; }
      \`}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1B5E3B', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></a>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#0D1F15', marginBottom: '0.4rem' }}>Crea tu cuenta</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '2rem' }}>Únete a NIDO Pro como asesor inmobiliario</p>
          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.8rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.85rem' }}>{error}</div>}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" className="input-field" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Correo electrónico</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" className="input-field" />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Contraseña</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" className="input-field" />
          </div>
          <button onClick={handleRegistro} disabled={loading} style={{ width: '100%', padding: '0.85rem', borderRadius: '100px', border: 'none', background: '#1B5E3B', color: 'white', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9CA3AF' }}>
            ¿Ya tienes cuenta? <a href="/login" style={{ color: '#1B5E3B', fontWeight: 500, textDecoration: 'none' }}>Ingresa aquí</a>
          </p>
        </div>
      </div>
      <div style={{ flex: 1, background: '#0D1F15', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ maxWidth: '360px' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', marginBottom: '1.5rem' }}>EMPIEZA GRATIS</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'white', lineHeight: 1.3, marginBottom: '2rem' }}>Cierra más tratos con inteligencia artificial</h2>
          {['Sin tarjeta de crédito', '14 días de prueba gratis', 'Cancela cuando quieras', 'Soporte en español'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '20px', height: '20px', background: '#C8A96E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#0D1F15', flexShrink: 0 }}>✓</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>{f}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}`

writeFileSync('app/propiedades/page.tsx', propiedades)
writeFileSync('app/chat/page.tsx', chat)
writeFileSync('app/login/page.tsx', login)
writeFileSync('app/registro/page.tsx', registro)
console.log('Todas las páginas premium aplicadas')
