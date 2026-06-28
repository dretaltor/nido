'use client'
import { useEffect, useState } from 'react'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
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


const safeDate = (dateStr: string | null | undefined, timeStr?: string): Date => {
  try {
    if (!dateStr) return new Date()
    const dt = timeStr ? dateStr + 'T' + timeStr + ':00' : dateStr + 'T12:00:00'
    const d = new Date(dt)
    return isNaN(d.getTime()) ? new Date() : d
  } catch { return new Date() }
}
const safeFmt = (dateStr: string | null | undefined, opts: any): string => {
  try {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T12:00:00')
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('es-CR', opts)
  } catch { return '' }
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [ofertas, setOfertas] = useState<any[]>([])
  const [ofertasRecibidas, setOfertasRecibidas] = useState<any[]>([])
  const [ofertaSel, setOfertaSel] = useState<any>(null)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [valeriaPerfil, setValeraPerfilDash] = useState<any>(null)
  const [calificacion, setCalificacion] = useState<any>(null)
  const [visitas, setVisitas] = useState<any[]>([])
  const [tareas, setTareas] = useState<any[]>([])
  const [nuevaTarea, setNuevaTarea] = useState(false)
  const [formTarea, setFormTarea] = useState({ titulo:'', descripcion:'', prioridad:'media', fecha_vencimiento:'', propiedad_id:'', lead_id:'' })
  const [tourActivo, setTourActivo] = useState(false)
  const [tourPaso, setTourPaso] = useState(0)
  const [updatingOferta, setUpdatingOferta] = useState(false)
  const [contraOferta, setContraOferta] = useState('')
  const [showContra, setShowContra] = useState(false)

  const updateOfertaEstado = async (id: string, estado: string) => {
    setUpdatingOferta(true)
    await supabase.from('ofertas').update({ estado }).eq('id', id)
    setOfertas(prev => prev.map((o:any) => o.id===id ? {...o, estado} : o))
    setOfertasRecibidas(prev => prev.map((o:any) => o.id===id ? {...o, estado} : o))
    setOfertaSel((prev:any) => prev ? {...prev, estado} : null)
    setUpdatingOferta(false)
  }
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
        supabase.from('ofertas').select('*').eq('asesor_email', user.email).order('created_at', { ascending: false }),
      ]).then(([{ data: props }, { data: leadsData }, { data: ofertasData }]) => {
        // Load ofertas received on this asesor's properties
        if (props && props.length > 0) {
          const propIds = props.map((p:any) => p.id)
          supabase.from('ofertas').select('*').in('propiedad_id', propIds).neq('asesor_email', user.email).order('created_at', { ascending: false })
            .then(({ data, error }) => { console.log('ofertasRecibidas:', data, error); setOfertasRecibidas(data || []) })
        }
        setPropiedades(props || [])
        setLeads(leadsData || [])
        setOfertas(ofertasData || [])
        // Check onboarding status
        supabase.from('perfiles').select('valeria_onboarding_completo,cedula_frente_url,foto_url').eq('id', user.id).maybeSingle().then(({data}) => setValeraPerfilDash(data))
        // Load visitas
        supabase.from('visitas').select('*').eq('asesor_email', user.email).order('fecha', { ascending: true }).then(({ data }) => setVisitas(data || []))
        // Load tareas
        supabase.from('tareas').select('*').eq('asesor_email', user.email).order('fecha_vencimiento', { ascending: true }).then(({ data }) => setTareas(data || []))
        // Load real rating
        supabase.from('asesor_calificaciones').select('promedio,total').eq('asesor_email', user.email).maybeSingle().then(({data}) => { if(data) setCalificacion(data) })
        // Tour primer ingreso
        const tourVisto = localStorage.getItem('nido_tour_asesor')
        if (!tourVisto) { setTourActivo(true); localStorage.setItem('nido_tour_asesor', '1') }
        const dismissed = localStorage.getItem('nido_onboarding_dismissed')
        if (dismissed) setOnboardingDismissed(true)

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
            <a href="/dashboard/perfil" className="nav-link">Mi perfil</a>
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

        {/* Onboarding checklist */}
        {!onboardingDismissed && (
          <OnboardingChecklist
            tieneFoto={!!valeriaPerfil?.foto_url}
            tieneValeria={!!valeriaPerfil?.valeria_onboarding_completo}
            tieneKYC={!!valeriaPerfil?.cedula_frente_url}
            tienePropiedades={propiedades.length > 0}
            onDismiss={() => { setOnboardingDismissed(true); localStorage.setItem('nido_onboarding_dismissed','1') }}
          />
        )}

        {/* Métricas */}
        <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
          {[
            { label:'Propiedades activas', valor:propActivas, sub:propiedades.length+' en total', color:'var(--accent)', href:'/dashboard#propiedades' },
            { label:'Leads totales', valor:leads.length, sub:leadsNuevos+' nuevos sin atender', color:'var(--accent)', href:'/dashboard/crm' },
            { label:'Leads cerrados', valor:leadsCerrados, sub:'este mes', color:'var(--ink)', href:'/dashboard/crm' },
            { label:'Ofertas recibidas', valor:ofertasRecibidas.length, sub:ofertasRecibidas.filter((o:any)=>o.estado==='pendiente').length+' pendientes', color:'oklch(0.52 0.08 50)', href:'#ofertas-recibidas' },
            { label:'Tasa de cierre', valor:leads.length>0?Math.round((leadsCerrados/leads.length)*100)+'%':'—', sub:'promedio cartera', color:'var(--accent)', href:'/dashboard/crm' },
          ].map((m,i) => (
            <a key={i} href={(m as any).href||'#'} className="dash-card" style={{ animation:'fadeUp 0.4s ease '+(i*0.08)+'s both', display:'block', textDecoration:'none', cursor:'pointer' }}>
              <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--ink-3)', marginBottom:8 }}>{m.label}</p>
              <p style={{ fontFamily:'var(--serif)', fontSize:36, color:m.color, lineHeight:1, marginBottom:4 }}>{m.valor}</p>
              <p style={{ fontSize:12, color:'var(--ink-3)' }}>{m.sub}</p>
            </a>
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
              <div key={p.id} className="prop-row" style={{ display:'flex', alignItems:'center', gap:10 }}>
                <a href={'/propiedades/'+p.id} target="_blank" style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:0, textDecoration:'none', color:'inherit', cursor:'pointer' }}>
                  <div style={{ width:40, height:40, borderRadius:8, background:'var(--accent-tint)', display:'grid', placeItems:'center', flexShrink:0, fontSize:18 }}>🏠</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.titulo||'Sin título'}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.zona||'—'}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:13, marginBottom:4 }}>{p.precio?'$'+p.precio.toLocaleString('en-US'):'—'}</div>
                    <span className={'badge '+(p.disponible?'badge-active':'badge-paused')}>{p.disponible?'Activa':'Pausada'}</span>
                  </div>
                </a>
                <a href={'/dashboard/propiedad/'+p.id} style={{ flexShrink:0, width:32, height:32, borderRadius:8, display:'grid', placeItems:'center', border:'1px solid var(--rule)', color:'var(--ink-3)', textDecoration:'none', fontSize:14 }} title="Editar">✏️</a>
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

        {/* Ofertas enviadas */}
          {ofertas.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Ofertas enviadas</h2>
                <span style={{ fontSize:12, color:'var(--ink-3)' }}>{ofertas.filter((o:any)=>o.estado==='pendiente').length} pendientes</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ofertas.slice(0,5).map((o:any) => (
                  <div key={o.id} className="dash-card" onClick={() => setOfertaSel({...o, tipo_vista:'enviada'})} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', cursor:'pointer' }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(o.comprador_nombre||'?')[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{o.comprador_nombre}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>{o.tipo_compra==='contado'?'Contado':'Crédito'} · {new Date(o.created_at).toLocaleDateString('es-CR')}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
                      <div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--accent)', marginBottom:4 }}>${Number(o.valor_oferta||0).toLocaleString()}</div>
                        <span style={{ padding:'2px 10px', borderRadius:999, fontSize:10, fontWeight:500, background:o.estado==='pendiente'?'oklch(0.93 0.05 80)':o.estado==='aceptada'?'var(--accent-tint)':o.estado==='rechazada'?'oklch(0.93 0.005 80)':'oklch(0.93 0.03 240)', color:o.estado==='pendiente'?'oklch(0.45 0.08 80)':o.estado==='aceptada'?'var(--accent)':o.estado==='rechazada'?'var(--ink-3)':'oklch(0.35 0.08 240)' }}>{o.estado}</span>
                      </div>
                      <span style={{ color:'var(--ink-3)', fontSize:18 }}>›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ofertas en mis propiedades */}
          <div id="ofertas-recibidas"></div>
        {ofertasRecibidas.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Ofertas en mis propiedades</h2>
                <span style={{ fontSize:12, color:'var(--ink-3)' }}>{ofertasRecibidas.filter((o:any)=>o.estado==='pendiente').length} pendientes</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ofertasRecibidas.slice(0,5).map((o:any) => (
                  <div key={o.id} className="dash-card" onClick={() => setOfertaSel({...o, tipo_vista:'recibida'})} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', cursor:'pointer' }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'oklch(0.93 0.05 80)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'oklch(0.45 0.08 80)', flexShrink:0 }}>{(o.comprador_nombre||'?')[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{o.comprador_nombre}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>Por: {o.asesor_nombre||o.asesor_email} · {new Date(o.created_at).toLocaleDateString('es-CR')}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
                      <div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--accent)', marginBottom:4 }}>${Number(o.valor_oferta||0).toLocaleString()}</div>
                        <span style={{ padding:'2px 10px', borderRadius:999, fontSize:10, fontWeight:500, background:o.estado==='pendiente'?'oklch(0.93 0.05 80)':o.estado==='aceptada'?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:o.estado==='pendiente'?'oklch(0.45 0.08 80)':o.estado==='aceptada'?'var(--accent)':'var(--ink-3)' }}>{o.estado}</span>
                      </div>
                      <span style={{ color:'var(--ink-3)', fontSize:18 }}>›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        {/* VISITAS */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Visitas agendadas</h2>
            <span style={{ fontSize:12, color:'var(--ink-3)' }}>{visitas.filter((v:any)=>v.estado==='pendiente').length} pendientes de confirmar</span>
          </div>
          {visitas.length === 0 ? (
            <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'24px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>
              No tenés visitas agendadas aún.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {visitas.slice(0,5).map((v:any) => {
                const isPendiente = v.estado === 'pendiente'
                const fechaEvento = safeDate(v.fecha, v.hora)
                const googleCal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Visita propiedad NIDO: '+v.propiedad_titulo)}&dates=${fechaEvento.toISOString().replace(/[-:]/g,'').split('.')[0]}Z/${new Date(fechaEvento.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]}Z&details=${encodeURIComponent('Comprador: '+v.comprador_nombre+' | Tel: '+v.comprador_telefono)}&location=${encodeURIComponent(v.propiedad_titulo)}`
                const appleCal = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Visita NIDO: ${v.propiedad_titulo}
DTSTART:${fechaEvento.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTEND:${new Date(fechaEvento.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DESCRIPTION:Comprador: ${v.comprador_nombre}
END:VEVENT
END:VCALENDAR`
                return (
                  <div key={v.id} style={{ background:'white', border:'1px solid '+(isPendiente?'oklch(0.85 0.05 80)':'var(--rule)'), borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:10, background:isPendiente?'oklch(0.93 0.05 80)':'var(--accent-tint)', display:'grid', placeItems:'center', fontSize:20, flexShrink:0 }}>
                      📅
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{v.propiedad_titulo}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>
                        {v.comprador_nombre} · {v.comprador_telefono} · {safeFmt(v.fecha, {weekday:'short',month:'short',day:'numeric'})} {v.hora}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                      {isPendiente && (
                        <button onClick={async () => {
                          await supabase.from('visitas').update({ estado:'confirmada' }).eq('id', v.id)
                          setVisitas(prev => prev.map((x:any) => x.id===v.id ? {...x, estado:'confirmada'} : x))
                          // Notify comprador
                          if (v.comprador_telefono) {
                            fetch('/api/wa-send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to: v.comprador_telefono, message: `✅ *Visita confirmada NIDO*\n\nTu visita fue confirmada:\n\nPropiedad: ${v.propiedad_titulo}\nFecha: ${safeFmt(v.fecha, {weekday:'long',month:'long',day:'numeric'})}\nHora: ${v.hora}\nTipo: ${v.tipo === 'virtual' ? 'Virtual' : 'Presencial'}\n\nTe enviaremos un recordatorio el día antes. 🏠` }) }).catch(()=>{})
                          }
                        }} style={{ padding:'6px 12px', borderRadius:999, background:'var(--accent)', color:'white', border:'none', fontSize:11, fontWeight:500, cursor:'pointer' }}>
                          Confirmar
                        </button>
                      )}
                      {v.estado === 'confirmada' && (
                        <div style={{ position:'relative' }}>
                          <details style={{ listStyle:'none' }}>
                            <summary style={{ padding:'6px 12px', borderRadius:999, background:'var(--bg)', border:'1px solid var(--rule)', fontSize:11, cursor:'pointer', listStyle:'none' }}>
                              📆 Agregar al calendario
                            </summary>
                            <div style={{ position:'absolute', right:0, top:'100%', marginTop:4, background:'white', border:'1px solid var(--rule)', borderRadius:10, padding:'8px', zIndex:10, minWidth:180, boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
                              <a href={googleCal} target="_blank" style={{ display:'block', padding:'8px 12px', fontSize:12, color:'var(--ink)', textDecoration:'none', borderRadius:6 }}>🗓 Google Calendar</a>
                              <a href={appleCal} download="visita-nido.ics" style={{ display:'block', padding:'8px 12px', fontSize:12, color:'var(--ink)', textDecoration:'none', borderRadius:6 }}>📱 Apple / iPhone</a>
                              <a href={appleCal} download="visita-nido.ics" style={{ display:'block', padding:'8px 12px', fontSize:12, color:'var(--ink)', textDecoration:'none', borderRadius:6 }}>🤖 Android</a>
                            </div>
                          </details>
                        </div>
                      )}
                      <span style={{ padding:'3px 10px', borderRadius:999, fontSize:10, fontWeight:500, background:v.estado==='confirmada'?'var(--accent-tint)':v.estado==='pendiente'?'oklch(0.93 0.05 80)':'var(--bg)', color:v.estado==='confirmada'?'var(--accent)':v.estado==='pendiente'?'oklch(0.45 0.08 80)':'var(--ink-3)' }}>
                        {v.estado}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* TAREAS */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Tareas</h2>
            <button onClick={() => setNuevaTarea(true)} style={{ padding:'6px 14px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:12, fontWeight:500, cursor:'pointer' }}>+ Nueva tarea</button>
          </div>

          {nuevaTarea && (
            <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'20px', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <input placeholder="Título de la tarea *" value={formTarea.titulo} onChange={e => setFormTarea(p=>({...p,titulo:e.target.value}))} style={{ padding:'9px 12px', border:'1px solid var(--rule)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', outline:'none', gridColumn:'1/-1' }}/>
                <input placeholder="Descripción (opcional)" value={formTarea.descripcion} onChange={e => setFormTarea(p=>({...p,descripcion:e.target.value}))} style={{ padding:'9px 12px', border:'1px solid var(--rule)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', outline:'none', gridColumn:'1/-1' }}/>
                <select value={formTarea.prioridad} onChange={e => setFormTarea(p=>({...p,prioridad:e.target.value}))} style={{ padding:'9px 12px', border:'1px solid var(--rule)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', outline:'none' }}>
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
                <input type="date" value={formTarea.fecha_vencimiento} onChange={e => setFormTarea(p=>({...p,fecha_vencimiento:e.target.value}))} style={{ padding:'9px 12px', border:'1px solid var(--rule)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', outline:'none' }}/>
                <select value={formTarea.propiedad_id} onChange={e => setFormTarea(p=>({...p,propiedad_id:e.target.value,lead_id:''}))} style={{ padding:'9px 12px', border:'1px solid var(--rule)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', outline:'none', gridColumn:'1/-1' }}>
                  <option value="">🏠 Sin propiedad asignada</option>
                  {propiedades.map((p:any) => <option key={p.id} value={p.id}>{p.ref_id ? p.ref_id+' · ' : ''}{p.titulo}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={() => setNuevaTarea(false)} style={{ padding:'8px 16px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:12, cursor:'pointer' }}>Cancelar</button>
                <button onClick={async () => {
                  if (!formTarea.titulo) return
                  const { data: u } = await supabase.auth.getUser()
                  await supabase.from('tareas').insert({ asesor_email: u.user?.email, titulo: formTarea.titulo, descripcion: formTarea.descripcion, prioridad: formTarea.prioridad, fecha_vencimiento: formTarea.fecha_vencimiento || null, propiedad_id: formTarea.propiedad_id || null })
                  const { data } = await supabase.from('tareas').select('*').eq('asesor_email', u.user?.email).order('fecha_vencimiento', { ascending: true })
                  setTareas(data || [])
                  setNuevaTarea(false)
                  setFormTarea({ titulo:'', descripcion:'', prioridad:'media', fecha_vencimiento:'', propiedad_id:'', lead_id:'' })
                }} style={{ padding:'8px 16px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:12, fontWeight:500, cursor:'pointer' }}>
                  Guardar tarea
                </button>
              </div>
            </div>
          )}

          {tareas.length === 0 && !nuevaTarea ? (
            <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'24px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>
              No tenés tareas pendientes. ¡Todo al día! ✓
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {tareas.filter((t:any)=>t.estado!=='completada').map((t:any) => {
                const vencida = t.fecha_vencimiento && new Date(t.fecha_vencimiento+'T12:00:00') < new Date()
                const prioColor = t.prioridad==='alta'?'oklch(0.55 0.08 20)':t.prioridad==='media'?'oklch(0.55 0.08 80)':'oklch(0.55 0.06 150)'
                return (
                  <div key={t.id} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    <button onClick={async () => {
                      await supabase.from('tareas').update({ estado:'completada' }).eq('id', t.id)
                      setTareas(prev => prev.filter((x:any) => x.id !== t.id))
                    }} style={{ width:20, height:20, borderRadius:4, border:'2px solid var(--rule)', background:'transparent', cursor:'pointer', flexShrink:0, display:'grid', placeItems:'center' }}>
                      <span style={{ fontSize:10 }}></span>
                    </button>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:vencida?'oklch(0.45 0.08 20)':'var(--ink)' }}>{t.titulo}</div>
                      {t.descripcion && <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:2 }}>{t.descripcion}</div>}
                    {t.propiedad_id && propiedades.find((p:any)=>p.id===t.propiedad_id) && (
                      <div style={{ fontSize:10, color:'var(--accent)', marginTop:2 }}>
                        🏠 {(propiedades.find((p:any)=>p.id===t.propiedad_id) as any)?.titulo}
                      </div>
                    )}
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                      <span style={{ fontSize:10, fontWeight:600, color:prioColor }}>{t.prioridad.toUpperCase()}</span>
                      {t.fecha_vencimiento && <span style={{ fontSize:11, color:vencida?'oklch(0.45 0.08 20)':'var(--ink-3)' }}>{safeFmt(t.fecha_vencimiento, {month:'short',day:'numeric'})}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
    {/* Drawer detalle oferta */}
    {ofertaSel && (
      <>
        <div onClick={() => setOfertaSel(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:99 }}/>
        <div style={{ position:'fixed', top:0, right:0, bottom:0, width:440, background:'white', borderLeft:'1px solid var(--rule)', zIndex:100, overflowY:'auto', boxShadow:'-8px 0 32px rgba(0,0,0,0.1)' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:ofertaSel.tipo_vista==='enviada'?'var(--accent)':'oklch(0.45 0.08 80)', marginBottom:4 }}>
                {ofertaSel.tipo_vista==='enviada'?'Oferta enviada':'Oferta recibida'}
              </div>
              <div style={{ fontFamily:'var(--serif)', fontSize:18 }}>{ofertaSel.comprador_nombre}</div>
            </div>
            <button onClick={() => setOfertaSel(null)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', cursor:'pointer', fontSize:16, display:'grid', placeItems:'center' }}>×</button>
          </div>
          <div style={{ padding:'20px 24px' }}>
            {/* Estado */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
              <span style={{ padding:'6px 20px', borderRadius:999, fontSize:12, fontWeight:500, background:ofertaSel.estado==='pendiente'?'oklch(0.93 0.05 80)':ofertaSel.estado==='aceptada'?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:ofertaSel.estado==='pendiente'?'oklch(0.45 0.08 80)':ofertaSel.estado==='aceptada'?'var(--accent)':'var(--ink-3)' }}>
                {ofertaSel.estado}
              </span>
            </div>

            {/* Datos financieros */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Detalle financiero</div>
              {[
                { l:'Comprador', v:ofertaSel.comprador_nombre },
                { l:'Correo', v:ofertaSel.comprador_email||'—' },
                { l:'Teléfono', v:ofertaSel.comprador_telefono||'—' },
                { l:'Valor ofertado', v:'$'+Number(ofertaSel.valor_oferta||0).toLocaleString()+' USD' },
                { l:'Tipo de compra', v:ofertaSel.tipo_compra==='contado'?'Contado':'Crédito bancario' },
                ofertaSel.forma_pago ? { l:'Forma de pago', v:ofertaSel.forma_pago } : null,
                ofertaSel.banco ? { l:'Banco', v:ofertaSel.banco } : null,
                ofertaSel.pre_aprobado ? { l:'Pre-aprobación', v:'Sí' } : null,
                ofertaSel.monto_prima ? { l:'Prima', v:'$'+Number(ofertaSel.monto_prima).toLocaleString()+' USD' } : null,
                { l:'Fecha', v:new Date(ofertaSel.created_at).toLocaleDateString('es-CR',{day:'2-digit',month:'long',year:'numeric'}) },
              ].filter(Boolean).map((f:any) => (
                <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                  <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
                  <span style={{ fontWeight:500 }}>{f.v}</span>
                </div>
              ))}
            </div>

            {/* Condiciones */}
            {ofertaSel.condiciones && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Condiciones especiales</div>
                <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65, background:'var(--bg)', padding:'12px 14px', borderRadius:8, fontStyle:'italic' }}>"{ofertaSel.condiciones}"</p>
              </div>
            )}

            {/* Acciones según tipo */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>

              {/* Acciones para oferta RECIBIDA en mi propiedad */}
              {ofertaSel.tipo_vista === 'recibida' && ofertaSel.estado === 'pendiente' && (
                <>
                  <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:4 }}>Acciones</div>
                  <button onClick={() => updateOfertaEstado(ofertaSel.id, 'aceptada')} disabled={updatingOferta} style={{ padding:'12px', borderRadius:999, background:'var(--accent)', color:'white', border:'none', fontSize:13, fontWeight:500, cursor:'pointer', opacity:updatingOferta?0.6:1 }}>
                    ✓ Aceptar oferta
                  </button>
                  <button onClick={() => setShowContra(!showContra)} style={{ padding:'12px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                    ↩ Contra ofertar
                  </button>
                  {showContra && (
                    <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:10, padding:'14px' }}>
                      <div style={{ fontSize:12, fontWeight:500, marginBottom:8 }}>Monto de contra oferta (USD)</div>
                      <input value={contraOferta} onChange={e => setContraOferta(e.target.value)} placeholder="Ej. 360,000" style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--rule)', borderRadius:8, fontSize:14, fontFamily:'var(--sans)', outline:'none', marginBottom:10, boxSizing:'border-box' as const }}/>
                      <button onClick={async () => {
                        if (!contraOferta) return
                        setUpdatingOferta(true)
                        await supabase.from('ofertas').update({ estado: 'contra_oferta', condiciones: (ofertaSel.condiciones||'') + ' | Contra oferta: $'+contraOferta+' USD' }).eq('id', ofertaSel.id)
                        setOfertaSel((p:any) => ({...p, estado:'contra_oferta'}))
                        setOfertasRecibidas(prev => prev.map((o:any) => o.id===ofertaSel.id ? {...o, estado:'contra_oferta'} : o))
                        setShowContra(false)
                        setContraOferta('')
                        setUpdatingOferta(false)
                      }} disabled={updatingOferta} style={{ width:'100%', padding:'10px', borderRadius:999, background:'var(--accent)', color:'white', border:'none', fontSize:13, cursor:'pointer', fontFamily:'var(--sans)' }}>
                        Enviar contra oferta
                      </button>
                    </div>
                  )}
                  <button onClick={() => updateOfertaEstado(ofertaSel.id, 'rechazada')} disabled={updatingOferta} style={{ padding:'12px', borderRadius:999, background:'transparent', color:'var(--ink-3)', border:'1px solid var(--rule)', fontSize:13, cursor:'pointer', opacity:updatingOferta?0.6:1 }}>
                    ✗ Rechazar oferta
                  </button>
                </>
              )}

              {/* Acciones para oferta ENVIADA */}
              {ofertaSel.tipo_vista === 'enviada' && (
                <>
                  <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:4 }}>Contacto</div>
                  {ofertaSel.comprador_telefono && (
                    <a href={'https://wa.me/'+ofertaSel.comprador_telefono.replace(/[^0-9]/g,'')} target="_blank" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:999, background:'#22c55e', color:'white', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                      💬 Contactar comprador por WhatsApp
                    </a>
                  )}
                  {ofertaSel.comprador_email && (
                    <a href={'mailto:'+ofertaSel.comprador_email} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:999, border:'1px solid var(--rule)', color:'var(--ink)', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                      ✉ Enviar email al comprador
                    </a>
                  )}
                </>
              )}

              {/* Estado final */}
              {ofertaSel.estado !== 'pendiente' && (
                <div style={{ padding:'12px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--rule)', textAlign:'center', fontSize:13, color:'var(--ink-3)' }}>
                  Oferta {ofertaSel.estado} · {new Date(ofertaSel.created_at).toLocaleDateString('es-CR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}
      {/* TOUR GUIADO ASESOR */}
      {tourActivo && (() => {
        const PASOS_TOUR = [
          { titulo:'¡Bienvenido a NIDO!', desc:'Este es tu dashboard de asesor. Desde aquí gestionás tus propiedades, leads, ofertas y tu perfil profesional en una sola plataforma.', icon:'✦' },
          { titulo:'Completá tu perfil', desc:'Antes de publicar, completá tu foto, datos y verificación KYC. Un perfil completo mejora tu ranking en NIDO hasta un +40%.', icon:'👤' },
          { titulo:'Personalizá a Valeria', desc:'Valeria es tu asistente IA personal. En "Mi Valeria" configurás su estilo de comunicación, zonas y especialidades para que trabaje exactamente como vos.', icon:'✦' },
          { titulo:'Publicá tu primera propiedad', desc:'Usá el wizard de 9 pasos para cargar una propiedad con datos registrales. Pasa por verificación antes de aparecer en el portal.', icon:'🏠' },
          { titulo:'Gestioná tus leads', desc:'Cada consulta llega a tu CRM. Filtrá por estado, respondé rápido — los asesores que responden en menos de 2 horas cierran 3× más.', icon:'👥' },
          { titulo:'Enviá y recibí ofertas', desc:'Podés enviar ofertas formales a cualquier propiedad en nombre de tu comprador. Las ofertas en tus propiedades las ves en "Ofertas recibidas".', icon:'📝' },
          { titulo:'Aprendé con la Academia', desc:'Accedé a cursos, guiones y recursos para mejorar tus ventas. Los cursos básicos son gratis — el resto incluidos en tu plan Pro.', icon:'📚' },
        ]
        const paso = PASOS_TOUR[tourPaso]
        const esUltimo = tourPaso === PASOS_TOUR.length - 1
        return (
          <>
            <div onClick={() => setTourActivo(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, backdropFilter:'blur(4px)' }}/>
            <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, background:'white', borderRadius:20, padding:'32px 36px', maxWidth:440, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.2)', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:12, background:'var(--accent-tint)', display:'grid', placeItems:'center', fontSize:26 }}>{paso.icon}</div>
                <button onClick={() => setTourActivo(false)} style={{ background:'none', border:'none', fontSize:20, color:'var(--ink-3)', cursor:'pointer', padding:4 }}>×</button>
              </div>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:8 }}>
                Paso {tourPaso+1} de {PASOS_TOUR.length}
              </div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, marginBottom:10, lineHeight:1.2 }}>{paso.titulo}</h3>
              <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.7, marginBottom:24 }}>{paso.desc}</p>
              <div style={{ display:'flex', gap:6, marginBottom:20 }}>
                {PASOS_TOUR.map((_, i) => (
                  <div key={i} style={{ height:4, flex:1, borderRadius:999, background:i<=tourPaso?'var(--accent)':'var(--rule)', transition:'background 0.3s' }}/>
                ))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                {tourPaso > 0 && (
                  <button onClick={() => setTourPaso(p => p-1)} style={{ padding:'10px 20px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:13, cursor:'pointer', color:'var(--ink-2)' }}>← Anterior</button>
                )}
                <button onClick={() => esUltimo ? setTourActivo(false) : setTourPaso(p => p+1)} style={{ flex:1, padding:'11px 20px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer' }}>
                  {esUltimo ? '¡Empezar!' : 'Siguiente →'}
                </button>
              </div>
              <button onClick={() => setTourActivo(false)} style={{ display:'block', width:'100%', textAlign:'center', marginTop:12, fontSize:12, color:'var(--ink-3)', background:'none', border:'none', cursor:'pointer' }}>
                Saltar tutorial
              </button>
            </div>
          </>
        )
      })()}
    </main>
  )
}
