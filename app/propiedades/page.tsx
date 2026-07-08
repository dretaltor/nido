'use client'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../../lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'
import { GuardarBusquedaModal } from '../../components/alertas/GuardarBusquedaModal'

const MapaInteractivo = dynamic(() => import('../../components/MapaInteractivo'), { ssr: false })

const HUES = [80, 50, 200, 130, 160, 240, 100, 170]

function fmt(n: number): string { return n.toLocaleString('en-US') }

function Icon({ name }: { name: string }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (name === 'bed') return <svg {...p}><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7"/><path d="M3 14h18M3 18h18"/></svg>
  if (name === 'bath') return <svg {...p}><path d="M4 12V6a2 2 0 0 1 4 0"/><path d="M3 12h18l-1 5a3 3 0 0 1-3 2H7a3 3 0 0 1-3-2l-1-5z"/></svg>
  if (name === 'ruler') return <svg {...p}><path d="M3 17 17 3l4 4L7 21z"/><path d="M7 11l2 2M10 8l2 2"/></svg>
  if (name === 'heart') return <svg {...p}><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/></svg>
  if (name === 'heart-fill') return <svg {...p} fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/></svg>
  if (name === 'x') return <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
  if (name === 'search') return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  if (name === 'send') return <svg {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>
  return null
}

interface Propiedad {
  id: string
  ref_id?: string
  titulo: string
  descripcion?: string
  precio: number
  tipo: string
  operacion?: string
  habitaciones: number
  banos: number
  metros?: number
  lote_m2?: number
  zona: string
  provincia?: string
  canton?: string
  distrito?: string
  direccion?: string
  disponible: boolean
  asesor_nombre: string
  asesor_email: string
  asesor_whatsapp?: string
  fotos?: string[]
  topografia?: string
  uso_suelo?: string
}

function PropertyCard({ p, index, fav, onFav, onOpen }: { p: Propiedad, index: number, fav: boolean, onFav: () => void, onOpen: () => void }) {
  const hue = HUES[index % HUES.length]
  const priceLabel = `$${fmt(p.precio)}`
  return (
    <article onClick={onOpen} style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: `oklch(0.88 0.03 ${hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {p.fotos && p.fotos.length > 0 ? (
          <img src={p.fotos[0]} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: `oklch(0.55 0.05 ${hue})`, textTransform: 'uppercase', textAlign: 'center', padding: '0 1rem' }}>
          {p.titulo.toUpperCase()} · FOTO
        </div>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 999, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {'Venta'}
          </span>
        </div>
        <button onClick={e => { e.stopPropagation(); onFav() }} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: fav ? '#e11d48' : 'var(--ink-3)' }}>
          <Icon name={fav ? 'heart-fill' : 'heart'} />
        </button>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{p.zona}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--ink)' }}>{priceLabel}</span>
        </div>
        {p.ref_id && <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.1em', marginBottom:4 }}>{p.ref_id}</div>}
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, margin: '0 0 10px', lineHeight: 1.1 }}>{p.titulo}</h3>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
          {p.tipo === 'lote' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="ruler" /> {p.metros || p.lote_m2} m² terreno</span>
          ) : (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="bed" /> {p.habitaciones} hab</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="bath" /> {p.banos} baños</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="ruler" /> {p.metros || p.lote_m2} m²</span>
            </>
          )}
        </div>
        <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <b style={{ color: 'var(--accent)', marginRight: 6 }}>↳ Valeria IA</b>
          Propiedad verificada · Disponible para visita virtual
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <a href={'https://wa.me/?text='+encodeURIComponent('🏠 '+p.titulo+' - '+p.zona+' $'+fmt(p.precio)+' https://www.nido-cr.com/propiedades/'+p.id)} target='_blank' onClick={e => e.stopPropagation()} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:999, background:'#22c55e', color:'white', fontSize:12, fontWeight:500, textDecoration:'none' }}>💬 Compartir</a>
        </div>
        </div>

      </div>
    </article>
  )
}

function Drawer({ p, fav, onFav, onClose }: { p: Propiedad, fav: boolean, onFav: () => void, onClose: () => void }) {
  const hue = HUES[0]
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'oklch(0.10 0.005 80 / 0.5)', zIndex: 60, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(680px, 96vw)', background: 'var(--bg)', zIndex: 70, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'relative', height: 300, background: `oklch(0.85 0.04 ${hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {p.fotos && p.fotos.length > 0 ? (
            <img src={p.fotos[0]} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: `oklch(0.5 0.06 ${hue})`, textTransform: 'uppercase' }}>FOTO PRINCIPAL</span>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'oklch(0.10 0.005 80 / 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="x" />
          </button>
        </div>
        <div style={{ padding: '32px 32px 80px' }}>
          <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: 22, marginBottom: 22 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>{p.zona} · {p.direccion}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, lineHeight: 1.05, margin: 0 }}>{p.titulo}</h2>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18 }}>{'$'}{fmt(p.precio)}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 4 }}>{'precio venta'}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', marginBottom: 28 }}>
            {(p.tipo === 'lote' ? [
              { num: String(p.lote_m2 || p.metros || 0) + ' m²', label: 'Área terreno' },
              { num: ({plano:'Plano',ligera_pendiente:'Ligera pend.',pendiente_pronunciada:'Pendiente',irregular:'Irregular'} as Record<string,string>)[p.topografia||''] || '—', label: 'Topografía' },
              { num: ({residencial:'Residencial',comercial:'Comercial',agricola:'Agrícola',mixto:'Mixto',forestal:'Forestal'} as Record<string,string>)[p.uso_suelo||''] || '—', label: 'Uso de suelo' },
              { num: 'Venta', label: 'Operación' },
            ] : [
              { num: p.habitaciones, label: 'Habitaciones' },
              { num: p.banos, label: 'Baños' },
              { num: String(p.metros || 0) + ' m²', label: 'Área' },
              { num: 'Venta', label: 'Operación' },
            ]).map((s, i) => (
              <div key={i} style={{ padding: '16px 0', paddingLeft: i > 0 ? 16 : 0, borderRight: i < 3 ? '1px solid var(--rule-soft)' : 'none' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{s.num}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, marginBottom:24 }}>
            <a href={'https://wa.me/?text='+encodeURIComponent('🏠 NIDO: '+p.titulo+' - '+p.zona+' $'+fmt(p.precio)+' https://www.nido-cr.com/propiedades/'+p.id)} target="_blank" style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:999, background:'#22c55e', color:'white', fontSize:13, fontWeight:500, textDecoration:'none' }}>💬 Compartir en WhatsApp</a>
            <a href={'/propiedades/'+p.id} target="_blank" style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:999, border:'1px solid var(--rule)', fontSize:13, color:'var(--ink)', textDecoration:'none' }}>🔗 Ver ficha completa</a>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 12px', fontWeight: 500 }}>Descripción</h4>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)' }}>{p.descripcion || 'Propiedad en excelentes condiciones.'}</p>
          </div>
          <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 8, padding: '16px 18px', marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>Valeria · Asesora IA de NIDO</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>Esta propiedad cumple con los criterios más solicitados en {p.zona}.</p>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="/contacto" style={{ display: 'block', padding: '11px 16px', borderRadius: 6, fontSize: 13, border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)', textAlign: 'center', textDecoration: 'none' }}>Contactar asesor</a>
            <a href="/chat" style={{ display: 'block', padding: '11px 16px', borderRadius: 6, fontSize: 13, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', textAlign: 'center', textDecoration: 'none' }}>Preguntar a Valeria IA</a>
          </div>
        </div>
      </div>
    </>
  )
}

const ZONES = [
  { num: '01', name: 'Valle Central', meta: 'Escazú · Santa Ana · Curridabat', price: '$2,450 / m²', delta: '+6.2% YoY' },
  { num: '02', name: 'Pacífico Central', meta: 'Santa Teresa · Manuel Antonio · Jacó', price: '$3,180 / m²', delta: '+11.8% YoY' },
  { num: '03', name: 'Guanacaste', meta: 'Tamarindo · Nosara · Papagayo', price: '$3,920 / m²', delta: '+9.4% YoY' },
]

export default function Propiedades() {
  const { user, isAsesor, loading: authLoading } = useAuth()
  
  // TEMP: check session directly  
  const [sessionCheck, setSessionCheck] = useState('')
  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      setSessionCheck(session ? 'SESION: '+session.user.email : 'SIN SESION')
    })
  }, [])
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ location: '', op: 'venta', budget: 'any' })
  const [sort, setSort] = useState('featured')
  const [favs, setFavs] = useState(new Set<string>())
  const [openId, setOpenId] = useState<string | null>(null)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [guardarBusquedaOpen, setGuardarBusquedaOpen] = useState(false)

  const cargar = () => {
    setLoading(true)
    supabase.from('propiedades').select('id,titulo,tipo,operacion,precio,zona,provincia,canton,distrito,fotos,habitaciones,banos,metros,lote_m2,asesor_email,asesor_nombre,asesor_whatsapp,created_at').eq('disponible', true).eq('verificacion_estado', 'aprobada').then(({ data }) => {
      setPropiedades((data || []) as unknown as Propiedad[])
      setLoading(false)
    })
  }

  useEffect(() => {
    // Carga de datos al montar — patrón estándar de sincronización con fuente externa (Supabase).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [])

  const filtered = useMemo(() => {
    let out = propiedades
    if (query.op !== 'todo') out = out.filter(p => p.operacion === query.op)
    if (query.location) out = out.filter(p => p.zona.toLowerCase().includes(query.location.toLowerCase()) || p.titulo.toLowerCase().includes(query.location.toLowerCase()))
    if (tipoFiltro) out = out.filter(p => p.tipo.toLowerCase() === tipoFiltro.toLowerCase())
    if (query.budget && query.budget !== 'any') out = out.filter(p => p.precio <= parseInt(query.budget) * 1000)
    if (sort === 'price-asc') out = [...out].sort((a, b) => a.precio - b.precio)
    if (sort === 'price-desc') out = [...out].sort((a, b) => b.precio - a.precio)
    return out
  }, [propiedades, query, sort, tipoFiltro])

  const open = openId ? propiedades.find(p => p.id === openId) : null
  const toggleFav = (id: string) => setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <main style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', background: 'var(--bg)', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-2:oklch(0.55 0.07 150);--accent-tint:oklch(0.95 0.02 150);--shadow-sm:0 1px 2px oklch(0.20 0.02 80/0.06);--shadow-md:0 8px 30px oklch(0.20 0.02 80/0.10);--shadow-lg:0 30px 60px oklch(0.20 0.02 80/0.16);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
        .chip{padding:7px 14px;border-radius:999px;border:1px solid var(--rule);background:transparent;font-size:13px;color:var(--ink-2);transition:all 0.15s;cursor:pointer;white-space:nowrap}
        .chip:hover{border-color:var(--ink);color:var(--ink)}
        .chip.active{background:var(--ink);color:var(--bg);border-color:var(--ink)}
        .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding-top:20px}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 4px oklch(0.42 0.06 150/0.18)}50%{box-shadow:0 0 0 8px oklch(0.42 0.06 150/0)}}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:var(--rule);border-radius:999px} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important;gap:20px!important;padding:24px 16px 16px!important}
          .search-grid{grid-template-columns:1fr!important;border-radius:16px!important}
          .search-field{border-right:none!important;border-bottom:1px solid var(--rule-soft)!important}
          .chips-wrap{padding:0 16px!important;overflow-x:auto;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch}
          .split-grid{grid-template-columns:1fr!important;padding:0 16px 100px!important}
          .map-col{display:none!important}
          .cards{grid-template-columns:1fr!important}
          .header-inner{padding:12px 16px!important}
          .header-nav{display:none!important}
          .header-btns{display:none!important}
          .editorial-section{display:none!important}
          .footer-inner{flex-direction:column!important;gap:8px!important;text-align:center!important;padding:20px 16px!important}
          h1{font-size:clamp(32px,9vw,56px)!important}
          .search-shell{padding:0 16px!important;margin-top:16px!important}
        }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'oklch(0.97 0.005 80/0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--rule)' }}>
        <div className="header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', maxWidth: 1600, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500 }}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></Link>
          <nav className="header-nav" style={{ display: 'flex', gap: 24, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
            <Link href="/propiedades" style={{ borderBottom: '1px solid var(--ink)', color: 'var(--ink)', paddingBottom: 2 }}>Ver propiedades</Link>
            <a href="/nosotros">Nosotros</a>
            <a href="/asesores">Asesores</a>
            <Link href="/noticias">Noticias</Link>
          </nav>
          <div className="header-btns" style={{ display: 'flex', gap: 10 }}>
{!authLoading && isAsesor ? (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--ink-3)' }}>{user?.email?.split('@')[0]}</span>
                <a href="/dashboard" style={{ background:'var(--accent)', color:'white', padding:'8px 16px', borderRadius:999, fontSize:13, fontWeight:500 }}>Mi dashboard →</a>
              </div>
            ) : (
              <a href="/unirse" style={{ border: '1px solid var(--ink)', background: 'var(--ink)', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 13 }}>Soy asesor →</a>
            )}
          </div>
        </div>
      </header>

      <section className="hero-grid" style={{ maxWidth: 1600, margin: '0 auto', padding: '48px 40px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'end' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2.4s ease-in-out infinite', display: 'inline-block' }} />
            Portal de propiedades · Costa Rica
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(40px, 5vw, 80px)', fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.015em' }}>
            El próximo lugar<br/>al que llamarás <em style={{ color: 'var(--accent)' }}>casa.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 400, marginTop: 20 }}>Encontrá tu próximo hogar</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
          {[{ num: propiedades.length || '·', label: 'Propiedades activas' }, { num: '38', label: 'Cantones cubiertos' }, { num: '24/7', label: 'Valeria IA' }].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderTop: '1px solid var(--rule)', paddingTop: 12 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 32 }}>{s.num}</div>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="search-shell" style={{ maxWidth: 1600, margin: '24px auto 0', padding: '0 40px' }}>
        <div className="search-grid" style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 999, padding: 6, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div className="search-field" style={{ padding: '10px 20px', borderRight: '1px solid var(--rule-soft)' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 3 }}>Ubicación</div>
            <input value={query.location} onChange={e => setQuery({ ...query, location: e.target.value })} placeholder="¿A dónde?" style={{ background: 'transparent', border: 0, outline: 'none', width: '100%', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }} />
          </div>
          <div className="search-field" style={{ padding: '10px 20px', borderRight: '1px solid var(--rule-soft)' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 3 }}>Operación</div>
            <select value={query.op} onChange={e => setQuery({ ...query, op: e.target.value })} style={{ background: 'transparent', border: 0, outline: 'none', width: '100%', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', appearance: 'none' }}>
              <option value="venta">En venta</option>
            </select>
          </div>
          <div style={{ padding: '10px 20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 3 }}>Presupuesto</div>
            <select value={query.budget} onChange={e => setQuery({ ...query, budget: e.target.value })} style={{ background: 'transparent', border: 0, outline: 'none', width: '100%', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', appearance: 'none' }}>
              <option value="any">Sin límite</option>
              <option value="100">Hasta $100K</option>
              <option value="200">Hasta $200K</option>
              <option value="300">Hasta $300K</option>
              <option value="400">Hasta $400K</option>
              <option value="500">Hasta $500K</option>
              <option value="600">Hasta $600K</option>
              <option value="700">Hasta $700K</option>
              <option value="800">Hasta $800K</option>
              <option value="1000">Hasta $1M</option>
              <option value="1500">Hasta $1.5M</option>
              <option value="2000">Hasta $2M</option>
              <option value="9999">Más de $2M</option>
            </select>
          </div>
          <button style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--ink)', color: 'var(--bg)', border: 0, display: 'grid', placeItems: 'center', margin: '0 4px' }}>
            <Icon name="search" />
          </button>
        </div>
      </div>

      <div className="chips-wrap" style={{ maxWidth: 1600, margin: '16px auto 0', padding: '0 40px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {['Casa', 'Apartamento', 'Villa', 'Lote'].map(t => (
          <button key={t} className={'chip' + (tipoFiltro === t.toLowerCase() ? ' active' : '')} onClick={() => setTipoFiltro(tipoFiltro === t.toLowerCase() ? '' : t.toLowerCase())}>{t}</button>
        ))}
        <span style={{ width: 1, height: 18, background: 'var(--rule)', margin: '0 4px', flexShrink: 0 }} />
        <button className={'chip' + (query.op === 'venta' ? ' active' : '')} onClick={() => setQuery({...query, op: query.op === 'venta' ? 'todo' : 'venta'})}>En venta</button>
        
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <span>{filtered.length} resultados</span>
          <button onClick={() => setGuardarBusquedaOpen(true)} style={{ background: 'transparent', border: '1px solid var(--rule)', borderRadius: 999, padding: '6px 14px', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>🔔 Avisarme de nuevas propiedades</button>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: 'transparent', border: 0, borderBottom: '1px solid var(--ink)', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', outline: 'none', cursor: 'pointer' }}>
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio menor</option>
            <option value="price-desc">Precio mayor</option>
          </select>
        </div>
      </div>

      {guardarBusquedaOpen && (
        <GuardarBusquedaModal
          filtros={{
            zona: query.location || undefined,
            tipo: tipoFiltro || undefined,
            operacion: query.op,
            precioMax: query.budget !== 'any' ? parseInt(query.budget) * 1000 : null,
          }}
          onClose={() => setGuardarBusquedaOpen(false)}
        />
      )}

      <div className="split-grid" style={{ maxWidth: 1600, margin: '20px auto 0', padding: '0 40px 80px', display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)', paddingBottom: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 14, fontWeight: 500 }}>Selección de la semana</h2>
            <span style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> Valeria IA
            </span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Cargando propiedades...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <p>No hay propiedades con ese filtro</p>
              <button onClick={() => { setTipoFiltro(''); setQuery({ location: '', op: 'venta', budget: 'any' }) }} style={{ marginTop: 12, background: 'var(--ink)', color: 'var(--bg)', border: 'none', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13 }}>Ver todas</button>
            </div>
          ) : (
            <div className="cards">
              {filtered.map((p, i) => <PropertyCard key={p.id} p={p} index={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => window.location.href = "/propiedades/" + p.id} />)}
            </div>
          )}
        </div>
        <div className="map-col" style={{ position: 'sticky', top: 72, height: 'calc(100vh - 90px)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--rule)' }}>
          <MapaInteractivo propiedades={filtered} onSelect={(id: string) => setOpenId(id)} />
        </div>
      </div>

      <section className="editorial-section" style={{ maxWidth: 1600, margin: '0 auto', padding: '60px 40px', borderTop: '1px solid var(--rule)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>Mercado · Costa Rica</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.01em', margin: '0 0 20px' }}>Zonas con mayor revalorización</h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)' }}>El mercado inmobiliario costarricense registra crecimiento sostenido en zonas costeras y del Valle Central.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--rule)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
          {ZONES.map(z => (
            <div key={z.num} style={{ background: 'var(--bg)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>{z.num}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{z.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{z.meta}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{z.price}</span>
                <span style={{ fontSize: 11, color: 'var(--accent)' }}>{z.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px 60px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 12, padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 6 }}>Explorá cantón por cantón</div>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Buscá propiedades en las 7 provincias de Costa Rica, zona por zona.</p>
          </div>
          <Link href="/propiedades/zona" style={{ padding: '12px 24px', borderRadius: 999, background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>Ver todas las zonas →</Link>
        </div>
      </section>

      <footer style={{ maxWidth: 1600, margin: '0 auto', borderTop: '1px solid var(--rule)' }}>
        <div className="footer-inner" style={{ padding: '32px 40px', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 NIDO · Costa Rica</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/precios">Precios</Link><Link href="/noticias">Noticias</Link><Link href="/contacto">Contacto</Link><Link href="/soporte">Soporte</Link>
          </div>
        </div>
      </footer>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid var(--rule)', display: 'none', zIndex: 40 }} className="mobile-bar">
        <style>{`@media(max-width:768px){.mobile-bar{display:flex!important}}`}</style>
        <Link href="/propiedades" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 16px', color: 'var(--accent)', fontSize: 10, letterSpacing: '0.06em', textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>🏠</span>PROPIEDADES
        </Link>
        <Link href="/soporte" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 16px', color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em', textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>💬</span>VALERIA IA
        </Link>
        <Link href="/contacto" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 16px', color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em', textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>📞</span>CONTACTO
        </Link>
        <Link href="/login" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 16px', color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em', textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>👤</span>INGRESAR
        </Link>
      </div>

      {open && <Drawer p={open} fav={favs.has(open.id)} onFav={() => toggleFav(open.id)} onClose={() => setOpenId(null)} />}
    </main>
  )
}