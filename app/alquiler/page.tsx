'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Propiedad {
  id: string
  titulo: string
  tipo: string
  provincia: string
  canton?: string
  precio: number
  habitaciones?: number
  banos?: number
  area_m2?: number
  fotos?: string[]
  activa: boolean
}

export default function Alquiler() {
  const [tab, setTab] = useState('Todos')
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('propiedades')
      .select('id,titulo,tipo,provincia,canton,precio,habitaciones,banos,area_m2,fotos,activa')
      .eq('operacion', 'alquiler')
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPropiedades((data || []) as unknown as Propiedad[])
        setCargando(false)
      })
  }, [])

  const tiposDisponibles = ['Todos', ...Array.from(new Set(propiedades.map(p => p.tipo))).filter(Boolean)]
  const filtered = propiedades.filter(p => tab === 'Todos' || p.tipo === tab)
  const featured = propiedades[0] || null
  const fmt = (n: number) => '$' + n.toLocaleString('en-US')
  const hueForTipo = (tipo: string) => ({ 'casa':50, 'apartamento':200, 'lote':130, 'local':280 }[tipo] ?? 80)

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
          <div style={{fontSize:12,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>Alquileres · {cargando ? '...' : propiedades.length} propiedades activas</div>
          <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(48px,5.5vw,84px)',fontWeight:400,lineHeight:0.98,letterSpacing:'-0.012em',margin:0}}>
            Vivir <em style={{fontStyle:'italic',color:'var(--accent)'}}>liviano.</em><br/>Alquilar <em style={{fontStyle:'italic',color:'var(--accent)'}}>bien.</em>
          </h1>
        </div>
        <p style={{fontSize:16,color:'var(--ink-2)',lineHeight:1.6,paddingBottom:14}}>Desde un loft mensual en Escalante hasta una villa estacional en Santa Teresa. Todos los alquileres de NIDO incluyen contratos verificados y un asesor humano de respaldo.</p>
      </section>

      <div className="section-pad" style={{maxWidth:1600,margin:'0 auto',padding:'56px 40px'}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',paddingBottom:30,borderBottom:'1px solid var(--rule)',marginBottom:36}}>
          <div style={{display:'inline-flex',border:'1px solid var(--rule)',borderRadius:999,padding:4,background:'var(--bg-card)'}}>
            {tiposDisponibles.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{padding:'10px 22px',border:0,background:tab===t?'var(--ink)':'transparent',color:tab===t?'var(--bg)':'var(--ink-2)',borderRadius:999,fontSize:13,cursor:'pointer',transition:'all 0.15s',textTransform:'capitalize'}}>{t}</button>
            ))}
          </div>
          <span style={{marginLeft:'auto',fontSize:13,color:'var(--ink-3)'}}>{filtered.length} resultados</span>
        </div>

        {cargando ? (
          <div style={{border:'1px solid var(--rule)',borderRadius:10,overflow:'hidden',marginBottom:56,background:'var(--bg-card)',padding:40,textAlign:'center',color:'var(--ink-3)',fontSize:14}}>
            Cargando propiedades…
          </div>
        ) : featured ? (
          <div className="featured-grid" style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',border:'1px solid var(--rule)',borderRadius:10,overflow:'hidden',marginBottom:56,background:'var(--bg-card)'}}>
            <div style={{aspectRatio:'4/3',background: featured.fotos?.[0] ? `url(${featured.fotos[0]}) center/cover` : `repeating-linear-gradient(135deg,oklch(0.84 0.014 ${hueForTipo(featured.tipo)}) 0,oklch(0.84 0.014 ${hueForTipo(featured.tipo)}) 16px,oklch(0.89 0.012 ${hueForTipo(featured.tipo)}) 16px,oklch(0.89 0.012 ${hueForTipo(featured.tipo)}) 32px)`,display:'grid',placeItems:'center'}}>
              {!featured.fotos?.[0] && <span style={{fontFamily:'var(--mono)',fontSize:12,color:`oklch(0.40 0.03 ${hueForTipo(featured.tipo)})`,letterSpacing:'0.08em'}}>{featured.titulo?.toUpperCase()} · {featured.tipo?.toUpperCase()}</span>}
            </div>
            <div style={{padding:'36px 32px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:12}}>Destacado</div>
                <h2 style={{fontFamily:'var(--serif)',fontSize:40,fontWeight:400,lineHeight:1.05,marginBottom:8}}>{featured.titulo}</h2>
                <div style={{fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>{[featured.canton, featured.provincia].filter(Boolean).join(', ')}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',borderTop:'1px solid var(--rule)',paddingTop:16,gap:12}}>
                  {[{v:featured.habitaciones??'—',l:'Habs'},{v:featured.banos??'—',l:'Baños'},{v:featured.area_m2??'—',l:'m²'}].map((s,i) => (
                    <div key={i}><div style={{fontFamily:'var(--serif)',fontSize:22}}>{s.v}</div><div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginTop:2}}>{s.l}</div></div>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:'1px solid var(--rule)'}}>
                <div style={{fontFamily:'var(--mono)',fontSize:24}}>{fmt(featured.precio)}<span style={{fontSize:12,color:'var(--ink-3)',marginLeft:4,fontFamily:'var(--sans)'}}>/mes</span></div>
                <a href={`/propiedades/${featured.id}`} style={{background:'var(--ink)',color:'var(--bg)',padding:'10px 20px',borderRadius:999,fontSize:13}}>Ver propiedad →</a>
              </div>
            </div>
          </div>
        ) : null}

        <h2 style={{fontFamily:'var(--serif)',fontSize:28,fontWeight:400,margin:'0 0 24px',borderBottom:'1px solid var(--rule)',paddingBottom:14}}>
          {tab === 'Todos' ? 'Todos los alquileres' : tab.charAt(0).toUpperCase() + tab.slice(1) + 's en alquiler'}
        </h2>

        {cargando ? (
          <div className="rental-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'32px 28px'}}>
            {Array.from({length:6}).map((_,i) => (
              <div key={i} style={{borderRadius:6,overflow:'hidden',opacity:0.5}}>
                <div style={{aspectRatio:'4/3',background:'var(--rule-soft)',borderRadius:6}}/>
                <div style={{padding:'16px 2px 0'}}>
                  <div style={{height:11,background:'var(--rule-soft)',borderRadius:4,marginBottom:8,width:'60%'}}/>
                  <div style={{height:20,background:'var(--rule-soft)',borderRadius:4,marginBottom:8}}/>
                  <div style={{height:12,background:'var(--rule-soft)',borderRadius:4,width:'70%'}}/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{color:'var(--ink-3)',fontSize:15,padding:'40px 0',textAlign:'center'}}>No hay propiedades disponibles en esta categoría.</p>
        ) : (
          <div className="rental-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'32px 28px'}}>
            {filtered.map(p => {
              const hue = hueForTipo(p.tipo)
              const loc = [p.canton, p.provincia].filter(Boolean).join(', ')
              return (
                <article key={p.id} onClick={() => window.location.href = `/propiedades/${p.id}`} style={{cursor:'pointer',display:'flex',flexDirection:'column'}}>
                  <div style={{position:'relative',aspectRatio:'4/3',borderRadius:6,overflow:'hidden',background:p.fotos?.[0]?`url(${p.fotos[0]}) center/cover`:`repeating-linear-gradient(135deg,oklch(0.86 0.012 ${hue}) 0,oklch(0.86 0.012 ${hue}) 14px,oklch(0.91 0.008 ${hue}) 14px,oklch(0.91 0.008 ${hue}) 28px)`,display:'grid',placeItems:'center'}}>
                    {!p.fotos?.[0] && <span style={{fontFamily:'var(--mono)',fontSize:11,color:`oklch(0.42 0.02 ${hue})`,letterSpacing:'0.08em'}}>{p.titulo?.toUpperCase()}</span>}
                    <div style={{position:'absolute',top:12,left:12}}>
                      <span className="badge dark" style={{textTransform:'capitalize'}}>{p.tipo}</span>
                    </div>
                  </div>
                  <div style={{padding:'16px 2px 0'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12}}>
                      <span style={{fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)'}}>{loc}</span>
                      <span style={{fontFamily:'var(--mono)',fontSize:13}}>{fmt(p.precio)}<small style={{color:'var(--ink-3)',fontFamily:'var(--sans)',marginLeft:2}}>/mes</small></span>
                    </div>
                    <h3 style={{fontFamily:'var(--serif)',fontSize:22,lineHeight:1.15,fontWeight:400,margin:'6px 0 8px'}}>{p.titulo}</h3>
                    <div style={{display:'flex',gap:14,fontSize:12,color:'var(--ink-2)'}}>
                      {p.habitaciones != null && <span>🛏 {p.habitaciones} hab</span>}
                      {p.banos != null && <span>🛁 {p.banos} baños</span>}
                      {p.area_m2 != null && <span>◰ {p.area_m2} m²</span>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
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