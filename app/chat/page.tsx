'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const SUGERENCIAS = [
  { icon: '📋', texto: '¿Qué tengo pendiente esta semana?' },
  { icon: '📈', texto: '¿Cómo puedo mejorar mi ranking en NIDO?' },
  { icon: '🎯', texto: 'Analiza mi pipeline de leads actual' },
  { icon: '✍️', texto: 'Ayudame a redactar una descripción de propiedad' },
  { icon: '🏆', texto: '¿Qué hacen diferente los asesores top?' },
  { icon: '📞', texto: 'Cómo hacer seguimiento efectivo a un lead frío' },
  { icon: '💰', texto: 'Estrategias para cerrar más rápido' },
  { icon: '🗺️', texto: '¿Qué zonas de Costa Rica tienen más demanda?' },
]

const buildSistema = (perfil: any) => {
  const base = `Sos Valeria`
  if (!perfil) return SISTEMA_BASE
  return SISTEMA_BASE + `

--- PERFIL PERSONALIZADO DE TU ASESOR ---
Nombre: ${perfil.nombre_asesor}
Estilo de comunicación: ${perfil.estilo_comunicacion}
Zonas de especialización: ${perfil.zonas}
Tipos de propiedades: ${perfil.tipo_propiedades}
Rango de precios: ${perfil.rango_precio}
Meta mensual: ${perfil.objetivo_mensual}
Estilo de cierre: ${perfil.estilo_cierre}
Propuesta de valor: ${perfil.diferenciador}
Disponibilidad: ${perfil.disponibilidad}
Meta en NIDO: ${perfil.meta_nido}

INSTRUCCIONES DE PERSONALIZACIÓN:
- Siempre llamá al asesor por su nombre: ${perfil.nombre_asesor}
- Adaptá tu tono al estilo: ${perfil.estilo_comunicacion}
- Cuando sugieras zonas, priorizá: ${perfil.zonas}
- Cuando generes descripciones o emails, usá el estilo ${perfil.estilo_comunicacion}
- Tené en cuenta que su meta es ${perfil.objetivo_mensual} y su diferenciador es: ${perfil.diferenciador}
- Sus clientes ideales buscan propiedades en rango ${perfil.rango_precio}
---`
}

const SISTEMA_BASE = \`Sos Valeria, la mentora IA de NIDO — la plataforma inmobiliaria premium de Costa Rica. Tu rol es ser el copiloto profesional del asesor inmobiliario que te consulta.

Tu personalidad: directa, cálida, experta. Hablás en español latinoamericano (vos/usted según contexto). Sos concisa pero profunda — no das respuestas genéricas.

Tus funciones principales:
1. MENTOR INMOBILIARIO: Asesorás en estrategias de venta, negociación, prospección y cierre. Conocés el mercado costarricense a fondo.
2. SEGUIMIENTO DE PENDIENTES: Cuando el asesor comparte sus tareas o leads, los rastreás y recordás prioridades.
3. RANKING Y MEJORA: Explicás qué factores mejoran el posicionamiento en NIDO (propiedades activas, fotos, respuesta a leads, calificaciones).
4. EDUCACIÓN: Enseñás aspectos legales, financieros y de marketing inmobiliario de forma práctica.
5. REDACCIÓN: Redactás descripciones de propiedades, emails a clientes y mensajes de seguimiento.

Factores de ranking en NIDO (usálos cuando el asesor pregunte):
- Propiedades con 8+ fotos profesionales (+30%)
- Tiempo de respuesta a leads < 2 horas (+40%)
- Calificación promedio > 4.5 estrellas (+25%)
- Propiedades con precio dentro del rango de mercado (+20%)
- Perfil completo con foto y descripción (+15%)
- Tour 360° incluido (+35%)
- Mínimo 5 propiedades activas (+20%)

Mercado Costa Rica 2026:
- Zonas de alta demanda: Escazú, Santa Ana, Curridabat, Santa Teresa, Tamarindo, Nosara
- Precio m² promedio venta: $2,400 (GAM), $3,200 (zonas costeras premium)
- Alquiler promedio San José: $1,200-$2,500 por 2 hab
- Tendencia: nómadas digitales con visa rentista, demanda en zona costera +18% anual

Cuando el asesor te diga qué leads o pendientes tiene, guardalos en tu contexto y referenciálos en respuestas futuras. Sé proactiva — si ves oportunidades, las señalás sin que te pregunten.`

