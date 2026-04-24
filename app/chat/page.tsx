'use client'
import { useState } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola! Soy tu Asesor IA de NIDO. Estoy aqui para ayudarte a encontrar la propiedad perfecta en Costa Rica. Estas buscando comprar o alquilar?' }
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Hubo un error.' }])
    }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <p style={{ color: '#6b7280', margin: 0 }}>Asesor IA disponible 24/7</p>
      </nav>
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#15803d', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🤖</div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>Asesor IA de NIDO</p>
              <p style={{ margin: 0, color: '#dcfce7', fontSize: '0.8rem' }}>En linea ahora</p>
            </div>
          </div>
          <div style={{ height: '480px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%', padding: '0.8rem 1.1rem', borderRadius: '18px', backgroundColor: msg.role === 'user' ? '#15803d' : '#f3f4f6', color: msg.role === 'user' ? 'white' : '#1f2937', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '0.8rem 1.1rem', borderRadius: '18px', color: '#6b7280' }}>Escribiendo...</div>
              </div>
            )}
          </div>
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.8rem' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Escribe aqui lo que buscas..." style={{ flex: 1, padding: '0.8rem 1.1rem', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none' }} />
            <button onClick={sendMessage} disabled={loading} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Enviar</button>
          </div>
        </div>
      </div>
    </main>
  )
}