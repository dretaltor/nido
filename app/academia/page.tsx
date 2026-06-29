'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getPlanConfig } from '../../lib/planes'
import { useTrial } from '../../lib/useTrial'

const CURSOS = [
  { id:1, cat:'Ventas', nivel:'Básico', dur:'2 horas', titulo:'Fundamentos de ventas inmobiliarias', desc:'Aprende las bases para cerrar tu primera venta. Técnicas de prospección, presentación y cierre.', temas:['¿Qué busca un comprador?','Cómo hacer una presentación efectiva','Manejo de objeciones','Técnicas de cierre'], icon:'🏠', gratis:true, hue:150 },
  { id:2, cat:'IA', nivel:'Básico', dur:'1.5 horas', titulo:'Cómo usar Valeria IA para multiplicar tus ventas', desc:'Domina el asistente IA de NIDO para automatizar el 80% de tu trabajo y enfocarte en cerrar.', temas:['Generar emails con IA','Analizar tu pipeline','Crear descripciones de propiedades','Seguimiento automático'], icon:'✦', gratis:true, hue:200 },
  { id:3, cat:'Marketing', nivel:'Intermedio', dur:'3 horas', titulo:'Marketing digital para asesores inmobiliarios', desc:'Aprende a generar leads desde Instagram, Facebook y WhatsApp de forma orgánica y pagada.', temas:['Estrategia en redes sociales','Crear contenido que vende','Facebook Ads para inmuebles','WhatsApp Business'], icon:'📱', gratis:false, hue:280 },
  { id:4, cat:'Legal', nivel:'Intermedio', dur:'2.5 horas', titulo:'Aspectos legales en transacciones inmobiliarias', desc:'Comprende contratos, escrituras, due diligence y todo lo legal que necesitas saber.', temas:['Tipos de contratos','Promesa de compraventa','Due diligence','Proceso notarial en CR'], icon:'⚖️', gratis:false, hue:50 },
  { id:5, cat:'Inversión', nivel:'Avanzado', dur:'4 horas', titulo:'Análisis de inversión inmobiliaria', desc:'Aprende a calcular retornos, cap rates y analizar mercados como un profesional.', temas:['Cap rate y ROI','Análisis de mercado','Flujo de caja','Estrategias de salida'], icon:'📈', gratis:false, hue:80 },
  { id:6, cat:'Ventas', nivel:'Avanzado', dur:'3 horas', titulo:'Negociación y cierre de alto valor', desc:'Técnicas avanzadas para negociar propiedades premium y cerrar deals complejos.', temas:['Psicología del comprador premium','Negociación de precio','Manejo de múltiples ofertas','Post-cierre y referidos'], icon:'🤝', gratis:false, hue:130 },
]

const CATS = ['Todos','Ventas','IA','Marketing','Legal','Inversión']
const NIVELES = ['Todos','Básico','Intermedio','Avanzado']

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .chip{padding:7px 14px;border-radius:999px;border:1px solid var(--rule);font-size:12px;color:var(--ink-2);cursor:pointer;transition:all 0.15s;background:transparent}
  .chip:hover{border-color:var(--ink);color:var(--ink)}
  .chip.active{background:var(--ink);color:var(--bg);border-color:var(--ink)}
  .curso-card{background:white;border:1px solid var(--rule);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;transition:all 0.2s;cursor:pointer}
  .curso-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(27,94,59,0.1);border-color:var(--accent)}
  .drawer{position:fixed;top:0;right:0;bottom:0;width:440px;background:white;border-left:1px solid var(--rule);z-index:100;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,0.08);animation:slideIn 0.3s ease}
  @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:99}
  @media(max-width:768px){.cursos-grid{grid-template-columns:1fr!important}.drawer{width:100%!important}.nav-pad{padding:14px 16px!important}.page-pad{padding:24px 16px!important}}
