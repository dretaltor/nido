'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLANES = [
  {
    id: 'gratis',
    nombre: 'Despega',
    desc: 'Para empezar a explorar NIDO sin compromiso.',
    precio_mes: 0,
    precio_ano: 0,
    badge: null,
    cta: 'Crear cuenta gratis',
    href: '/registro',
    featured: false,
    features: [
      { texto: '5 propiedades publicadas', ok: true },
      { texto: 'Ficha básica sin fotos premium', ok: true },
      { texto: 'Acceso de lectura al portal', ok: true },
      { texto: 'Perfil de asesor público', ok: true },
      { texto: 'Valeria IA', ok: false },
      { texto: 'CRM de leads', ok: false },
      { texto: 'Estadísticas de vistas', ok: false },
      { texto: 'Academia NIDO', ok: false },
      { texto: 'Soporte prioritario', ok: false },
    ]
  },
  {
    id: 'pro',
    nombre: 'Elite',
    desc: 'Para asesores que quieren crecer con IA y automatización.',
    precio_mes: 59,
    precio_ano: 45,
    badge: 'Más popular',
    cta: 'Empezar Elite',
    href: '/registro?plan=pro',
    featured: false,
    features: [
      { texto: '15 propiedades publicadas', ok: true },
      { texto: 'Galería de fotos ilimitada', ok: true },
      { texto: 'Valeria IA — asesora 24/7', ok: true },
      { texto: 'CRM de leads completo', ok: true },
      { texto: 'Estadísticas y métricas', ok: true },
      { texto: 'Academia NIDO completa', ok: true },
      { texto: 'Tour 360° (1 por mes)', ok: true },
      { texto: 'Soporte en 24 horas', ok: true },
      { texto: 'Panel propietario avanzado', ok: false },
    ]
  },
  {
    id: 'enterprise',
    nombre: 'Black',
    desc: 'Para asesores top y equipos que quieren dominar el mercado.',
    precio_mes: 149,
    precio_ano: 115,
    badge: 'Mayor valor',
    cta: 'Empezar Black',
    href: '/registro?plan=enterprise',
    featured: true,
    features: [
      { texto: 'Propiedades ilimitadas', ok: true },
      { texto: 'Galería de fotos ilimitada', ok: true },
      { texto: 'Valeria IA con memoria y contexto', ok: true },
      { texto: 'CRM avanzado con score de leads', ok: true },
      { texto: 'Leads premium de las calculadoras (prioridad automática)', ok: true },
      { texto: 'Valeria por WhatsApp — mentora de mercado 24/7 y notificaciones en vivo', ok: true },
      { texto: 'Estadísticas en tiempo real', ok: true },
      { texto: 'Academia NIDO + certificaciones', ok: true },
      { texto: 'Tour 360° (1 por mes incluido, adicionales con costo)', ok: true },
      { texto: 'Soporte prioritario en 2 horas', ok: true },
      { texto: 'Panel propietario avanzado', ok: true },
    ]
  },
]

