'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const PANELES = [
  {
    id: 'comprador',
    href: '/comprador',
    label: 'Quiero comprar',
    sub: 'Encontrá tu hogar ideal con Valeria IA',
    eyebrow: 'Comprador',
    foto: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    acento: 'oklch(0.42 0.06 150)',
    icon: '🏠',
  },
  {
    id: 'vendedor',
    href: '/vendedor-onboarding',
    label: 'Quiero vender',
    sub: 'Publicá tu propiedad y llegá a miles de compradores',
    eyebrow: 'Vendedor',
    foto: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    acento: 'oklch(0.62 0.10 75)',
    icon: '🗝️',
  },
  {
    id: 'asesor',
    href: '/unirse',
    label: 'Soy asesor',
    sub: 'Gestioná tus propiedades y leads con IA',
    eyebrow: 'Asesor',
    foto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    acento: 'oklch(0.52 0.08 230)',
    icon: '✦',
  },
]

export default function Bienvenida() {
  const router = useRouter()
  const [hover, setHover] = useState<string | null>(null)

  return (
    <main style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', fontFamily:"'DM Sans',sans-serif", position:'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes slow-zoom { 0%{transform:scale(1)} 100%{transform:scale(1.08)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .panel { transition: flex 0.7s cubic-bezier(0.4,0,0.2,1); }
        .panel-img { transition: opacity 0.5s ease; animation: slow-zoom 20s ease-in-out infinite alternate; }
        .panel-content { transition: all 0.4s ease; }
        .panel-btn { transition: all 0.25s ease; }
        .panel-btn:hover { transform: translateY(-2px); }
        .nido-logo { font-family:'Cormorant Garamond',serif; font-size:1.3rem; color:white; letter-spacing:0.08em; opacity:0.9; }
        @media (max-width: 768px) {
          .panels-container { flex-direction: column !important; }
          .panel { flex: 1 !important; min-height: 33.33vh !important; }
          .panel-h1 { font-size: 1.8rem !important; }
        }
      `}</style>

      {/* Logo flotante */}
      <div style={{ position:'fixed', top:24, left:32, zIndex:100, animation:'fadeIn 1s ease 0.3s both' }}>
        <div className="nido-logo">NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span></div>
      </div>

      {/* 3 paneles */}
      <div className="panels-container" style={{ display:'flex', width:'100%', height:'100%' }}>
        {PANELES.map((p, idx) => {
          const isHovered = hover === p.id
          const anyHovered = hover !== null
          const flex = anyHovered ? (isHovered ? 2.2 : 0.65) : 1

          return (
            <div
              key={p.id}
              className="panel"
              style={{ flex, position:'relative', overflow:'hidden', cursor:'pointer', minWidth:0 }}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => router.push(p.href)}
            >
              {/* Foto de fondo */}
              <div style={{ position:'absolute', inset:'-5%', overflow:'hidden' }}>
                <img
                  src={p.foto}
                  alt={p.label}
                  className="panel-img"
                  style={{ width:'110%', height:'110%', objectFit:'cover', display:'block', opacity: isHovered ? 0.55 : 0.35 }}
                />
              </div>

              {/* Overlay gradiente */}
              <div style={{ position:'absolute', inset:0, background: isHovered
                ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%)',
                transition:'background 0.5s ease'
              }}/>

              {/* Línea de color acento */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:p.acento, opacity: isHovered ? 1 : 0, transition:'opacity 0.3s ease' }}/>

              {/* Divisor vertical */}
              {idx < PANELES.length - 1 && (
                <div style={{ position:'absolute', top:'10%', bottom:'10%', right:0, width:1, background:'rgba(255,255,255,0.08)', zIndex:2 }}/>
              )}

              {/* Contenido */}
              <div className="panel-content" style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding: isHovered ? '2.5rem 2.5rem 3rem' : '2rem 1.8rem 2.5rem', zIndex:3 }}>
                {/* Eyebrow */}
                <div style={{ fontSize:'0.62rem', letterSpacing:'0.22em', textTransform:'uppercase', color: isHovered ? p.acento : 'rgba(255,255,255,0.45)', marginBottom:'0.6rem', transition:'color 0.3s ease', fontWeight:500 }}>
                  {String(idx+1).padStart(2,'0')} · {p.eyebrow}
                </div>

                {/* Título */}
                <h2 className="panel-h1" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isHovered ? 'clamp(2rem,3.5vw,3rem)' : 'clamp(1.4rem,2.5vw,2.2rem)', fontWeight:300, color:'white', lineHeight:1.1, marginBottom:'0.8rem', transition:'font-size 0.4s ease', letterSpacing:'-0.01em' }}>
                  {p.label}
                </h2>

                {/* Sub */}
                <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', marginBottom: isHovered ? '1.5rem' : '0', maxHeight: isHovered ? 60 : 0, overflow:'hidden', transition:'all 0.4s ease', lineHeight:1.6 }}>
                  {p.sub}
                </p>

                {/* CTA */}
                <div style={{ overflow:'hidden', maxHeight: isHovered ? 60 : 0, transition:'max-height 0.4s ease' }}>
                  <button
                    className="panel-btn"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'white', color:'#060D08', border:'none', padding:'10px 20px', borderRadius:999, fontSize:'0.8rem', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.02em' }}
                  >
                    Continuar <span style={{ fontSize:'1rem' }}>→</span>
                  </button>
                </div>
              </div>

              {/* Número grande decorativo */}
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(6rem,15vw,14rem)', fontWeight:300, color:'rgba(255,255,255,0.03)', lineHeight:1, pointerEvents:'none', userSelect:'none', transition:'all 0.5s ease', opacity: isHovered ? 0 : 1 }}>
                {String(idx+1)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:100, fontSize:'0.65rem', letterSpacing:'0.15em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase', animation:'fadeIn 1s ease 1s both' }}>
        Elegí tu camino
      </div>
    </main>
  )
}
