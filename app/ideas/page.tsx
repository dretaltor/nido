'use client'
import { useState } from 'react'

const ARTICLES = [
  { id:'a1', cat:'Mercado', title:'Por qué Santa Teresa subió 12% en 2025', deck:'Una mirada a los factores que están moviendo el Pacífico Central — desde la fibra óptica hasta los nómadas digitales con visa rentista.', date:'12 Mar 2026', read:6, hue:50, author:'Daniel Sánchez', featured:true },
  { id:'a2', cat:'Guías', title:'Comprar en Costa Rica como extranjero', deck:'Lo que ningún realtor te cuenta sobre escrituras, sociedades anónimas y los tres impuestos que se pagan al cierre.', date:'8 Mar 2026', read:11, hue:130, author:'Valeria Hidalgo' },
  { id:'a3', cat:'Diseño', title:'La nueva arquitectura del trópico', deck:'Cinco arquitectos costarricenses están redefiniendo cómo se construye en el bosque, con materiales locales y huella mínima.', date:'5 Mar 2026', read:8, hue:160, author:'Lucía Vargas' },
  { id:'a4', cat:'Inversión', title:'Alquiler vacacional vs. largo plazo', deck:'Calculamos los retornos reales de tres propiedades equivalentes: una en Tamarindo, una en Escalante, una en Atenas.', date:'1 Mar 2026', read:9, hue:80, author:'Felipe Araya' },
  { id:'a5', cat:'Zonas', title:'Atenas: el Valle Central que casi nadie mira', deck:'Clima primaveral, lotes generosos y a 40 minutos del aeropuerto. Por qué los compradores en sus 50 están eligiendo Occidente.', date:'26 Feb 2026', read:7, hue:100, author:'Roberto Mata' },
  { id:'a6', cat:'Mercado', title:'El precio del metro cuadrado en 38 cantones', deck:'Nuestro índice trimestral, ahora con datos de cierre verificados. Descargá el dashboard completo.', date:'22 Feb 2026', read:4, hue:240, author:'Equipo NIDO' },
  { id:'a7', cat:'Diseño', title:'Cinco fachadas costarricenses para inspirarse', deck:'De una casa de madera en Monteverde a un loft de cemento en Escalante. Una galería de soluciones contemporáneas.', date:'19 Feb 2026', read:5, hue:200, author:'Lucía Vargas' },
  { id:'a8', cat:'Guías', title:'El glosario inmobiliario que necesitás', deck:'Plusvalía, finiquito, escritura pública, fideicomiso. Los 24 términos que vas a escuchar en el proceso.', date:'15 Feb 2026', read:8, hue:60, author:'Equipo NIDO' },
]

const CATS = ['Todas','Mercado','Guías','Diseño','Inversión','Zonas']

