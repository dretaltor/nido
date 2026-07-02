'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// AGENTS data loaded from Supabase

const REGIONS = ['Todas','Valle Central','Valle Occidente','Pacífico','Guanacaste','Montaña']
const SPECS = ['Todas','Condominios','Lujo','Beachfront','Inversión','Lofts','Alquiler','Fincas','Eco','Hipoteca','Comercial']

export default function Asesores() {
  const [asesores, setAsesores] = useState<any[]>([])
  const [loadingAsesores, setLoadingAsesores] = useState(true)
  const [region, setRegion] = useState('Todas')
  const [spec, setSpec] = useState('Todas')
  useEffect(() => {
    supabase.from('asesores_publicos')
      .select('id,nombre,correo,foto_url,valeria_perfil,equipo_nido_estado')
      .order('nombre')
      .then(async ({ data }) => {
        if (data) {
          const [conteos, ratings, cerradas] = await Promise.all([
            Promise.all(data.map((a:any) =>
              supabase.from('propiedades').select('id', { count: 'exact', head: true }).eq('asesor_email', a.correo).eq('disponible', true)
            )),
            Promise.all(data.map((a:any) =>
              supabase.from('asesor_calificaciones').select('promedio,total').eq('asesor_email', a.correo).maybeSingle()
            )),
            Promise.all(data.map((a:any) =>
              supabase.from('comisiones').select('id', { count: 'exact', head: true }).eq('asesor_email', a.correo).eq('estado', 'cobrada')
            )),
          ])
          setAsesores(data.map((a:any, i:number) => {
            const vp = a.valeria_perfil || {}
            const zonas = (vp.zonas || 'Valle Central').split(',').map((z:string) => z.trim())
            const esEquipoNido = a.equipo_nido_estado === 'aprobado'
            return {
              ...a,
              name: a.nombre,
              role: esEquipoNido ? 'Asesor NIDO' : 'Asesor afiliado a NIDO',
              initial: (a.nombre || 'A')[0].toUpperCase(),
              hue: 80,
              region: zonas[0] || 'Valle Central',
              bio: vp.diferenciador || (esEquipoNido ? 'Asesor del equipo interno de NIDO con experiencia en el mercado costarricense.' : 'Asesor afiliado a NIDO con experiencia en el mercado costarricense.'),
              listings: conteos[i]?.count || 0,
              sold: cerradas[i]?.count || 0,
              rating: ratings[i]?.data?.promedio || null,
              ratingTotal: ratings[i]?.data?.total || 0,
              langs: ['ES'],
              specs: vp.tipo_propiedades ? vp.tipo_propiedades.split(',').map((s:string)=>s.trim()) : ['Residencial'],
            }
          }))
        }
        setLoadingAsesores(false)
      })
  }, [])

  const AGENTS = asesores
  const filtered = AGENTS.filter(a => (region==='Todas'||a.region===region) && (spec==='Todas'||a.specs.includes(spec)))

  if (loadingAsesores) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#999' }}>
      <p>Cargando asesores...</p>
    </main>
  )

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
            <a href="/propiedades">Propiedades</a>
            <a href="/nosotros" style={{color:'var(--ink-3)',textDecoration:'none',fontSize:13}}>Nosotros</a>
            <a href="/asesores" style={{color:'var(--ink)',borderBottom:'1px solid var(--ink)',paddingBottom:2}}>Asesores</a>
            <a href="/noticias">Noticias</a>
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
              <div style={{width:56,height:56,borderRadius:'50%',background:`oklch(0.85 0.04 ${a.hue})`,display:'grid',placeItems:'center',fontFamily:'var(--serif)',fontSize:22,color:`oklch(0.35 0.06 ${a.hue})`,flexShrink:0,overflow:'hidden'}}>
                {a.foto_url ? <img src={a.foto_url} alt={a.nombre} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : a.initial}
              </div>
              <div>
                <div style={{fontFamily:'var(--serif)',fontSize:22,marginBottom:2}}>{a.name}</div>
                <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:10,letterSpacing:'0.04em'}}>{a.role}</div>
                <p style={{fontSize:14,color:'var(--ink-2)',lineHeight:1.55,marginBottom:10}}>{a.bio}</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                  {a.specs.map((s:string) => <span key={s} style={{padding:'3px 10px',borderRadius:999,border:'1px solid var(--rule)',fontSize:11,color:'var(--ink-3)'}}>{s}</span>)}
                  {a.langs.map((l:string) => <span key={l} style={{padding:'3px 10px',borderRadius:999,background:'var(--bg-elev)',fontSize:11,fontFamily:'var(--mono)',color:'var(--ink-3)'}}>{l}</span>)}
                </div>
                <div style={{display:'flex',gap:24,fontSize:13}}>
                  <div><b style={{fontFamily:'var(--serif)',fontSize:18}}>{a.listings}</b> <span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Activas</span></div>
                  <div><b style={{fontFamily:'var(--serif)',fontSize:18}}>{a.sold}</b> <span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Cerradas</span></div>
                  {a.rating ? (
                    <div><b style={{fontFamily:'var(--serif)',fontSize:18}}>★ {a.rating}</b> <span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>{a.ratingTotal} reseña{a.ratingTotal===1?'':'s'}</span></div>
                  ) : (
                    <div><span style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Sin reseñas aún</span></div>
                  )}
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