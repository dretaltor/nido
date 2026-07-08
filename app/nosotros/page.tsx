'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Nosotros() {
  const router = useRouter()

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}
    .cta-btn{display:inline-block;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none;cursor:pointer;border:none;font-family:var(--sans);transition:all 0.2s}
    .cta-btn:hover{transform:translateY(-2px)}
    .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
    .divider{width:48px;height:2px;background:var(--accent);margin:0 auto 20px}
    @media(max-width:768px){.grid-3{grid-template-columns:1fr}.grid-2{grid-template-columns:1fr}.hide-mobile{display:none!important}}
  `

  return (
    <main style={{ fontFamily:'var(--sans)' }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(6,13,8,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', textDecoration:'none' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></Link>
        <div style={{ display:'flex', gap:24, fontSize:13 }} className="hide-mobile">
          <a href="#mision" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Misión</a>
          <a href="#modelo" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Modelo</a>
          <a href="#producto" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Producto</a>
          <a href="#red" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Red de asesores</a>
          <a href="#valores" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Valores</a>
          <a href="#latam" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Expansión</a>
        </div>
        <button onClick={() => router.push('/propiedades')} style={{ padding:'9px 20px', borderRadius:999, background:'oklch(0.42 0.06 150)', color:'white', fontSize:13, fontWeight:500, border:'none', cursor:'pointer' }}>
          Ver propiedades
        </button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.08, animation:'slow-zoom 24s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.3) 0%, rgba(6,13,8,0.98) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, maxWidth:800, animation:'fadeUp 0.6s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'6px 18px', marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'oklch(0.75 0.06 150)', display:'inline-block' }}/>
            <span style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)' }}>Fundada en Costa Rica · Visión LATAM</span>
          </div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(44px,7vw,88px)', fontWeight:400, lineHeight:1.0, marginBottom:24, color:'white' }}>
            Reimaginando el<br/>mercado <em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>inmobiliario.</em>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.8, maxWidth:580, margin:'0 auto 48px' }}>
            NIDO es una empresa de tecnología inmobiliaria fundada en Costa Rica con la misión de transformar la forma en que las personas compran, venden y gestionan propiedades en América Latina.
          </p>
          <div style={{ display:'flex', gap:32, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { val:'2024', label:'Año de fundación' },
              { val:'CR', label:'Sede central' },
              { val:'LATAM', label:'Visión de expansión' },
            ].map(s => (
              <div key={s.val} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:36, color:'var(--gold)', marginBottom:4 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section id="mision" style={{ background:'var(--bg)', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Propósito</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Lo que nos <em style={{ fontStyle:'italic', color:'var(--accent)' }}>mueve.</em>
            </h2>
          </div>
          <div className="grid-2" style={{ marginBottom:40 }}>
            {[
              {
                tag:'Misión',
                titulo:'Democratizar el acceso a transacciones inmobiliarias transparentes, seguras y eficientes.',
                desc:'NIDO existe para eliminar la brecha entre propietarios, compradores y profesionales inmobiliarios. A través de tecnología de inteligencia artificial, verificación registral y una red de asesores certificados, construimos un mercado donde la información es clara, los procesos son trazables y las personas toman mejores decisiones.',
                color:'var(--accent)',
              },
              {
                tag:'Visión',
                titulo:'Ser la plataforma inmobiliaria de referencia en América Latina para 2030.',
                desc:'Comenzamos en Costa Rica con la convicción de que el modelo es replicable en toda la región. Cada funcionalidad que construimos — desde Valeria IA hasta la verificación KYC — está diseñada para escalar. NIDO será el estándar de confianza y tecnología inmobiliaria en LATAM.',
                color:'oklch(0.52 0.08 230)',
              },
            ].map((item, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'32px' }}>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:item.color, marginBottom:16, fontWeight:600 }}>{item.tag}</div>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, lineHeight:1.3, marginBottom:16, color:'var(--ink)' }}>{item.titulo}</h3>
                <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Valores centrales */}
          <div id="valores" style={{ background:'var(--ink)', borderRadius:16, padding:'40px', marginBottom:0 }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Valores corporativos</div>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400, color:'white', lineHeight:1.1 }}>
                Los principios que<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>guían cada decisión.</em>
              </h3>
            </div>
            <div className="grid-3">
              {[
                { icon:'🔐', titulo:'Transparencia', desc:'Cada proceso, costo y resultado es visible para todas las partes. No hay letra pequeña en NIDO.' },
                { icon:'⚖️', titulo:'Integridad', desc:'Operamos bajo los más altos estándares éticos. La confianza es la base de cada transacción.' },
                { icon:'🚀', titulo:'Innovación', desc:'La tecnología es nuestro diferenciador. Usamos IA para hacer más eficiente lo que antes era lento y opaco.' },
                { icon:'🤝', titulo:'Compromiso', desc:'Con propietarios, compradores y asesores. Solo cobramos cuando generamos valor real.' },
                { icon:'🌎', titulo:'Impacto regional', desc:'Pensamos desde Costa Rica pero construimos para LATAM. Cada decisión considera la escalabilidad.' },
                { icon:'✓', titulo:'Excelencia', desc:'Nuestros asesores son certificados. Nuestras propiedades son verificadas. El estándar NIDO no se negocia.' },
              ].map((v, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'20px' }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>{v.icon}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'white', marginBottom:8 }}>{v.titulo}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.65 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EL MODELO */}
      <section id="modelo" style={{ background:'#060D08', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Modelo de negocio</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, color:'white' }}>
              Tres carriles.<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>Un ecosistema.</em>
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:540, margin:'16px auto 0' }}>
              NIDO opera simultáneamente como corredora, como plataforma SaaS para asesores y como portal de propiedades. Los tres carriles se refuerzan mutuamente.
            </p>
          </div>
          <div className="grid-3" style={{ marginBottom:40 }}>
            {[
              {
                num:'01',
                titulo:'Corredora inmobiliaria',
                desc:'Gestionamos la venta de propiedades directamente con un equipo de asesores certificados NIDO. Cobramos una comisión competitiva, y solo cuando la propiedad se vende.',
                items:['Propiedad verificada de principio a fin','Marketing y promoción incluidos','Acompañamiento legal y documental','Negociación en manos de profesionales'],
                color:'oklch(0.75 0.06 150)',
              },
              {
                num:'02',
                titulo:'Plataforma para asesores',
                desc:'Asesores inmobiliarios independientes se suscriben a NIDO para acceder a tecnología, formación y visibilidad que antes solo tenían las grandes inmobiliarias.',
                items:['Planes flexibles según el ritmo de cada asesor','Asistencia inteligente incluida','Formación continua con certificación','Portal y red de referidos'],
                color:'var(--gold)',
              },
              {
                num:'03',
                titulo:'Portal de propiedades',
                desc:'El portal público conecta compradores con propiedades verificadas y asesores calificados. Genera oportunidades reales para toda la red.',
                items:['Búsqueda intuitiva por zona','Información confiable en cada ficha','Contacto directo con el asesor a cargo','Estimación de valor sin costo'],
                color:'oklch(0.65 0.06 200)',
              },
            ].map((carril, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px', display:'flex', flexDirection:'column' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:11, color:carril.color, marginBottom:12, letterSpacing:'0.1em' }}>Carril {carril.num}</div>
                <div style={{ fontSize:17, fontWeight:500, color:'white', marginBottom:12, lineHeight:1.3 }}>{carril.titulo}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:20, flex:1 }}>{carril.desc}</div>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:16 }}>
                  {carril.items.map(item => (
                    <div key={item} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'rgba(255,255,255,0.55)' }}>
                      <span style={{ color:carril.color, fontSize:10 }}>✓</span> {item}
                    </div>
                  ))}
                  {carril.num === '02' && (
                    <a href="/precios" style={{ display:'inline-block', marginTop:6, fontSize:12, color:carril.color, textDecoration:'none' }}>Ver planes y precios →</a>
                  )}
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* RED DE ASESORES */}
      <section id="red" style={{ background:'var(--bg)', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Red colaborativa</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Asesores independientes.<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>Estándar NIDO.</em>
            </h2>
            <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.75, maxWidth:560, margin:'16px auto 0' }}>
              NIDO opera como una red colaborativa donde asesores inmobiliarios independientes se certifican y afilian a la plataforma, accediendo a tecnología, leads y respaldo institucional.
            </p>
          </div>

          {/* Diagrama conceptual */}
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:16, padding:'40px', marginBottom:32, textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap', position:'relative' }}>
              {/* Centro NIDO */}
              <div style={{ width:120, height:120, borderRadius:'50%', background:'var(--ink)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:2, position:'relative' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', fontStyle:'italic' }}>NIDO</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em' }}>HUB CENTRAL</div>
              </div>
              {/* Elementos orbitando */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginLeft:24 }}>
                {[
                  { icon:'👤', label:'Asesor afiliado', color:'var(--accent-tint)', border:'oklch(0.85 0.04 150)' },
                  { icon:'🏠', label:'Propietario', color:'oklch(0.95 0.02 240)', border:'oklch(0.85 0.03 240)' },
                  { icon:'🔍', label:'Comprador', color:'oklch(0.95 0.02 80)', border:'oklch(0.88 0.03 80)' },
                  { icon:'✦', label:'Valeria IA', color:'oklch(0.93 0.03 150)', border:'oklch(0.85 0.04 150)' },
                  { icon:'📋', label:'Registro Nacional', color:'oklch(0.95 0.01 80)', border:'var(--rule)' },
                  { icon:'⚖️', label:'Notaría', color:'oklch(0.95 0.01 80)', border:'var(--rule)' },
                ].map((item, i) => (
                  <div key={i} style={{ background:item.color, border:'1px solid '+item.border, borderRadius:10, padding:'12px 16px', textAlign:'center', minWidth:100 }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{item.icon}</div>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--ink)', lineHeight:1.3 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2">
            {[
              {
                titulo:'Para el asesor afiliado',
                items:[
                  'Acceso a CRM, Valeria IA y academia con suscripción mensual',
                  'Leads calificados del portal NIDO',
                  'Respaldo institucional y credencial verificada',
                  'Certificación NIDO que diferencia al profesional',
                  'Herramientas que multiplican su productividad',
                  'Comunidad y red de colaboración entre asesores',
                ],
                color:'var(--accent)',
              },
              {
                titulo:'Para el cliente (propietario o comprador)',
                items:[
                  'Asesor con identidad y calificaciones verificadas',
                  'Propiedades verificadas en el Registro Nacional',
                  'Proceso transparente con trazabilidad completa',
                  'Tecnología IA que agiliza cada paso',
                  'Respaldo de NIDO como empresa detrás del proceso',
                  'Comisión solo al cierre — sin costos anticipados',
                ],
                color:'oklch(0.52 0.08 230)',
              },
            ].map((col, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'28px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:col.color, marginBottom:18, textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.titulo}</div>
                {col.items.map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12, fontSize:14, color:'var(--ink-2)', lineHeight:1.55 }}>
                    <span style={{ color:col.color, flexShrink:0, marginTop:2 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LO QUE OFRECEMOS HOY + ROADMAP */}
      <section id="producto" style={{ background:'var(--bg)', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>La plataforma</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Lo que ofrecemos <em style={{ fontStyle:'italic', color:'var(--accent)' }}>hoy.</em>
            </h2>
            <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.75, maxWidth:560, margin:'16px auto 0' }}>
              NIDO no es una promesa — es una plataforma en producción, usada por asesores reales todos los días.
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom:48 }}>
            {[
              {
                icon:'🏠', titulo:'Si vendés o alquilás una propiedad',
                items:[
                  'Tu propiedad llega solo a interesados con intención real de comprar',
                  'Nunca estás solo: hay un asesor certificado y tecnología de respaldo en cada paso',
                  'Sabés en todo momento en qué etapa está tu proceso',
                  'Revisamos que tu propiedad esté en condiciones de venderse antes de publicarla',
                ],
                color:'var(--accent)',
              },
              {
                icon:'🔍', titulo:'Si estás buscando comprar',
                items:[
                  'Cada propiedad que ves fue verificada antes de llegar al portal',
                  'Un asistente inteligente te acompaña desde la primera pregunta hasta la visita',
                  'Tratás siempre con un asesor certificado, no con un intermediario improvisado',
                  'Toda la información que necesitás para decidir, en un solo lugar',
                ],
                color:'oklch(0.52 0.08 230)',
              },
              {
                icon:'🎓', titulo:'Si sos asesor inmobiliario',
                items:[
                  'Herramientas de nivel corporativo, accesibles para un asesor independiente',
                  'Oportunidades calificadas que llegan mientras atendés a tus otros clientes',
                  'Formación continua y una certificación que te distingue en el mercado',
                  'Una red donde los asesores colaboran en vez de competir entre sí',
                ],
                color:'var(--gold)',
              },
              {
                icon:'🛡️', titulo:'El respaldo detrás de cada transacción',
                items:[
                  'Presencia en todo el país, en cada provincia y cantón',
                  'Inteligencia artificial trabajando de forma constante para que ninguna oportunidad se pierda',
                  'Verificación de identidad y de propiedad antes de que nadie negocie',
                  'Cada paso queda documentado y trazable — nada se pierde en una conversación suelta',
                ],
                color:'oklch(0.65 0.06 200)',
              },
            ].map((col, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'28px' }}>
                <div style={{ fontSize:26, marginBottom:12 }}>{col.icon}</div>
                <div style={{ fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:16 }}>{col.titulo}</div>
                {col.items.map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:11, fontSize:13, color:'var(--ink-3)', lineHeight:1.55 }}>
                    <span style={{ color:col.color, flexShrink:0, marginTop:2 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* EXPANSIÓN LATAM */}
      <section id="latam" style={{ background:'#060D08', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Visión 2030</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, color:'white' }}>
              Nacimos en Costa Rica.<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>Pensamos en LATAM.</em>
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:560, margin:'16px auto 0' }}>
              El modelo NIDO está diseñado para replicarse. La tecnología es el núcleo — el mercado es la región.
            </p>
          </div>

          {/* Roadmap */}
          <div style={{ display:'flex', flexDirection:'column', gap:0, marginBottom:48 }}>
            {[
              { año:'2024', fase:'Fundación', hito:'Lanzamiento de NIDO en Costa Rica. Desarrollo de plataforma, Valeria IA y red inicial de asesores certificados.', activo:true },
              { año:'2025', fase:'Consolidación CR', hito:'Crecimiento de la red de asesores, primeras transacciones cerradas, optimización del modelo y expansión a zonas costeras.', activo:true },
              { año:'2026', fase:'Escala nacional', hito:'Cobertura nacional en Costa Rica, lanzamiento del portal para compradores internacionales y versión en inglés para nómadas digitales.', activo:true },
              { año:'2027', fase:'Expansión regional', hito:'Entrada a Panama y Colombia como mercados piloto. Adaptación del modelo regulatorio por país.', activo:false },
              { año:'2028–2030', fase:'LATAM', hito:'Expansión a México, Chile, Perú y otros mercados de alto crecimiento inmobiliario en la región.', activo:false },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:24, paddingBottom:28, position:'relative' }}>
                {i < 4 && <div style={{ position:'absolute', left:19, top:44, bottom:0, width:2, background:item.activo?'oklch(0.42 0.06 150/0.4)':'rgba(255,255,255,0.06)' }}/>}
                <div style={{ width:40, height:40, borderRadius:'50%', background:item.activo?'var(--accent)':'rgba(255,255,255,0.08)', display:'grid', placeItems:'center', flexShrink:0, zIndex:1, border:item.activo?'none':'1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:item.activo?'white':'rgba(255,255,255,0.3)' }}/>
                </div>
                <div style={{ flex:1, paddingTop:8 }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontFamily:'var(--mono)', fontSize:12, color:item.activo?'oklch(0.75 0.06 150)':'rgba(255,255,255,0.3)' }}>{item.año}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:item.activo?'white':'rgba(255,255,255,0.4)' }}>{item.fase}</span>
                    {item.activo && <span style={{ fontSize:10, background:'oklch(0.42 0.06 150/0.2)', color:'oklch(0.75 0.06 150)', padding:'2px 8px', borderRadius:999, letterSpacing:'0.06em' }}>EN CURSO</span>}
                  </div>
                  <div style={{ fontSize:14, color:item.activo?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.25)', lineHeight:1.7 }}>{item.hito}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mercado objetivo */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'32px' }}>
            <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Mercado objetivo LATAM</div>
            <div className="grid-3">
              {[
                { val:'$1.2T', label:'Mercado inmobiliario LATAM', sub:'Estimado 2026 (USD)' },
                { val:'680M', label:'Población objetivo', sub:'Clase media y alta en crecimiento' },
                { val:'< 5%', label:'Penetración digital actual', sub:'Oportunidad masiva de disrupción' },
              ].map(s => (
                <div key={s.val} style={{ textAlign:'center', padding:'20px', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:36, color:'var(--gold)', marginBottom:6 }}>{s.val}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'white', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background:'var(--bg)', padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:16 }}>Únete a NIDO</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(36px,5vw,56px)', fontWeight:400, lineHeight:1.05, marginBottom:16 }}>
            Sé parte del cambio<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>inmobiliario.</em>
          </h2>
          <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.75, marginBottom:36 }}>
            Ya seas propietario, comprador o asesor inmobiliario — NIDO tiene un lugar para vos en el ecosistema.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/registro')} className="cta-btn" style={{ background:'var(--ink)', color:'white' }}>
              Soy asesor inmobiliario →
            </button>
            <button onClick={() => router.push('/vendedor-onboarding')} className="cta-btn" style={{ background:'var(--accent)', color:'white' }}>
              Quiero vender →
            </button>
            <button onClick={() => router.push('/propiedades')} className="cta-btn" style={{ background:'transparent', color:'var(--ink)', border:'1px solid var(--rule)' }}>
              Busco comprar
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#040A06', padding:'28px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.04)', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontFamily:'var(--serif)', fontSize:20, color:'white' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></span>
        <div style={{ display:'flex', gap:24, fontSize:12 }}>
          <Link href="/propiedades" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Portal</Link>
          <a href="/asesores" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Asesores</a>
          <a href="/academia" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Academia</a>
          <a href="/privacidad" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Privacidad</a>
          <a href="/terminos" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Términos</a>
        </div>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>© 2026 NIDO · Costa Rica</span>
      </footer>
    </main>
  )
}
