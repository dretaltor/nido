'use client'
import { useState, useEffect, useRef } from 'react'
import { crearTicketSoporte } from '../../lib/soporte'

const SUGERENCIAS = [
  { icon: '🔍', texto: '¿Cómo busco propiedades en NIDO?' },
  { icon: '📅', texto: '¿Cómo agendo una visita a una propiedad?' },
  { icon: '💳', texto: '¿NIDO ayuda con el financiamiento o crédito?' },
  { icon: '📋', texto: '¿Qué pasa después de hacer una oferta?' },
  { icon: '🏠', texto: '¿NIDO cobra algo a los compradores?' },
  { icon: '🗺️', texto: '¿Qué zonas de Costa Rica tienen más propiedades disponibles?' },
]

interface Msg { role: 'user' | 'assistant'; content: string }

const SISTEMA = `Sos Valeria, la asistente IA de NIDO — la plataforma inmobiliaria premium de Costa Rica. Estás hablando con un COMPRADOR o visitante del portal público (no tiene cuenta necesariamente).

Tono cálido, cercano y profesional, en español. Respuestas concisas (máximo 4-5 oraciones).

Tus funciones:
1. Explicar cómo funciona NIDO para compradores: búsqueda de propiedades, cómo agendar visitas, cómo se hacen ofertas, y que el servicio no tiene costo para el comprador (la comisión la paga el propietario al vender).
2. Orientar sobre zonas, tipos de propiedad y rangos de precio en Costa Rica en términos generales.
3. Responder dudas sobre el proceso de compra (visitas, ofertas, financiamiento — aclarando que NIDO no es un banco pero puede orientar sobre el proceso general).
4. Si preguntan por propiedades específicas, redirigirlos a www.nido-cr.com/propiedades para ver el catálogo completo, ya que no tenés acceso a la base de datos en vivo desde este chat.

Si no podés resolver algo o el usuario pide hablar con una persona, decile amablemente que puede usar el botón "Hablar con el equipo NIDO" para que un asesor lo contacte.`

