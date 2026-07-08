'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SUGERENCIAS = [
  { icon: '🏠', texto: 'Comprar una casa en Escazú' },
  { icon: '🏢', texto: 'Alquilar apartamento en San José' },
  { icon: '🌊', texto: 'Propiedad cerca de la playa' },
  { icon: '💼', texto: 'Inversión inmobiliaria' },
  { icon: '🌿', texto: 'Casa en zona tranquila' },
  { icon: '🏗️', texto: 'Lote para construir' },
]

interface Mensaje {
  rol: 'valeria' | 'usuario'
  texto: string
}

export default function BienvenidaComprador() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: 'valeria', texto: '¡Hola! Soy Valeria, tu asesora personal de NIDO. Estoy aquí para ayudarte a encontrar exactamente lo que buscas en Costa Rica. ¿Por dónde empezamos?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(true)
  const [particulas, setParticulas] = useState<{x:number,y:number,size:number,opacity:number,speed:number}[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const p = Array.from({length: 25}, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.3 + 0.05,
      speed: Math.random() * 0.3 + 0.1,
    }))
    // Posiciones aleatorias solo pueden calcularse en cliente (evita mismatch de hidratación SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticulas(p)
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [mensajes, loading])

  const enviar = async (texto: string) => {
    if (!texto.trim() || loading) return
    setMostrarSugerencias(false)
    const nuevos: Mensaje[] = [...mensajes, { rol: 'usuario', texto }]
    setMensajes(nuevos)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevos.map(m => ({ role: m.rol === 'valeria' ? 'assistant' : 'user', content: m.texto })) })
      })
      const data = await res.json()
      setMensajes(prev => [...prev, { rol: 'valeria', texto: data.message }])
    } catch {
      setMensajes(prev => [...prev, { rol: 'valeria', texto: 'Hubo un error. Por favor intenta de nuevo.' }])
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#060D08', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse-glow { 0%{box-shadow:0 0 0 0 oklch(0.42 0.06 150/0.3)} 70%{box-shadow:0 0 0 20px oklch(0.42 0.06 150/0)} 100%{box-shadow:0 0 0 0 oklch(0.42 0.06 150/0)} }
        @keyframes grad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes drift { 0%{transform:translateY(0) translateX(0)} 33%{transform:translateY(-25px) translateX(12px)} 66%{transform:translateY(12px) translateX(-8px)} 100%{transform:translateY(0) translateX(0)} }
        @keyframes blink { 0%,100%{opacity:0.4} 50%{opacity:1} } @keyframes slow-zoom { 0%{transform:scale(1) translateX(0)} 100%{transform:scale(1.08) translateX(-1%)} }
        .msg-ani { animation: fadeUp 0.35s ease; }
        .chip-btn:hover { background:rgba(255,255,255,0.08)!important; border-color:oklch(0.55 0.07 150)!important; color:white!important; transform:translateY(-1px); }
        .skip-lnk:hover { color:rgba(255,255,255,0.5)!important; }
        .send-btn:hover:not(:disabled) { background:oklch(0.52 0.07 150)!important; transform:scale(1.05); }
        .send-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .chat-inp:focus { outline:none; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* Fondo - Fotos animadas */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
        {/* Imagen principal con zoom lento */}
        <div style={{
          position:'absolute', inset:'-10%',
          backgroundImage:'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80)',
          backgroundSize:'cover', backgroundPosition:'center',
          animation:'slow-zoom 20s ease-in-out infinite alternate',
          opacity:0.25,
        }}/>
        {/* Overlay gradiente */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.2) 0%, rgba(6,13,8,0.05) 50%, rgba(6,13,8,0.4) 100%)' }}/>
        <div style={{ position:'absolute', inset:0, background:'none' }}/>
        {/* Orbe verde animado */}
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.42 0.06 150/0.12) 0%, transparent 70%)', animation:'float 10s ease-in-out infinite' }}/>
        {/* Partículas */}
        {particulas.map((p, i) => (
          <div key={i} style={{ position:'absolute', left:p.x+'%', top:p.y+'%', width:p.size, height:p.size, borderRadius:'50%', background:i%3===0?'oklch(0.55 0.07 150)':i%3===1?'oklch(0.62 0.10 75)':'white', opacity:p.opacity*0.5, animation:'drift '+(9+i*0.4)+'s ease-in-out infinite', animationDelay:(i*0.25)+'s' }}/>
        ))}
        {/* Grid sutil */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
      </div>

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.2rem 2rem', borderBottom:'1px solid rgba(255,255,255,0.05)', backdropFilter:'blur(12px)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', color:'white', letterSpacing:'0.04em' }}>NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span></div>
        <button className="skip-lnk" onClick={() => router.push('/propiedades')} style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.2)', letterSpacing:'0.12em', background:'none', border:'none', cursor:'pointer', transition:'color 0.2s' }}>VER PROPIEDADES →</button>
      </nav>

      {/* Main */}
      <div style={{ position:'relative', zIndex:10, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1rem 1rem 2rem', maxWidth:600, margin:'0 auto', width:'100%', background:'radial-gradient(ellipse 700px 600px at center, rgba(6,13,8,0.7) 0%, transparent 100%)' }}>

        {/* Avatar */}
        <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg, oklch(0.42 0.06 150), oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.2rem', position:'relative', animation:'pulse-glow 3s ease-out infinite', flexShrink:0 }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</span>
          <span style={{ position:'absolute', bottom:4, right:4, width:12, height:12, background:'#22c55e', borderRadius:'50%', border:'2px solid #060D08' }}/>
        </div>

        <div style={{ fontSize:'0.62rem', letterSpacing:'0.2em', color:'oklch(0.85 0.06 80)', marginBottom:'0.7rem', textAlign:'center' }}>VALERIA · ASESORA IA DE NIDO</div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.6rem,5vw,2.4rem)', fontWeight:400, color:'white', textAlign:'center', lineHeight:1.15, marginBottom:'0.6rem' }}>
          Tu próximo hogar empieza<br/>con una <em style={{ fontStyle:'italic', color:'oklch(0.55 0.07 150)' }}>conversación.</em>
        </h1>
        <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.4)', textAlign:'center', lineHeight:1.65, marginBottom:'1.5rem', maxWidth:420 }}>
          Cuéntame qué buscas y en minutos te muestro las propiedades que realmente encajan con tu vida.
        </p>

        {/* Chat box */}
        <div style={{ width:'100%', background:'rgba(4,10,6,0.82)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, overflow:'hidden', backdropFilter:'blur(28px)', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
          <div ref={chatRef} style={{ maxHeight:260, overflowY:'auto', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {mensajes.map((m, i) => (
              <div key={i} className="msg-ani" style={{ display:'flex', justifyContent:m.rol==='usuario'?'flex-end':'flex-start', gap:'0.5rem', alignItems:'flex-start' }}>
                {m.rol==='valeria' && (
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'0.75rem', fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</span>
                  </div>
                )}
                <div style={{ maxWidth:'82%', padding:'0.7rem 0.9rem', borderRadius:m.rol==='valeria'?'4px 14px 14px 14px':'14px 4px 14px 14px', background:m.rol==='valeria'?'rgba(255,255,255,0.06)':'oklch(0.42 0.06 150)', color:m.rol==='valeria'?'rgba(255,255,255,0.85)':'white', fontSize:'0.84rem', lineHeight:1.6 }}>
                  {m.texto}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'0.75rem', fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</span>
                </div>
                <div style={{ padding:'0.7rem 0.9rem', borderRadius:'4px 14px 14px 14px', background:'rgba(255,255,255,0.06)', display:'flex', gap:5, alignItems:'center' }}>
                  {[0,1,2].map(j => <span key={j} style={{ width:5, height:5, borderRadius:'50%', background:'oklch(0.55 0.07 150)', display:'inline-block', animation:'blink 1.2s ease-in-out '+(j*0.2)+'s infinite' }}/>)}
                </div>
              </div>
            )}
            {mostrarSugerencias && mensajes.length===1 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', paddingLeft:'2rem' }}>
                {SUGERENCIAS.map(s => (
                  <button key={s.texto} className="chip-btn" onClick={() => enviar(s.texto)} style={{ padding:'0.4rem 0.8rem', borderRadius:999, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.55)', fontSize:'0.75rem', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif" }}>
                    <span>{s.icon}</span>{s.texto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding:'0.8rem 1rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:'0.6rem', alignItems:'center' }}>
            <input className="chat-inp" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && enviar(input)} placeholder="Cuéntame qué estás buscando..." style={{ flex:1, background:'transparent', border:'none', color:'white', fontSize:'0.88rem', fontFamily:"'DM Sans',sans-serif" }}/>
            <button className="send-btn" onClick={() => enviar(input)} disabled={loading||!input.trim()} style={{ width:36, height:36, borderRadius:'50%', background:'oklch(0.42 0.06 150)', border:'none', color:'white', cursor:'pointer', display:'grid', placeItems:'center', transition:'all 0.2s', fontSize:'0.9rem' }}>→</button>
          </div>
        </div>

        <button className="skip-lnk" onClick={() => router.push('/propiedades')} style={{ marginTop:'1.2rem', fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', background:'none', border:'none', cursor:'pointer', transition:'color 0.2s' }}>
          Prefiero explorar por mi cuenta →
        </button>
        <button className="skip-lnk" onClick={() => router.push('/propiedades/zona')} style={{ marginTop:'0.6rem', fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', background:'none', border:'none', cursor:'pointer', transition:'color 0.2s' }}>
          Explorá propiedades por zona →
        </button>
      </div>
    </main>
  )
}
