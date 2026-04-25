'use client'
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
`}</style>
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
}