interface Msg { role: 'user' | 'assistant'; content: string }

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mostrarSug, setMostrarSug] = useState(true)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load asesor's Valeria profile
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('perfiles').select('valeria_perfil, nombre').eq('id', user.id).maybeSingle()
        if (data?.valeria_perfil) setValeriaPerfil(data.valeria_perfil)
      }
    })
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      const nombre = user?.email?.split('@')[0] || 'asesor'
      setMsgs([{
        role: 'assistant',
        content: 'Hola ' + nombre + '. Soy Valeria, tu mentora IA en NIDO. Puedo ayudarte con tu pipeline de leads, estrategias para rankear mejor, redactar descripciones o simplemente ser tu copiloto inmobiliario. ¿Por dónde empezamos?'
      }])
    })
  }, [])

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
        body: JSON.stringify({
          system: SISTEMA,
          messages: nuevos,
        })
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Hubo un error al conectarme. Intenta de nuevo.' }])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(input) }
  }

  const nombre = user?.email?.split('@')[0] || 'asesor'

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', color:'var(--ink)', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}
        .msg-ani{animation:fadeUp 0.3s ease}
        .sug-btn{padding:8px 14px;border-radius:999px;border:1px solid var(--rule);background:white;font-size:13px;color:var(--ink-2);cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:7px;font-family:var(--sans);text-align:left}
        .sug-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-tint)}
        .send-btn{width:38px;height:38px;border-radius:50%;background:var(--ink);border:none;color:white;cursor:pointer;display:grid;place-items:center;transition:all 0.2s;flex-shrink:0}
        .send-btn:hover:not(:disabled){background:oklch(0.30 0.006 80);transform:scale(1.05)}
        .send-btn:disabled{opacity:0.4;cursor:not-allowed}
        .chat-textarea{flex:1;border:none;background:transparent;font-family:var(--sans);font-size:14px;color:var(--ink);outline:none;resize:none;line-height:1.5;max-height:120px}
        .chat-textarea::placeholder{color:var(--ink-3)}
        .nav-link{font-size:13px;color:var(--ink-3);text-decoration:none;transition:color 0.15s}
        .nav-link:hover{color:var(--ink)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--rule);border-radius:2px}
        @media(max-width:768px){.side-panel{display:none!important}.chat-area{max-width:100%!important}}
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom:'1px solid var(--rule)', background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:1400, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:13, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
            <span style={{ fontSize:14, fontWeight:500 }}>Valeria</span>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink-3)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
              Mentora IA · En línea
            </span>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/dashboard/crm" className="nav-link">CRM</a>
            <a href="/academia" className="nav-link">Academia</a>
          </div>
        </div>
      </nav>

      <div style={{ flex:1, display:'flex', overflow:'hidden', maxWidth:1400, margin:'0 auto', width:'100%' }}>

        {/* Panel lateral */}
        <aside className="side-panel" style={{ width:260, borderRight:'1px solid var(--rule)', display:'flex', flexDirection:'column', overflow:'hidden', background:'white' }}>
          <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--rule)' }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Sugerencias rápidas</div>
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
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Tu ranking NIDO</div>
            {[
              { label:'Propiedades activas', val:'—', tip:'Mínimo 5 recomendado' },
              { label:'Tiempo de respuesta', val:'—', tip:'< 2 horas = +40%' },
              { label:'Calificación promedio', val:'—', tip:'> 4.5 = +25%' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:12, color:'var(--ink-2)', fontWeight:500 }}>{r.label}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--accent)' }}>{r.val}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--ink-3)' }}>{r.tip}</div>
              </div>
            ))}
            <a href="/precios" style={{ display:'block', marginTop:16, padding:'9px 14px', background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:8, fontSize:12, color:'var(--accent)', fontWeight:500, textDecoration:'none', textAlign:'center' }}>
              Ver mi plan actual →
            </a>
          </div>
        </aside>

        {/* Chat principal */}
        <div className="chat-area" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', maxWidth:800, margin:'0 auto', width:'100%' }}>

          {/* Mensajes */}
          <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:16 }}>
            {msgs.map((m, i) => (
              <div key={i} className="msg-ani" style={{ display:'flex', gap:12, justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-start' }}>
                {m.role==='assistant' && (
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)', flexShrink:0, marginTop:2 }}>V</div>
                )}
                <div style={{ maxWidth:'75%', padding:'12px 16px', borderRadius:m.role==='user'?'18px 4px 18px 18px':'4px 18px 18px 18px', background:m.role==='user'?'var(--ink)':'white', color:m.role==='user'?'white':'var(--ink)', fontSize:14, lineHeight:1.65, border:m.role==='assistant'?'1px solid var(--rule)':'none', whiteSpace:'pre-wrap' }}>
                  {m.content}
                </div>
                {m.role==='user' && (
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-tint)', border:'1px solid var(--rule)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, flexShrink:0, marginTop:2 }}>
                    {nombre[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)', flexShrink:0 }}>V</div>
                <div style={{ padding:'12px 16px', borderRadius:'4px 18px 18px 18px', background:'white', border:'1px solid var(--rule)', display:'flex', gap:5, alignItems:'center' }}>
                  {[0,1,2].map(j => <span key={j} style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:'blink 1.2s ease '+(j*0.2)+'s infinite' }}/>)}
                </div>
              </div>
            )}

            {/* Sugerencias inline solo al inicio */}
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

          {/* Input */}
          <div style={{ borderTop:'1px solid var(--rule)', padding:'16px 28px', background:'white' }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-end', background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:14, padding:'10px 14px', transition:'border-color 0.2s' }}>
              <textarea
                ref={inputRef}
                className="chat-textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Preguntale a Valeria... (Enter para enviar, Shift+Enter para nueva línea)"
                rows={1}
                style={{ flex:1, border:'none', background:'transparent', fontFamily:'var(--sans)', fontSize:14, color:'var(--ink)', outline:'none', resize:'none', lineHeight:1.5 }}
              />
              <button className="send-btn" onClick={() => enviar(input)} disabled={loading || !input.trim()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:8, textAlign:'center' }}>
              Valeria recuerda el contexto de esta conversación · <a href="/academia" style={{ color:'var(--accent)' }}>Ver Academia →</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
