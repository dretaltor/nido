'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { exportToCSV } from '../../../lib/csvExport'

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


const OFERTAS_MOCK: any[] = []

export default function DashboardPropietario() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const initRef = useRef(false)
  const [tab, setTab] = useState('resumen')
  const [ofertasReales, setOfertasReales] = useState<any[]>([])
  const [propiedadesReales, setPropiedadesReales] = useState<any[]>([])
  const [leadsReales, setLeadsReales] = useState<any[]>([])
  const [visitasPorLead, setVisitasPorLead] = useState<Record<string,boolean>>({})
  const [visitasReales, setVisitasReales] = useState<any[]>([])
  const [updatingOferta, setUpdatingOferta] = useState<string|null>(null)
  const [contraModal, setContraModal] = useState<any>(null)
  const [contraValor, setContraValor] = useState('')
  const [perfilPropietario, setPerfilPropietario] = useState<any>(null)
  const [uploadingDoc, setUploadingDoc] = useState<string|null>(null)
  const [contrato, setContrato] = useState<any>(null)
  const [loadingContrato, setLoadingContrato] = useState(true)
  const [tourActivo, setTourActivo] = useState(false)
  const [tourPaso, setTourPaso] = useState(0)
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('')
  const [comparables, setComparables] = useState<any[]>([])
  const [loadingComparables, setLoadingComparables] = useState(true)
  const [feedbacksReales, setFeedbacksReales] = useState<any[]>([])
  const [referidosReales, setReferidosReales] = useState<any[]>([])
  const [refLinkCopiado, setRefLinkCopiado] = useState(false)

  const actualizarOferta = async (id: string, estado: string) => {
    setUpdatingOferta(id)
    await supabase.from('ofertas').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
    setOfertasReales(prev => prev.map((o:any) => o.id === id ? { ...o, estado } : o))
    setUpdatingOferta(null)
  }

  const enviarContraOferta = async () => {
    if (!contraModal || !contraValor) return
    setUpdatingOferta(contraModal.id)
    await supabase.from('ofertas').update({
      estado: 'contraoferta',
      contraoferta_valor: parseFloat(contraValor.replace(/[^0-9.]/g,'')),
      updated_at: new Date().toISOString()
    }).eq('id', contraModal.id)
    setOfertasReales(prev => prev.map((o:any) => o.id === contraModal.id ? { ...o, estado: 'contraoferta' } : o))
    setContraModal(null)
    setContraValor('')
    setUpdatingOferta(null)
  }

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login-propietario'); return }
      
      // Solo redirigir si explícitamente es asesor
      const tipo = user.user_metadata?.tipo
      if (tipo === 'asesor') { router.push('/dashboard'); return }

      setUser(user)
      setNombre(user.user_metadata?.nombre || user.email?.split('@')[0] || 'propietario')
      // Cargar perfil de propietario
      supabase.from('propietarios').select('id,user_id,nombre,correo,telefono,cedula,verificado,verificacion_estado,verificacion_notas,cedula_frente_url,cedula_reverso_url,selfie_url,created_at,codigo_referido,referido_por').eq('correo', user.email!).maybeSingle()
        .then(({ data }) => {
          setPerfilPropietario(data)
          // Mostrar tour si es primera visita
          const tourVisto = localStorage.getItem('nido_tour_propietario')
          if (!tourVisto) { setTourActivo(true); localStorage.setItem('nido_tour_propietario', '1') }
        })
      // Programa de referidos: quienes referi yo
      supabase.from('referidos').select('*').eq('referidor_email', user.email!).order('created_at', { ascending: false })
        .then(({ data }) => setReferidosReales(data || []))
      supabase.from('contratos').select('id,propietario_correo,propietario_nombre,propiedad_id,tipo,estado,firmado_propietario,firmado_nido,firmado_at,firma_tipo,firma_url,comision_porcentaje,created_at').eq('propietario_correo', user.email!).in('estado', ['activo','pendiente']).order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data: c }) => { setContrato(c); setLoadingContrato(false) })
      // Fetch propiedades del propietario + leads + ofertas filtradas
      supabase.from('propiedades').select('id,titulo,zona,precio,disponible,tipo,ref_id,fotos,habitaciones,banos,metros,operacion')
        .eq('propietario_email', user.email!)
        .then(({ data: props }) => {
          const propsData = props || []
          setPropiedadesReales(propsData)
          // Comparables reales de la zona (para la pestaña "Valor de mercado") — otras
          // propiedades activas y aprobadas en la misma zona, sin importar quien las publico.
          if (propsData[0]?.zona) {
            supabase.from('propiedades').select('id,precio,metros,tipo,operacion,zona')
              .eq('zona', propsData[0].zona)
              .eq('disponible', true)
              .eq('verificacion_estado', 'aprobada')
              .neq('id', propsData[0].id)
              .limit(60)
              .then(({ data: comps }) => { setComparables(comps || []); setLoadingComparables(false) })
          } else {
            setLoadingComparables(false)
          }
          if (propsData.length > 0) {
            const pids = propsData.map((p:any) => p.id)
            // Leads: solo campos no sensibles (sin email ni telefono)
            supabase.from('leads').select('id,nombre,zona_interes,tipo_busqueda,estado,created_at,propiedad_id')
              .in('propiedad_id', pids).order('created_at', { ascending: false })
              .then(({ data: leadsData }) => {
                setLeadsReales(leadsData || [])
                // Cruzar con visitas para saber si agendó (visitas no tiene lead_id, se cruza
                // por numero de telefono via RPC server-side para no exponer telefonos al dueño)
                supabase.rpc('leads_con_visita', { prop_ids: pids })
                  .then(({ data: vis }) => {
                    const mapa: Record<string,boolean> = {}
                    ;(vis || []).forEach((v:any) => { if(v.lead_id) mapa[v.lead_id] = true })
                    setVisitasPorLead(mapa)
                  })
              })
            // Ofertas filtradas por propiedades del propietario
            supabase.from('ofertas').select('id,comprador_nombre,comprador_telefono,valor_oferta,condiciones,estado,tipo_compra,propiedad_id,asesor_email,created_at').in('propiedad_id', pids)
              .order('created_at', { ascending: false })
              .then(({ data: ofData }) => setOfertasReales(ofData || []))
            // Fetch visitas del propietario
            supabase.from('visitas').select('id,propiedad_id,propiedad_titulo,comprador_nombre,fecha,hora,estado')
              .in('propiedad_id', pids).order('fecha', { ascending: true })
              .then(({ data: vis }) => setVisitasReales(vis || []))
            // Reseñas reales de visitantes sobre estas propiedades (vista publica segura)
            supabase.from('calificaciones_publicas')
              .select('calificador_nombre,calificacion,comentario,propiedad_id,created_at')
              .in('propiedad_id', pids).order('created_at', { ascending: false })
              .then(({ data: fb }) => setFeedbacksReales(fb || []))
          }
        })
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
    { id:'referidos', label:'Referidos' },
    { id:'contrato', label:'Contrato' },
    { id:'verificacion', label:'Verificación' },
    { id:'facturacion', label:'Facturación' },
    { id:'contacto', label:'Contacto NIDO' },
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
          <a href="/dashboard/propietario/perfil" style={{ fontSize:13, color:'var(--ink-3)', border:'1px solid var(--rule)', padding:'6px 14px', borderRadius:999 }}>Mi perfil</a>
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
              {propiedadesReales.map(p => (
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
              {leadsReales.length === 0 ? (
                <div style={{ padding:'16px 24px', fontSize:13, color:'var(--ink-3)' }}>Sin consultas aún.</div>
              ) : leadsReales.slice(0,2).map((l:any) => {
                const prop = propiedadesReales.find((p:any) => p.id === l.propiedad_id)
                const inicial = (l.nombre||'C')[0].toUpperCase()
                const agendó = !!visitasPorLead[l.id]
                return (
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1px solid var(--rule-soft)' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{inicial}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500 }}>{(l.nombre||'Interesado').split(' ')[0]}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{prop?.titulo||'Tu propiedad'} · {agendó ? '✓ Visita agendada' : 'Sin visita aún'}</div>
                  </div>
                  <span className="badge" style={{ background:l.estado==='nuevo'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:l.estado==='nuevo'?'oklch(0.35 0.08 240)':'var(--accent)' }}>{l.estado}</span>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PROPIEDADES */}
        {tab === 'propiedades' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400 }}>Mis propiedades</h2>
              <button onClick={() => exportToCSV('nido-propiedades-' + new Date().toISOString().split('T')[0], propiedadesReales.map((p:any) => ({
                titulo: p.titulo, zona: p.zona, precio: p.precio, disponible: p.disponible ? 'Activa' : 'Inactiva',
                tipo: p.tipo, operacion: p.operacion, ref: p.ref_id, habitaciones: p.habitaciones, banos: p.banos, metros: p.metros,
              })))} disabled={propiedadesReales.length === 0} style={{ background:'transparent', border:'1px solid var(--rule)', color:'var(--ink-2)', padding:'8px 16px', borderRadius:999, fontSize:13, cursor:propiedadesReales.length===0?'not-allowed':'pointer', opacity:propiedadesReales.length===0?0.5:1 }}>
                ⬇ Exportar CSV
              </button>
            </div>
            {propiedadesReales.length === 0 ? (
              <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>
                Aún no tenés propiedades registradas en NIDO.
              </div>
            ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
              {propiedadesReales.map((p:any) => {
                const foto = p.fotos?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=60'
                const leadsDeEsta = leadsReales.filter((l:any) => l.propiedad_id === p.id)
                const ofertasDeEsta = ofertasReales.filter((o:any) => o.propiedad_id === p.id)
                return (
                <div key={p.id} className="card">
                  <img src={foto} style={{ width:'100%', height:200, objectFit:'cover' }} alt={p.titulo}/>
                  <div className="card-pad">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:4 }}>{p.titulo}</div>
                        <div style={{ fontSize:13, color:'var(--ink-3)' }}>{p.zona}</div>
                      </div>
                      <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>{p.disponible ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:18, color:'var(--accent)', marginBottom:16 }}>${Number(p.precio||0).toLocaleString()} USD</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                      {[
                        {l:'Consultas',v:leadsDeEsta.length},
                        {l:'Ofertas recibidas',v:ofertasDeEsta.length},
                        {l:'Habitaciones',v:p.habitaciones||'—'},
                        {l:'Área',v:p.metros ? p.metros+'m²' : '—'}
                      ].map((s:any) => (
                        <div key={s.l} style={{ background:'var(--bg)', borderRadius:8, padding:'10px 12px' }}>
                          <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', marginBottom:2 }}>{s.v}</div>
                          <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <a href={'/propiedades/'+p.id} target="_blank" style={{ flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--rule)', fontSize:13, textAlign:'center', fontWeight:500, textDecoration:'none', color:'var(--ink)' }}>Ver ficha →</a>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.origin+'/propiedades/'+p.id); alert('¡Enlace copiado!') }} style={{ flex:1, padding:'10px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, cursor:'pointer', fontWeight:500 }}>🔗 Compartir</button>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
            )}
          </div>
        )}

        {/* LEADS */}
        {tab === 'leads' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400 }}>Leads de compradores</h2>
              <button onClick={() => exportToCSV('nido-leads-propietario-' + new Date().toISOString().split('T')[0], leadsReales.map((l:any) => ({
                nombre: l.nombre, propiedad: propiedadesReales.find((p:any) => p.id === l.propiedad_id)?.titulo || '',
                zona_interes: l.zona_interes, tipo_busqueda: l.tipo_busqueda, estado: l.estado, fecha: l.created_at,
              })))} disabled={leadsReales.length === 0} style={{ background:'transparent', border:'1px solid var(--rule)', color:'var(--ink-2)', padding:'8px 16px', borderRadius:999, fontSize:13, cursor:leadsReales.length===0?'not-allowed':'pointer', opacity:leadsReales.length===0?0.5:1 }}>
                ⬇ Exportar CSV
              </button>
            </div>
            <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.88 0.04 150)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'var(--accent)' }}>
              ℹ️ Solo ves el interés y la propiedad. Los datos de contacto son gestionados por tu asesor NIDO para proteger tu privacidad.
            </div>
            <div className="card">
              {leadsReales.length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>
                  Aún no hay consultas en tus propiedades.
                </div>
              ) : leadsReales.map((l:any,i:number) => {
                const prop = propiedadesReales.find((p:any) => p.id === l.propiedad_id)
                const inicial = (l.nombre || 'C')[0].toUpperCase()
                const nombreCorto = (l.nombre || 'Comprador').split(' ').map((n:string, idx:number) => idx===0 ? n[0]+'.' : n).join(' ')
                const hace = new Date(l.created_at)
                const diff = Math.floor((Date.now()-hace.getTime())/(1000*3600))
                const cuandoFue = diff < 1 ? 'Hace menos de 1h' : diff < 24 ? `Hace ${diff}h` : `Hace ${Math.floor(diff/24)} día${Math.floor(diff/24)>1?'s':''}`
                return (
                  <div key={l.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px', borderBottom:i<leadsReales.length-1?'1px solid var(--rule-soft)':'none' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:18, color:'var(--accent)', flexShrink:0 }}>{inicial}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{(l.nombre||'Interesado').split(' ')[0]}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{prop?.titulo || 'Tu propiedad'} · {cuandoFue}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:999, background: visitasPorLead[l.id] ? 'var(--accent-tint)' : 'oklch(0.93 0.005 80)', color: visitasPorLead[l.id] ? 'var(--accent)' : 'var(--ink-3)', fontWeight:500 }}>
                        {visitasPorLead[l.id] ? '✓ Visita agendada' : 'Sin visita'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* VISITAS */}
        {tab === 'visitas' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Visitas agendadas</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {visitasReales.length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>Sin visitas agendadas aún.</div>
              ) : visitasReales.map((v:any) => (
                <div key={v.id} className="card card-pad" style={{ display:'flex', alignItems:'center', gap:20 }}>
                  <div style={{ width:60, height:60, borderRadius:10, background:v.estado==='confirmada'?'var(--accent-tint)':'oklch(0.93 0.05 80)', display:'grid', placeItems:'center', flexShrink:0 }}>
                    <span style={{ fontSize:24 }}>{v.estado==='confirmada'?'✓':'⏳'}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{v.comprador_nombre || 'Interesado'}</div>
                    <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:4 }}>{v.propiedad_titulo || 'Tu propiedad'}</div>
                    <div style={{ fontSize:13, color:'var(--ink-2)' }}>{v.fecha} {v.hora ? '· '+v.hora : ''}</div>
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
            {feedbacksReales.length === 0 ? (
              <div className="card card-pad" style={{ textAlign:'center', padding:'40px 20px', color:'var(--ink-3)', fontSize:14 }}>
                Todavía no tenés feedbacks de visitas. Cuando un comprador visite tu propiedad, le pedimos su opinión y aparecerá acá.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {feedbacksReales.map((f, i) => {
                  const prop = propiedadesReales.find((p:any) => p.id === f.propiedad_id)
                  const nombre = f.calificador_nombre || 'Visitante anónimo'
                  const fecha = f.created_at ? new Date(f.created_at).toLocaleDateString('es-CR', { day:'numeric', month:'short' }) : ''
                  return (
                    <div key={i} className="card card-pad">
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{nombre[0]}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:500 }}>{nombre}</div>
                          <div style={{ fontSize:12, color:'var(--ink-3)' }}>{prop?.titulo || 'Tu propiedad'} · {fecha}</div>
                        </div>
                        <div style={{ display:'flex', gap:2 }}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:16, color:s<=f.calificacion?'#C8A96E':'var(--rule)' }}>★</span>)}
                        </div>
                      </div>
                      {f.comentario && (
                        <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65, background:'var(--bg)', padding:'12px 14px', borderRadius:8, fontStyle:'italic' }}>"{f.comentario}"</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* OFERTAS */}
        {tab === 'ofertas' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Ofertas recibidas</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {ofertasReales.map(o => (
                <div key={o.id} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden', transition:'all 0.2s' }}>
                  {/* Header oferta */}
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--rule-soft)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:18, color:'var(--accent)', flexShrink:0 }}>
                        {(o.comprador_nombre||'?')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:500 }}>{o.comprador_nombre}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{new Date(o.created_at).toLocaleDateString('es-CR', {day:'2-digit',month:'long',year:'numeric'})}</div>
                      </div>
                    </div>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500, background:o.estado==='pendiente'?'oklch(0.93 0.05 80)':o.estado==='aceptada'?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:o.estado==='pendiente'?'oklch(0.45 0.08 80)':o.estado==='aceptada'?'var(--accent)':'var(--ink-3)' }}>
                      {o.estado}
                    </span>
                  </div>

                  {/* Detalle financiero */}
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--rule-soft)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:o.condiciones?16:0 }}>
                      <div style={{ background:'var(--bg)', borderRadius:8, padding:'12px' }}>
                        <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Monto ofertado</div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:20, color:'var(--accent)', fontWeight:500 }}>${Number(o.valor_oferta||0).toLocaleString()}</div>
                        <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:2 }}>USD</div>
                      </div>
                      <div style={{ background:'var(--bg)', borderRadius:8, padding:'12px' }}>
                        <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Tipo de compra</div>
                        <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:2 }}>{o.tipo_compra === 'contado' ? 'Contado' : 'Crédito bancario'}</div>
                        <div style={{ fontSize:11, color:'var(--ink-3)' }}>{o.forma_pago || (o.pre_aprobado ? 'Pre-aprobado' : 'Sin pre-aprobación')}</div>
                      </div>
                      <div style={{ background:'var(--bg)', borderRadius:8, padding:'12px' }}>
                        <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>
                          {o.tipo_compra === 'credito' ? 'Prima / Banco' : 'Forma de pago'}
                        </div>
                        <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:2 }}>
                          {o.tipo_compra === 'credito' ? (o.monto_prima ? '$'+Number(o.monto_prima).toLocaleString() : 'Sin prima') : (o.forma_pago === 'transferencia' ? 'Transferencia' : 'Cheque gerencia')}
                        </div>
                        <div style={{ fontSize:11, color:'var(--ink-3)' }}>
                          {o.banco || ''}
                        </div>
                      </div>
                    </div>

                    {o.condiciones && (
                      <div style={{ background:'oklch(0.97 0.03 80)', border:'1px solid oklch(0.90 0.02 80)', borderRadius:8, padding:'12px 14px', marginTop:8 }}>
                        <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Condiciones especiales del comprador</div>
                        <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.6, fontStyle:'italic' }}>"{o.condiciones}"</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {o.estado === 'pendiente' && (
                    <div style={{ padding:'14px 20px', display:'flex', gap:10, background:'var(--bg-elev)' }}>
                      <button onClick={() => { if(window.confirm('¿Aceptar esta oferta de $'+Number(o.valor_oferta||0).toLocaleString()+'?')) actualizarOferta(o.id,'aceptada') }} disabled={updatingOferta===o.id} style={{ flex:1, padding:'10px', borderRadius:999, background:'var(--accent)', color:'white', border:'none', fontSize:13, cursor:'pointer', fontWeight:500, opacity:updatingOferta===o.id?0.6:1 }}>
                        {updatingOferta===o.id ? '...' : '✓ Aceptar oferta'}
                      </button>
                      <button onClick={() => { if(window.confirm('¿Rechazar esta oferta?')) actualizarOferta(o.id,'rechazada') }} disabled={updatingOferta===o.id} style={{ flex:1, padding:'10px', borderRadius:999, background:'transparent', color:'var(--ink-3)', border:'1px solid var(--rule)', fontSize:13, cursor:'pointer', opacity:updatingOferta===o.id?0.6:1 }}>
                        ✗ Rechazar
                      </button>
                      <button onClick={() => { setContraModal(o); setContraValor('') }} disabled={updatingOferta===o.id} style={{ flex:1, padding:'10px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, cursor:'pointer', opacity:updatingOferta===o.id?0.6:1 }}>
                        ↩ Contraoferta
                      </button>
                    </div>
                  )}
                  {o.estado !== 'pendiente' && (
                    <div style={{ padding:'12px 20px', background:'var(--bg-elev)', display:'flex', justifyContent:'center' }}>
                      <span style={{ fontSize:12, color:'var(--ink-3)' }}>Oferta {o.estado}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MERCADO */}
        {tab === 'mercado' && (() => {
          const propia = propiedadesReales[0]
          // Preferimos comparables del mismo tipo (casa/apartamento/etc); si hay muy pocos, usamos todos los de la zona.
          const compsMismoTipo = propia?.tipo ? comparables.filter(c => c.tipo === propia.tipo) : comparables
          const comps = compsMismoTipo.length >= 3 ? compsMismoTipo : comparables
          const precios = comps.map((c:any) => c.precio).filter((p:any) => p > 0)
          const precioMercado = precios.length ? Math.round(precios.reduce((a:number,b:number)=>a+b,0)/precios.length) : null
          const precioM2s = comps.filter((c:any) => c.metros > 0).map((c:any) => c.precio / c.metros)
          const precioM2Zona = precioM2s.length ? Math.round(precioM2s.reduce((a:number,b:number)=>a+b,0)/precioM2s.length) : null
          const precioM2Propia = propia?.metros ? Math.round(propia.precio / propia.metros) : null
          const minPrecio = precios.length ? Math.min(...precios) : null
          const maxPrecio = precios.length ? Math.max(...precios) : null
          const demanda = comps.length >= 6 ? 'Alta' : comps.length >= 2 ? 'Media' : 'Insuficiente'
          const diffPct = precioMercado && propia?.precio ? Math.round(((propia.precio - precioMercado) / precioMercado) * 1000) / 10 : null

          if (!propia) return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Valor de mercado</h2>
              <p style={{ fontSize:14, color:'var(--ink-3)' }}>Publicá tu propiedad para ver un análisis de mercado.</p>
            </div>
          )

          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:4 }}>Valor de mercado</h2>
            <p style={{ fontSize:12, color:'var(--ink-3)', marginBottom:20 }}>
              {loadingComparables ? 'Calculando comparables...' : comps.length > 0 ? `Basado en ${comps.length} propiedad${comps.length===1?'':'es'} activa${comps.length===1?'':'s'} en ${propia.zona}` : `Todavía no hay suficientes propiedades comparables publicadas en ${propia.zona}`}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <div className="card card-pad">
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Tu propiedad</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:48, color:'var(--accent)', marginBottom:4 }}>${(propia.precio||0).toLocaleString()}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Precio de lista actual</div>
              </div>
              <div className="card card-pad">
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Promedio de zona</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:48, color:'var(--ink)', marginBottom:4 }}>{precioMercado ? '$'+precioMercado.toLocaleString() : '—'}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Propiedades similares en {propia.zona || 'tu zona'}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'Precio por m²', val: precioM2Propia ? '$'+precioM2Propia.toLocaleString()+' USD' : '—', sub: precioM2Zona ? 'Zona: $'+precioM2Zona.toLocaleString() : 'Sin datos de m² en la zona' },
                { label:'Diferencia vs. zona', val: diffPct !== null ? (diffPct>0?'+':'')+diffPct+'%' : '—', sub: diffPct !== null ? (diffPct>0?'Por encima del promedio':'Por debajo del promedio') : 'Sin comparables suficientes' },
                { label:'Demanda de zona', val: demanda, sub: propia.zona+' · '+new Date().getFullYear() },
                { label:'Rango de precios', val: minPrecio&&maxPrecio ? '$'+(minPrecio/1000).toFixed(0)+'k–$'+(maxPrecio/1000).toFixed(0)+'k' : '—', sub:'En comparables activos' },
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
                <div style={{ fontSize:13, fontWeight:500, color:'var(--accent)' }}>¿Querés una lectura personalizada?</div>
              </div>
              <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65, marginBottom:12 }}>
                Estos números son un cálculo directo sobre las propiedades activas en tu zona — no un avalúo formal. Valeria puede darte una recomendación de precio y estrategia según tu caso específico.
              </p>
              <a href="/dashboard/propietario/valeria" style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>Hablar con Valeria →</a>
            </div>
          </div>
          )
        })()}

        {/* TOUR GUIADO */}
      {tourActivo && (() => {
        const PASOS_TOUR = [
          { titulo:'¡Bienvenido a NIDO!', desc:'Este es tu panel de propietario. Desde aquí gestionás tu propiedad, revisás los interesados y seguís todo el proceso de venta.', icon:'🏠', target:'inicio' },
          { titulo:'Verificá tu identidad', desc:'Antes de publicar tu propiedad necesitás verificar tu identidad. Subí tu cédula y selfie en la pestaña "Verificación" — tu asesor NIDO te contactará en 24 horas.', icon:'🪪', target:'verificacion' },
          { titulo:'Cargá tu propiedad', desc:'Una vez verificado, podés cargar los datos de tu propiedad con el wizard guiado de 9 pasos. Incluye datos registrales, fotos y descripción.', icon:'📋', target:'propiedades' },
          { titulo:'Seguí tus leads', desc:'En la pestaña "Leads" ves todos los interesados que consultaron tu propiedad. Los contactos van protegidos — el asesor NIDO los califica antes.', icon:'👥', target:'leads' },
          { titulo:'Revisá las ofertas', desc:'Cuando alguien esté listo para comprar, su asesor envía una oferta formal. La ves en detalle en "Ofertas" y podés aceptar, rechazar o contraofertar.', icon:'📝', target:'ofertas' },
          { titulo:'Tu asesor NIDO', desc:'Tenés un asesor dedicado que coordina todo el proceso. Podés contactarlo directamente por email desde la pestaña "Contacto NIDO".', icon:'🤝', target:'fin' },
        ]
        const paso = PASOS_TOUR[tourPaso]
        const esUltimo = tourPaso === PASOS_TOUR.length - 1
        return (
          <>
            <div onClick={() => setTourActivo(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, backdropFilter:'blur(4px)' }}/>
            <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, background:'white', borderRadius:20, padding:'32px 36px', maxWidth:440, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.2)', animation:'fadeUp 0.3s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:12, background:'var(--accent-tint)', display:'grid', placeItems:'center', fontSize:26 }}>{paso.icon}</div>
                <button onClick={() => setTourActivo(false)} style={{ background:'none', border:'none', fontSize:20, color:'var(--ink-3)', cursor:'pointer', padding:4 }}>×</button>
              </div>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:8 }}>
                Paso {tourPaso+1} de {PASOS_TOUR.length}
              </div>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:10, lineHeight:1.2 }}>{paso.titulo}</h3>
              <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.7, marginBottom:24 }}>{paso.desc}</p>
              <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                {PASOS_TOUR.map((_, i) => (
                  <div key={i} style={{ height:4, flex:1, borderRadius:999, background:i<=tourPaso?'var(--accent)':'var(--rule)', transition:'background 0.3s' }}/>
                ))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                {tourPaso > 0 && (
                  <button onClick={() => setTourPaso(p => p-1)} style={{ padding:'10px 20px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:13, cursor:'pointer', color:'var(--ink-2)' }}>← Anterior</button>
                )}
                <button onClick={() => { if(esUltimo) { setTourActivo(false); if(paso.target!=='fin') setTab(paso.target) } else { setTourPaso(p => p+1) } }} style={{ flex:1, padding:'11px 20px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer' }}>
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

      {/* VERIFICACIÓN */}
        {tab === 'verificacion' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Verificación de identidad</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:24, lineHeight:1.6 }}>Para publicar tu propiedad necesitamos verificar tu identidad. Un asesor NIDO revisará tus documentos y te contactará para coordinar una llamada o visita.</p>

            {/* Estado actual */}
            <div style={{ marginBottom:20, padding:'14px 18px', borderRadius:10, background:
              perfilPropietario?.verificacion_estado === 'aprobado' ? 'var(--accent-tint)' :
              perfilPropietario?.verificacion_estado === 'rechazado' ? 'oklch(0.97 0.03 20)' :
              perfilPropietario?.verificacion_estado === 'en_revision' ? 'oklch(0.93 0.05 80)' :
              'oklch(0.93 0.005 80)',
              border: '1px solid ' + (
                perfilPropietario?.verificacion_estado === 'aprobado' ? 'oklch(0.85 0.04 150)' :
                perfilPropietario?.verificacion_estado === 'rechazado' ? 'oklch(0.85 0.06 20)' :
                perfilPropietario?.verificacion_estado === 'en_revision' ? 'oklch(0.88 0.05 80)' :
                'var(--rule)')
            }}>
              <div style={{ fontSize:14, fontWeight:500, color:
                perfilPropietario?.verificacion_estado === 'aprobado' ? 'var(--accent)' :
                perfilPropietario?.verificacion_estado === 'rechazado' ? 'oklch(0.45 0.08 20)' :
                perfilPropietario?.verificacion_estado === 'en_revision' ? 'oklch(0.45 0.08 80)' :
                'var(--ink-3)'
              }}>
                {perfilPropietario?.verificacion_estado === 'aprobado' ? '✓ Identidad verificada — podés publicar propiedades' :
                 perfilPropietario?.verificacion_estado === 'rechazado' ? '✗ Verificación rechazada — revisá las notas abajo' :
                 perfilPropietario?.verificacion_estado === 'en_revision' ? '⏳ Documentos en revisión — te contactaremos pronto' :
                 'Pendiente — subí tus documentos para comenzar'}
              </div>
              {perfilPropietario?.verificacion_notas && (
                <p style={{ fontSize:13, color:'var(--ink-2)', marginTop:8, lineHeight:1.6 }}>
                  Nota del revisor: {perfilPropietario.verificacion_notas}
                </p>
              )}
            </div>

            {/* Documentos */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
              {[
                { key:'cedula_frente', label:'Cédula — Frente', desc:'Foto clara del frente de tu cédula de identidad', icon:'🪪' },
                { key:'cedula_reverso', label:'Cédula — Reverso', desc:'Foto clara del reverso de tu cédula de identidad', icon:'🪪' },
                { key:'selfie', label:'Selfie con cédula', desc:'Foto tuya sosteniendo tu cédula visible', icon:'🤳' },
              ].map(doc => {
                const url = perfilPropietario?.[doc.key + '_url']
                return (
                  <div key={doc.key} style={{ border:'1px solid var(--rule)', borderRadius:10, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, background: url ? 'var(--accent-tint)' : 'white' }}>
                    <div style={{ width:44, height:44, borderRadius:8, background: url ? 'var(--accent)' : 'var(--bg)', display:'grid', placeItems:'center', fontSize:20, flexShrink:0 }}>
                      {url ? '✓' : doc.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{doc.label}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{url ? 'Documento subido ✓' : doc.desc}</div>
                    </div>
                    <div>
                      <label style={{ padding:'8px 16px', borderRadius:999, background: url ? 'var(--bg)' : 'var(--ink)', color: url ? 'var(--ink-2)' : 'white', fontSize:13, fontWeight:500, cursor:'pointer', border: url ? '1px solid var(--rule)' : 'none' }}>
                        {uploadingDoc === doc.key ? 'Subiendo...' : url ? 'Cambiar' : 'Subir'}
                        <input type="file" accept="image/*" style={{ display:'none' }} onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file || !user) return
                          setUploadingDoc(doc.key)
                          try {
                            const { data: { session } } = await supabase.auth.getSession()
                            const fd = new FormData()
                            fd.append('file', file)
                            fd.append('tipo', doc.key + '_prop')
                            const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
                            const json = await res.json()
                            if (!res.ok) throw new Error(json.error || 'Error al subir')
                            const publicUrl = json.publicUrl
                            const update: any = { [doc.key + '_url']: publicUrl, verificacion_estado: 'en_revision' }
                            await supabase.from('propietarios').update(update).eq('correo', user.email!)
                            setPerfilPropietario((p:any) => ({ ...p, [doc.key + '_url']: publicUrl, verificacion_estado: 'en_revision' }))
                          } catch (err: any) {
                            alert('Error al subir documento: ' + err.message)
                          } finally {
                            setUploadingDoc(null)
                          }
                        }}/>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Agendar llamada */}
            <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:12, padding:'20px 24px' }}>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:8 }}>¿Necesitás ayuda o querés agendar una llamada?</div>
              <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6, marginBottom:16 }}>Un asesor NIDO te contactará en las próximas 24 horas hábiles. También podés escribirnos directamente.</p>
              <div style={{ display:'flex', gap:10 }}>
                <a href="mailto:hola@nido-cr.com?subject=Verificación de propietario NIDO" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                  ✉ Enviar email
                </a>
              </div>
            </div>
          </div>
        )}

        {/* FACTURACIÓN */}
        {!loadingContrato && !contrato && tab !== 'contrato' && (
          <div style={{ marginBottom:20, background:'var(--ink)', borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:6 }}>Acción requerida</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:20, color:'white', fontWeight:400, marginBottom:4 }}>Activá tu cuenta firmando el contrato.</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>Sin contrato no podés publicar ni recibir leads. Sin costo previo — solo pagás si vendemos.</div>
            </div>
            <a href="/dashboard/propietario/contrato" style={{ padding:'11px 22px', borderRadius:999, background:'oklch(0.42 0.06 150)', color:'white', fontSize:14, fontWeight:500, textDecoration:'none', flexShrink:0 }}>Firmar contrato →</a>
          </div>
        )}
        {!loadingContrato && contrato?.estado === 'pendiente' && tab !== 'contrato' && (
          <div style={{ marginBottom:20, background:'oklch(0.93 0.05 80)', border:'1px solid oklch(0.88 0.05 80)', borderRadius:12, padding:'16px 20px', display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ fontSize:20 }}>⏳</span>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'oklch(0.40 0.08 80)' }}>Contrato en revisión — te notificamos en 24 horas hábiles.</div>
              <div style={{ fontSize:12, color:'oklch(0.45 0.06 80)' }}>Un asesor NIDO lo contrafirmará pronto.</div>
            </div>
            <a href="mailto:hola@nido-cr.com?subject=Contrato en revisión" style={{ marginLeft:'auto', padding:'8px 14px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:12, fontWeight:500, textDecoration:'none', flexShrink:0 }}>✉ Escribirnos</a>
          </div>
        )}

        {tab === 'referidos' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Programa de referidos</h2>
            <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6, marginBottom:24 }}>
              Compartí tu link con otros propietarios o asesores. Cuando se registren en NIDO usando tu código, aparecen acá y el equipo NIDO revisa y aprueba la recompensa.
            </p>
            <div className="card card-pad" style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Tu código de referido</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--accent)', letterSpacing:'0.04em' }}>{perfilPropietario?.codigo_referido || '—'}</div>
                <button
                  onClick={() => {
                    if (!perfilPropietario?.codigo_referido) return
                    navigator.clipboard.writeText('https://www.nido-cr.com/registro-propietario?ref=' + perfilPropietario.codigo_referido)
                    setRefLinkCopiado(true)
                    setTimeout(() => setRefLinkCopiado(false), 2500)
                  }}
                  style={{ padding:'8px 18px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}
                >
                  {refLinkCopiado ? '✓ Copiado' : 'Copiar link para compartir'}
                </button>
              </div>
              <p style={{ fontSize:12, color:'var(--ink-3)', marginTop:10 }}>
                https://www.nido-cr.com/registro-propietario?ref={perfilPropietario?.codigo_referido || '...'}
              </p>
            </div>

            <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:400, marginBottom:14 }}>Tus referidos</h3>
            {referidosReales.length === 0 ? (
              <div className="card card-pad" style={{ textAlign:'center', padding:'40px 20px', color:'var(--ink-3)', fontSize:14 }}>
                Todavía no referiste a nadie. Compartí tu link para empezar a ganar recompensas.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {referidosReales.map(r => {
                  const badgeStyle = r.estado==='pagado' ? { background:'var(--accent-tint)', color:'var(--accent)' }
                    : r.estado==='aprobado' ? { background:'oklch(0.93 0.05 150)', color:'oklch(0.40 0.08 150)' }
                    : r.estado==='rechazado' ? { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }
                    : { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }
                  const estadoLabel: Record<string,string> = { pendiente:'Pendiente de revisión', aprobado:'Aprobado', rechazado:'Rechazado', pagado:'Recompensa pagada' }
                  return (
                    <div key={r.id} className="card card-pad" style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(r.referido_nombre||r.referido_email)[0].toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500 }}>{r.referido_nombre || r.referido_email}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{r.referido_tipo === 'asesor' ? 'Asesor' : 'Propietario'} · {new Date(r.created_at).toLocaleDateString('es-CR')}</div>
                      </div>
                      {r.recompensa_monto ? <div style={{ fontSize:13, color:'var(--ink-2)', fontWeight:500 }}>${r.recompensa_monto}</div> : null}
                      <span className="badge" style={badgeStyle}>{estadoLabel[r.estado] || r.estado}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'contrato' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Mi contrato</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.65, marginBottom:24 }}>Gestioná tu contrato de servicios con NIDO. Sin contrato activo no podés publicar ni recibir leads.</p>

            {!contrato ? (
              <div style={{ background:'var(--ink)', borderRadius:16, padding:'32px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'white', fontWeight:400, marginBottom:12 }}>Sin contrato activo</div>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:440, margin:'0 auto 24px' }}>
                  Firmá un contrato de corretaje con NIDO para publicar tu propiedad y empezar a recibir compradores calificados. Sin costo previo — solo pagás si vendemos.
                </p>
                <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginBottom:24 }}>
                  {[
                    { icon:'🎯', t:'Compradores calificados' },
                    { icon:'📊', t:'Dashboard en tiempo real' },
                    { icon:'⚖️', t:'Asesoría legal incluida' },
                    { icon:'📣', t:'Marketing en redes' },
                  ].map((b:any) => (
                    <div key={b.t} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.6)' }}>
                      <span>{b.icon}</span> {b.t}
                    </div>
                  ))}
                </div>
                <a href="/dashboard/propietario/contrato" style={{ display:'inline-block', padding:'13px 32px', borderRadius:999, background:'oklch(0.42 0.06 150)', color:'white', fontSize:15, fontWeight:500, textDecoration:'none' }}>
                  Firmar contrato ahora →
                </a>
                <div style={{ marginTop:16, fontSize:12, color:'rgba(255,255,255,0.3)' }}>
                  Exclusividad 90 días · 4% solo al cerrar · Sin costo si no vendemos
                </div>
              </div>
            ) : contrato.estado === 'pendiente' ? (
              <div style={{ background:'oklch(0.93 0.05 80)', border:'1px solid oklch(0.88 0.05 80)', borderRadius:14, padding:'28px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8, color:'oklch(0.40 0.08 80)' }}>Contrato en revisión</div>
                <p style={{ fontSize:14, color:'oklch(0.45 0.06 80)', lineHeight:1.7, maxWidth:440, margin:'0 auto 20px' }}>
                  Recibimos tu firma. Un asesor NIDO lo revisará y contrafirmará en las próximas 24 horas hábiles. Te notificaremos por correo cuando esté activo.
                </p>
                <a href="mailto:hola@nido-cr.com?subject=Contrato en revisión" style={{ display:'inline-block', padding:'11px 24px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:14, fontWeight:500, textDecoration:'none' }}>
                  ✉ Contactar equipo NIDO
                </a>
              </div>
            ) : (
              <div>
                <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:14, padding:'24px 28px', marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:8 }}>✓ Contrato activo</div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, marginBottom:6 }}>
                        {contrato.tipo === 'no_exclusivo' ? 'Sin exclusividad · push de venta' : 'Exclusividad 90 días'}
                      </div>
                      <div style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.7 }}>
                        {contrato.tipo === 'no_exclusivo'
                          ? <>Inicio: {contrato.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString('es-CR') : '—'} · Sin fecha de vencimiento</>
                          : <>Inicio: {contrato.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString('es-CR') : '—'} · Vence: {contrato.fecha_vencimiento ? new Date(contrato.fecha_vencimiento).toLocaleDateString('es-CR') : '—'}</>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:36, color:'var(--accent)' }}>
                        4%
                      </div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>
                        comisión al cierre
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                  {[
                    { l:'Tipo de contrato', v: contrato.tipo === 'no_exclusivo' ? 'Sin exclusividad · push de venta' : 'Exclusividad 90 días' },
                    { l:'Estado', v:'Activo ✓' },
                    { l:'Comisión', v:contrato.comision_porcentaje+'% al cierre' },
                    { l:'Firma', v:contrato.firma_tipo === 'digital' ? 'Digital' : 'Física escaneada' },
                  ].map((f:any) => (
                    <div key={f.l} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:10, padding:'14px 18px' }}>
                      <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>{f.l}</div>
                      <div style={{ fontSize:15, fontWeight:500 }}>{f.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'20px 24px' }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>
                    {contrato.tipo === 'no_exclusivo' ? 'Podés en cualquier momento:' : 'Al vencer el contrato podés:'}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <a href="/dashboard/propietario/contrato" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, textDecoration:'none', color:'var(--ink)', transition:'all 0.2s' }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>
                          {contrato.tipo === 'no_exclusivo' ? 'Volver a exclusividad 90 días' : 'Renovar exclusividad 90 días'}
                        </div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>Mismas condiciones · 4% solo al cierre</div>
                      </div>
                      <span style={{ color:'var(--accent)' }}>→</span>
                    </a>
                    {contrato.tipo !== 'no_exclusivo' && (
                      <a href="/dashboard/propietario/contrato?modo=no_exclusivo" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, textDecoration:'none', color:'var(--ink)', transition:'all 0.2s' }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>Continuar sin exclusividad (push de venta)</div>
                          <div style={{ fontSize:12, color:'var(--ink-3)' }}>Sin costo de suscripción · 4% solo si vendemos nosotros</div>
                        </div>
                        <span style={{ color:'var(--accent)' }}>→</span>
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize:12, color:'var(--ink-3)', marginTop:12 }}>NIDO no ofrece planes de suscripción para propietarios — el único modelo es el corretaje con comisión al cierre.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    
        {/* FACTURACIÓN */}
        {tab === 'facturacion' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Facturación</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:24 }}>Tu plan y contrato activo con NIDO.</p>
            {loadingContrato ? (
              <p style={{ color:'var(--ink-3)', fontSize:14 }}>Cargando...</p>
            ) : !contrato ? (
              <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.88 0.04 150)', borderRadius:14, padding:'28px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, marginBottom:8 }}>Sin contrato activo</div>
                <p style={{ fontSize:14, color:'var(--ink-3)', marginBottom:20 }}>Firmá un contrato para activar tu facturación.</p>
                <a href="/dashboard/propietario/contrato" style={{ display:'inline-block', padding:'12px 28px', borderRadius:999, background:'var(--accent)', color:'white', fontSize:14, fontWeight:500, textDecoration:'none' }}>Firmar contrato →</a>
              </div>
            ) : (() => {
              const inicio = contrato.fecha_inicio ? new Date(contrato.fecha_inicio+'T12:00:00') : null
              const venc = contrato.fecha_vencimiento ? new Date(contrato.fecha_vencimiento+'T12:00:00') : null
              const hoy = new Date()
              const diasRestantes = venc ? Math.max(0, Math.ceil((venc.getTime()-hoy.getTime())/(1000*3600*24))) : null
              const totalDias = contrato.periodo_dias || 90
              const progreso = diasRestantes !== null ? Math.round(((totalDias-diasRestantes)/totalDias)*100) : 0
              return (
                <div>
                  <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'24px 28px', marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                      <div>
                        <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--ink-3)', marginBottom:4 }}>Tipo de contrato</div>
                        <div style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, color:'var(--ink)' }}>
                          {contrato.tipo === 'no_exclusivo' ? 'Sin exclusividad · push de venta' : 'Exclusividad 90 días'}
                        </div>
                      </div>
                      <span style={{ padding:'6px 16px', borderRadius:999, fontSize:12, fontWeight:500, background:contrato.estado==='activo'?'var(--accent-tint)':'oklch(0.93 0.05 80)', color:contrato.estado==='activo'?'var(--accent)':'oklch(0.45 0.08 80)' }}>
                        {contrato.estado === 'activo' ? '✓ Activo' : '⏳ En revisión'}
                      </span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
                      {[
                        { label:'Comisión acordada', val: (contrato.comision_porcentaje||4)+'% al cerrar' },
                        { label:'Inicio', val: inicio ? inicio.toLocaleDateString('es-CR',{day:'2-digit',month:'short',year:'numeric'}) : '—' },
                        { label:'Vencimiento', val: venc ? venc.toLocaleDateString('es-CR',{day:'2-digit',month:'short',year:'numeric'}) : '—' },
                      ].map(m => (
                        <div key={m.label} style={{ background:'var(--bg)', borderRadius:10, padding:'14px 16px' }}>
                          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--ink-3)', marginBottom:6 }}>{m.label}</div>
                          <div style={{ fontSize:15, fontWeight:500 }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                    {diasRestantes !== null && (
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <span style={{ fontSize:12, color:'var(--ink-3)' }}>Tiempo transcurrido</span>
                          <span style={{ fontSize:12, fontWeight:500, color: diasRestantes < 15 ? 'oklch(0.52 0.12 30)' : 'var(--accent)' }}>
                            {diasRestantes} días restantes
                          </span>
                        </div>
                        <div style={{ height:6, background:'var(--rule)', borderRadius:999, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:progreso+'%', background: diasRestantes < 15 ? 'oklch(0.52 0.12 30)' : 'var(--accent)', borderRadius:999, transition:'width 0.6s ease' }}/>
                        </div>
                      </div>
                    )}
                  </div>
                  {contrato.firma_url && (
                    <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                      <div>
                        <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--ink-3)', marginBottom:4 }}>Documento firmado</div>
                        <div style={{ fontSize:14, fontWeight:500 }}>Contrato de corretaje · {contrato.firma_tipo === 'digital' ? 'Firma digital GAUDI' : 'Firma física'}</div>
                      </div>
                      <a href={contrato.firma_url} target="_blank" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                        📄 Ver documento
                      </a>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* CONTACTO NIDO */}
        {tab === 'contacto' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Contacto con NIDO</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.65, marginBottom:24, maxWidth:640 }}>
              Una vez que publicás tu propiedad, queda a disposición del equipo NIDO para gestionar su venta: coordinamos visitas, calificamos leads, negociamos ofertas y te acompañamos hasta el cierre. Si tenés cualquier duda o necesitás resolver un detalle sobre tu propiedad, escribinos directamente.
            </p>
            <div className="card card-pad" style={{ marginBottom:20, maxWidth:420 }}>
              <div style={{ fontSize:28, marginBottom:10 }}>✉️</div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:6 }}>Correo electrónico</div>
              <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6, marginBottom:16 }}>Escribinos con cualquier duda o detalle sobre tu propiedad — te respondemos en menos de 24 horas hábiles.</p>
              <a href="mailto:hola@nido-cr.com?subject=Consulta%20de%20propietario" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                ✉ hola@nido-cr.com
              </a>
            </div>
            <div className="card card-pad" style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--accent)', marginBottom:6 }}>¿Buscás una respuesta rápida sobre valor de mercado u otra duda general?</div>
              <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.6, marginBottom:12 }}>Valeria IA puede orientarte al instante sobre el valor de tu propiedad, tiempos de venta y el proceso con NIDO.</p>
              <a href="/dashboard/propietario/valeria" style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>Hablar con Valeria →</a>
            </div>
          </div>
        )}

      {/* Modal contraoferta */}
      {contraModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:'white', borderRadius:16, padding:32, maxWidth:420, width:'100%' }}>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, marginBottom:8 }}>Enviar contraoferta</h3>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:20 }}>Oferta original: <strong>${Number(contraModal.valor_oferta||0).toLocaleString()}</strong></p>
            <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Tu contraoferta (USD)</label>
            <input
              type="number"
              value={contraValor}
              onChange={e => setContraValor(e.target.value)}
              placeholder="Ej: 350000"
              style={{ width:'100%', padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, fontSize:15, marginBottom:20, fontFamily:'var(--sans)', outline:'none' }}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setContraModal(null); setContraValor('') }} style={{ flex:1, padding:'12px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:14, cursor:'pointer' }}>Cancelar</button>
              <button onClick={enviarContraOferta} disabled={!contraValor || updatingOferta===contraModal.id} style={{ flex:1, padding:'12px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer', opacity:(!contraValor||updatingOferta===contraModal.id)?0.6:1 }}>
                {updatingOferta===contraModal.id ? 'Enviando...' : 'Enviar contraoferta →'}
              </button>
            </div>
          </div>
        </div>
      )}
</main>
  )
}