export default function Ideas() {
  const [cat, setCat] = useState('Todas')
  const featured = ARTICLES.find(a => a.featured)!
  const rest = ARTICLES.filter(a => !a.featured && (cat==='Todas'||a.cat===cat))

  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",background:'var(--bg)',minHeight:'100vh',color:'var(--ink)'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
        .cat-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;border:1px solid var(--rule);color:var(--ink-3)}
        .chip{padding:7px 14px;border-radius:999px;border:1px solid var(--rule);background:transparent;font-size:13px;color:var(--ink-2);cursor:pointer;transition:all 0.15s}
        .chip:hover{border-color:var(--ink);color:var(--ink)}
        .chip.active{background:var(--ink);color:var(--bg);border-color:var(--ink)}
        .idea-card{cursor:pointer;display:flex;flex-direction:column;border-top:1px solid var(--rule);padding-top:24px;transition:all 0.15s}
        .idea-card:hover h3{color:var(--accent)}
        @media(max-width:768px){.ideas-grid-inner{grid-template-columns:1fr!important}.featured-grid{grid-template-columns:1fr!important}.sub-hero-grid{grid-template-columns:1fr!important;gap:16px!important;padding:32px 16px 20px!important}.section-pad{padding:32px 16px!important}}
      `}</style>

      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',maxWidth:1600,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:26,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <nav style={{display:'flex',gap:28,fontSize:13,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--ink-2)'}}>
            <a href="/propiedades">Comprar</a>
            <a href="/alquiler">Alquilar</a>
            <a href="/asesores">Asesores</a>
            <a href="/ideas" style={{color:'var(--ink)',borderBottom:'1px solid var(--ink)',paddingBottom:2}}>Ideas</a>
          </nav>
          <div style={{display:'flex',gap:10}}>
            <a href="/login" style={{border:'1px solid var(--rule)',padding:'8px 16px',borderRadius:999,fontSize:13}}>Ingresar</a>
            <a href="/registro" style={{border:'1px solid var(--ink)',background:'var(--ink)',color:'var(--bg)',padding:'8px 16px',borderRadius:999,fontSize:13}}>Crear cuenta</a>
          </div>
        </div>
      </nav>

      <section className="sub-hero-grid" style={{maxWidth:1600,margin:'0 auto',padding:'64px 40px 32px',display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:60,alignItems:'end',borderBottom:'1px solid var(--rule)'}}>
        <div>
          <div style={{fontSize:12,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>Ideas · Editorial NIDO</div>
          <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(48px,5.5vw,84px)',fontWeight:400,lineHeight:0.98,letterSpacing:'-0.012em'}}>
            Lectura para<br/>los que <em style={{fontStyle:'italic',color:'var(--accent)'}}>buscan bien.</em>
          </h1>
        </div>
        <p style={{fontSize:16,color:'var(--ink-2)',lineHeight:1.6,paddingBottom:14}}>Análisis de mercado, guías legales y conversaciones con arquitectos costarricenses. Una redacción independiente dentro de NIDO.</p>
      </section>

      <div className="section-pad" style={{maxWidth:1600,margin:'0 auto',padding:'56px 40px'}}>
        <div className="featured-grid" style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:0,border:'1px solid var(--rule)',borderRadius:10,overflow:'hidden',marginBottom:56,background:'var(--bg-card)'}}>
          <div style={{aspectRatio:'4/3',background:`repeating-linear-gradient(135deg,oklch(0.84 0.014 ${featured.hue}) 0,oklch(0.84 0.014 ${featured.hue}) 16px,oklch(0.89 0.012 ${featured.hue}) 16px,oklch(0.89 0.012 ${featured.hue}) 32px)`,display:'grid',placeItems:'center'}}>
            <span style={{fontFamily:'var(--mono)',fontSize:11,color:`oklch(0.40 0.03 ${featured.hue})`,letterSpacing:'0.08em',padding:'0 2rem',textAlign:'center'}}>{featured.title.toUpperCase()}</span>
          </div>
          <div style={{padding:'40px 36px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:20}}>
                <span className="cat-badge">{featured.cat}</span>
                <span style={{fontSize:12,color:'var(--ink-3)'}}>{featured.date}</span>
                <span style={{fontSize:12,color:'var(--ink-3)'}}>· {featured.read} min</span>
              </div>
              <h2 style={{fontFamily:'var(--serif)',fontSize:36,fontWeight:400,lineHeight:1.1,marginBottom:16}}>{featured.title}</h2>
              <p style={{fontSize:15,color:'var(--ink-2)',lineHeight:1.65,marginBottom:24}}>{featured.deck}</p>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:`oklch(0.85 0.04 ${featured.hue})`,display:'grid',placeItems:'center',fontFamily:'var(--serif)',fontSize:16}}>{featured.author[0]}</div>
                <div style={{fontSize:13,color:'var(--ink-2)'}}>{featured.author}</div>
              </div>
            </div>
            <a href="#" style={{display:'inline-block',marginTop:28,fontSize:13,color:'var(--accent)',letterSpacing:'0.04em'}}>Leer la edición →</a>
          </div>
        </div>

        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:32,paddingBottom:20,borderBottom:'1px solid var(--rule)'}}>
          {CATS.map(c => <button key={c} className={'chip'+(cat===c?' active':'')} onClick={() => setCat(c)}>{c}</button>)}
          <span style={{marginLeft:'auto',fontSize:13,color:'var(--ink-3)'}}>{rest.length} artículos</span>
        </div>

        <div className="ideas-grid-inner" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'32px 28px'}}>
          {rest.map(a => (
            <article key={a.id} className="idea-card">
              <div style={{aspectRatio:'4/3',borderRadius:6,overflow:'hidden',background:`repeating-linear-gradient(135deg,oklch(0.86 0.012 ${a.hue}) 0,oklch(0.86 0.012 ${a.hue}) 14px,oklch(0.91 0.008 ${a.hue}) 14px,oklch(0.91 0.008 ${a.hue}) 28px)`,display:'grid',placeItems:'center',marginBottom:16}}>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:`oklch(0.42 0.02 ${a.hue})`,letterSpacing:'0.08em',padding:'0 1rem',textAlign:'center'}}>{a.title.toUpperCase()}</span>
              </div>
              <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:10}}>
                <span className="cat-badge">{a.cat}</span>
                <span style={{fontSize:12,color:'var(--ink-3)'}}>{a.date}</span>
                <span style={{fontSize:12,color:'var(--ink-3)'}}>{a.read} min</span>
              </div>
              <h3 style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:400,lineHeight:1.15,marginBottom:8,transition:'color 0.15s'}}>{a.title}</h3>
              <p style={{fontSize:13,color:'var(--ink-2)',lineHeight:1.6}}>{a.deck}</p>
            </article>
          ))}
        </div>
      </div>

      <div style={{background:'var(--ink)',margin:'0 40px 40px',borderRadius:16,padding:'48px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
        <div>
          <h2 style={{fontFamily:'var(--serif)',fontSize:40,fontWeight:400,color:'white',marginBottom:12}}>El boletín <em style={{color:'var(--accent)'}}>de los lunes.</em></h2>
          <p style={{color:'rgba(255,255,255,0.55)',fontSize:15,lineHeight:1.65,marginBottom:16}}>Cada lunes: índice de precios actualizado, dos lecturas seleccionadas y una propiedad fuera del radar.</p>
          <ul style={{color:'rgba(255,255,255,0.4)',fontSize:13,lineHeight:2,listStyle:'none'}}>
            <li>· 14,200 lectores en Costa Rica y la región</li>
            <li>· Editado por el equipo de redacción de NIDO</li>
            <li>· Llegás los lunes a las 7:00 AM</li>
          </ul>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <input placeholder="tu@correo.com" style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
          <button style={{background:'var(--accent)',color:'var(--ink)',border:'none',padding:'12px 24px',borderRadius:999,fontSize:14,fontWeight:500,cursor:'pointer'}}>Suscribirme →</button>
        </div>
      </div>
    </main>
  )
}