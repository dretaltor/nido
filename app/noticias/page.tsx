'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const NOTICIAS_STATIC = [
  {
    id: 1,
    categoria: 'Mercado',
    fecha: 'Mayo 2026',
    titulo: 'El mercado inmobiliario costarricense registra crecimiento del 8.4% en zonas premium',
    resumen: 'Escazú, Santa Ana y Curridabat lideran la valorización en el Gran Área Metropolitana. Los expertos anticipan tendencia positiva para el segundo semestre.',
    tiempo: '3 min',
    tag: 'GAM',
  },
  {
    id: 2,
    categoria: 'Inversión',
    fecha: 'Mayo 2026',
    titulo: 'Zona costera: demanda de compradores extranjeros crece un 18% en 2026',
    resumen: 'Tamarindo, Santa Teresa y Nosara concentran el mayor interés de nómadas digitales y rentistas. El precio por metro cuadrado supera los $3,200 en zonas premium.',
    tiempo: '4 min',
    tag: 'Costas',
  },
  {
    id: 3,
    categoria: 'Legal',
    fecha: 'Abril 2026',
    titulo: 'Todo lo que necesitás saber sobre la Visa Rentista en Costa Rica',
    resumen: 'Requisitos, plazos y beneficios del programa de residencia más accesible de Centroamérica. Ideal para extranjeros con ingresos pasivos superiores a $2,500/mes.',
    tiempo: '5 min',
    tag: 'Visa',
  },
  {
    id: 4,
    categoria: 'Financiamiento',
    fecha: 'Abril 2026',
    titulo: 'Tasas de crédito hipotecario en Costa Rica: comparativa de bancos 2026',
    resumen: 'BCR, BAC, Davivienda y Scotiabank ofrecen diferentes condiciones. Analizamos las mejores opciones para compradores locales y extranjeros.',
    tiempo: '6 min',
    tag: 'Crédito',
  },
  {
    id: 5,
    categoria: 'Tendencias',
    fecha: 'Marzo 2026',
    titulo: 'Nómadas digitales impulsan nueva demanda en zonas rurales premium de Costa Rica',
    resumen: 'El trabajo remoto está transformando mercados como La Fortuna, Uvita y Monteverde. Precios suben pero aún representan oportunidades de inversión.',
    tiempo: '4 min',
    tag: 'Tendencias',
  },
  {
    id: 6,
    categoria: 'Legal',
    fecha: 'Marzo 2026',
    titulo: 'Proceso de compra para extranjeros: guía completa 2026',
    resumen: 'Desde la oferta hasta el cierre notarial. Impuestos, gastos de cierre, due diligence y todo lo que necesitás saber para comprar con seguridad en Costa Rica.',
    tiempo: '7 min',
    tag: 'Guía',
  },
  {
    id: 7,
    categoria: 'Mercado',
    fecha: 'Febrero 2026',
    titulo: 'Curridabat: el distrito más dinámico del GAM para invertir en 2026',
    resumen: 'Proyectos residenciales de alta densidad, nueva infraestructura vial y cercanía a centros comerciales hacen de Curridabat la apuesta del año.',
    tiempo: '3 min',
    tag: 'GAM',
  },
  {
    id: 8,
    categoria: 'Inversión',
    fecha: 'Febrero 2026',
    titulo: 'Retorno de inversión en propiedades de alquiler en Costa Rica',
    resumen: 'Análisis de cap rates por zona: cuáles son las mejores zonas para generar ingresos pasivos con propiedades residenciales y vacacionales.',
    tiempo: '5 min',
    tag: 'Inversión',
  },
  {
    id: 9,
    categoria: 'Tendencias',
    fecha: 'Enero 2026',
    titulo: 'Sostenibilidad y construcción verde: el futuro del mercado inmobiliario CR',
    resumen: 'Certificaciones LEED y EDGE ganan terreno en desarrollos residenciales premium. Los compradores millennials priorizan eficiencia energética y diseño sostenible.',
    tiempo: '4 min',
    tag: 'Sostenibilidad',
  },
]

const CATS = ['Todas', 'Mercado', 'Inversión', 'Legal', 'Financiamiento', 'Tendencias']

const CAT_COLORS: Record<string, string> = {
  Mercado: 'oklch(0.93 0.03 240)',
  Inversión: 'var(--accent-tint)',
  Legal: 'oklch(0.93 0.03 280)',
  Financiamiento: 'oklch(0.93 0.05 80)',
  Tendencias: 'oklch(0.93 0.04 150)',
}
const CAT_TEXT: Record<string, string> = {
  Mercado: 'oklch(0.35 0.08 240)',
  Inversión: 'var(--accent)',
  Legal: 'oklch(0.35 0.08 280)',
  Financiamiento: 'oklch(0.45 0.08 80)',
  Tendencias: 'oklch(0.35 0.06 150)',
}

