'use client'
import { useState } from 'react'

const RENTALS = [
  { id:'r1', title:'Loft del Cafetal', loc:'Barrio Escalante, San José', price:1450, beds:1, baths:1, area:78, hue:200, term:'Largo plazo', furn:'Amueblado', badge:'Disponible ya', ai:'Coincide con tu rango' },
  { id:'r2', title:'Aurora 502', loc:'Sabana Norte, San José', price:2400, beds:2, baths:2, area:110, hue:240, term:'Largo plazo', furn:'Sin muebles', badge:'Sin estrenar', ai:'Vista al parque' },
  { id:'r3', title:'Casa del Mar', loc:'Tamarindo, Guanacaste', price:3800, beds:3, baths:3, area:220, hue:50, term:'Mensual', furn:'Amueblado', badge:'Pet friendly', ai:'300m a la playa' },
  { id:'r4', title:'Estudio Cipresal', loc:'Heredia Centro', price:850, beds:1, baths:1, area:42, hue:130, term:'Largo plazo', furn:'Amueblado', badge:'Económico', ai:'Cerca del tren' },
  { id:'r5', title:'Villa Pacífica', loc:'Santa Teresa', price:5200, beds:4, baths:4, area:300, hue:60, term:'Estacional', furn:'Amueblado', badge:'Con piscina', ai:'Reservada Dic-Mar' },
  { id:'r6', title:'Apto Curridabat', loc:'Curridabat, San José', price:1650, beds:2, baths:2, area:95, hue:80, term:'Largo plazo', furn:'Semi', badge:'Coworking', ai:'Edificio nuevo' },
]