`

export default function Academia() {
  const [cat, setCat] = useState('Todos')
  const [nivel, setNivel] = useState('Todos')
  const [sel, setSel] = useState<typeof CURSOS[0] | null>(null)
  const [planActivo, setPlanActivo] = useState<string | null>(null)
  const { bloqueado: trialBloqueado, checando: checandoTrial } = useTrial()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return
      const { data } = await supabase.from('suscripciones').select('plan,activo').eq('correo', user.email).maybeSingle()
      if (data?.activo) setPlanActivo(data.plan)
    })
  }, [])

  const todoDesbloqueado = getPlanConfig(planActivo).academiaCompleta

  if (!checandoTrial && trialBloqueado) return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:460, textAlign:'center', background:'white', border:'1px solid var(--rule)', borderRadius:20, padding:'44px 36px' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>⏳</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:400, marginBottom:10 }}>Tu prueba de NIDO Black terminó</h1>
        <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65, marginBottom:24 }}>Subí de plan para seguir accediendo a la Academia y sus certificaciones.</p>
        <a href="/precios" style={{ display:'inline-block', padding:'13px 28px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:14, fontWeight:500, textDecoration:'none' }}>Ver planes →</a>
      </div>
    </main>
  )

  const filtrados = CURSOS.filter(c =>
    (cat==='Todos'||c.cat===cat) && (nivel==='Todos'||c.nivel===nivel)
  )

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1400, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-3)' }}>
            <a href="/nosotros" style={{color:"var(--ink-3)",textDecoration:"none",fontSize:13}}>Nosotros</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/dashboard/crm">CRM</a>
            <a href="/academia" style={{ color:'var(--accent)', fontWeight:500 }}>Academia</a>
          </div>
          <a href="/dashboard/nueva-propiedad" style={{ background:'var(--ink)', color:'white', padding:'8px 18px', borderRadius:999, fontSize:13 }}>+ Nueva propiedad</a>
        </div>
      </nav>

      <div className="page-pad" style={{ maxWidth:1400, margin:'0 auto', padding:'32px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:32, animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Formación profesional</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,48px)', fontWeight:400, lineHeight:1.05, marginBottom:8 }}>
            Academia <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em>
          </h1>
          <p style={{ fontSize:15, color:'var(--ink-2)', maxWidth:'56ch', lineHeight:1.65 }}>
            Cursos diseñados para asesores que quieren cerrar más y trabajar mejor. Algunos son gratuitos, el resto incluidos en tu plan Pro.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
          {[
            { label:'Cursos disponibles', valor:'6', sub:'2 gratuitos' },
            { label:'Horas de contenido', valor:'16', sub:'a tu ritmo' },
            { label:'Categorías', valor:'5', sub:'especializadas' },
            { label:'Certificado', valor:'✓', sub:'al completar' },
          ].map((s,i) => (
            <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'16px 20px', animation:'fadeUp 0.4s ease '+(i*0.08)+'s both' }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--accent)', marginBottom:4 }}>{s.valor}</div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--ink-3)', marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:12, color:'var(--ink-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24, alignItems:'center' }}>
          <div style={{ display:'flex', gap:6 }}>
            {CATS.map(c => <button key={c} className={'chip'+(cat===c?' active':'')} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div style={{ width:1, height:24, background:'var(--rule)', margin:'0 4px' }}/>
          <div style={{ display:'flex', gap:6 }}>
            {NIVELES.map(n => <button key={n} className={'chip'+(nivel===n?' active':'')} onClick={() => setNivel(n)}>{n}</button>)}
          </div>
          <span style={{ marginLeft:'auto', fontSize:13, color:'var(--ink-3)' }}>{filtrados.length} cursos</span>
        </div>

        {/* Grid cursos */}
        <div className="cursos-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:40 }}>
          {filtrados.map(c => (
            <div key={c.id} className="curso-card" onClick={() => { if(c.gratis || todoDesbloqueado) { window.location.href = '/academia/curso?id=' + c.id } else { setSel(c) } }}>
              <div style={{ height:120, background:`oklch(0.88 0.03 ${c.hue})`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                <span style={{ fontSize:36 }}>{c.icon}</span>
                {c.gratis && <span style={{ position:'absolute', top:10, right:10, background:'var(--accent)', color:'white', fontSize:10, padding:'2px 10px', borderRadius:999, letterSpacing:'0.06em', fontWeight:500 }}>GRATIS</span>}
                {!c.gratis && todoDesbloqueado && <span style={{ position:'absolute', top:10, right:10, background:'var(--accent)', color:'white', fontSize:10, padding:'2px 10px', borderRadius:999, letterSpacing:'0.06em', fontWeight:500 }}>INCLUIDO</span>}
                {!c.gratis && !todoDesbloqueado && <span style={{ position:'absolute', top:10, right:10, background:'var(--ink)', color:'white', fontSize:10, padding:'2px 10px', borderRadius:999, letterSpacing:'0.06em' }}>PRO</span>}
              </div>
              <div style={{ padding:'16px 18px', flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', border:'1px solid var(--rule)', padding:'2px 8px', borderRadius:999 }}>{c.cat}</span>
                  <span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', border:'1px solid var(--rule)', padding:'2px 8px', borderRadius:999 }}>{c.nivel}</span>
                </div>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, lineHeight:1.2, marginBottom:8 }}>{c.titulo}</h3>
                <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.55, flex:1 }}>{c.desc}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, paddingTop:14, borderTop:'1px solid var(--rule-soft)' }}>
                  <span style={{ fontSize:12, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:4 }}>⏱ {c.dur}</span>
                  <span style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>Ver curso →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner Pro */}
        <div style={{ background:'var(--ink)', borderRadius:16, padding:'32px 40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'oklch(0.85 0.06 80)', marginBottom:12 }}>NIDO Pro</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400, color:'white', marginBottom:12, lineHeight:1.1 }}>Acceso completo a<br/>toda la <em style={{ fontStyle:'italic', color:'oklch(0.55 0.07 150)' }}>academia.</em></h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>Con el plan Pro accedés a todos los cursos, certificados y al soporte de Valeria IA para aplicar lo aprendido en tus cierres.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'flex-start' }}>
            {['Todos los cursos desbloqueados','Certificado NIDO de Asesor Pro','Valeria IA incluida 24/7','Soporte prioritario'].map(b => (
              <div key={b} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(255,255,255,0.7)' }}>
                <span style={{ width:20, height:20, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', fontSize:10, color:'white', flexShrink:0 }}>✓</span>
                {b}
              </div>
            ))}
            <a href="/precios" style={{ marginTop:8, background:'var(--accent)', color:'white', padding:'12px 24px', borderRadius:999, fontSize:14, fontWeight:500, textDecoration:'none' }}>Ver planes →</a>
          </div>
        </div>
      </div>

      {/* Drawer curso */}
      {sel && (
        <>
          <div className="overlay" onClick={() => setSel(null)}/>
          <div className="drawer">
            <div style={{ height:160, background:`oklch(0.88 0.03 ${sel.hue})`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0 }}>
              <span style={{ fontSize:52 }}>{sel.icon}</span>
              <button onClick={() => setSel(null)} style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.15)', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer', color:'white' }}>×</button>
              {sel.gratis
                ? <span style={{ position:'absolute', bottom:16, left:16, background:'var(--accent)', color:'white', fontSize:11, padding:'3px 12px', borderRadius:999, fontWeight:500 }}>GRATIS</span>
                : <span style={{ position:'absolute', bottom:16, left:16, background:'var(--ink)', color:'white', fontSize:11, padding:'3px 12px', borderRadius:999 }}>PLAN PRO</span>
              }
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', border:'1px solid var(--rule)', padding:'2px 8px', borderRadius:999 }}>{sel.cat}</span>
                <span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', border:'1px solid var(--rule)', padding:'2px 8px', borderRadius:999 }}>{sel.nivel}</span>
                <span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', border:'1px solid var(--rule)', padding:'2px 8px', borderRadius:999 }}>⏱ {sel.dur}</span>
              </div>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, lineHeight:1.15, marginBottom:12 }}>{sel.titulo}</h2>
              <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65, marginBottom:24 }}>{sel.desc}</p>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:14 }}>Contenido del curso</div>
                {sel.temas.map((t,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--rule-soft)' }}>
                    <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--mono)', fontSize:10, color:'var(--accent)', flexShrink:0 }}>{String(i+1).padStart(2,'0')}</span>
                    <span style={{ fontSize:14, color:'var(--ink-2)' }}>{t}</span>
                  </div>
                ))}
              </div>
              {(sel.gratis || todoDesbloqueado)
                ? <a href={'/academia/curso?id=' + sel.id} style={{ display:'block', textAlign:'center', width:'100%', padding:'13px', borderRadius:999, background:'var(--accent)', border:'none', color:'white', fontSize:14, fontWeight:500, cursor:'pointer', textDecoration:'none' }}>{sel.gratis ? 'Comenzar curso gratis →' : 'Comenzar curso →'}</a>
                : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'var(--ink-2)' }}>
                      Este curso es parte del plan Enterprise. Desbloquealo junto con todos los demás cursos.
                    </div>
                    <a href="/precios" style={{ display:'block', padding:'13px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:14, fontWeight:500, textAlign:'center', textDecoration:'none' }}>Ver plan Enterprise →</a>
                  </div>
              }
            </div>
          </div>
        </>
      )}
    </main>
  )
}
