'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);
    --ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);
    --rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);
    --accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);
    --serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace;
  }
  a { color:inherit; text-decoration:none; } button { font:inherit; color:inherit; cursor:pointer; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .dash-card { background:white; border:1px solid var(--rule); border-radius:12px; padding:20px; transition:all 0.2s; }
  .dash-card:hover { box-shadow:0 4px 20px rgba(27,94,59,0.08); border-color:var(--accent); }
  .nav-link { font-size:13px; color:var(--ink-3); transition:color 0.15s; }
  .nav-link:hover { color:var(--ink); }
  .nav-link.active { color:var(--accent); font-weight:500; }
  .module-btn { display:flex; flex-direction:column; gap:8px; background:white; border:1px solid var(--rule); border-radius:12px; padding:20px; text-decoration:none; transition:all 0.2s; cursor:pointer; }
  .module-btn:hover { border-color:var(--accent); transform:translateY(-2px); box-shadow:0 8px 24px rgba(27,94,59,0.08); }
  .prop-row { display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid var(--rule-soft); }
  .prop-row:last-child { border-bottom:none; }
  .lead-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--rule-soft); }
  .lead-row:last-child { border-bottom:none; }
  .badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:500; }
  .badge-new { background:var(--accent-tint); color:var(--accent); }
  .badge-contacted { background:oklch(0.93 0.03 200); color:oklch(0.35 0.06 200); }
  .badge-closed { background:oklch(0.93 0.03 150); color:var(--accent); }
  .badge-active { background:var(--accent-tint); color:var(--accent); }
  .badge-paused { background:oklch(0.93 0.03 80); color:oklch(0.45 0.04 80); }
  @media(max-width:768px) { .dash-grid { grid-template-columns:1fr!important; } .sidebar { display:none!important; } .nav-pad { padding:14px 16px!important; } }