const DIFERENCIAS = [
  { feature: 'Propiedades publicadas', gratis: '5', pro: '15', enterprise: 'Ilimitadas' },
  { feature: 'Fotos por propiedad', gratis: '3', pro: 'Ilimitadas', enterprise: 'Ilimitadas' },
  { feature: 'Valeria IA', gratis: '—', pro: 'Básica', enterprise: 'Con memoria y contexto' },
  { feature: 'CRM de leads', gratis: '—', pro: 'Completo', enterprise: 'Avanzado + score' },
  { feature: 'Tours 360°', gratis: '—', pro: '1 por mes incluido', enterprise: '1 por mes incluido + adicionales' },
  { feature: 'Valeria por WhatsApp', gratis: '—', pro: '—', enterprise: 'Mentora de mercado + notificaciones en vivo' },
  { feature: 'Academia NIDO', gratis: '—', pro: 'Cursos básicos', enterprise: 'Todo + certificaciones' },
  { feature: 'Soporte', gratis: 'Email', pro: '24 horas', enterprise: '2 horas' },
  { feature: 'Estadísticas', gratis: '—', pro: 'Semanales', enterprise: 'Tiempo real' },
  { feature: 'Panel propietario', gratis: '—', pro: '—', enterprise: '✓' },
  { feature: 'Descuento anual', gratis: '—', pro: '20%', enterprise: '23%' },
]

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .toggle-group{display:inline-flex;border:1px solid var(--rule);border-radius:999px;padding:4px;background:var(--bg-card)}
  .toggle-btn{padding:8px 22px;border-radius:999px;border:none;background:transparent;font-size:13px;color:var(--ink-2);cursor:pointer;transition:all 0.2s;font-family:var(--sans)}
  .toggle-btn.active{background:var(--ink);color:white}
  .plan-card{background:white;border:1px solid var(--rule);border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:20px;transition:all 0.25s;position:relative;overflow:hidden}
  .plan-card:hover{box-shadow:0 8px 32px rgba(27,94,59,0.1)}
  .plan-card.featured{border-color:var(--ink);background:var(--ink)}
  .feat-row{display:flex;align-items:center;gap:10px;font-size:13px}
  .check{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;font-size:10px}
  .check.ok{background:var(--accent);color:white}
  .check.no{background:var(--rule);color:var(--ink-3)}
  .cta-btn{width:100%;padding:13px;border-radius:999px;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:var(--sans)}
  .cta-btn:hover{transform:translateY(-1px)}
  .cta-btn.dark{background:white;color:var(--ink)}
  .cta-btn.dark:hover{background:oklch(0.93 0.005 80)}
  .cta-btn.light{background:var(--ink);color:white}
  .cta-btn.light:hover{background:oklch(0.28 0.006 80)}
  .cta-btn.accent{background:var(--accent);color:white}
  .cta-btn.accent:hover{background:oklch(0.38 0.06 150)}
  .table-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid var(--rule-soft)}
  .table-row:last-child{border-bottom:none}
  .table-cell{padding:14px 16px;font-size:13px;display:flex;align-items:center}
  .table-cell.center{justify-content:center;text-align:center}
  .table-header{background:var(--ink);color:white;border-radius:8px 8px 0 0}
  .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .table-inner{min-width:560px}
  @media(max-width:900px){.planes-grid{grid-template-columns:1fr!important}.nav-pad{padding:14px 16px!important}.page-pad{padding:32px 16px 80px!important}.nav-links{display:none!important}.table-scroll-hint{display:block!important}}