export default function SoportePublico() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'assistant',
    content: 'Hola, soy Valeria de NIDO 🏠 Puedo ayudarte con dudas sobre cómo comprar o alquilar una propiedad, agendar visitas, o cómo funciona la plataforma. ¿En qué te ayudo?'
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarSug, setMostrarSug] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [enviandoTicket, setEnviandoTicket] = useState(false)
  const [ticketAbierto, setTicketAbierto] = useState(false)
  const [form, setForm] = useState({ nombre:'', correo:'', telefono:'' })
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [msgs, loading])

  const enviar = async (texto: string) => {
    if (!texto.trim() || loading) return
    setMostrarSug(false)
    const nuevos: Msg[] = [...msgs, { role: 'user', content: texto }]
    setMsgs(nuevos)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SISTEMA, messages: nuevos })
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'assistant', content: data.message || 'No pude procesar tu consulta, intentá de nuevo.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Hubo un error al conectarme. Intenta de nuevo.' }])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(input) }
  }

  const enviarTicket = async () => {
    if (!form.nombre.trim() || !form.correo.trim() || enviandoTicket) return
    setEnviandoTicket(true)
    const res = await crearTicketSoporte({
      usuario_email: form.correo.trim(),
      usuario_nombre: form.nombre.trim(),
      usuario_telefono: form.telefono.trim() || undefined,
      usuario_tipo: 'comprador',
      asunto: 'Consulta de comprador vía Valeria — ' + form.nombre.trim(),
      mensajes: msgs,
    })
    if (res.ok) {
      setTicketAbierto(true)
      setMostrarForm(false)
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Listo, ' + form.nombre.trim() + ' — le avisé al equipo NIDO sobre tu consulta. Te van a contactar a ' + form.correo.trim() + (form.telefono ? ' o al ' + form.telefono : '') + ' en las próximas 24 horas hábiles.' }])
    } else {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'No pude enviar tu consulta automáticamente. Escribinos directamente a hola@nido-cr.com.' }])
    }
    setEnviandoTicket(false)
  }

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', display:'flex', flexDirection:'column', background:'oklch(0.97 0.005 80)', color:'oklch(0.20 0.005 80)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}
        .msg-ani{animation:fadeUp 0.3s ease}
        .sug-btn{padding:8px 14px;border-radius:999px;border:1px solid oklch(0.88 0.006 80);background:white;font-size:13px;color:oklch(0.42 0.005 80);cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:7px;font-family:'DM Sans',sans-serif;text-align:left}
        .sug-btn:hover{border-color:oklch(0.42 0.06 150);color:oklch(0.42 0.06 150);background:oklch(0.95 0.02 150)}
        .send-btn{width:38px;height:38px;border-radius:50%;background:oklch(0.20 0.005 80);border:none;color:white;cursor:pointer;display:grid;place-items:center;transition:all 0.2s;flex-shrink:0}
        .send-btn:hover:not(:disabled){background:oklch(0.30 0.006 80);transform:scale(1.05)}
        .send-btn:disabled{opacity:0.4;cursor:not-allowed}
        .chat-textarea{flex:1;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:14px;color:oklch(0.20 0.005 80);outline:none;resize:none;line-height:1.5;max-height:120px}
        .field-input{width:100%;padding:10px 12px;border:1px solid oklch(0.88 0.006 80);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none}
        .field-input:focus{border-color:oklch(0.42 0.06 150)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:oklch(0.88 0.006 80);border-radius:2px}
      `}</style>

      <nav style={{ borderBottom:'1px solid oklch(0.88 0.006 80)', background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:1000, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'oklch(0.20 0.005 80)' }}>NIDO<span style={{ color:'oklch(0.42 0.06 150)' }}>.</span></a>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:12, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
            <span style={{ fontSize:13, fontWeight:500 }}>Valeria · Soporte</span>
          </div>
          <a href="/propiedades" style={{ fontSize:13, color:'oklch(0.60 0.005 80)' }}>Ver propiedades →</a>
        </div>
      </nav>

      <div style={{ flex:1, display:'flex', flexDirection:'column', maxWidth:760, margin:'0 auto', width:'100%' }}>

        <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'24px 20px', display:'flex', flexDirection:'column', gap:16, minHeight:400 }}>
          {msgs.map((m, i) => (
            <div key={i} className="msg-ani" style={{ display:'flex', gap:12, justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-start' }}>
              {m.role==='assistant' && (
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)', flexShrink:0, marginTop:2 }}>V</div>
              )}
              <div style={{ maxWidth:'75%', padding:'12px 16px', borderRadius:m.role==='user'?'18px 4px 18px 18px':'4px 18px 18px 18px', background:m.role==='user'?'oklch(0.20 0.005 80)':'white', color:m.role==='user'?'white':'oklch(0.20 0.005 80)', fontSize:14, lineHeight:1.65, border:m.role==='assistant'?'1px solid oklch(0.88 0.006 80)':'none', whiteSpace:'pre-wrap' }}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)', flexShrink:0 }}>V</div>
              <div style={{ padding:'12px 16px', borderRadius:'4px 18px 18px 18px', background:'white', border:'1px solid oklch(0.88 0.006 80)', display:'flex', gap:5, alignItems:'center' }}>
                {[0,1,2].map(j => <span key={j} style={{ width:6, height:6, borderRadius:'50%', background:'oklch(0.42 0.06 150)', display:'inline-block', animation:'blink 1.2s ease '+(j*0.2)+'s infinite' }}/>)}
              </div>
            </div>
          )}

          {mostrarSug && msgs.length <= 1 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
              {SUGERENCIAS.map(s => (
                <button key={s.texto} className="sug-btn" onClick={() => enviar(s.texto)}>
                  <span>{s.icon}</span> {s.texto}
                </button>
              ))}
            </div>
          )}

          {mostrarForm && !ticketAbierto && (
            <div className="msg-ani" style={{ background:'white', border:'1px solid oklch(0.88 0.006 80)', borderRadius:12, padding:'16px 18px', maxWidth:'85%' }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Dejanos tus datos y el equipo NIDO te contacta</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                <input className="field-input" placeholder="Nombre completo" value={form.nombre} onChange={e => setForm(f => ({...f, nombre:e.target.value}))}/>
                <input className="field-input" placeholder="Correo electrónico" type="email" value={form.correo} onChange={e => setForm(f => ({...f, correo:e.target.value}))}/>
                <input className="field-input" placeholder="Teléfono (opcional)" value={form.telefono} onChange={e => setForm(f => ({...f, telefono:e.target.value}))}/>
              </div>
              <button onClick={enviarTicket} disabled={!form.nombre.trim() || !form.correo.trim() || enviandoTicket} style={{ width:'100%', padding:'10px', borderRadius:8, background:'oklch(0.20 0.005 80)', color:'white', border:'none', fontSize:13, fontWeight:500, opacity:(!form.nombre.trim()||!form.correo.trim()||enviandoTicket)?0.6:1 }}>
                {enviandoTicket ? 'Enviando...' : 'Enviar consulta al equipo NIDO'}
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop:'1px solid oklch(0.88 0.006 80)', padding:'16px 20px', background:'white' }}>
          {!ticketAbierto && (
            <button onClick={() => setMostrarForm(v => !v)} style={{ display:'block', width:'100%', marginBottom:10, padding:'8px 14px', borderRadius:8, border:'1px solid oklch(0.88 0.006 80)', background:'transparent', fontSize:12, color:'oklch(0.42 0.005 80)', fontWeight:500 }}>
              💬 ¿Necesitás hablar con el equipo NIDO?
            </button>
          )}
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, border:'1px solid oklch(0.88 0.006 80)', borderRadius:16, padding:'10px 12px 10px 16px', background:'oklch(0.97 0.005 80)' }}>
            <textarea
              className="chat-textarea"
              placeholder="Escribile a Valeria..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="send-btn" onClick={() => enviar(input)} disabled={!input.trim() || loading}>
              →
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
