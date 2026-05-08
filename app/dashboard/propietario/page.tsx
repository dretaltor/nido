'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .card{background:white;border:1px solid var(--rule);border-radius:12px;overflow:hidden}
  .card-pad{padding:20px 24px}
  .badge{padding:4px 12px;border-radius:999px;font-size:11px;font-weight:500;letter-spacing:0.06em}
  .tab{padding:8px 18px;border-radius:999px;border:1px solid var(--rule);font-size:13px;cursor:pointer;transition:all 0.15s;background:transparent;color:var(--ink-2)}
  .tab.active{background:var(--ink);color:white;border-color:var(--ink)}
  .oferta-card{background:white;border:1px solid var(--rule);border-radius:10px;padding:16px 20px;display:flex;align-items:center;gap:16px;transition:all 0.2s}
  .oferta-card:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(27,94,59,0.08)}
  .nav-link{font-size:13px;color:var(--ink-3);transition:color 0.15s}
  .nav-link:hover{color:var(--ink)}
  .nav-link.active{color:var(--accent);font-weight:500}
`

// Mock data — en producción viene de Supabase
const PROPIEDADES_MOCK = [
  { id:'1', titulo:'Casa en Santa Ana', zona:'Santa Ana', precio:380000, vistas:142, consultas:8, estado:'activa', foto:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=60' },
  { id:'2', titulo:'Apartamento Escazú', zona:'Escazú', precio:220000, vistas:89, consultas:4, estado:'activa', foto:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60' },
]

const LEADS_MOCK = [
  { id:'1', nombre:'Carlos Jiménez', telefono:'+506 8800-1234', interes:'Compra', propiedad:'Casa en Santa Ana', fecha:'Hace 2 horas', estado:'nuevo' },
  { id:'2', nombre:'María Solano', telefono:'+506 8700-5678', interes:'Compra', propiedad:'Casa en Santa Ana', fecha:'Hace 1 día', estado:'contactado' },
  { id:'3', nombre:'Roberto Arias', telefono:'+506 8600-9012', interes:'Inversión', propiedad:'Apartamento Escazú', fecha:'Hace 3 días', estado:'interesado' },
]

const VISITAS_MOCK = [
  { id:'1', nombre:'Carlos Jiménez', propiedad:'Casa en Santa Ana', fecha:'Lunes 12 mayo', hora:'10:00 AM', estado:'confirmada' },
  { id:'2', nombre:'Ana Quesada', propiedad:'Apartamento Escazú', fecha:'Miércoles 14 mayo', hora:'3:00 PM', estado:'pendiente' },
]

const FEEDBACKS_MOCK = [
  { id:'1', nombre:'Laura Mora', propiedad:'Casa en Santa Ana', fecha:'30 abr', calificacion:4, comentario:'Muy bonita la propiedad, el jardín es excelente. Le falta un poco de pintura en la fachada.' },
  { id:'2', nombre:'Diego Chaves', propiedad:'Apartamento Escazú', fecha:'28 abr', calificacion:5, comentario:'Perfecto el apartamento, exactamente lo que buscamos. Muy bien ubicado.' },
]

const OFERTAS_MOCK = [
  { id:'1', nombre:'Carlos Jiménez', propiedad:'Casa en Santa Ana', monto:365000, precio_lista:380000, fecha:'Hace 2 días', estado:'pendiente' },
  { id:'2', nombre:'Familia Rojas', propiedad:'Casa en Santa Ana', monto:370000, precio_lista:380000, fecha:'Hace 5 días', estado:'rechazada' },
]

const MERCADO_DATA = {
  precio_propiedad: 380000,
  precio_mercado: 362000,
  precio_m2_zona: 2400,
  precio_m2_propiedad: 2380,
  variacion_anual: 8.4,
  demanda_zona: 'Alta',
  tiempo_promedio_venta: 45,
}

export default function DashboardPropietario() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState('resumen')
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login-propietario'); return }
      
      // Solo redirigir si explícitamente es asesor
      const tipo = user.user_metadata?.tipo
      if (tipo === 'asesor') { router.push('/dashboard'); return }
      
      // Propietario confirmado - mostrar dashboard
      setUser(user)
      setNombre(user.email?.split('@')[0] || 'propietario')
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--sans)', color:'var(--ink-3)', fontSize:14 }}>
      <style>{CSS}</style>
      Cargando tu panel...
    </div>
  )

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const TABS = [
    { id:'resumen', label:'Resumen' },
    { id:'propiedades', label:'Propiedades' },
    { id:'leads', label:'Leads' },
    { id:'visitas', label:'Visitas' },
    { id:'feedbacks', label:'Feedbacks' },
    { id:'ofertas', label:'Ofertas' },
    { id:'mercado', label:'Valor de Mercado' },
    { id:'facturacion', label:'Facturación' },
  ]

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:1400, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:6, overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t.id} className={'tab'+(tab===t.id?' active':'')} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/bienvenida'))} style={{ fontSize:12, color:'var(--ink-3)', background:'none', border:'1px solid var(--rule)', padding:'6px 14px', borderRadius:999, cursor:'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'32px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Panel de propietario</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(24px,3vw,36px)', fontWeight:400, marginBottom:4 }}>
            {saludo}, <em style={{ fontStyle:'italic', color:'var(--accent)' }}>{nombre}.</em>
          </h1>
          <p style={{ fontSize:13, color:'var(--ink-3)' }}>Gestioná tus propiedades, leads y ofertas desde un solo lugar.</p>
        </div>

        {/* RESUMEN */}
        {tab === 'resumen' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
              {[
                { label:'Propiedades activas', val:'2', sub:'En el mercado', color:'var(--accent)' },
                { label:'Leads este mes', val:'3', sub:'Sin atender: 1', color:'oklch(0.52 0.08 230)' },
                { label:'Visitas agendadas', val:'2', sub:'Esta semana', color:'var(--gold, #C8A96E)' },
                { label:'Ofertas recibidas', val:'2', sub:'1 pendiente', color:'oklch(0.55 0.08 50)' },
              ].map((m,i) => (
                <div key={i} className="card card-pad" style={{ animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:40, color:m.color, marginBottom:4 }}>{m.val}</div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Resumen propiedades */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              {PROPIEDADES_MOCK.map(p => (
                <div key={p.id} className="card" style={{ display:'flex', gap:0, overflow:'hidden' }}>
                  <img src={p.foto} style={{ width:100, height:'100%', objectFit:'cover', flexShrink:0 }} alt={p.titulo}/>
                  <div className="card-pad" style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>{p.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:8 }}>{p.zona}</div>
                    <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--ink-2)' }}>
                      <span>{p.vistas} vistas</span>
                      <span>{p.consultas} consultas</span>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)', marginTop:6 }}>${p.precio.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leads recientes */}
            <div className="card">
              <div className="card-pad" style={{ borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight:500 }}>Leads recientes</span>
                <button onClick={() => setTab('leads')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todos →</button>
              </div>
              {LEADS_MOCK.slice(0,2).map(l => (
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1px solid var(--rule-soft)' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{l.nombre[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500 }}>{l.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{l.propiedad} · {l.interes}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:11, color:'var(--ink-3)', marginBottom:4 }}>{l.fecha}</div>
                    <span className="badge" style={{ background:l.estado==='nuevo'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:l.estado==='nuevo'?'oklch(0.35 0.08 240)':'var(--accent)' }}>{l.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROPIEDADES */}
        {tab === 'propiedades' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400 }}>Mis propiedades</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
              {PROPIEDADES_MOCK.map(p => (
                <div key={p.id} className="card">
                  <img src={p.foto} style={{ width:'100%', height:200, objectFit:'cover' }} alt={p.titulo}/>
                  <div className="card-pad">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:4 }}>{p.titulo}</div>
                        <div style={{ fontSize:13, color:'var(--ink-3)' }}>{p.zona}</div>
                      </div>
                      <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>{p.estado}</span>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:18, color:'var(--accent)', marginBottom:16 }}>${p.precio.toLocaleString()} USD</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                      {[{l:'Vistas totales',v:p.vistas},{l:'Consultas',v:p.consultas},{l:'Visitas agendadas',v:1},{l:'Ofertas recibidas',v:1}].map(s => (
                        <div key={s.l} style={{ background:'var(--bg)', borderRadius:8, padding:'10px 12px' }}>
                          <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', marginBottom:2 }}>{s.v}</div>
                          <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <a href={'/propiedades/'+p.id} style={{ flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--rule)', fontSize:13, textAlign:'center', fontWeight:500 }}>Ver ficha →</a>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.origin+'/propiedades/'+p.id); alert('¡Enlace copiado!') }} style={{ flex:1, padding:'10px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, cursor:'pointer', fontWeight:500 }}>🔗 Compartir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADS */}
        {tab === 'leads' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Leads de compradores</h2>
            <div className="card">
              {LEADS_MOCK.map((l,i) => (
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px', borderBottom:i<LEADS_MOCK.length-1?'1px solid var(--rule-soft)':'none' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:18, color:'var(--accent)', flexShrink:0 }}>{l.nombre[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>
                      {l.nombre.split(' ').map((n:string, i:number) => i===0 ? n[0]+'.' : n).join(' ')}
                    </div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{l.propiedad} · {l.interes} · {l.fecha}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:4, fontStyle:'italic' }}>Contacto gestionado por tu asesor NIDO</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span className="badge" style={{ background:l.estado==='nuevo'?'oklch(0.93 0.03 240)':l.estado==='contactado'?'var(--accent-tint)':'oklch(0.93 0.05 80)', color:l.estado==='nuevo'?'oklch(0.35 0.08 240)':l.estado==='contactado'?'var(--accent)':'oklch(0.45 0.08 80)' }}>{l.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISITAS */}
        {tab === 'visitas' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Visitas agendadas</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {VISITAS_MOCK.map(v => (
                <div key={v.id} className="card card-pad" style={{ display:'flex', alignItems:'center', gap:20 }}>
                  <div style={{ width:60, height:60, borderRadius:10, background:v.estado==='confirmada'?'var(--accent-tint)':'oklch(0.93 0.05 80)', display:'grid', placeItems:'center', flexShrink:0 }}>
                    <span style={{ fontSize:24 }}>{v.estado==='confirmada'?'✓':'⏳'}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{v.nombre}</div>
                    <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:4 }}>{v.propiedad}</div>
                    <div style={{ fontSize:13, color:'var(--ink-2)' }}>{v.fecha} · {v.hora}</div>
                  </div>
                  <span className="badge" style={{ background:v.estado==='confirmada'?'var(--accent-tint)':'oklch(0.93 0.05 80)', color:v.estado==='confirmada'?'var(--accent)':'oklch(0.45 0.08 80)' }}>{v.estado}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACKS */}
        {tab === 'feedbacks' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Feedbacks de visitas</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {FEEDBACKS_MOCK.map(f => (
                <div key={f.id} className="card card-pad">
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{f.nombre[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500 }}>{f.nombre}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{f.propiedad} · {f.fecha}</div>
                    </div>
                    <div style={{ display:'flex', gap:2 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:16, color:s<=f.calificacion?'#C8A96E':'var(--rule)' }}>★</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65, background:'var(--bg)', padding:'12px 14px', borderRadius:8, fontStyle:'italic' }}>"{f.comentario}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OFERTAS */}
        {tab === 'ofertas' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Ofertas recibidas</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {OFERTAS_MOCK.map(o => (
                <div key={o.id} className="oferta-card">
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:20, color:'var(--accent)', flexShrink:0 }}>{o.nombre[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{o.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{o.propiedad} · {o.fecha}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:20, color:'var(--accent)', marginBottom:2 }}>${o.monto.toLocaleString()}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>Lista: ${o.precio_lista.toLocaleString()} · {Math.round(o.monto/o.precio_lista*100)}%</div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    {o.estado === 'pendiente' ? (
                      <>
                        <button style={{ padding:'8px 16px', borderRadius:999, background:'var(--accent)', color:'white', border:'none', fontSize:13, cursor:'pointer', fontWeight:500 }}>Aceptar</button>
                        <button style={{ padding:'8px 16px', borderRadius:999, background:'transparent', color:'var(--ink-3)', border:'1px solid var(--rule)', fontSize:13, cursor:'pointer' }}>Rechazar</button>
                      </>
                    ) : (
                      <span className="badge" style={{ background:'oklch(0.93 0.005 80)', color:'var(--ink-3)' }}>Rechazada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MERCADO */}
        {tab === 'mercado' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Valor de mercado</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <div className="card card-pad">
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Tu propiedad</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:48, color:'var(--accent)', marginBottom:4 }}>${MERCADO_DATA.precio_propiedad.toLocaleString()}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Precio de lista actual</div>
              </div>
              <div className="card card-pad">
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Promedio de zona</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:48, color:'var(--ink)', marginBottom:4 }}>${MERCADO_DATA.precio_mercado.toLocaleString()}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Propiedades similares en {PROPIEDADES_MOCK[0].zona}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'Precio por m²', val:'$'+MERCADO_DATA.precio_m2_propiedad+' USD', sub:'Zona: $'+MERCADO_DATA.precio_m2_zona },
                { label:'Variación anual', val:'+'+MERCADO_DATA.variacion_anual+'%', sub:'Últimos 12 meses' },
                { label:'Demanda de zona', val:MERCADO_DATA.demanda_zona, sub:'Santa Ana · 2026' },
                { label:'Tiempo promedio venta', val:MERCADO_DATA.tiempo_promedio_venta+'d', sub:'En tu zona' },
              ].map((s,i) => (
                <div key={i} className="card card-pad">
                  <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--accent)', marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:12, fontWeight:500, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="card card-pad" style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--accent)' }}>Análisis de Valeria IA</div>
              </div>
              <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65 }}>
                Tu propiedad está tasada un 4.9% por encima del promedio de zona, lo que es razonable dado sus características. En el contexto actual de alta demanda en Santa Ana, te recomiendo mantener el precio. El mercado está absorbiendo propiedades similares en 38 días promedio.
              </p>
            </div>
          </div>
        )}

        {/* FACTURACIÓN */}
        {tab === 'facturacion' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Facturación</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <div className="card card-pad">
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Plan actual</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--ink)', marginBottom:4 }}>Plan Gratis</div>
                <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6, marginBottom:16 }}>Acceso básico al panel de propietario. Para funciones avanzadas como análisis de mercado detallado y reportes, considerá el plan Pro.</p>
                <a href="/precios" style={{ display:'inline-block', padding:'10px 20px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:13, fontWeight:500 }}>Ver planes →</a>
              </div>
              <div className="card card-pad">
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Próxima factura</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:48, color:'var(--ink)', marginBottom:4 }}>$0</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Plan gratuito activo</div>
              </div>
            </div>
            <div className="card">
              <div className="card-pad" style={{ borderBottom:'1px solid var(--rule)' }}>
                <span style={{ fontSize:14, fontWeight:500 }}>Historial de pagos</span>
              </div>
              <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>
                No hay pagos registrados aún.
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