`

export default function Precios() {
  const router = useRouter()
  const [anual, setAnual] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const [showPago, setShowPago] = useState(false)
  const [planSeleccionado, setPlanSeleccionado] = useState<string>('')

  const SINPE = '8822-6436'
  const IBAN = 'CR21015200009876543210'
  const BANCO = 'Banco Nacional de Costa Rica'
  const CUENTA_NOMBRE = 'NIDO Plataforma Inmobiliaria'

  const PLANES_INFO: Record<string, {nombre:string, precio:string, precioAnual:string}> = {
    pro: { nombre:'NIDO Elite', precio:'$59/mes', precioAnual:'$45/mes (facturado anual)' },
    enterprise: { nombre:'NIDO Black', precio:'$149/mes', precioAnual:'$115/mes (facturado anual)' },
  }

  const handleSuscribirse = async (planId: string) => {
    if (planId === 'gratis') { router.push('/registro'); return }
    setPlanSeleccionado(planId)
    setShowPago(true)
  }

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1300, margin:'0 auto' }}>
          <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
          <div className="nav-links" style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-3)' }}>
            <Link href="/propiedades">Portal</Link>
            <a href="/nosotros">Nosotros</a>
            <a href="/asesores">Asesores</a>
            <a href="/academia">Academia</a>
            <a href="/precios" style={{ color:'var(--accent)', fontWeight:500 }}>Planes</a>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <a href="/login" style={{ border:'1px solid var(--rule)', padding:'8px 16px', borderRadius:999, fontSize:13 }}>Ingresar</a>
            <a href="/registro" style={{ background:'var(--ink)', color:'white', padding:'8px 16px', borderRadius:999, fontSize:13 }}>Crear cuenta</a>
          </div>
        </div>
      </nav>

      <div className="page-pad" style={{ maxWidth:1300, margin:'0 auto', padding:'48px 40px 80px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto 48px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:14 }}>Planes para asesores</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, marginBottom:16 }}>
            Invertí en tu <em style={{ fontStyle:'italic', color:'var(--accent)' }}>carrera.</em>
          </h1>
          <p style={{ fontSize:16, color:'var(--ink-2)', lineHeight:1.65, marginBottom:28 }}>
            Los asesores NIDO Elite cierran 2.4× más rápido. Los Black dominan su zona.
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
            <div className="toggle-group">
              <button className={'toggle-btn'+(anual?'':' active')} onClick={() => setAnual(false)}>Mensual</button>
              <button className={'toggle-btn'+(anual?' active':'')} onClick={() => setAnual(true)}>Anual</button>
            </div>
            {anual && <span style={{ fontSize:12, color:'var(--accent)', fontWeight:500, background:'var(--accent-tint)', padding:'4px 12px', borderRadius:999 }}>Ahorrás hasta 23%</span>}
          </div>
        </div>

        {/* Planes */}
        <div className="planes-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:64, alignItems:'start' }}>
          {PLANES.map((p, idx) => (
            <div key={p.id} className={'plan-card'+(p.featured?' featured':'')} style={{ animation:'fadeUp 0.4s ease '+(idx*0.1)+'s both' }}>
              {p.badge && (
                <div style={{ position:'absolute', top:20, right:20, background:p.featured?'oklch(0.85 0.06 80)':'var(--ink)', color:p.featured?'var(--ink)':'white', fontSize:10, letterSpacing:'0.1em', fontWeight:500, padding:'3px 10px', borderRadius:999, textTransform:'uppercase' }}>
                  {p.badge}
                </div>
              )}

              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:p.featured?'oklch(0.85 0.06 80)':'var(--ink-3)', marginBottom:8 }}>{p.nombre}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6 }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize:52, fontWeight:400, color:p.featured?'white':'var(--ink)', lineHeight:1 }}>
                    {p.precio_mes === 0 ? 'Gratis' : (anual ? p.precio_ano : p.precio_mes) === 0 ? 'Gratis' : '$' + (anual ? p.precio_ano : p.precio_mes)}
                  </span>
                  {p.precio_mes > 0 && <span style={{ fontSize:14, color:p.featured?'rgba(255,255,255,0.5)':'var(--ink-3)' }}>/mes</span>}
                </div>
                {p.precio_mes > 0 && anual && (
                  <div style={{ fontSize:12, color:p.featured?'rgba(255,255,255,0.5)':'var(--ink-3)', marginBottom:4 }}>
                    Facturado como ${p.precio_ano * 12}/año
                  </div>
                )}
                <p style={{ fontSize:13, color:p.featured?'rgba(255,255,255,0.6)':'var(--ink-2)', lineHeight:1.55, marginTop:8 }}>{p.desc}</p>
              </div>

              <div style={{ borderTop:'1px solid '+(p.featured?'rgba(255,255,255,0.1)':'var(--rule)'), paddingTop:20, display:'flex', flexDirection:'column', gap:10 }}>
                {p.features.map((f, i) => (
                  <div key={i} className="feat-row">
                    <span className={'check'+(f.ok?' ok':' no')} style={{ background:f.ok?(p.featured?'var(--accent)':'var(--accent)'):'rgba(255,255,255,0.1)', color:f.ok?'white':(p.featured?'rgba(255,255,255,0.3)':'var(--ink-3)') }}>
                      {f.ok ? '✓' : '—'}
                    </span>
                    <span style={{ color:p.featured?(f.ok?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.35)'):(f.ok?'var(--ink)':'var(--ink-3)'), textDecoration:f.ok?'none':'none' }}>
                      {f.texto}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSuscribirse(p.id)}
                disabled={loadingPlan === p.id}
                className={'cta-btn '+(p.featured?'dark':p.id==='gratis'?'light':'accent')}
                style={{ display:'block', textAlign:'center', width:'100%', padding:13, borderRadius:999, fontSize:14, fontWeight:500, transition:'all 0.2s', marginTop:'auto', cursor:'pointer', opacity:loadingPlan===p.id?0.7:1 }}
              >
                {loadingPlan === p.id ? 'Redirigiendo...' : p.cta + ' →'}
              </button>
            </div>
          ))}
        </div>

        {/* Plan Equipo / Inmobiliaria */}
        <div style={{ background:'var(--ink)', borderRadius:20, padding:'40px', marginBottom:64, display:'flex', flexWrap:'wrap', gap:32, alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ flex:'1 1 320px', minWidth:280 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'oklch(0.85 0.06 80)', marginBottom:10 }}>Para equipos e inmobiliarias</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400, color:'white', marginBottom:12, lineHeight:1.15 }}>
              ¿Lideras un equipo? <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Hay un plan para eso.</em>
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:440 }}>
              El plan Inmobiliaria agrupa a varios asesores bajo una sola cuenta administrada: invitás a tu equipo por correo, asignás roles, y ves el reporte de comisiones de todos en un solo panel — sin procesos manuales.
            </p>
          </div>
          <div style={{ flex:'0 0 auto', display:'flex', gap:16, flexWrap:'wrap' }}>
            {[
              { nombre:'Inmobiliaria Junior', precio:'$249', sub:'hasta 5 agentes · 100 propiedades' },
              { nombre:'Inmobiliaria Senior', precio:'$480', sub:'hasta 15 agentes · 250 propiedades' },
            ].map(p => (
              <div key={p.nombre} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'20px 24px', minWidth:200 }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>{p.nombre}</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:30, color:'white', marginBottom:4 }}>{p.precio}<span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>/mes</span></div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{p.sub}</div>
              </div>
            ))}
            <a href="/dashboard/equipo" style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent)', color:'white', padding:'0 28px', borderRadius:999, fontSize:14, fontWeight:500, textDecoration:'none', minHeight:48 }}>
              Crear mi equipo →
            </a>
          </div>
        </div>

        {/* Tabla comparativa */}
        <div style={{ marginBottom:64 }}>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:28, fontWeight:400, textAlign:'center', marginBottom:32 }}>
            Comparación <em style={{ fontStyle:'italic', color:'var(--accent)' }}>detallada.</em>
          </h2>
          <div className="table-scroll" style={{ border:'1px solid var(--rule)', borderRadius:12 }}>
            <div className="table-inner">
              <div className="table-row table-header">
                <div className="table-cell" style={{ fontWeight:500, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>Funcionalidad</div>
                {['Despega','Elite','Black'].map(n => (
                  <div key={n} className="table-cell center" style={{ fontWeight:500, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>{n}</div>
                ))}
              </div>
              {DIFERENCIAS.map((r, i) => (
                <div key={i} className="table-row" style={{ background:i%2===0?'white':'var(--bg-elev)' }}>
                  <div className="table-cell" style={{ fontWeight:500, color:'var(--ink)' }}>{r.feature}</div>
                  <div className="table-cell center" style={{ color:'var(--ink-3)' }}>{r.gratis}</div>
                  <div className="table-cell center" style={{ color:'var(--ink-2)' }}>{r.pro}</div>
                  <div className="table-cell center" style={{ color:'var(--accent)', fontWeight:500 }}>{r.enterprise}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="table-scroll-hint" style={{ display:'none', fontSize:11, color:'var(--ink-3)', textAlign:'center', marginTop:8 }}>← Deslizá para ver Elite y Black →</p>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:640, margin:'0 auto 64px' }}>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:28, fontWeight:400, textAlign:'center', marginBottom:28 }}>Preguntas <em style={{ fontStyle:'italic', color:'var(--accent)' }}>frecuentes.</em></h2>
          {[
            { q:'¿Puedo cambiar de plan en cualquier momento?', a:'Sí. Podés hacer upgrade o downgrade en cualquier momento. Si hacés upgrade, el cambio aplica inmediatamente. Si hacés downgrade, aplica al siguiente ciclo.' },
            { q:'¿Qué pasa con mis propiedades si hago downgrade?', a:'Si bajás al plan Despega, tus propiedades se pausan (no se eliminan) hasta que volvás a un plan pago.' },
            { q:'¿Aceptan tarjetas costarricenses?', a:'Sí. Aceptamos Visa y Mastercard locales e internacionales, y próximamente SINPE Móvil.' },
            { q:'¿Hay contrato de permanencia?', a:'No. En el plan mensual podés cancelar cuando quieras. El plan anual no tiene reembolsos parciales.' },
            { q:'¿Qué incluye exactamente Valeria IA?', a:'En Elite, Valeria puede redactar descripciones, analizar leads y responder consultas. En Black, además recuerda el historial de tus propiedades y compradores para un asesoramiento más profundo.' },
            { q:'¿Cómo funciona Valeria por WhatsApp?', a:'Exclusivo del plan Black: Valeria te escribe directo a tu WhatsApp. Actúa como tu mentora de mercado (precios por m², tendencias de zona, CMA rápido de una propiedad), te avisa en el momento cuando llega un lead nuevo o se enfría uno viejo, te manda un resumen cada mañana con tus leads, visitas y tickets del día, y te ayuda a redactar descripciones y mensajes de seguimiento — todo sin salir del chat.' },
          ].map((f, i) => (
            <div key={i} style={{ borderTop:'1px solid var(--rule)', padding:'18px 0' }}>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:8, color:'var(--ink)' }}>{f.q}</div>
              <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65 }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div style={{ background:'var(--ink)', borderRadius:20, padding:'48px', textAlign:'center', maxWidth:700, margin:'0 auto' }}>
          <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'oklch(0.85 0.06 80)', marginBottom:12, letterSpacing:'0.08em' }}>¿Todavía con dudas?</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:36, fontWeight:400, color:'white', marginBottom:12, lineHeight:1.1 }}>
            Empezá gratis.<br/>Crecé cuando estés listo.
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65, marginBottom:28, maxWidth:420, margin:'0 auto 28px' }}>
            No necesitás tarjeta de crédito para empezar. El plan Despega incluye 7 días de Black gratis para probar todo.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/registro" style={{ background:'var(--accent)', color:'white', padding:'13px 28px', borderRadius:999, fontSize:14, fontWeight:500, textDecoration:'none', display:'inline-block' }}>Crear cuenta gratis →</a>
            <button onClick={() => handleSuscribirse('enterprise')} disabled={loadingPlan==='enterprise'} style={{ border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'13px 28px', borderRadius:999, fontSize:14, background:'transparent', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", opacity:loadingPlan==='enterprise'?0.7:1 }}>{loadingPlan==='enterprise'?'Redirigiendo...':'Ver Black'}</button>
          </div>
        </div>

      </div>

      {/* Modal pago SINPE/Transferencia */}
      {showPago && (
        <>
          <div onClick={() => setShowPago(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, background:'white', borderRadius:20, padding:'36px', maxWidth:480, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Plan seleccionado</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400 }}>{PLANES_INFO[planSeleccionado]?.nombre}</div>
                <div style={{ fontSize:14, color:'var(--ink-3)', marginTop:4 }}>{anual ? PLANES_INFO[planSeleccionado]?.precioAnual : PLANES_INFO[planSeleccionado]?.precio}</div>
              </div>
              <button onClick={() => setShowPago(false)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:18, cursor:'pointer', display:'grid', placeItems:'center' }}>×</button>
            </div>

            <div style={{ background:'var(--bg)', borderRadius:12, padding:'20px', marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:16 }}>Datos de pago</div>
              
              {/* SINPE */}
              <div style={{ marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--rule)' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ background:'#00A651', color:'white', fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:600 }}>SINPE Móvil</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:22, fontWeight:600, color:'var(--ink)', letterSpacing:'0.1em' }}>{SINPE}</span>
                  <button onClick={() => navigator.clipboard.writeText(SINPE.replace('-',''))} style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-tint)', border:'none', padding:'5px 12px', borderRadius:999, cursor:'pointer' }}>
                    Copiar
                  </button>
                </div>
                <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:4 }}>A nombre de: {CUENTA_NOMBRE}</div>
              </div>

              {/* Transferencia */}
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:8 }}>Transferencia bancaria</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {[
                    { l:'Banco', v:BANCO },
                    { l:'Cuenta', v:CUENTA_NOMBRE },
                    { l:'IBAN', v:IBAN },
                  ].map(f => (
                    <div key={f.l} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
                      <span style={{ fontFamily: f.l==='IBAN'?'var(--mono)':'var(--sans)', fontWeight:500, fontSize: f.l==='IBAN'?11:13 }}>{f.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background:'oklch(0.93 0.05 80)', border:'1px solid oklch(0.88 0.05 80)', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'oklch(0.40 0.08 80)', lineHeight:1.6 }}>
              ⚠️ Después de realizar el pago, envianos el comprobante por WhatsApp al <strong>8822-6436</strong> indicando tu correo registrado y el plan elegido. Activamos tu cuenta en menos de 24 horas hábiles.
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <a href={'https://wa.me/50688226436?text=Hola NIDO, realicé el pago del plan '+PLANES_INFO[planSeleccionado]?.nombre+'. Mi correo es: '} target="_blank" style={{ flex:1, padding:'12px', borderRadius:999, background:'#22c55e', color:'white', fontSize:14, fontWeight:500, textAlign:'center', textDecoration:'none', display:'block' }}>
                💬 Enviar comprobante por WhatsApp
              </a>
              <button onClick={() => setShowPago(false)} style={{ padding:'12px 20px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:14, cursor:'pointer', color:'var(--ink-2)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
