'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import ValeriaChatBox from './ValeriaChatBox'

// Rutas donde NO se muestra la burbuja publica de Valeria: paneles autenticados
// (propietario, asesor, admin) ya tienen su propia Valeria integrada, y /soporte
// ya es el chat a pantalla completa (evita duplicar la burbuja ahi).
const RUTAS_EXCLUIDAS = ['/dashboard', '/admin', '/chat', '/login', '/registro', '/soporte', '/bienvenida']

export default function ChatWidgetComprador() {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)

  if (RUTAS_EXCLUIDAS.some(r => pathname === r || pathname?.startsWith(r + '/'))) return null

  return (
    <>
      <style>{`
        @keyframes cwcPop{from{opacity:0;transform:translateY(16px) scale(0.96)}to{opacity:1;transform:none}}
        @keyframes cwcPulse{0%,100%{box-shadow:0 0 0 0 rgba(27,94,59,0.35)}50%{box-shadow:0 0 0 8px rgba(27,94,59,0)}}
        .cwc-bubble{animation:cwcPulse 2.8s ease infinite}
        @media(max-width:768px){.cwc-panel{bottom:148px!important}.cwc-bubble-btn{bottom:80px!important}}
        @media(max-width:480px){.cwc-panel{right:12px!important;left:12px!important;width:auto!important}}
      `}</style>

      {abierto && (
        <div className="cwc-panel" style={{
          position:'fixed', bottom:96, right:24, width:360, height:520, maxHeight:'60vh',
          background:'oklch(0.97 0.005 80)', borderRadius:18, boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
          border:'1px solid oklch(0.88 0.006 80)', zIndex:998, overflow:'hidden',
          display:'flex', flexDirection:'column', animation:'cwcPop 0.22s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'oklch(0.20 0.005 80)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontSize:12, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'white' }}>Valeria · NIDO</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
                  En línea
                </div>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} style={{ width:26, height:26, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.1)', color:'white', fontSize:14, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
          </div>
          <div style={{ flex:1, overflow:'hidden' }}>
            <ValeriaChatBox compact/>
          </div>
        </div>
      )}

      <button
        className={'cwc-bubble-btn' + (abierto ? '' : ' cwc-bubble')}
        onClick={() => setAbierto(v => !v)}
        aria-label="Hablar con Valeria"
        style={{
          position:'fixed', bottom:24, right:24, width:58, height:58, borderRadius:'50%',
          background:'oklch(0.20 0.005 80)', border:'none', cursor:'pointer', zIndex:999,
          display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.25)',
          transition:'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {abierto ? (
          <span style={{ color:'white', fontSize:22, lineHeight:1 }}>×</span>
        ) : (
          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</span>
        )}
      </button>
    </>
  )
}
