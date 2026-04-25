'use client'
import { useState, useEffect, useRef } from 'react'

const SUGERENCIAS = [
  'Busco casa en Escazú hasta $300k',
  'Quiero alquilar en San José centro',
  'Necesito apartamento 2 habitaciones',
  'Busco propiedad de inversión',
]

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy Valeria, tu asesora IA de NIDO 🏡 Estoy aquí para ayudarte a encontrar la propiedad perfecta en Costa Rica. ¿Estás buscando comprar o alquilar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSugerencias, setShowSugerencias] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const content = text || input
    if (!content.trim() || loading) return
    setShowSugerencias(false)
    const userMessage = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Hubo un error. Por favor intenta de nuevo.' }])
    }
    setLoading(false)
  }

  const now = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", height: '100vh', overflow: 'hidden', display: 'grid', gridTemplateColumns: '260px 1fr', background: '#FAFAF8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .quick-btn { background: white; border: 1px solid rgba(27,94,59,0.12); border-radius: 100px; padding: 0.4rem 0.9rem; font-size: 0.75rem; color: #1B5E3B; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .quick-btn:hover { background: #F0FDF4; border-color: #1B5E3B; }
        .sug-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.6rem 0.9rem; font-size: 0.78rem; color: rgba(255,255,255,0.6); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; text-align: left; }
        .sug-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .msg-bubble-ai { background: white; border: 1px solid rgba(27,94,59,0.08); border-radius: 4px 16px 16px 16px; padding: 0.9rem 1.1rem; box-shadow: 0 2px 8px rgba(27,94,59,0.04); }
        .msg-bubble-user { background: #1B5E3B; border-radius: 16px 4px 16px 16px; padding: 0.9rem 1.1rem; }
        .send-btn { background: #1B5E3B; border: none; border-radius: 10px; padding: 0.65rem 1.3rem; color: white; font-size: 0.85rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .send-btn:hover { background: #2D7A52; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-input { flex: 1; border: none; background: transparent; font-size: 0.88rem; color: #1a1a1a; outline: none; font-family: 'DM Sans', sans-serif; }
        .chat-input::placeholder { color: #9CA3AF; }
        .sidebar-link { color: rgba(255,255,255,0.4); font-size: 0.78rem; text-decoration: none; padding: 0.5rem 0.8rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .sidebar-link:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(27,94,59,0.15); border-radius: 2px; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ background: '#0D1F15', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '1.5rem 1.3rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'white', textDecoration: 'none' }}>
            NIDO<span style={{ color: '#C8A96E' }}>.</span>
          </a>
        </div>

        <div style={{ padding: '1.2rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginBottom: '0.8rem' }}>CONVERSACIÓN ACTIVA</p>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.2rem' }}>
            <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.2rem' }}>Nueva búsqueda</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Con Valeria · Ahora</p>
          </div>

          <p style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginBottom: '0.8rem', marginTop: '1.2rem' }}>ACCESOS RÁPIDOS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <a href="/propiedades" className="sidebar-link">
              <span style={{ fontSize: '0.9rem' }}>🏠</span> Ver propiedades
            </a>
            <a href="/contacto" className="sidebar-link">
              <span style={{ fontSize: '0.9rem' }}>🏦</span> Precalificación
            </a>
            <a href="/contacto" className="sidebar-link">
              <span style={{ fontSize: '0.9rem' }}>📞</span> Hablar con asesor
            </a>
            <a href="/asesores" className="sidebar-link">
              <span style={{ fontSize: '0.9rem' }}>⭐</span> Ranking asesores
            </a>
          </div>
        </div>

        <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: '28px', height: '28px', background: '#1B5E3B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white' }}>N</div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>nido-cr.com</p>
          </a>
        </div>
      </div>

      {/* CHAT MAIN */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* HEADER */}
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(27,94,59,0.08)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #1B5E3B, #0D1F15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#C8A96E', fontStyle: 'italic' }}>V</span>
            </div>
            <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }} />
          </div>
          <div>
            <p style={{ fontWeight: 500, color: '#0D1F15', fontSize: '0.95rem' }}>Valeria</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <p style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>Asesora IA de NIDO · responde al instante</p>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem' }}>
            <a href="/propiedades" style={{ background: '#F7F4EE', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.78rem', color: '#1B5E3B', cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}>Ver propiedades →</a>
            <a href="/contacto" style={{ background: '#1B5E3B', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.78rem', color: 'white', cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}>Hablar con asesor humano</a>
          </div>
        </div>

        {/* MESSAGES */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 0 0.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(27,94,59,0.08)' }} />
            <p style={{ fontSize: '0.65rem', color: '#9CA3AF', letterSpacing: '0.08em' }}>HOY</p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(27,94,59,0.08)' }} />
          </div>

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.8rem', alignItems: 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1B5E3B, #0D1F15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.85rem', color: '#C8A96E', fontStyle: 'italic' }}>V</span>
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {msg.role === 'assistant' && (
                  <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: 500 }}>Valeria</p>
                )}
                <div className={msg.role === 'user' ? 'msg-bubble-user' : 'msg-bubble-ai'}>
                  <p style={{ color: msg.role === 'user' ? 'white' : '#1a1a1a', fontSize: '0.88rem', lineHeight: 1.7 }}>{msg.content}</p>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.35rem', textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: msg.role === 'assistant' ? '0.2rem' : 0 }}>{now}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1B5E3B, #0D1F15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.85rem', color: '#C8A96E', fontStyle: 'italic' }}>V</span>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: 500 }}>Valeria</p>
                <div className="msg-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.9rem 1.1rem' }}>
                  <div style={{ width: '6px', height: '6px', background: '#1B5E3B', borderRadius: '50%', opacity: 0.4, animation: 'pulse 1s ease-in-out infinite' }} />
                  <div style={{ width: '6px', height: '6px', background: '#1B5E3B', borderRadius: '50%', opacity: 0.4, animation: 'pulse 1s ease-in-out 0.2s infinite' }} />
                  <div style={{ width: '6px', height: '6px', background: '#1B5E3B', borderRadius: '50%', opacity: 0.4, animation: 'pulse 1s ease-in-out 0.4s infinite' }} />
                </div>
              </div>
            </div>
          )}

          {showSugerencias && messages.length === 1 && (
            <div style={{ paddingLeft: '42px' }}>
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.6rem' }}>Sugerencias rápidas:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SUGERENCIAS.map(s => (
                  <button key={s} className="quick-btn" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{ padding: '1rem 2rem 1.2rem', background: 'white', borderTop: '1px solid rgba(27,94,59,0.08)' }}>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', background: '#F7F4EE', borderRadius: '14px', padding: '0.5rem 0.5rem 0.5rem 1.2rem', border: '1px solid rgba(27,94,59,0.08)' }}>
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Describe la propiedad que buscas..."
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? 'Escribiendo...' : 'Enviar'}
            </button>
          </div>
          <p style={{ fontSize: '0.65rem', color: '#C8A96E', textAlign: 'center', marginTop: '0.6rem', letterSpacing: '0.04em' }}>
            Valeria · Asesora IA de NIDO · Basada en propiedades reales disponibles
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </main>
  )
}