export default function Noticias() {
  const router = useRouter()
  const [cat, setCat] = useState('Todas')
  const [noticias, setNoticias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('noticias')
      .select('*')
      .eq('activa', true)
      .order('fecha_publicacion', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setNoticias(data)
        } else {
          // Fallback to static noticias if DB empty
          setNoticias(NOTICIAS_STATIC)
        }
        setLoading(false)
      })
  }, [])

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
    a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .chip{padding:7px 16px;border-radius:999px;border:1px solid var(--rule);font-size:12px;color:var(--ink-2);cursor:pointer;transition:all 0.15s;background:transparent}
    .chip:hover{border-color:var(--ink);color:var(--ink)}
    .chip.active{background:var(--ink);color:white;border-color:var(--ink)}
    .news-card{background:white;border:1px solid var(--rule);border-radius:14px;padding:24px;display:flex;flex-direction:column;gap:12px;cursor:pointer;transition:all 0.2s}
    .news-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(27,94,59,0.1);border-color:var(--accent)}
    @media(max-width:768px){.news-grid{grid-template-columns:1fr!important}.nav-pad{padding:14px 16px!important}}
  `

  const filtradas = cat === 'Todas' ? noticias : noticias.filter((n:any) => n.categoria === cat)

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1200, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-3)' }}>
            <a href="/propiedades">Portal</a>
            <a href="/asesores">Asesores</a>
            <a href="/noticias" style={{ color:'var(--accent)', fontWeight:500 }}>Noticias</a>
          </div>
          <a href="/propiedades" style={{ background:'var(--ink)', color:'white', padding:'8px 18px', borderRadius:999, fontSize:13 }}>Ver propiedades →</a>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:40, animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Mercado inmobiliario</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, marginBottom:12 }}>
            Noticias e <em style={{ fontStyle:'italic', color:'var(--accent)' }}>insights.</em>
          </h1>
          <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.7, maxWidth:'56ch' }}>
            Análisis, tendencias y noticias del mercado inmobiliario costarricense. Todo lo que necesitás saber para tomar mejores decisiones.
          </p>
        </div>

        {/* Destacada */}
        <div onClick={() => {}} style={{ background:'var(--ink)', borderRadius:16, padding:'36px 40px', marginBottom:40, cursor:'pointer', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, right:0, width:300, height:'100%', background:'linear-gradient(to left, oklch(0.42 0.06 150/0.15), transparent)' }}/>
          <div style={{ position:'relative', zIndex:1, maxWidth:600 }}>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <span style={{ background:'var(--accent)', color:'white', fontSize:10, padding:'3px 10px', borderRadius:999, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Destacado</span>
              <span style={{ background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontSize:10, padding:'3px 10px', borderRadius:999, letterSpacing:'0.06em' }}>Mayo 2026</span>
            </div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,32px)', fontWeight:400, color:'white', lineHeight:1.15, marginBottom:12 }}>
              El mercado inmobiliario costarricense registra crecimiento del 8.4% en zonas premium
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:20 }}>
              Escazú, Santa Ana y Curridabat lideran la valorización en el Gran Área Metropolitana. Los expertos anticipan tendencia positiva para el segundo semestre del año.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:13 }}>
              <span style={{ color:'var(--accent)' }}>Leer análisis completo →</span>
              <span style={{ color:'rgba(255,255,255,0.3)' }}>3 min de lectura</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
          {CATS.map(c => (
            <button key={c} className={'chip'+(cat===c?' active':'')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {/* Grid noticias */}
        <div className="news-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {filtradas.map((n, i) => (
            <div key={n.id} className="news-card" style={{ animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <span style={{ padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:CAT_COLORS[n.categoria]||'var(--bg)', color:CAT_TEXT[n.categoria]||'var(--ink-3)' }}>
                  {n.categoria}
                </span>
                <span style={{ fontSize:11, color:'var(--ink-3)' }}>{n.fecha}</span>
              </div>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, lineHeight:1.2, color:'var(--ink)' }}>{n.titulo}</h3>
              <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.65, flex:1 }}>{n.resumen}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid var(--rule)' }}>
                <span style={{ fontSize:11, color:'var(--ink-3)' }}>{n.fuente_nombre ? `Fuente: ${n.fuente_nombre}` : '⏱ ' + n.tiempo + ' de lectura'}</span>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                  <span style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>Leer más →</span>
                  {n.redactado_por && <span style={{ fontSize:10, color:'var(--ink-3)', fontStyle:'italic' }}>{n.redactado_por}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ marginTop:56, background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'36px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:32, flexWrap:'wrap' }}>
          <div>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:8 }}>Recibí el mercado en tu correo.</h3>
            <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65 }}>Análisis semanal del mercado inmobiliario costarricense. Sin spam.</p>
          </div>
          <div style={{ display:'flex', gap:10, flexShrink:0 }}>
            <input placeholder="tu@correo.com" style={{ padding:'10px 16px', border:'1px solid var(--rule)', borderRadius:999, fontSize:14, outline:'none', fontFamily:'var(--sans)', width:220 }}/>
            <button style={{ padding:'10px 20px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer' }}>Suscribirme</button>
          </div>
        </div>

      </div>

      <footer style={{ borderTop:'1px solid var(--rule)', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white' }}>
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
        <p style={{ fontSize:12, color:'var(--ink-3)' }}>© 2026 NIDO · Costa Rica</p>
        <a href="/propiedades" style={{ fontSize:13, color:'var(--ink-3)' }}>Ver propiedades →</a>
      </footer>
    </main>
  )
}