export default function Alquiler() {
  const [tab, setTab] = useState('Largo plazo')
  const filtered = RENTALS.filter(r => tab==='Todos' || r.term===tab)
  const fmt = (n: number) => '$' + n.toLocaleString('en-US')
  const featured = RENTALS[2]

  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",background:'var(--bg)',minHeight:'100vh',color:'var(--ink)'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
        .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;letter-spacing:0.05em;background:rgba(255,255,255,0.9);color:var(--ink-2);border:1px solid var(--rule)}
        .badge.dark{background:var(--ink);color:var(--bg);border-color:var(--ink)}
        .ai-tag{display:inline-flex;align-items:center;gap:8px;font-size:11px;color:var(--accent);margin-top:10px}
        .ai-glyph{width:16px;height:16px;border-radius:50%;background:var(--accent);color:white;display:grid;place-items:center;font-family:var(--serif);font-style:italic;font-size:10px;flex-shrink:0}
        @media(max-width:768px){.rental-grid{grid-template-columns:1fr!important}.featured-grid{grid-template-columns:1fr!important}.sub-hero-grid{grid-template-columns:1fr!important;gap:16px!important;padding:32px 16px 20px!important}.section-pad{padding:32px 16px!important}}
      `}</style>

      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',maxWidth:1600,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:26,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <nav style={{display:'flex',gap:28,fontSize:13,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--ink-2)'}}>
            <a href="/propiedades">Comprar</a>
            <a href="/alquiler" style={{color:'var(--ink)',borderBottom:'1px solid var(--ink)',paddingBottom:2}}>Alquilar</a>
            <a href="/asesores">Asesores</a>
            <a href="/ideas">Ideas</a>
          </nav>
          <div style={{display:'flex',gap:10}}>
            <a href="/login" style={{border:'1px solid var(--rule)',padding:'8px 16px',borderRadius:999,fontSize:13}}>Ingresar</a>
            <a href="/registro" style={{border:'1px solid var(--ink)',background:'var(--ink)',color:'var(--bg)',padding:'8px 16px',borderRadius:999,fontSize:13}}>Crear cuenta</a>
          </div>
        </div>
      </nav>

      <section className="sub-hero-grid" style={{maxWidth:1600,margin:'0 auto',padding:'64px 40px 32px',display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:60,alignItems:'end',borderBottom:'1px solid var(--rule)'}}>
        <div>
          <div style={{fontSize:12,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>Alquileres · 412 propiedades activas</div>
          <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(48px,5.5vw,84px)',fontWeight:400,lineHeight:0.98,letterSpacing:'-0.012em',margin:0}}>
            Vivir <em style={{fontStyle:'italic',color:'var(--accent)'}}>liviano.</em><br/>Alquilar <em style={{fontStyle:'italic',color:'var(--accent)'}}>bien.</em>
          </h1>
        </div>
        <p style={{fontSize:16,color:'var(--ink-2)',lineHeight:1.6,paddingBottom:14}}>Desde un loft mensual en Escalante hasta una villa estacional en Santa Teresa. Todos los alquileres de NIDO incluyen contratos verificados y un asesor humano de respaldo.</p>
      </section>

      <div className="section-pad" style={{maxWidth:1600,margin:'0 auto',padding:'56px 40px'}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',paddingBottom:30,borderBottom:'1px solid var(--rule)',marginBottom:36}}>
          <div style={{display:'inline-flex',border:'1px solid var(--rule)',borderRadius:999,padding:4,background:'var(--bg-card)'}}>
            {['Largo plazo','Mensual','Estacional','Todos'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{padding:'10px 22px',border:0,background:tab===t?'var(--ink)':'transparent',color:tab===t?'var(--bg)':'var(--ink-2)',borderRadius:999,fontSize:13,cursor:'pointer',transition:'all 0.15s'}}>{t}</button>
            ))}
          </div>
          <span style={{marginLeft:'auto',fontSize:13,color:'var(--ink-3)'}}>{filtered.length} resultados</span>
        </div>

        <div className="featured-grid" style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',border:'1px solid var(--rule)',borderRadius:10,overflow:'hidden',marginBottom:56,background:'var(--bg-card)'}}>
          <div style={{aspectRatio:'4/3',background:`repeating-linear-gradient(135deg,oklch(0.84 0.014 200) 0,oklch(0.84 0.014 200) 16px,oklch(0.89 0.012 200) 16px,oklch(0.89 0.012 200) 32px)`,display:'grid',placeItems:'center'}}>
            <span style={{fontFamily:'var(--mono)',fontSize:12,color:'oklch(0.40 0.03 200)',letterSpacing:'0.08em'}}>CASA DEL MAR · ESTACIONAL</span>
          </div>
          <div style={{padding:'36px 32px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:12}}>Destacado de la semana</div>
              <h2 style={{fontFamily:'var(--serif)',fontSize:40,fontWeight:400,lineHeight:1.05,marginBottom:8}}>{featured.title}</h2>
              <div style={{fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>{featured.loc}</div>
              <p style={{fontSize:15,color:'var(--ink-2)',lineHeight:1.6,marginBottom:20}}>Casa frente al mar con piscina privada y acceso directo a la playa. Ideal para nómadas digitales y familias en temporada alta.</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid var(--rule)',paddingTop:16,gap:12}}>
                {[{v:featured.beds,l:'Habs'},{v:featured.baths,l:'Baños'},{v:featured.area,l:'m²'},{v:'4.9 ★',l:'Rating'}].map((s,i) => (
                  <div key={i}><div style={{fontFamily:'var(--serif)',fontSize:22}}>{s.v}</div><div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginTop:2}}>{s.l}</div></div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:'1px solid var(--rule)'}}>
              <div style={{fontFamily:'var(--mono)',fontSize:24}}>{fmt(featured.price)}<span style={{fontSize:12,color:'var(--ink-3)',marginLeft:4,fontFamily:'var(--sans)'}}>/mes</span></div>
              <a href="/contacto" style={{background:'var(--ink)',color:'var(--bg)',padding:'10px 20px',borderRadius:999,fontSize:13}}>Reservar visita →</a>
            </div>
          </div>
        </div>

        <h2 style={{fontFamily:'var(--serif)',fontSize:28,fontWeight:400,margin:'0 0 24px',borderBottom:'1px solid var(--rule)',paddingBottom:14}}>
          Más alquileres en {tab.toLowerCase()}
        </h2>

        <div className="rental-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'32px 28px'}}>
          {filtered.map(r => (
            <article key={r.id} style={{cursor:'pointer',display:'flex',flexDirection:'column'}}>
              <div style={{position:'relative',aspectRatio:'4/3',borderRadius:6,overflow:'hidden',background:`repeating-linear-gradient(135deg,oklch(0.86 0.012 ${r.hue}) 0,oklch(0.86 0.012 ${r.hue}) 14px,oklch(0.91 0.008 ${r.hue}) 14px,oklch(0.91 0.008 ${r.hue}) 28px)`,display:'grid',placeItems:'center'}}>
                <span style={{fontFamily:'var(--mono)',fontSize:11,color:`oklch(0.42 0.02 ${r.hue})`,letterSpacing:'0.08em'}}>{r.title.toUpperCase()}</span>
                <div style={{position:'absolute',top:12,left:12,display:'flex',gap:6}}>
                  <span className="badge dark">{r.badge}</span>
                  <span className="badge">{r.furn}</span>
                </div>
              </div>
              <div style={{padding:'16px 2px 0'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12}}>
                  <span style={{fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)'}}>{r.loc}</span>
                  <span style={{fontFamily:'var(--mono)',fontSize:13}}>{fmt(r.price)}<small style={{color:'var(--ink-3)',fontFamily:'var(--sans)',marginLeft:2}}>/mes</small></span>
                </div>
                <h3 style={{fontFamily:'var(--serif)',fontSize:22,lineHeight:1.15,fontWeight:400,margin:'6px 0 8px'}}>{r.title}</h3>
                <div style={{display:'flex',gap:14,fontSize:12,color:'var(--ink-2)'}}>
                  <span>🛏 {r.beds} hab</span><span>🛁 {r.baths} baños</span><span>◰ {r.area} m²</span>
                </div>
                <div className="ai-tag"><span className="ai-glyph">V</span>{r.ai}</div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div style={{background:'var(--ink)',margin:'0 40px 40px',borderRadius:16,padding:'48px 48px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48}}>
        <div>
          <h2 style={{fontFamily:'var(--serif)',fontSize:40,fontWeight:400,color:'white',marginBottom:16}}>¿Tenés una propiedad<br/>para <em style={{color:'var(--accent)'}}>alquilar</em>?</h2>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:15,lineHeight:1.65}}>Publicala en NIDO y alcanzá a miles de inquilinos calificados con contratos verificados y asesoría legal incluida.</p>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
          <a href="/dashboard/nueva-propiedad" style={{background:'var(--accent)',color:'var(--ink)',padding:'14px 28px',borderRadius:999,fontSize:15,fontWeight:500}}>Publicar mi propiedad →</a>
        </div>
      </div>
    </main>
  )
}