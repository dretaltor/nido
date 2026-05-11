'use client'
import { useState } from 'react'

const AGENTS = [
  { id:1, name:'María Quesada', role:'Asesora Senior · Valle Central', initial:'M', hue:80, region:'Valle Central', bio:'12 años acompañando familias en Escazú y Santa Ana. Especialista en condominios cerrados y propiedades sobre $500K.', listings:28, sold:142, langs:['ES','EN'], specs:['Condominios','Lujo','Familias'] },
  { id:2, name:'Daniel Sánchez', role:'Asesor Costero · Pacífico', initial:'D', hue:50, region:'Pacífico', bio:'Surfer convertido en agente. Conoce cada calle de Santa Teresa, Mal País y Nosara.', listings:22, sold:89, langs:['ES','EN','FR'], specs:['Beachfront','Inversión','Vacacional'] },
  { id:3, name:'Lucía Vargas', role:'Asesora Urbana · Centro', initial:'L', hue:200, region:'Valle Central', bio:'Experta en alquileres urbanos y la escena gastronómica de Escalante. Trabajó en arquitectura antes de NIDO.', listings:34, sold:76, langs:['ES','EN'], specs:['Lofts','Alquiler','Diseño'] },
  { id:4, name:'Roberto Mata', role:'Asesor Rural · Occidente', initial:'R', hue:130, region:'Valle Occidente', bio:'Crecido en Atenas. Domina fincas, lotes y propiedades de campo.', listings:19, sold:64, langs:['ES'], specs:['Fincas','Lotes','Cafetal'] },
  { id:5, name:'Andrés Picado', role:'Asesor de Montaña', initial:'A', hue:160, region:'Montaña', bio:'Vive en Monteverde. Especializado en propiedades sustentables y off-grid.', listings:14, sold:41, langs:['ES','EN'], specs:['Eco','Off-grid','Bosque'] },
  { id:6, name:'Camila Rojas', role:'Asesora · Sabana', initial:'C', hue:240, region:'Valle Central', bio:'Especialista en torres residenciales nuevas de la Sabana y Rohrmoser.', listings:31, sold:118, langs:['ES','EN'], specs:['Nuevos','Torres','Inversión'] },
  { id:7, name:'Jorge Méndez', role:'Asesor Guanacaste', initial:'J', hue:30, region:'Guanacaste', bio:'Tamarindo y Papagayo. 8 años con desarrolladores de resorts antes de cambiarse a residencial.', listings:26, sold:93, langs:['ES','EN'], specs:['Resort','Lujo','Beachfront'] },
  { id:8, name:'Valeria Hidalgo', role:'Asesora · Pre-aprobación', initial:'V', hue:280, region:'Valle Central', bio:'Ex-banquera. Acompaña a compradores en su pre-aprobación hipotecaria.', listings:12, sold:67, langs:['ES','EN'], specs:['Hipoteca','Asesoría','Primera'] },
  { id:9, name:'Felipe Araya', role:'Asesor Comercial', initial:'F', hue:100, region:'Valle Central', bio:'Locales comerciales, oficinas y bodegas. 15 años en el mercado corporativo costarricense.', listings:23, sold:51, langs:['ES','EN'], specs:['Comercial','Oficina','Bodega'] },
]

const REGIONS = ['Todas','Valle Central','Valle Occidente','Pacífico','Guanacaste','Montaña']
const SPECS = ['Todas','Condominios','Lujo','Beachfront','Inversión','Lofts','Alquiler','Fincas','Eco','Hipoteca','Comercial']