`

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      // Verificar localStorage primero — más confiable que metadata
      const tipoLocal = typeof window !== 'undefined' ? localStorage.getItem('nido_user_tipo') : null
      const tipoMeta = user.user_metadata?.tipo
      const tipo = tipoLocal || tipoMeta || 'asesor'
      if (tipo === 'propietario') { router.push('/dashboard/propietario'); return }
      setUser(user)
      Promise.all([
        supabase.from('propiedades').select('*').eq('asesor_email', user.email),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
      ]).then(([{ data: props }, { data: leadsData }]) => {
        setPropiedades(props || [])
        setLeads(leadsData || [])
        setLoading(false)
      })
    })
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  const leadsNuevos = leads.filter(l => l.estado === 'nuevo').length
  const leadsCerrados = leads.filter(l => l.estado === 'cerrado').length
  const propActivas = propiedades.filter(p => p.disponible).length
  const nombre = user?.email?.split('@')[0] || 'ahí'
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  if (loading) return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{CSS}</style>
      <p style={{ color:'var(--ink-3)', fontSize:14 }}>Cargando tu dashboard...</p>
    </main>
  )

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1400, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:28, alignItems:'center' }}>
            <a href="/dashboard" className="nav-link active">Dashboard</a>
            <a href="/dashboard/crm" className="nav-link">CRM</a>
            <a href="/propiedades" className="nav-link">Portal</a>
            <a href="/dashboard/nueva-propiedad" className="nav-link">Nueva propiedad</a>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{nombre}</div>
              <div style={{ fontSize:11, color:'var(--ink-3)' }}>Asesor NIDO</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', color:'white', fontSize:13, fontWeight:500 }}>
              {nombre.slice(0,2).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ fontSize:12, color:'var(--ink-3)', border:'1px solid var(--rule)', borderRadius:999, padding:'6px 14px', background:'transparent' }}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'32px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:32, animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Panel de asesor</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1, marginBottom:6 }}>{saludo}, <em style={{ fontStyle:'italic', color:'var(--accent)' }}>{nombre}.</em></h1>
          <p style={{ fontSize:14, color:'var(--ink-2)' }}>Esto es lo que está pasando con tu cartera hoy.</p>
        </div>

        {/* Métricas */}
        <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
          {[
            { label:'Propiedades activas', valor:propActivas, sub:propiedades.length+' en total', color:'var(--accent)' },
            { label:'Leads totales', valor:leads.length, sub:leadsNuevos+' nuevos sin atender', color:'var(--accent)' },
            { label:'Leads cerrados', valor:leadsCerrados, sub:'este mes', color:'var(--ink)' },
            { label:'Tasa de cierre', valor:leads.length>0?Math.round((leadsCerrados/leads.length)*100)+'%':'—', sub:'promedio cartera', color:'var(--accent)' },
          ].map((m,i) => (
            <div key={i} className="dash-card" style={{ animation:'fadeUp 0.4s ease '+(i*0.08)+'s both' }}>
              <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--ink-3)', marginBottom:8 }}>{m.label}</p>
              <p style={{ fontFamily:'var(--serif)', fontSize:36, color:m.color, lineHeight:1, marginBottom:4 }}>{m.valor}</p>
              <p style={{ fontSize:12, color:'var(--ink-3)' }}>{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>

          {/* Propiedades */}
          <div className="dash-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Mis propiedades</h2>
              <a href="/dashboard/nueva-propiedad" style={{ fontSize:12, background:'var(--ink)', color:'white', padding:'6px 16px', borderRadius:999 }}>+ Nueva</a>
            </div>
            {propiedades.length === 0 && (
              <div style={{ padding:'24px 0', textAlign:'center' }}>
                <p style={{ fontSize:14, color:'var(--ink-3)', marginBottom:12 }}>Aún no tienes propiedades publicadas.</p>
                <a href="/dashboard/nueva-propiedad" style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>Publicar primera propiedad →</a>
              </div>
            )}
            {propiedades.slice(0,5).map(p => (
              <div key={p.id} className="prop-row">
                <div style={{ width:40, height:40, borderRadius:8, background:'var(--accent-tint)', display:'grid', placeItems:'center', flexShrink:0, fontSize:18 }}>🏠</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.titulo||'Sin título'}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.zona||'—'}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:13, marginBottom:4 }}>{p.precio?'$'+p.precio.toLocaleString('en-US'):'—'}</div>
                  <span className={'badge '+(p.disponible?'badge-active':'badge-paused')}>{p.disponible?'Activa':'Pausada'}</span>
                </div>
              </div>
            ))}
            {propiedades.length > 5 && <p style={{ fontSize:12, color:'var(--ink-3)', textAlign:'center', paddingTop:12 }}>{propiedades.length-5} más →</p>}
          </div>

          {/* Leads */}
          <div className="dash-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Leads recientes</h2>
              <a href="/dashboard/crm" style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>Ver CRM →</a>
            </div>
            {leads.length === 0 && (
              <div style={{ padding:'24px 0', textAlign:'center' }}>
                <p style={{ fontSize:14, color:'var(--ink-3)' }}>Aún no tienes leads. Publicá propiedades para empezar a recibirlos.</p>
              </div>
            )}
            {leads.slice(0,6).map(l => (
              <div key={l.id} className="lead-row">
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg-elev)', border:'1px solid var(--rule)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:15, flexShrink:0 }}>
                  {(l.nombre||'?')[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.nombre||'Sin nombre'}</div>
                  <div style={{ fontSize:11, color:'var(--ink-3)' }}>{l.email||l.telefono||'—'}</div>
                </div>
                <span className={'badge badge-'+(l.estado||'new')}>{l.estado||'nuevo'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Módulos rápidos */}
        <div style={{ marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, marginBottom:16 }}>Herramientas</h2>
          <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { href:'/dashboard/nueva-propiedad', icon:'＋', label:'Nueva propiedad', desc:'Wizard de 8 pasos' },
              { href:'/dashboard/crm', icon:'◎', label:'CRM de leads', desc:'Gestionar contactos' },
              { href:'/propiedades', icon:'🏠', label:'Ver todas las propiedades', desc:'Ofertar en cualquier propiedad' },
              { href:'/chat', icon:'✦', label:'Valeria IA', desc:'Tu asistente inteligente' },
              { href:'/academia', icon:'◈', label:'Academia', desc:'Cursos y certificaciones' },
            ].map(m => (
              <a key={m.href} href={m.href} className="module-btn">
                <span style={{ fontSize:22, color:'var(--accent)' }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Valeria sugerencia */}
        <div style={{ background:'var(--ink)', borderRadius:16, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:20, fontStyle:'italic', color:'oklch(0.85 0.06 80)', flexShrink:0 }}>V</div>
            <div>
              <div style={{ fontSize:12, color:'oklch(0.85 0.06 80)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Valeria · Sugerencia del día</div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>
                {propiedades.length === 0 ? 'Publicá tu primera propiedad hoy. Los asesores con al menos 3 propiedades reciben 4× más leads.' : leadsNuevos > 0 ? 'Tenés '+leadsNuevos+' lead'+(leadsNuevos>1?'s':'')+' sin atender. Los primeros en responder cierran 2× más rápido.' : 'Tu cartera se ve bien. Considerá agregar fotos profesionales para aumentar las vistas un 60%.'}
              </p>
            </div>
          </div>
          <a href="/chat" style={{ background:'var(--accent)', color:'white', padding:'10px 20px', borderRadius:999, fontSize:13, fontWeight:500, whiteSpace:'nowrap', textDecoration:'none' }}>Hablar con Valeria →</a>
        </div>

      </div>
    </main>
  )
}
