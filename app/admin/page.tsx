'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .sidebar-link{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.15s;border:none;background:transparent;width:100%;text-align:left;font-family:var(--sans)}
  .sidebar-link:hover{background:rgba(255,255,255,0.06);color:white}
  .sidebar-link.active{background:rgba(255,255,255,0.1);color:white}
  .card{background:white;border:1px solid var(--rule);border-radius:12px}
  .card-pad{padding:20px 24px}
  .badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:500}
  .tab{padding:7px 16px;border-radius:999px;border:1px solid var(--rule);font-size:12px;cursor:pointer;transition:all 0.15s;background:transparent;font-family:var(--sans)}
  .tab.active{background:var(--ink);color:white;border-color:var(--ink)}
  .row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--rule-soft);cursor:pointer;transition:background 0.15s}
  .row:hover{background:var(--bg-elev)}
  .row:last-child{border-bottom:none}
  .drawer{position:fixed;top:0;right:0;bottom:0;width:500px;background:white;border-left:1px solid var(--rule);z-index:200;overflow-y:auto;box-shadow:-8px 0 40px rgba(0,0,0,0.12)}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:199}
  .field{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:13px;font-family:var(--sans);outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .field:focus{border-color:var(--accent)}
  .btn{padding:10px 20px;border-radius:999px;border:none;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
  .btn-primary{background:var(--accent);color:white}
  .btn-primary:hover{background:oklch(0.38 0.06 150)}
  .btn-dark{background:var(--ink);color:white}
  .btn-danger{background:oklch(0.45 0.08 20);color:white}
  .btn-outline{background:transparent;border:1px solid var(--rule);color:var(--ink-2)}
  @media(max-width:900px){.sidebar{display:none!important}.main-content{margin-left:0!important}}
`

const MODULES = [
  { id:'dashboard', icon:'◈', label:'Dashboard' },
  { id:'asesores', icon:'👥', label:'Asesores' },
  { id:'propietarios', icon:'🏠', label:'Propietarios' },
  { id:'propiedades', icon:'🗂', label:'Propiedades' },
  { id:'suscripciones', icon:'💳', label:'Suscripciones' },
  { id:'kyc', icon:'🪪', label:'Verificaciones KYC' },
  { id:'mensajes', icon:'✉', label:'Mensajes internos' },
  { id:'soporte', icon:'🎫', label:'Soporte' },
  { id:'kyc_propietarios', icon:'🏠', label:'KYC Propietarios' },
  { id:'contratos', icon:'📋', label:'Contratos' },
  { id:'comisiones', icon:'💰', label:'Comisiones' },
  { id:'equipo_nido', icon:'⭐', label:'Equipo NIDO' },
]

export default function AdminPanel() {
  const router = useRouter()
  const [modulo, setModulo] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<any>(null)
  const [asesores, setAsesores] = useState<any[]>([])
  const [propietarios, setPropietarios] = useState<any[]>([])
  const [comisiones, setComisiones] = useState<any[]>([])
  const [contratos, setContratos] = useState<any[]>([])
  const [resumenComisiones, setResumenComisiones] = useState<any[]>([])
  const [propiedades, setPropiedades] = useState<any[]>([])
  const [suscripciones, setSuscripciones] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [sel, setSel] = useState<any>(null)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [msg, setMsg] = useState('')
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/admin/login'; return }
      const { data: admin } = await supabase.from('admins').select('*').eq('correo', user.email!).maybeSingle()
      if (!admin) { window.location.href = '/admin/login'; return }
      setAdminUser(user)
      loadAll()
    })
  }, [])

  const loadAll = async () => {
    const [{ data: met }, { data: as }, { data: pr }, { data: pp }, { data: sus }, { data: coms }, { data: cons }, { data: tks }] = await Promise.all([
      supabase.from('admin_metricas').select('*').maybeSingle(),
      supabase.from('perfiles').select('id,nombre,correo,telefono,cedula,foto_url,verificado,verificacion_estado,verificacion_notas,verificado_at,plan,solicita_equipo_nido,equipo_nido_estado,contrato_equipo_nido_aceptado,contrato_asesor_aceptado,valeria_onboarding_completo,cedula_frente_url,cedula_reverso_url,selfie_url,compania,created_at').order('created_at', { ascending: false }),
      supabase.from('propietarios').select('id,nombre,correo,telefono,cedula,verificado,verificacion_estado,verificacion_notas,verificado_at,created_at').order('created_at', { ascending: false }),
      supabase.from('propiedades').select('id,titulo,tipo,precio,zona,provincia,disponible,verificacion_estado,verificacion_notas,verificado_at,verificado_por,asesor_email,asesor_nombre,asesor_whatsapp,fotos,created_at').order('created_at', { ascending: false }),
      supabase.from('suscripciones').select('id,correo,plan,activo,es_trial,trial_fin,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('comisiones').select('*').order('created_at', { ascending: false }),
      supabase.from('contratos').select('id,propietario_correo,propietario_nombre,propiedad_id,tipo,estado,firmado_propietario,firmado_nido,firmado_at,firma_tipo,firma_url,created_at').order('created_at', { ascending: false }),
      supabase.from('soporte_tickets').select('*').order('updated_at', { ascending: false }),
    ])
    setMetricas(met)
    setAsesores(as || [])
    setPropietarios(pr || [])
    setPropiedades(pp || [])
    setSuscripciones(sus || [])
    setComisiones(coms || [])
    setContratos(cons || [])
    setTickets(tks || [])
    setLoading(false)
  }

  const cambiarPlan = async (correo: string, plan: string) => {
    await supabase.from('suscripciones').upsert({ correo, plan, activo: true, updated_at: new Date().toISOString() }, { onConflict: 'correo' })
    loadAll()
    setMsg('✓ Plan actualizado a ' + plan)
    setTimeout(() => setMsg(''), 3000)
  }

  const togglePropiedad = async (id: string, disponible: boolean) => {
    await supabase.from('propiedades').update({ disponible: !disponible }).eq('id', id)
    loadAll()
  }

  const verificarPropiedad = async (id: string, aprobar: boolean, notas?: string) => {
    const { data: prop } = await supabase.from('propiedades').select('titulo,asesor_email,asesor_nombre,asesor_whatsapp').eq('id', id).maybeSingle()
    await supabase.from('propiedades').update({
      verificacion_estado: aprobar ? 'aprobada' : 'rechazada',
      verificacion_notas: notas || null,
      disponible: aprobar,
      verificado_por: adminUser?.email,
      verificado_at: new Date().toISOString(),
    }).eq('id', id)
    if (aprobar && prop?.asesor_email) {
      const { data: { session: ses1 } } = await supabase.auth.getSession()
      fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses1?.access_token}, body: JSON.stringify({
        to: prop.asesor_email,
        tipo: 'propiedad_aprobada',
        data: { asesor_nombre: prop.asesor_nombre, propiedad: prop.titulo, propiedad_id: id, asesor_telefono: prop.asesor_whatsapp }
      }) }).catch(() => {})
    }
    loadAll()
    setMsg(aprobar ? '✓ Propiedad aprobada y publicada' : '✓ Propiedad rechazada')
    setSel(null)
  }

  const aprobarKYC = async (id: string, aprobar: boolean, notas?: string) => {
    const { data: asesorRow } = await supabase.from('perfiles').select('nombre,correo,telefono').eq('id', id).maybeSingle()
    await supabase.from('perfiles').update({
      verificado: aprobar,
      verificacion_estado: aprobar ? 'aprobado' : 'rechazado',
      verificacion_notas: notas || null,
      verificado_at: new Date().toISOString(),
    }).eq('id', id)
    if (aprobar && asesorRow?.correo) {
      const { data: { session: ses2 } } = await supabase.auth.getSession()
      fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses2?.access_token}, body: JSON.stringify({
        to: asesorRow.correo,
        tipo: 'kyc_aprobado',
        data: { nombre: asesorRow.nombre, asesor_telefono: asesorRow.telefono }
      }) }).catch(() => {})
    }
    loadAll()
    setSel((p:any) => p ? {...p, verificado: aprobar, verificacion_estado: aprobar ? 'aprobado' : 'rechazado'} : null)
  }

  const responderEquipoNido = async (asesor: any, aprobar: boolean) => {
    await supabase.from('perfiles').update({
      equipo_nido_estado: aprobar ? 'aprobado' : 'rechazado',
    }).eq('id', asesor.id)

    // Si se aprueba, activar automaticamente plan Black (enterprise) gratis
    if (aprobar) {
      await supabase.from('suscripciones').upsert({
        correo: asesor.correo,
        plan: 'enterprise',
        activo: true,
        es_trial: false,
        trial_fin: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'correo' })
    }

    setAsesores(prev => prev.map((a:any) => a.id===asesor.id ? {...a, equipo_nido_estado: aprobar?'aprobado':'rechazado'} : a))
    const { data: { session: ses3 } } = await supabase.auth.getSession()
    fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses3?.access_token}, body: JSON.stringify({
      to: asesor.correo,
      tipo: aprobar ? 'equipo_nido_aprobado' : 'mensaje_admin',
      data: aprobar
        ? { nombre: asesor.nombre, asesor_telefono: asesor.telefono }
        : { nombre: asesor.nombre, asunto: 'Solicitud Equipo NIDO', mensaje: 'Gracias por tu interés en el Equipo NIDO. Por ahora no podemos avanzar con tu solicitud, pero podés seguir trabajando como asesor independiente en la plataforma.' }
    }) }).catch(() => {})
  }

  const enviarMensaje = async (correo: string, asunto: string, mensaje: string) => {
    const { data: { session: ses4 } } = await supabase.auth.getSession()
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ses4?.access_token },
      body: JSON.stringify({ to: correo, tipo: 'mensaje_admin', data: { asunto, mensaje } })
    })
    setMsg('✓ Mensaje enviado a ' + correo)
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#060D08',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif'}}>Cargando backoffice...</div>

  const mrrPro = suscripciones.filter(s => s.activo && s.plan === 'pro' && s.periodo === 'mensual').length * 49
  const mrrEnterprise = suscripciones.filter(s => s.activo && s.plan === 'enterprise' && s.periodo === 'mensual').length * 129
  const mrr = mrrPro + mrrEnterprise

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)', display:'flex' }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside className="sidebar" style={{ width:220, background:'var(--ink)', position:'fixed', top:0, left:0, bottom:0, display:'flex', flexDirection:'column', zIndex:50 }}>
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', marginBottom:2 }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></div>
          <div style={{ fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Backoffice Admin</div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {MODULES.map(m => (
            <button key={m.id} className={'sidebar-link'+(modulo===m.id?' active':'')} onClick={() => { setModulo(m.id); setSel(null); setFiltro('todos'); setBusqueda('') }}>
              <span style={{ fontSize:14 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{adminUser?.email}</div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/admin/login')} style={{ fontSize:12, color:'rgba(255,255,255,0.3)', background:'none', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:999, cursor:'pointer', width:'100%' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content" style={{ marginLeft:220, flex:1, padding:'32px', minHeight:'100vh' }}>

        {msg && <div style={{ position:'fixed', top:20, right:20, background:'var(--accent)', color:'white', padding:'10px 20px', borderRadius:999, fontSize:13, fontWeight:500, zIndex:300, boxShadow:'0 4px 20px rgba(27,94,59,0.3)' }}>{msg}</div>}

        {/* ── DASHBOARD ── */}
        {modulo === 'dashboard' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Resumen general</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,3vw,40px)', fontWeight:400 }}>Dashboard <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
            </div>

            {/* MRR destacado */}
            <div style={{ background:'var(--ink)', borderRadius:16, padding:'28px 32px', marginBottom:20, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
              {[
                { label:'MRR Total', val:'$'+mrr.toLocaleString(), sub:'Ingresos recurrentes mensuales', big:true },
                { label:'MRR Pro', val:'$'+mrrPro.toLocaleString(), sub:suscripciones.filter(s=>s.activo&&s.plan==='pro').length+' asesores Pro' },
                { label:'MRR Enterprise', val:'$'+mrrEnterprise.toLocaleString(), sub:suscripciones.filter(s=>s.activo&&s.plan==='enterprise').length+' asesores Enterprise' },
              ].map((s,i) => (
                <div key={i} style={{ borderLeft: i>0?'1px solid rgba(255,255,255,0.08)':'none', paddingLeft: i>0?24:0 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize: s.big?48:36, color:'white', lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'Asesores totales', val:metricas?.total_asesores||0, sub:'en la plataforma', color:'var(--ink)' },
                { label:'Propiedades activas', val:metricas?.propiedades_activas||0, sub:'publicadas hoy', color:'var(--accent)' },
                { label:'Asesores verificados', val:metricas?.asesores_verificados||0, sub:'KYC aprobado', color:'oklch(0.42 0.06 150)' },
                { label:'KYC pendientes', val:metricas?.kyc_pendientes||0, sub:'por revisar', color:'oklch(0.52 0.08 50)' },
              ].map((m,i) => (
                <div key={i} className="card card-pad" style={{ animation:'fadeUp 0.4s ease '+(i*0.08)+'s both' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:40, color:m.color, marginBottom:4 }}>{m.val}</div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Últimos asesores */}
              <div className="card">
                <div className="card-pad" style={{ borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>Últimos asesores</span>
                  <button onClick={() => setModulo('asesores')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todos →</button>
                </div>
                {asesores.slice(0,5).map(a => (
                  <div key={a.id} className="row" onClick={() => { setModulo('asesores'); setSel(a) }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:14, color:'var(--accent)', flexShrink:0 }}>{(a.nombre||'?')[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{a.nombre||'Sin nombre'}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>{a.correo}</div>
                    </div>
                    <span className="badge" style={{ background:a.verificado?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:a.verificado?'var(--accent)':'var(--ink-3)' }}>{a.verificado?'✓ Verificado':'Pendiente'}</span>
                  </div>
                ))}
              </div>

              {/* Suscripciones activas */}
              <div className="card">
                <div className="card-pad" style={{ borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>Suscripciones activas</span>
                  <button onClick={() => setModulo('suscripciones')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todas →</button>
                </div>
                {suscripciones.filter(s=>s.activo).slice(0,5).map(s => (
                  <div key={s.id} className="row">
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{s.correo}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.periodo}</div>
                    </div>
                    <span className="badge" style={{ background:s.plan==='enterprise'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:s.plan==='enterprise'?'oklch(0.35 0.08 240)':'var(--accent)', textTransform:'uppercase' }}>{s.plan}</span>
                    <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)', marginLeft:8 }}>${s.plan==='pro'?49:129}/mes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ASESORES ── */}
        {modulo === 'asesores' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Gestión</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Asesores <em style={{ fontStyle:'italic', color:'var(--accent)' }}>afiliados.</em></h1>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar asesor..." className="field" style={{ width:220 }}/>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','verificado','en_revision','pendiente'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>

            <div className="card">
              {asesores
                .filter(a => filtro==='todos' || (filtro==='verificado'?a.verificado:a.verificacion_estado===filtro||(!a.verificacion_estado&&filtro==='pendiente')))
                .filter(a => !busqueda || (a.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.correo||'').toLowerCase().includes(busqueda.toLowerCase()))
                .map(a => {
                  const sus = suscripciones.find(s => s.correo === a.correo && s.activo)
                  return (
                    <div key={a.id} className="row" onClick={() => setSel({...a, _tipo:'asesor', _sus:sus})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', overflow:'hidden', display:'grid', placeItems:'center', flexShrink:0 }}>
                        {a.foto_url ? <img src={a.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <span style={{ fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)' }}>{(a.nombre||'?')[0]}</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} {a.telefono?'· '+a.telefono:''}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                        {sus && <span className="badge" style={{ background:sus.plan==='enterprise'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:sus.plan==='enterprise'?'oklch(0.35 0.08 240)':'var(--accent)', textTransform:'uppercase' }}>{sus.plan}</span>}
                        <span className="badge" style={{ background:a.verificado?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:a.verificado?'var(--accent)':'var(--ink-3)' }}>
                          {a.verificado?'✓ Verificado':a.verificacion_estado||'Pendiente'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── PROPIETARIOS ── */}
        {modulo === 'propietarios' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Gestión</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Propietarios <em style={{ fontStyle:'italic', color:'var(--accent)' }}>afiliados.</em></h1>
            </div>
            <div className="card">
              {propietarios.map(p => (
                <div key={p.id} className="row" onClick={() => setSel({...p, _tipo:'propietario'})}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'oklch(0.93 0.03 240)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'oklch(0.35 0.08 240)', flexShrink:0 }}>{(p.nombre||'?')[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{p.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.correo} · {p.relacion||'Propietario'}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'var(--ink-3)' }}>{new Date(p.created_at).toLocaleDateString('es-CR')}</span>
                    <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                  </div>
                </div>
              ))}
              {propietarios.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay propietarios registrados.</div>}
            </div>
          </div>
        )}

        {/* ── PROPIEDADES ── */}
        {modulo === 'propiedades' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Inventario</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Propiedades <em style={{ fontStyle:'italic', color:'var(--accent)' }}>totales.</em></h1>
              </div>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar propiedad..." className="field" style={{ width:220 }}/>
            </div>
            <div className="card">
              {propiedades
                .filter(p => !busqueda || (p.titulo||'').toLowerCase().includes(busqueda.toLowerCase()) || (p.zona||'').toLowerCase().includes(busqueda.toLowerCase()))
                .map(p => (
                <div key={p.id} className="row" onClick={() => setSel({...p, _tipo:'propiedad'})}>
                  <div style={{ width:48, height:40, borderRadius:6, background:'var(--bg)', overflow:'hidden', flexShrink:0, display:'grid', placeItems:'center', fontSize:18 }}>🏠</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{p.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.zona} · {p.asesor_email} · {p.ref_id||'—'}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)' }}>${Number(p.precio||0).toLocaleString()}</span>
                    <span className="badge" style={{ background:p.disponible?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:p.disponible?'var(--accent)':'var(--ink-3)' }}>{p.disponible?'Activa':'Pausada'}</span>
                    <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUSCRIPCIONES ── */}
        {modulo === 'suscripciones' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Facturación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Suscripciones <em style={{ fontStyle:'italic', color:'var(--accent)' }}>activas.</em></h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'MRR Total', val:'$'+mrr.toLocaleString(), sub:'mensual recurrente' },
                { label:'Suscripciones activas', val:suscripciones.filter(s=>s.activo).length, sub:'asesores pagos' },
                { label:'ARR estimado', val:'$'+(mrr*12).toLocaleString(), sub:'ingresos anuales' },
              ].map((s,i) => (
                <div key={i} className="card card-pad">
                  <div style={{ fontFamily:'var(--serif)', fontSize:36, color:'var(--accent)', marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              {suscripciones.map(s => (
                <div key={s.id} className="row" onClick={() => setSel({...s, _tipo:'suscripcion'})}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{s.correo}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{s.periodo} · {new Date(s.created_at).toLocaleDateString('es-CR')}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)' }}>${s.plan==='pro'?49:s.plan==='enterprise'?129:0}/mes</span>
                    <span className="badge" style={{ background:s.plan==='enterprise'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:s.plan==='enterprise'?'oklch(0.35 0.08 240)':'var(--accent)', textTransform:'uppercase' }}>{s.plan}</span>
                    <span className="badge" style={{ background:s.activo?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:s.activo?'var(--accent)':'var(--ink-3)' }}>{s.activo?'Activa':'Inactiva'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KYC ── */}
        {modulo === 'kyc' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Identidad</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Verificaciones <em style={{ fontStyle:'italic', color:'var(--accent)' }}>KYC.</em></h1>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','en_revision','pendiente','aprobado','rechazado'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?asesores.length:asesores.filter(a=>f==='en_revision'?a.verificacion_estado==='en_revision':f==='pendiente'?(!a.verificacion_estado||a.verificacion_estado==='pendiente'):a.verificacion_estado===f).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {asesores
                .filter(a => filtro==='todos'||(filtro==='en_revision'?a.verificacion_estado==='en_revision':filtro==='pendiente'?(!a.verificacion_estado||a.verificacion_estado==='pendiente'):a.verificacion_estado===filtro))
                .map(a => {
                  const docs = [a.cedula_frente_url,a.cedula_reverso_url,a.selfie_url].filter(Boolean).length
                  return (
                    <div key={a.id} className="row" onClick={() => setSel({...a, _tipo:'kyc'})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(a.nombre||'?')[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} · {docs}/3 documentos</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="badge" style={{ background:a.verificado?'var(--accent-tint)':a.verificacion_estado==='en_revision'?'oklch(0.93 0.05 80)':'oklch(0.93 0.005 80)', color:a.verificado?'var(--accent)':a.verificacion_estado==='en_revision'?'oklch(0.45 0.08 80)':'var(--ink-3)' }}>
                          {a.verificado?'✓ Aprobado':a.verificacion_estado==='en_revision'?'En revisión':a.verificacion_estado||'Pendiente'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── CONTRATOS ── */}
        {modulo === 'contratos' && (() => {
          const ESTADOS: Record<string,{bg:string,color:string,label:string}> = {
            pendiente: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Pendiente firma NIDO' },
            activo:    { bg:'var(--accent-tint)', color:'var(--accent)', label:'Activo' },
            vencido:   { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Vencido' },
            cancelado: { bg:'oklch(0.97 0.03 20)', color:'oklch(0.45 0.08 20)', label:'Cancelado' },
          }
          const pendientes = contratos.filter(c => c.estado === 'pendiente')
          return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Gestión legal</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Contratos <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                {[
                  { label:'Total contratos', val:contratos.length, color:'var(--ink)' },
                  { label:'Pendientes firma', val:pendientes.length, color:'oklch(0.45 0.08 80)' },
                  { label:'Activos', val:contratos.filter(c=>c.estado==='activo').length, color:'var(--accent)' },
                  { label:'Exclusividades', val:contratos.filter(c=>c.tipo==='exclusividad').length, color:'oklch(0.42 0.06 230)' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'18px' }}>
                    <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:32, color:s.color, lineHeight:1 }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Pendientes urgentes */}
              {pendientes.length > 0 && (
                <div style={{ background:'oklch(0.93 0.05 80)', border:'1px solid oklch(0.88 0.05 80)', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'oklch(0.40 0.08 80)', marginBottom:4 }}>⚠️ {pendientes.length} contrato{pendientes.length>1?'s':''} pendiente{pendientes.length>1?'s':''} de contrafirma</div>
                  <div style={{ fontSize:12, color:'oklch(0.45 0.06 80)' }}>Estos propietarios ya firmaron — necesitan tu contrafirma para activarse.</div>
                </div>
              )}

              {/* Lista */}
              <div className="card">
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--rule)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', fontWeight:500 }}>
                  <span>Propietario</span><span>Tipo</span><span>Firma</span><span>Vence</span><span>Estado</span>
                </div>
                {contratos.map((c:any) => {
                  const est = ESTADOS[c.estado] || ESTADOS.pendiente
                  return (
                    <div key={c.id} className="row" onClick={() => setSel({...c, _tipo:'contrato'})}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{c.propietario_nombre || c.propietario_correo}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{c.propietario_correo}</div>
                      </div>
                      <div style={{ fontSize:13, color:'var(--ink-2)' }}>{c.tipo === 'exclusividad' ? '90 días' : 'Mensual'}</div>
                      <div style={{ fontSize:13, color:'var(--ink-2)' }}>{c.firma_tipo === 'digital' ? '🔐 GAUDI' : '📄 Física'}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-CR') : '—'}</div>
                      <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:est.bg, color:est.color }}>{est.label}</span>
                    </div>
                  )
                })}
                {contratos.length === 0 && <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay contratos registrados aún.</div>}
              </div>
            </div>
          )
        })()}

        {/* ── COMISIONES ── */}
        {modulo === 'comisiones' && (() => {
          const fmt = (n: number) => '$' + (n||0).toLocaleString('es-CR', { minimumFractionDigits:0, maximumFractionDigits:0 })
          const ESTADOS: Record<string,{bg:string,color:string,label:string}> = {
            proyectada: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Proyectada' },
            en_proceso: { bg:'oklch(0.93 0.03 240)', color:'oklch(0.35 0.08 240)', label:'En proceso' },
            cobrada:    { bg:'var(--accent-tint)', color:'var(--accent)', label:'Cobrada' },
            cancelada:  { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Cancelada' },
          }
          const totalCobrado = comisiones.filter(c=>c.estado==='cobrada').reduce((a,c)=>a+(c.monto_comision||0),0)
          const totalPipeline = comisiones.filter(c=>c.estado!=='cancelada').reduce((a,c)=>a+(c.monto_comision||0),0)
          const totalProyectado = comisiones.filter(c=>c.estado==='proyectada'||c.estado==='en_proceso').reduce((a,c)=>a+(c.monto_comision||0),0)
          return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Control financiero</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Comisiones <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
              </div>

              {/* Stats globales */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                {[
                  { label:'Total cobrado', val:fmt(totalCobrado), color:'var(--accent)', sub:comisiones.filter(c=>c.estado==='cobrada').length+' cierres' },
                  { label:'Pipeline activo', val:fmt(totalProyectado), color:'oklch(0.45 0.08 80)', sub:comisiones.filter(c=>c.estado==='proyectada'||c.estado==='en_proceso').length+' negocios' },
                  { label:'Pipeline total', val:fmt(totalPipeline), color:'var(--ink)', sub:'Cobrado + activo' },
                  { label:'Asesores activos', val:String(resumenComisiones.length), color:'oklch(0.42 0.06 230)', sub:'Con negocios registrados' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'18px' }}>
                    <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:26, color:s.color, marginBottom:4, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Resumen por asesor */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Ranking de asesores por pipeline</div>
                <div className="card">
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--rule)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', fontWeight:500 }}>
                    <span>Asesor</span><span>Cobrado</span><span>Pipeline</span><span>Negocios</span><span>Cerrados</span>
                  </div>
                  {resumenComisiones.map((r:any, i:number) => (
                    <div key={r.asesor_email} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:8, padding:'12px 20px', borderBottom:'1px solid var(--rule-soft)', fontSize:13, alignItems:'center' }} onClick={() => setFiltro(r.asesor_email)}>
                      <div>
                        <div style={{ fontWeight:500, marginBottom:2 }}>{r.asesor_nombre||r.asesor_email}</div>
                        <div style={{ fontSize:11, color:'var(--ink-3)' }}>{r.asesor_email}</div>
                      </div>
                      <div style={{ fontFamily:'var(--mono)', color:'var(--accent)', fontWeight:500 }}>{fmt(r.total_cobrado)}</div>
                      <div style={{ fontFamily:'var(--mono)', color:'oklch(0.45 0.08 80)' }}>{fmt(r.total_proyectado)}</div>
                      <div style={{ color:'var(--ink-2)' }}>{r.total_negocios}</div>
                      <div style={{ color:'var(--accent)' }}>{r.cerrados}</div>
                    </div>
                  ))}
                  {resumenComisiones.length === 0 && <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay comisiones registradas aún.</div>}
                </div>
              </div>

              {/* Todas las comisiones */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)' }}>Todos los negocios</div>
                  {filtro && filtro !== 'todos' && <button onClick={() => setFiltro('todos')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todos ×</button>}
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                  {['todos','proyectada','en_proceso','cobrada','cancelada'].map(f => (
                    <button key={f} onClick={() => setFiltro(f)} style={{ padding:'6px 14px', borderRadius:999, border:'1px solid var(--rule)', fontSize:11, cursor:'pointer', background:filtro===f?'var(--ink)':'transparent', color:filtro===f?'white':'var(--ink-2)' }}>
                      {f==='todos'?'Todos':ESTADOS[f]?.label}
                    </button>
                  ))}
                </div>
                <div className="card">
                  {comisiones
                    .filter(c => filtro==='todos'||c.estado===filtro||c.asesor_email===filtro)
                    .map((c:any) => {
                      const est = ESTADOS[c.estado]||ESTADOS.proyectada
                      return (
                        <div key={c.id} className="row" onClick={() => setSel({...c, _tipo:'comision'})}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{c.propiedad_titulo}</div>
                            <div style={{ fontSize:12, color:'var(--ink-3)', display:'flex', gap:10 }}>
                              <span>{c.asesor_nombre||c.asesor_email}</span>
                              {c.propiedad_zona && <span>· {c.propiedad_zona}</span>}
                              {c.fecha_cierre_estimada && <span>· Est. {new Date(c.fecha_cierre_estimada).toLocaleDateString('es-CR')}</span>}
                            </div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <div style={{ fontFamily:'var(--mono)', fontSize:16, fontWeight:500, color:c.estado==='cobrada'?'var(--accent)':'var(--ink)', marginBottom:4 }}>{fmt(c.monto_comision||0)}</div>
                            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:est.bg, color:est.color }}>{est.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  {comisiones.filter(c => filtro==='todos'||c.estado===filtro||c.asesor_email===filtro).length === 0 && (
                    <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay negocios con ese filtro.</div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── KYC PROPIETARIOS ── */}
        {modulo === 'kyc_propietarios' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Verificación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>KYC <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Propietarios.</em></h1>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','pendiente_docs','en_revision','aprobado','rechazado'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='pendiente_docs'?'Sin docs':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?propietarios.length:propietarios.filter((p:any)=>p.verificacion_estado===f||(f==='pendiente_docs'&&!p.verificacion_estado)).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {propietarios
                .filter((p:any) => filtro==='todos'||p.verificacion_estado===filtro||(filtro==='pendiente_docs'&&!p.verificacion_estado))
                .map((p:any) => {
                  const docs = [p.cedula_frente_url, p.cedula_reverso_url, p.selfie_url].filter(Boolean).length
                  return (
                    <div key={p.id} className="row" onClick={() => setSel({...p, _tipo:'kyc_propietario'})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'oklch(0.93 0.03 240)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'oklch(0.35 0.08 240)', flexShrink:0 }}>{(p.nombre||'?')[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{p.nombre}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.correo} · {docs}/3 docs · {p.relacion||'Propietario'}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="badge" style={{ background:p.verificacion_estado==='aprobado'?'var(--accent-tint)':p.verificacion_estado==='en_revision'?'oklch(0.93 0.05 80)':'oklch(0.93 0.005 80)', color:p.verificacion_estado==='aprobado'?'var(--accent)':p.verificacion_estado==='en_revision'?'oklch(0.45 0.08 80)':'var(--ink-3)' }}>
                          {p.verificacion_estado==='aprobado'?'✓ Aprobado':p.verificacion_estado==='en_revision'?'En revisión':p.verificacion_estado||'Sin docs'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
              {propietarios.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay propietarios registrados.</div>}
            </div>
          </div>
        )}

        {/* ── EQUIPO NIDO ── */}
        {modulo === 'equipo_nido' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Incorporaciones</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Solicitudes <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Equipo NIDO.</em></h1>
              <p style={{ fontSize:14, color:'var(--ink-3)', marginTop:6 }}>Asesores que aplicaron a unirse al equipo interno de NIDO al registrarse.</p>
            </div>
            <div className="card">
              {asesores.filter((a:any) => a.solicita_equipo_nido).length === 0 ? (
                <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>
                  No hay solicitudes de Equipo NIDO por el momento.
                </div>
              ) : asesores.filter((a:any) => a.solicita_equipo_nido).map((a:any) => (
                <div key={a.id} className="row" style={{ alignItems:'center' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0, overflow:'hidden' }}>
                    {a.foto_url ? <img src={a.foto_url} alt={a.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (a.nombre||'?')[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} · {a.telefono||'sin teléfono'}</div>
                  </div>
                  {a.equipo_nido_estado === 'aprobado' ? (
                    <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>✓ Aprobado</span>
                  ) : a.equipo_nido_estado === 'rechazado' ? (
                    <span className="badge" style={{ background:'oklch(0.93 0.005 80)', color:'var(--ink-3)' }}>Rechazado</span>
                  ) : (
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => responderEquipoNido(a, true)} className="btn-dark" style={{ padding:'7px 16px', borderRadius:999, fontSize:12, border:'none', cursor:'pointer' }}>Aprobar</button>
                      <button onClick={() => responderEquipoNido(a, false)} className="btn-outline" style={{ padding:'7px 16px', borderRadius:999, fontSize:12, cursor:'pointer' }}>Rechazar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENSAJES ── */}
        {modulo === 'mensajes' && (
          <div style={{ animation:'fadeUp 0.4s ease', maxWidth:680 }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Comunicación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Mensajes <em style={{ fontStyle:'italic', color:'var(--accent)' }}>internos.</em></h1>
            </div>
            <MensajeForm asesores={asesores} propietarios={propietarios} onSend={enviarMensaje}/>
          </div>
        )}

        {/* ── SOPORTE (SAC) ── */}
        {modulo === 'soporte' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Atención al cliente</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Tickets de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>soporte.</em></h1>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','abierto','en_progreso','resuelto'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='en_progreso'?'En progreso':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?tickets.length:tickets.filter(t=>t.estado===f).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {tickets.filter(t => filtro==='todos'||t.estado===filtro).length === 0 && (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>No hay tickets en este estado.</div>
              )}
              {tickets
                .filter(t => filtro==='todos'||t.estado===filtro)
                .map(t => {
                  const badgeStyle = t.estado==='resuelto'
                    ? { background:'var(--accent-tint)', color:'var(--accent)' }
                    : t.estado==='en_progreso'
                    ? { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }
                    : { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }
                  return (
                    <div key={t.id} className="row" onClick={() => setSel({...t, _tipo:'ticket'})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(t.usuario_nombre||t.usuario_email||'?')[0].toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{t.asunto || 'Consulta de soporte'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{t.usuario_nombre || t.usuario_email} · {t.usuario_tipo} · {new Date(t.created_at).toLocaleDateString('es-CR')}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="badge" style={badgeStyle}>
                          {t.estado==='resuelto'?'✓ Resuelto':t.estado==='en_progreso'?'En progreso':'Abierto'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

      </div>

      {/* ── DRAWER DETALLE ── */}
      {sel && (
        <>
          <div className="overlay" onClick={() => setSel(null)}/>
          <div className="drawer">
            <DrawerDetalle
              sel={sel}
              suscripciones={suscripciones}
              onClose={() => setSel(null)}
              onCambiarPlan={cambiarPlan}
              onAprobarKYC={aprobarKYC}
              onTogglePropiedad={togglePropiedad}
              onVerificarPropiedad={verificarPropiedad}
              onEnviarMensaje={enviarMensaje}
              onMsg={setMsg}
              onReload={loadAll}
            />
          </div>
        </>
      )}
    </main>
  )
}

// ── MENSAJE FORM ──
function MensajeForm({ asesores, propietarios, onSend }: any) {
  const [destinatario, setDestinatario] = useState('')
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const todos = [
    ...asesores.map((a:any) => ({ correo:a.correo, nombre:a.nombre||a.correo, tipo:'Asesor' })),
    ...propietarios.map((p:any) => ({ correo:p.correo, nombre:p.nombre||p.correo, tipo:'Propietario' })),
  ]

  const enviar = async () => {
    if (!destinatario || !asunto || !mensaje) return
    setEnviando(true)
    await onSend(destinatario, asunto, mensaje)
    setExito(true); setAsunto(''); setMensaje(''); setDestinatario('')
    setTimeout(() => setExito(false), 3000)
    setEnviando(false)
  }

  return (
    <div className="card card-pad">
      <h3 style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:20 }}>Nuevo mensaje</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Destinatario</label>
          <select value={destinatario} onChange={e => setDestinatario(e.target.value)} className="field" style={{ appearance:'none' }}>
            <option value="">Seleccionar...</option>
            {todos.map(t => <option key={t.correo} value={t.correo}>[{t.tipo}] {t.nombre} — {t.correo}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Asunto</label>
          <input className="field" value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Asunto del mensaje"/>
        </div>
        <div>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Mensaje</label>
          <textarea className="field" value={mensaje} onChange={e => setMensaje(e.target.value)} rows={6} placeholder="Escribí tu mensaje aquí..." style={{ resize:'vertical' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={enviar} disabled={enviando||!destinatario||!asunto||!mensaje} className="btn btn-primary" style={{ opacity:enviando||!destinatario||!asunto||!mensaje?0.5:1 }}>
            {enviando ? 'Enviando...' : 'Enviar mensaje →'}
          </button>
        </div>
        {exito && <div style={{ padding:'10px', background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:8, fontSize:13, color:'var(--accent)', textAlign:'center' }}>✓ Mensaje enviado correctamente</div>}
      </div>
    </div>
  )
}

// ── DRAWER DETALLE ──
function DrawerDetalle({ sel, suscripciones, onClose, onCambiarPlan, onAprobarKYC, onTogglePropiedad, onVerificarPropiedad, onEnviarMensaje, onMsg, onReload }: any) {
  const [nuevoPlan, setNuevoPlan] = useState('')
  const [notasKYC, setNotasKYC] = useState(sel?.verificacion_notas||'')
  const [msgInterno, setMsgInterno] = useState('')
  const [asuntoInterno, setAsuntoInterno] = useState('')
  const [updating, setUpdating] = useState(false)
  const [contratoLoadError, setContratoLoadError] = useState('')

  const sus = suscripciones.find((s:any) => s.correo === sel.correo && s.activo)

  if (sel._tipo === 'asesor' || sel._tipo === 'kyc') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Asesor afiliado</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.nombre||'Sin nombre'}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>

        {/* Foto y estado */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, padding:'16px', background:'var(--bg)', borderRadius:10 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', overflow:'hidden', background:'var(--accent-tint)', display:'grid', placeItems:'center', flexShrink:0 }}>
            {sel.foto_url ? <img src={sel.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <span style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--accent)' }}>{(sel.nombre||'?')[0]}</span>}
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{sel.nombre||'Sin nombre'}</div>
            <div style={{ display:'flex', gap:8 }}>
              {sel.verificado && <span className="badge" style={{ background:'var(--accent)', color:'white' }}>✓ Verificado</span>}
              {sus && <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)', textTransform:'uppercase' }}>{sus.plan}</span>}
            </div>
          </div>
        </div>

        {/* Datos */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Información</div>
          {[
            { l:'Correo', v:sel.correo },
            { l:'Teléfono', v:sel.telefono||'—' },
            { l:'Cédula', v:sel.cedula||'—' },
            { l:'Código corredor', v:sel.codigo_corredor||'—' },
            { l:'Estado KYC', v:sel.verificacion_estado||'pendiente' },
            { l:'Plan actual', v:sus?.plan||'gratis' },
            { l:'Registro', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Documentos KYC */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Documentos KYC</div>
          {[
            { label:'Cédula Frente', url:sel.cedula_frente_url },
            { label:'Cédula Reverso', url:sel.cedula_reverso_url },
            { label:'Selfie con cédula', url:sel.selfie_url },
          ].map(doc => (
            <div key={doc.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', border:'1px solid var(--rule)', borderRadius:8, marginBottom:6, background:doc.url?'var(--accent-tint)':'var(--bg)' }}>
              <span style={{ fontSize:13, color:doc.url?'var(--accent)':'var(--ink-3)', display:'flex', alignItems:'center', gap:8 }}>
                {doc.url?'✓':'○'} {doc.label}
              </span>
              {doc.url && <a href={doc.url} target="_blank" style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>Ver →</a>}
            </div>
          ))}
        </div>

        {/* KYC acciones */}
        {!sel.verificado && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Notas para el asesor</div>
            <textarea value={notasKYC} onChange={e => setNotasKYC(e.target.value)} rows={3} placeholder="Motivo de rechazo o instrucciones..." className="field" style={{ marginBottom:10, resize:'vertical' }}/>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={async () => { setUpdating(true); await onAprobarKYC(sel.id, true, notasKYC); setUpdating(false) }} disabled={updating||!sel.cedula_frente_url||!sel.cedula_reverso_url||!sel.selfie_url} className="btn btn-primary" style={{ flex:2, opacity:updating||!sel.cedula_frente_url?0.5:1 }}>
                ✓ Aprobar KYC
              </button>
              <button onClick={async () => { setUpdating(true); await onAprobarKYC(sel.id, false, notasKYC); setUpdating(false) }} disabled={updating} className="btn btn-danger" style={{ flex:1 }}>
                ✗ Rechazar
              </button>
            </div>
          </div>
        )}

        {/* Cambiar plan */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Cambiar membresía</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
            <select value={nuevoPlan} onChange={e => setNuevoPlan(e.target.value)} className="field" style={{ appearance:'none' }}>
              <option value="">Seleccionar plan...</option>
              <option value="gratis">Gratis</option>
              <option value="pro">Pro — $49/mes</option>
              <option value="enterprise">Enterprise — $129/mes</option>
            </select>
            <button onClick={async () => { if (!nuevoPlan) return; await onCambiarPlan(sel.correo, nuevoPlan); onMsg('✓ Plan cambiado a '+nuevoPlan) }} disabled={!nuevoPlan} className="btn btn-dark" style={{ opacity:!nuevoPlan?0.5:1 }}>
              Aplicar
            </button>
          </div>
        </div>

        {/* Mensaje interno */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Enviar mensaje</div>
          <input value={asuntoInterno} onChange={e => setAsuntoInterno(e.target.value)} placeholder="Asunto" className="field" style={{ marginBottom:8 }}/>
          <textarea value={msgInterno} onChange={e => setMsgInterno(e.target.value)} rows={3} placeholder="Mensaje para el asesor..." className="field" style={{ marginBottom:8, resize:'vertical' }}/>
          <button onClick={async () => { if (!msgInterno||!asuntoInterno) return; await onEnviarMensaje(sel.correo, asuntoInterno, msgInterno); setMsgInterno(''); setAsuntoInterno('') }} disabled={!msgInterno||!asuntoInterno} className="btn btn-dark" style={{ width:'100%', opacity:!msgInterno||!asuntoInterno?0.5:1 }}>
            ✉ Enviar mensaje al asesor
          </button>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'propietario') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.35 0.08 240)', marginBottom:4 }}>Propietario</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.nombre}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {[
          { l:'Nombre', v:sel.nombre },
          { l:'Correo', v:sel.correo },
          { l:'Teléfono', v:sel.telefono||'—' },
          { l:'Cédula', v:sel.cedula||'—' },
          { l:'Relación', v:sel.relacion||'—' },
          { l:'Registro', v:new Date(sel.created_at).toLocaleDateString('es-CR') },
        ].map(f => (
          <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
            <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
            <span style={{ fontWeight:500 }}>{f.v}</span>
          </div>
        ))}
        <div style={{ marginTop:16 }}>
          <input value={asuntoInterno} onChange={e => setAsuntoInterno(e.target.value)} placeholder="Asunto" className="field" style={{ marginBottom:8 }}/>
          <textarea value={msgInterno} onChange={e => setMsgInterno(e.target.value)} rows={3} placeholder="Mensaje para el propietario..." className="field" style={{ marginBottom:8, resize:'vertical' }}/>
          <button onClick={async () => { await onEnviarMensaje(sel.correo, asuntoInterno, msgInterno); setMsgInterno(''); setAsuntoInterno('') }} disabled={!msgInterno||!asuntoInterno} className="btn btn-dark" style={{ width:'100%', opacity:!msgInterno||!asuntoInterno?0.5:1 }}>
            ✉ Enviar mensaje
          </button>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'propiedad') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--accent)', marginBottom:4 }}>{sel.ref_id}</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.titulo}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>

        {/* Estado verificación */}
        <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:10, background:sel.verificacion_estado==='aprobada'?'var(--accent-tint)':sel.verificacion_estado==='rechazada'?'oklch(0.97 0.03 20)':'oklch(0.93 0.05 80)', border:'1px solid '+(sel.verificacion_estado==='aprobada'?'oklch(0.85 0.04 150)':sel.verificacion_estado==='rechazada'?'oklch(0.85 0.06 20)':'oklch(0.88 0.05 80)') }}>
          <span style={{ fontSize:13, fontWeight:500, color:sel.verificacion_estado==='aprobada'?'var(--accent)':sel.verificacion_estado==='rechazada'?'oklch(0.45 0.08 20)':'oklch(0.45 0.08 80)' }}>
            {sel.verificacion_estado==='aprobada'?'✓ Propiedad aprobada y publicada':sel.verificacion_estado==='rechazada'?'✗ Propiedad rechazada':sel.verificacion_estado==='pendiente_verificacion'?'⏳ Pendiente de verificación':'Borrador'}
          </span>
        </div>

        {/* Datos generales */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Datos generales</div>
          {[
            { l:'Título', v:sel.titulo },
            { l:'Zona', v:sel.zona||'—' },
            { l:'Precio', v:'$'+Number(sel.precio||0).toLocaleString()+' USD' },
            { l:'Tipo', v:sel.tipo||'—' },
            { l:'Operación', v:sel.operacion||'—' },
            { l:'Asesor/Propietario', v:sel.asesor_email||'—' },
            { l:'Publicada', v:new Date(sel.created_at).toLocaleDateString('es-CR') },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Datos registrales */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Datos registrales</div>
          {[
            { l:'Número de finca', v:sel.numero_finca||'—' },
            { l:'Número de plano', v:sel.numero_plano||'—' },
            { l:'Naturaleza', v:sel.naturaleza||'—' },
            { l:'Área registral', v:sel.area_registral?sel.area_registral+'m²':'—' },
            { l:'Colindancias', v:sel.colindancias||'—' },
            { l:'Gravámenes', v:sel.gravamenes||'—' },
            { l:'Anotaciones', v:sel.anotaciones||'—' },
            { l:'Libre de gravámenes', v:sel.libre_gravamenes?'✓ Confirmado':'✗ No confirmado' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)', flexShrink:0, marginRight:12 }}>{f.l}</span>
              <span style={{ fontWeight:500, textAlign:'right', color:f.l==='Libre de gravámenes'?(sel.libre_gravamenes?'var(--accent)':'oklch(0.45 0.08 20)'):'var(--ink)' }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Notas */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Notas para el propietario/asesor</label>
          <textarea value={notasKYC} onChange={e => setNotasKYC(e.target.value)} rows={3} placeholder="Ej. Favor verificar el número de finca, no coincide con el plano..." className="field" style={{ resize:'vertical' }}/>
        </div>

        {/* Acciones verificación */}
        {sel.verificacion_estado !== 'aprobada' && (
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <button onClick={() => onVerificarPropiedad(sel.id, true, notasKYC)} disabled={!sel.libre_gravamenes} className="btn btn-primary" style={{ flex:2, opacity:!sel.libre_gravamenes?0.5:1 }}>
              ✓ Aprobar y publicar
            </button>
            <button onClick={() => onVerificarPropiedad(sel.id, false, notasKYC)} className="btn btn-danger" style={{ flex:1 }}>
              ✗ Rechazar
            </button>
          </div>
        )}
        {!sel.libre_gravamenes && (
          <p style={{ fontSize:11, color:'oklch(0.45 0.08 20)', marginBottom:12 }}>⚠️ El propietario no confirmó que la propiedad está libre de gravámenes.</p>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => { onTogglePropiedad(sel.id, sel.disponible); onClose() }} className={'btn btn-outline'} style={{ flex:1 }}>
            {sel.disponible ? '⏸ Pausar' : '▶ Activar'}
          </button>
          <a href={'/propiedades/'+sel.id} target="_blank" className="btn btn-outline" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            Ver ficha →
          </a>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'suscripcion') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Suscripción</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.correo}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {[
          { l:'Correo', v:sel.correo },
          { l:'Plan', v:sel.plan },
          { l:'Período', v:sel.periodo },
          { l:'Estado', v:sel.activo?'Activa':'Inactiva' },
          { l:'Stripe ID', v:sel.stripe_subscription_id||'—' },
          { l:'Inicio', v:new Date(sel.created_at).toLocaleDateString('es-CR') },
        ].map(f => (
          <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
            <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
            <span style={{ fontWeight:500 }}>{f.v}</span>
          </div>
        ))}
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Cambiar plan manualmente</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
            <select value={nuevoPlan} onChange={e => setNuevoPlan(e.target.value)} className="field" style={{ appearance:'none' }}>
              <option value="">Seleccionar plan...</option>
              <option value="gratis">Gratis</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button onClick={async () => { if (!nuevoPlan) return; await onCambiarPlan(sel.correo, nuevoPlan); onMsg('✓ Plan actualizado') }} disabled={!nuevoPlan} className="btn btn-dark">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'contrato') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Contrato</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.propietario_nombre || sel.propietario_correo}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {/* Datos */}
        <div style={{ marginBottom:20 }}>
          {[
            { l:'Propietario', v:sel.propietario_nombre||'—' },
            { l:'Correo', v:sel.propietario_correo },
            { l:'Tipo', v:sel.tipo==='exclusividad'?'Exclusividad 90 días':'Mensual $39.99' },
            { l:'Estado', v:sel.estado },
            { l:'Firma', v:sel.firma_tipo==='digital'?'Digital GAUDI':'Física escaneada' },
            { l:'Inicio', v:sel.fecha_inicio?new Date(sel.fecha_inicio).toLocaleDateString('es-CR'):'—' },
            { l:'Vencimiento', v:sel.fecha_vencimiento?new Date(sel.fecha_vencimiento).toLocaleDateString('es-CR'):'—' },
            { l:'Comisión', v:sel.comision_porcentaje+'%' },
          ].map((f:any) => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Ver firma */}
        {sel.firma_url && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Documento firmado</div>
            <a href={sel.firma_url} target="_blank" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, textDecoration:'none', color:'var(--ink)', background:'var(--bg)' }}>
              <span style={{ fontSize:20 }}>{sel.firma_tipo==='digital'?'🔐':'📄'}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>Ver documento firmado</div>
                <div style={{ fontSize:11, color:'var(--ink-3)' }}>{sel.firma_tipo==='digital'?'PDF firmado con GAUDI':'Firma física escaneada'}</div>
              </div>
              <span style={{ marginLeft:'auto', color:'var(--accent)' }}>→</span>
            </a>
          </div>
        )}

        {/* Ver PDF contrato */}
        <div style={{ marginBottom:20 }}>
          {contratoLoadError && <p style={{ color:'oklch(0.45 0.08 20)', fontSize:12, margin:'0 0 8px', padding:'8px 12px', background:'oklch(0.97 0.02 20)', borderRadius:8, border:'1px solid oklch(0.88 0.04 20)' }}>{contratoLoadError}</p>}
          <button onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/contrato-pdf?correo='+sel.propietario_correo+'&tipo='+sel.tipo, { headers: { 'Authorization': 'Bearer ' + session?.access_token } })
            if (!res.ok) { setContratoLoadError('No se pudo cargar el contrato.'); return }
            setContratoLoadError('')
            const html = await res.text()
            const blob = new Blob([html], { type: 'text/html' })
            window.open(URL.createObjectURL(blob), '_blank')
          }} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, background:'var(--bg)', cursor:'pointer', width:'100%', textAlign:'left' }}>
            <span style={{ fontSize:20 }}>📋</span>
            <div style={{ fontSize:13, fontWeight:500 }}>Ver contrato original</div>
            <span style={{ marginLeft:'auto', color:'var(--accent)' }}>→</span>
          </button>
        </div>

        {/* Acciones */}
        {sel.estado === 'pendiente' && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Acciones</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={async () => {
                setUpdating(true)
                await supabase.from('contratos').update({ estado:'activo', firmado_nido:true, firmado_at: new Date().toISOString() }).eq('id', sel.id)
                // Notify propietario
                fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to: sel.propietario_correo, tipo:'contrato_aprobado', data:{ nombre: sel.propietario_nombre, tipo: sel.tipo } }) }).catch(()=>{})
                onReload(); onMsg('✓ Contrato activado'); onClose()
                setUpdating(false)
              }} disabled={updating} className="btn btn-primary" style={{ opacity:updating?0.5:1 }}>
                ✓ Contrafirmar y activar contrato
              </button>
              <button onClick={async () => {
                setUpdating(true)
                await supabase.from('contratos').update({ estado:'cancelado' }).eq('id', sel.id)
                onReload(); onMsg('Contrato cancelado'); onClose()
                setUpdating(false)
              }} disabled={updating} style={{ padding:'10px', borderRadius:999, border:'1px solid oklch(0.85 0.06 20)', color:'oklch(0.45 0.08 20)', background:'transparent', fontSize:13, cursor:'pointer' }}>
                ✗ Rechazar contrato
              </button>
            </div>
          </div>
        )}

        {sel.estado === 'activo' && (
          <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'14px 18px', fontSize:13, color:'var(--accent)' }}>
            ✓ Contrato activo y vigente. El propietario puede publicar propiedades.
          </div>
        )}

        {/* Contacto */}
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Contactar propietario</div>
          <div style={{ display:'flex', gap:8 }}>
            <a href={'mailto:'+sel.propietario_correo+'?subject=Contrato NIDO - '+sel.propietario_nombre} className="btn btn-outline" style={{ flex:1, textAlign:'center', textDecoration:'none', padding:'10px' }}>✉ Email</a>
            <a href="https://wa.me/50688226436" target="_blank" className="btn" style={{ flex:1, background:'#22c55e', color:'white', textAlign:'center', textDecoration:'none', padding:'10px', borderRadius:999, fontSize:13, fontWeight:500 }}>💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'kyc_propietario') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.35 0.08 240)', marginBottom:4 }}>KYC Propietario</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.nombre}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {/* Datos */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Información</div>
          {[
            { l:'Nombre', v:sel.nombre },
            { l:'Correo', v:sel.correo },
            { l:'Teléfono', v:sel.telefono||'—' },
            { l:'Cédula', v:sel.cedula||'—' },
            { l:'Relación', v:sel.relacion||'—' },
            { l:'Estado KYC', v:sel.verificacion_estado||'pendiente_docs' },
            { l:'Registro', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Documentos */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Documentos KYC</div>
          {[
            { label:'Cédula Frente', url:sel.cedula_frente_url },
            { label:'Cédula Reverso', url:sel.cedula_reverso_url },
            { label:'Selfie con cédula', url:sel.selfie_url },
          ].map(doc => (
            <div key={doc.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', border:'1px solid var(--rule)', borderRadius:8, marginBottom:6, background:doc.url?'var(--accent-tint)':'var(--bg)' }}>
              <span style={{ fontSize:13, color:doc.url?'var(--accent)':'var(--ink-3)', display:'flex', alignItems:'center', gap:8 }}>
                {doc.url?'✓':'○'} {doc.label}
              </span>
              {doc.url && <a href={doc.url} target="_blank" style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>Ver →</a>}
            </div>
          ))}
        </div>

        {/* Notas y acciones */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Notas para el propietario</label>
          <textarea value={notasKYC} onChange={e => setNotasKYC(e.target.value)} rows={3} placeholder="Ej. La foto de la cédula no es legible..." className="field" style={{ resize:'vertical', marginBottom:10 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={async () => {
              setUpdating(true)
              await supabase.from('propietarios').update({ verificado: true, verificacion_estado: 'aprobado', verificacion_notas: notasKYC||null, verificado_at: new Date().toISOString() }).eq('correo', sel.correo)
              onReload(); onMsg('✓ Propietario aprobado'); onClose()
              setUpdating(false)
            }} disabled={updating} className="btn btn-primary" style={{ flex:2, opacity:updating?0.5:1 }}>
              ✓ Aprobar propietario
            </button>
            <button onClick={async () => {
              if (!notasKYC) { onMsg('Agregá una nota de rechazo'); return }
              setUpdating(true)
              await supabase.from('propietarios').update({ verificado: false, verificacion_estado: 'rechazado', verificacion_notas: notasKYC }).eq('correo', sel.correo)
              onReload(); onMsg('Propietario rechazado'); onClose()
              setUpdating(false)
            }} disabled={updating} className="btn btn-danger" style={{ flex:1 }}>
              ✗ Rechazar
            </button>
          </div>
        </div>

        {/* Contacto directo */}
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Contacto directo</div>
          <div style={{ display:'flex', gap:8 }}>
            {sel.telefono && <a href={'https://wa.me/'+sel.telefono.replace(/[^0-9]/g,'')} target="_blank" className="btn" style={{ flex:1, background:'#22c55e', color:'white', textAlign:'center', textDecoration:'none', padding:'10px' }}>💬 WhatsApp</a>}
            <a href={'mailto:'+sel.correo+'?subject=Verificación NIDO - '+sel.nombre} className="btn btn-outline" style={{ flex:1, textAlign:'center', textDecoration:'none', padding:'10px' }}>✉ Email</a>
          </div>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'ticket') return (
    <TicketDetalle ticket={sel} onClose={onClose} onReload={onReload} onMsg={onMsg}/>
  )

  return null
}

// ── TICKET DE SOPORTE ──
function TicketDetalle({ ticket, onClose, onReload, onMsg }: any) {
  const [mensajes, setMensajes] = useState<any[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    supabase.from('soporte_mensajes').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true })
      .then(({ data }) => { setMensajes(data || []); setLoadingMsgs(false) })
  }, [ticket.id])

  const cambiarEstado = async (estado: string) => {
    await supabase.from('soporte_tickets').update({ estado, updated_at: new Date().toISOString() }).eq('id', ticket.id)
    onReload()
    onMsg('✓ Ticket marcado como ' + (estado==='en_progreso'?'en progreso':estado))
  }

  const responder = async () => {
    if (!respuesta.trim() || enviando) return
    setEnviando(true)
    await supabase.from('soporte_mensajes').insert({ ticket_id: ticket.id, remitente: 'admin', contenido: respuesta })
    await supabase.from('soporte_tickets').update({ estado: 'en_progreso', updated_at: new Date().toISOString() }).eq('id', ticket.id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session?.access_token },
      body: JSON.stringify({ to: ticket.usuario_email, tipo: 'mensaje_admin', data: { asunto: 'Re: ' + (ticket.asunto || 'Tu consulta con NIDO'), mensaje: respuesta } })
    }).catch(() => {})
    setMensajes(prev => [...prev, { remitente: 'admin', contenido: respuesta, created_at: new Date().toISOString() }])
    setRespuesta('')
    onReload()
    setEnviando(false)
  }

  const remitenteLabel: Record<string,string> = { usuario:'Usuario', valeria:'Valeria IA', admin:'Equipo NIDO' }

  return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Ticket de soporte · {ticket.usuario_tipo}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{ticket.asunto || 'Consulta de soporte'}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer', flexShrink:0 }}>×</button>
        </div>
        <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:12 }}>{ticket.usuario_nombre} · {ticket.usuario_email}{ticket.usuario_telefono ? ' · '+ticket.usuario_telefono : ''}</div>
        <div style={{ display:'flex', gap:8 }}>
          {['abierto','en_progreso','resuelto'].map(e => (
            <button key={e} onClick={() => cambiarEstado(e)} className={'tab'+(ticket.estado===e?' active':'')} style={{ fontSize:11, padding:'5px 12px' }}>
              {e==='en_progreso'?'En progreso':e.charAt(0).toUpperCase()+e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Conversación</div>
        {loadingMsgs ? (
          <p style={{ fontSize:13, color:'var(--ink-3)' }}>Cargando...</p>
        ) : mensajes.length === 0 ? (
          <p style={{ fontSize:13, color:'var(--ink-3)' }}>Sin mensajes registrados para este ticket.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {mensajes.map((m, i) => (
              <div key={m.id || i} style={{ padding:'10px 14px', borderRadius:10, background: m.remitente==='admin' ? 'var(--accent-tint)' : m.remitente==='valeria' ? 'var(--bg)' : 'white', border:'1px solid var(--rule-soft)' }}>
                <div style={{ fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:4 }}>{remitenteLabel[m.remitente] || m.remitente}</div>
                <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{m.contenido}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Responder al usuario</label>
          <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} rows={4} placeholder="Escribí tu respuesta — se envía por correo al usuario..." className="field" style={{ resize:'vertical', marginBottom:10 }}/>
          <button onClick={responder} disabled={!respuesta.trim() || enviando} className="btn btn-primary" style={{ width:'100%', opacity:(!respuesta.trim()||enviando)?0.5:1 }}>
            {enviando ? 'Enviando...' : 'Responder por email →'}
          </button>
        </div>
      </div>
    </div>
  )
}