export default function Asesores() {
  const [region, setRegion] = useState('Todas')
  const [spec, setSpec] = useState('Todas')
  const filtered = AGENTS.filter(a => (region==='Todas'||a.region===region) && (spec==='Todas'||a.specs.includes(spec)))

  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",background:'var(--bg)',minHeight:'100vh',color:'var(--ink)'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
        .chip{padding:7px 14px;border-radius:999px;border:1px solid var(--rule);background:transparent;font-size:13px;color:var(--ink-2);cursor:pointer;transition:all 0.15s}
        .chip:hover{border-color:var(--ink);color:var(--ink)}
        .chip.active{background:var(--ink);color:var(--bg);border-color:var(--ink)}
        .agent-card{border-top:1px solid var(--rule);padding:28px 0;display:grid;grid-template-columns:56px 1fr auto;gap:20px;align-items:start;cursor:pointer;transition:all 0.15s;position:relative}
        .agent-card:hover{padding-left:8px}
        .agent-card .arrow{position:absolute;right:0;top:32px;font-size:18px;color:var(--ink-3);transition:all 0.15s;opacity:0}
        .agent-card:hover .arrow{opacity:1;transform:translateX(4px)}
        @media(max-width:768px){.agent-grid-inner{grid-template-columns:1fr!important}.sub-hero-grid{grid-template-columns:1fr!important;gap:16px!important;padding:32px 16px 20px!important}.section-pad{padding:32px 16px!important}.regions-row{overflow-x:auto;flex-wrap:nowrap!important}}
      `}</style>

      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',maxWidth:1600,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:26,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <nav style={{display:'flex',gap:28,fontSize:13,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--ink-2)'}}>
            <a href="/propiedades">Comprar</a>
            <a href="/alquiler">Alquilar</a>
            <a href="/nosotros" style={{color:'var(--ink-3)',textDecoration:'none',fontSize:13}}>Nosotros</a>
            <a href="/asesores" style={{color:'var(--ink)',borderBottom:'1px solid var(--ink)',paddingBottom:2}}>Asesores</a>
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
          <div style={{fontSize:12,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>87 asesores · Cobertura nacional</div>
          <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(48px,5.5vw,84px)',fontWeight:400,lineHeight:0.98,letterSpacing:'-0.012em'}}>
            Personas <em style={{fontStyle:'italic',color:'var(--accent)'}}>antes</em> que<br/>algoritmos.
          </h1>
        </div>
        <p style={{fontSize:16,color:'var(--ink-2)',lineHeight:1.6,paddingBottom:14}}>Cada asesor de NIDO está certificado, vive en la zona que cubre y trabaja con Valeria IA — pero la conversación, las visitas y las negociaciones siguen siendo humanas.</p>
      </section>

      <div className="section-pad" style={{maxWidth:1600,margin:'0 auto',padding:'40px 40px'}}>
        <div className="regions-row" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
          {REGIONS.map(r => <button key={r} className={'chip'+(region===r?' active':'')} onClick={() => setRegion(r)}>{r}</button>)}
          <div style={{width:1,height:28,background:'var(--rule)',margin:'0 4px',alignSelf:'center'}}/>
          {SPECS.slice(1,6).map(s => <button key={s} className={'chip'+(spec===s?' active':'')} onClick={() => setSpec(spec===s?'Todas':s)}>{s}</button>)}
          <span style={{marginLeft:'auto',fontSize:13,color:'var(--ink-3)',alignSelf:'center'}}>{filtered.length} asesores</span>
        </div>

        <div className="agent-grid-inner" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 48px'}}>
          {filtered.map(a => (
            <div key={a.id} className="agent-card">
              <div style={{width:56,height:56,borderRadius:'50%',background:`oklch(0.85 0.04 ${a.hue})`,display:'grid',placeItems:'center',fontFamily:'var(--serif)',fontSize:22,color:`oklch(0.35 0.06 ${a.hue})`,flexShrink:0}}>
                {a.initial}
              </div>
              <div>
                <div style={{fontFamily:'var(--serif)',fontSize:22,marginBottom:2}}>{a.name}</div>
                <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:10,letterSpacing:'0.04em'}}>{a.role}</div>
                <p style={{fontSize:14,color:'var(--ink-2)',lineHeight:1.55,marginBottom:10}}>{a.bio}</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                  {a.specs.map(s => <span key={s} style={{padding:'3px 10px',borderRadius:999,border:'1px solid var(--rule)',fontSize:11,color:'var(--ink-3)'}}>{s}</span>)}
                  {a.langs.map(l => <span key={l} style={{padding:'3px 10px',borderRadius:999,background:'var(--bg-elev)',fontSize:11,fontFamily:'var(--mono)',color:'var(--ink-3)'}}>{l}</span>)}
                </div>
                <div style={{display:'flex',gap:24,fontSize:13}}>
                  <div><b style={{fontFamily:'var(--serif)',fontSize:18}}>{a.listings}</b> <span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Activas</span></div>
                  <div><b style={{fontFamily:'var(--serif)',fontSize:18}}>{a.sold}</b> <span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Cerradas</span></div>
                  <div><b style={{fontFamily:'var(--serif)',fontSize:18}}>4.9</b> <span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Rating</span></div>
                </div>
              </div>
              <div className="arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'var(--ink)',margin:'0 40px 40px',borderRadius:16,padding:'48px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
        <div>
          <h2 style={{fontFamily:'var(--serif)',fontSize:40,fontWeight:400,color:'white',marginBottom:12}}>¿Querés ser <em style={{color:'var(--accent)'}}>asesor NIDO</em>?</h2>
          <p style={{color:'rgba(255,255,255,0.55)',fontSize:15,lineHeight:1.65}}>Nuestros asesores cierran 2.4× más rápido con Valeria IA automatizando el 80% del trabajo administrativo.</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <input placeholder="Tu correo profesional" style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
          <button style={{background:'var(--accent)',color:'var(--ink)',border:'none',padding:'12px 24px',borderRadius:999,fontSize:14,fontWeight:500,cursor:'pointer'}}>Aplicar →</button>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)'}}>Solo aceptamos asesores con corredora vigente.</p>
        </div>
      </div>
    </main>
  )
}