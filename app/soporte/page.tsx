'use client'
import ValeriaChatBox from '../../components/soporte/ValeriaChatBox'

export default function SoportePublico() {
  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', display:'flex', flexDirection:'column', background:'oklch(0.97 0.005 80)', color:'oklch(0.20 0.005 80)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
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

      <div style={{ flex:1, display:'flex', flexDirection:'column', maxWidth:760, margin:'0 auto', width:'100%', minHeight:0 }}>
        <ValeriaChatBox/>
      </div>
    </main>
  )
}
