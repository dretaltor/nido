'use client'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [pos, setPos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <main style={{ minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif", overflow:'hidden', position:'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .link-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;transition:all 0.2s;font-family:"DM Sans",sans-serif}
        .link-btn:hover{transform:translateY(-2px)}
      `}</style>

      {/* Background glow */}
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 600px 400px at ${pos.x}% ${pos.y}%, oklch(0.42 0.06 150/0.12) 0%, transparent 70%)`, transition:'background 0.1s', pointerEvents:'none' }}/>

      {/* Content */}
      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'0 24px', animation:'fadeUp 0.6s ease' }}>

        {/* 404 number */}
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(120px,20vw,200px)', fontWeight:400, color:'rgba(255,255,255,0.06)', lineHeight:1, marginBottom:-20, userSelect:'none', animation:'float 4s ease infinite' }}>
          404
        </div>

        {/* Logo */}
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:'white', letterSpacing:'0.05em', marginBottom:16 }}>
          NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span>
        </div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,5vw,48px)', fontWeight:400, color:'white', marginBottom:12, lineHeight:1.1 }}>
          Esta página <em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>no existe.</em>
        </h1>

        <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', marginBottom:40, lineHeight:1.7, maxWidth:420, margin:'0 auto 40px' }}>
          La propiedad que buscás puede haber sido vendida, pausada o la dirección no es correcta.
        </p>

        {/* Valeria message */}
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 20px', maxWidth:400, margin:'0 auto 32px', backdropFilter:'blur(12px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:13, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
            <span style={{ fontSize:13, fontWeight:500, color:'white' }}>Valeria</span>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.35)', marginLeft:'auto' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>En línea
            </span>
          </div>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.65, fontStyle:'italic' }}>
            "¿Perdiste una propiedad? Puedo ayudarte a encontrar algo similar. Solo decime qué buscás."
          </p>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/propiedades" className="link-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white' }}>
            <span>🏠</span> Ver propiedades
          </a>
          <a href="/chat" className="link-btn" style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <span>✦</span> Hablar con Valeria
          </a>
          <a href="/" className="link-btn" style={{ background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)' }}>
            ← Inicio
          </a>
        </div>
      </div>

      {/* Bottom text */}
      <div style={{ position:'absolute', bottom:24, fontSize:11, color:'rgba(255,255,255,0.15)', letterSpacing:'0.1em' }}>
        NIDO · PLATAFORMA INMOBILIARIA · COSTA RICA
      </div>
    </main>
  )
}
