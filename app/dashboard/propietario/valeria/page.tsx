'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

const SUGERENCIAS = [
  { icon: '💰', texto: '¿Cuál es el valor de mercado actual de mi propiedad?' },
  { icon: '⏱️', texto: '¿Cuánto tarda en venderse una propiedad como la mía?' },
  { icon: '📸', texto: '¿Cómo puedo mejorar las fotos o descripción para vender más rápido?' },
  { icon: '🤝', texto: '¿Cómo funciona la comisión de NIDO si vendemos?' },
  { icon: '📈', texto: '¿Debería ajustar el precio de mi propiedad?' },
  { icon: '📋', texto: '¿Qué pasa cuando llega una oferta por mi propiedad?' },
]

interface Msg { role: 'user' | 'assistant'; content: string }

export default function ValeriaPropietario() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarSug, setMostrarSug] = useState(true)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login-propietario'); return }
      setUser(user)
      const nombre = user.user_metadata?.nombre || user.email?.split('@')[0] || 'propietario'
      const { data: props } = await supabase.from('propiedades')
        .select('id,titulo,zona,precio,tipo,operacion,habitaciones,banos,metros,disponible')
        .eq('propietario_email', user.email!)
      setPropiedades(props || [])
      const saludoProp = props && props.length > 0
        ? `Veo que tenés ${props.length === 1 ? 'tu propiedad' : 'tus ' + props.length + ' propiedades'} publicada${props.length === 1 ? '' : 's'} con nosotros. Preguntame lo que necesités saber: valor de mercado, tiempos de venta, cómo mejorar el anuncio, o cualquier duda sobre el proceso.`
        : 'Todavía no veo propiedades publicadas a tu nombre. Cuando publiqués una, puedo ayudarte con su valor de mercado y estrategia de venta.'
      setMsgs([{
        role: 'assistant',
        content: 'Hola ' + nombre + '. Soy Valeria, la IA de NIDO. ' + saludoProp
      }])
    })
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [msgs, loading])

  const buildSistema = () => {
    const propsTexto = propiedades.length > 0
      ? propiedades.map(p => `- ${p.titulo || 'Propiedad'} en ${p.zona || 'zona no especificada'}: $${(p.precio||0).toLocaleString()} · ${p.operacion || 'venta'} · ${p.habitaciones || '—'} hab · ${p.banos || '—'} baños · ${p.metros || '—'} m² · Estado: ${p.disponible ? 'activa' : 'inactiva'}`).join('\n')
      : 'El propietario todavía no tiene propiedades publicadas.'

    return `Sos Valeria, la asistente IA de NIDO — la plataforma inmobiliaria premium de Costa Rica. Estás hablando con un PROPIETARIO (dueño de una propiedad publicada en NIDO), NO con un asesor inmobiliario.

Tu rol es ayudar al propietario a entender el valor y el proceso de venta de SU propiedad. Hablás en español, tono cálido, cercano y profesional. Respuestas concisas (máximo 4-5 oraciones), claras, sin tecnicismos innecesarios.

Propiedades del propietario:
${propsTexto}

Tus funciones:
1. VALOR DE MERCADO: Dar una estimación razonada del valor de mercado basada en zona, tamaño, características y tendencias generales del mercado costarricense. Aclará siempre que es una estimación orientativa, no un avalúo formal.
2. TIEMPOS Y ESTRATEGIA: Explicar cuánto suele tardar la venta en su zona y qué factores aceleran o frenan una venta (precio, fotos, exclusividad, disponibilidad para visitas).
3. PROCESO NIDO: Explicar cómo funciona NIDO — modelo de corretaje (comisión del 4% solo si se concreta la venta, sin costo previo ni suscripción), cláusula de exclusividad de 90 días, opción de continuar sin exclusividad como "push de venta" al vencer, cómo llegan las ofertas y cómo se coordinan las visitas.
4. RECOMENDACIONES PRÁCTICAS: Sugerir mejoras simples (fotos, descripción, ajuste de precio) que ayuden a vender más rápido.

Contexto de mercado Costa Rica 2026 (usalo como referencia general, no como dato exacto):
- Zonas de alta demanda: Escazú, Santa Ana, Curridabat, Santa Teresa, Tamarindo, Nosara
- Precio m² promedio venta: $2,400 (GAM/Valle Central), $3,200 (zonas costeras premium)
- Tiempo promedio de venta en zonas de alta demanda: 40-50 días

Si te preguntan algo fuera de tu alcance (legal complejo, fiscal, disputas), recomendá amablemente contactar al equipo NIDO directamente. Nunca inventés cifras exactas de tasación — siempre aclará que es orientativo y que para un valor preciso el equipo NIDO puede coordinar un análisis comparativo de mercado (CMA).`
  }

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
        body: JSON.stringify({ system: buildSistema(), messages: nuevos })
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

  const nombre = user?.email?.split('@')[0] || 'propietario'

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", height:'calc(100vh - 64px)', display:'flex', flexDirection:'column', background:'oklch(0.97 0.005 80)', color:'oklch(0.20 0.005 80)', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}
        .msg-ani{animation:fadeUp 0.3s ease}
        .sug-btn{padding:8px 14px;border-radius:999px;border:1px solid oklch(0.88 0.006 80);background:white;font-size:13px;color:oklch(0.42 0.005 80);cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:7px;font-family:'DM Sans',sans-serif;text-align:left}
        .sug-btn:hover{border-color:oklch(0.42 0.06 150);color:oklch(0.42 0.06 150);background:oklch(0.95 0.02 150)}
        .send-btn{width:38px;height:38px;border-radius:50%;background:oklch(0.20 0.005 80);border:none;color:white;cursor:pointer;display:grid;place-items:center;transition:all 0.2s;flex-shrink:0}
        .send-btn:hover:not(:disabled){background:oklch(0.30 0.006 80);transform:scale(1.05)}
        .send-btn:disabled{opacity:0.4;cursor:not-allowed}
        .chat-textarea{flex:1;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:14px;color:oklch(0.20 0.005 80);outline:none;resize:none;line-height:1.5;max-height:120px}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:oklch(0.88 0.006 80);border-radius:2px}
        @media(max-width:768px){.side-panel-p{display:none!important}}
      `}</style>

      <div style={{ flex:1, display:'flex', overflow:'hidden', maxWidth:1200, margin:'0 auto', width:'100%' }}>

        <aside className="side-panel-p" style={{ width:240, borderRight:'1px solid oklch(0.88 0.006 80)', display:'flex', flexDirection:'column', overflow:'hidden', background:'white' }}>
          <div style={{ padding:'20px 16px', borderBottom:'1px solid oklch(0.88 0.006 80)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:13, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
              <span style={{ fontSize:14, fontWeight:500 }}>Valeria</span>
            </div>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.60 0.005 80)', marginBottom:12 }}>Preguntale a Valeria</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {SUGERENCIAS.map(s => (
                <button key={s.texto} className="sug-btn" onClick={() => enviar(s.texto)} style={{ width:'100%', borderRadius:8, padding:'9px 12px' }}>
                  <span style={{ fontSize:14 }}>{s.icon}</span>
                  <span style={{ fontSize:12, lineHeight:1.4 }}>{s.texto}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:'16px', flex:1 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.60 0.005 80)', marginBottom:10 }}>¿Necesitás algo más específico?</div>
            <p style={{ fontSize:12, color:'oklch(0.60 0.005 80)', lineHeight:1.6, marginBottom:12 }}>Valeria te orienta, pero para temas puntuales de tu propiedad el equipo NIDO puede ayudarte directamente.</p>
            <a href="https://wa.me/50688226436?text=Hola%2C%20soy%20propietario%20en%20NIDO%20y%20tengo%20una%20consulta%20sobre%20mi%20propiedad." target="_blank" style={{ display:'block', padding:'9px 14px', background:'#22c55e', borderRadius:8, fontSize:12, color:'white', fontWeight:500, textDecoration:'none', textAlign:'center' }}>
              💬 Contactar equipo NIDO
            </a>
          </div>
        </aside>

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', maxWidth:760, margin:'0 auto', width:'100%' }}>

          <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:16 }}>
            {msgs.map((m, i) => (
              <div key={i} className="msg-ani" style={{ display:'flex', gap:12, justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-start' }}>
                {m.role==='assistant' && (
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)', flexShrink:0, marginTop:2 }}>V</div>
                )}
                <div style={{ maxWidth:'75%', padding:'12px 16px', borderRadius:m.role==='user'?'18px 4px 18px 18px':'4px 18px 18px 18px', background:m.role==='user'?'oklch(0.20 0.005 80)':'white', color:m.role==='user'?'white':'oklch(0.20 0.005 80)', fontSize:14, lineHeight:1.65, border:m.role==='assistant'?'1px solid oklch(0.88 0.006 80)':'none', whiteSpace:'pre-wrap' }}>
                  {m.content}
                </div>
                {m.role==='user' && (
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'oklch(0.95 0.02 150)', border:'1px solid oklch(0.88 0.006 80)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:14, flexShrink:0, marginTop:2 }}>
                    {nombre[0].toUpperCase()}
                  </div>
                )}
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
                {SUGERENCIAS.slice(0,4).map(s => (
                  <button key={s.texto} className="sug-btn" onClick={() => enviar(s.texto)}>
                    <span>{s.icon}</span> {s.texto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop:'1px solid oklch(0.88 0.006 80)', padding:'16px 28px', background:'white' }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, border:'1px solid oklch(0.88 0.006 80)', borderRadius:16, padding:'10px 12px 10px 16px', background:'oklch(0.97 0.005 80)' }}>
              <textarea
                ref={inputRef}
                className="chat-textarea"
                placeholder="Preguntale a Valeria sobre tu propiedad..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="send-btn" onClick={() => enviar(input)} disabled={!input.trim() || loading}>
                →
              </button>
            </div>
            <p style={{ fontSize:11, color:'oklch(0.60 0.005 80)', marginTop:8, textAlign:'center' }}>Valeria da estimaciones orientativas. Para un avalúo formal, contactá al equipo NIDO.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
