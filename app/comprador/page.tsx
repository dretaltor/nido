'use client'
import { useRouter } from 'next/navigation'

export default function Comprador() {
  const router = useRouter()

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}
    .lang-card{background:white;border:2px solid var(--rule);border-radius:20px;padding:36px 32px;cursor:pointer;transition:all 0.25s;text-align:center;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:16px}
    .lang-card:hover{border-color:var(--accent);transform:translateY(-4px);box-shadow:0 16px 48px rgba(27,94,59,0.12)}
  `

  return (
    <main style={{ fontFamily:"var(--sans)", minHeight:"100vh", background:"#060D08", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" }}>
      <style>{CSS}</style>

      <div style={{ position:"absolute", inset:"-5%", backgroundImage:"url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80)", backgroundSize:"cover", backgroundPosition:"center", opacity:0.08, animation:"slow-zoom 24s ease-in-out infinite alternate" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(6,13,8,0.5) 0%, rgba(6,13,8,0.98) 100%)" }}/>

      <div style={{ position:"relative", zIndex:2, maxWidth:600, width:"100%", animation:"fadeUp 0.5s ease" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <a href="/" style={{ fontFamily:"var(--serif)", fontSize:32, color:"white", textDecoration:"none" }}>
            NIDO<span style={{ color:"var(--gold)" }}>.</span>
          </a>
        </div>

        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:16 }}>
            Select your language · Seleccioná tu idioma
          </div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(32px,5vw,52px)", fontWeight:400, lineHeight:1.05, color:"white" }}>
            How would you like<br/>to <em style={{ fontStyle:"italic", color:"oklch(0.75 0.06 150)" }}>continue?</em>
          </h1>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Español */}
          <div className="lang-card" onClick={() => localStorage.setItem('nido_lang','es'); router.push('/comprador-es')}>
            <div style={{ fontSize:48 }}>🇨🇷</div>
            <div>
              <div style={{ fontFamily:"var(--serif)", fontSize:28, fontWeight:400, marginBottom:6 }}>Español</div>
              <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.5 }}>Buscá propiedades con Valeria IA en español</div>
            </div>
            <div style={{ width:"100%", padding:"11px", borderRadius:999, background:"var(--ink)", color:"white", fontSize:14, fontWeight:500, textAlign:"center" }}>
              Continuar en Español →
            </div>
          </div>

          {/* English */}
          <div className="lang-card" onClick={() => router.push('/en')}>
            <div style={{ fontSize:48 }}>🇺🇸</div>
            <div>
              <div style={{ fontFamily:"var(--serif)", fontSize:28, fontWeight:400, marginBottom:6 }}>English</div>
              <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.5 }}>Browse properties with full English support</div>
            </div>
            <div style={{ width:"100%", padding:"11px", borderRadius:999, background:"oklch(0.42 0.06 150)", color:"white", fontSize:14, fontWeight:500, textAlign:"center" }}>
              Continue in English →
            </div>
          </div>
        </div>

        <p style={{ textAlign:"center", marginTop:24, fontSize:12, color:"rgba(255,255,255,0.25)" }}>
          Podés cambiar el idioma en cualquier momento · You can change language at any time
        </p>
      </div>
    </main>
  )
}
