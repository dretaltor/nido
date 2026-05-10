'use client'
import { useRouter } from 'next/navigation'

export default function Corredora() {
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
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    @media(max-width:768px){.grid-3{grid-template-columns:1fr}.grid-2{grid-template-columns:1fr}.hide-mobile{display:none!important}.hero-h{font-size:40px!important}}
  `

  return (
    <main style={{ fontFamily:'var(--sans)' }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(6,13,8,0.88)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', textDecoration:'none' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></a>
        <div style={{ display:'flex', gap:24, fontSize:13 }} className="hide-mobile">
          <a href="#dolor" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>El problema</a>
          <a href="#solucion" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>La solución</a>
          <a href="#equipo" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Nuestro equipo</a>
          <a href="#proceso" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>El proceso</a>
        </div>
        <button onClick={() => router.push('/vendedor-onboarding')} style={{ padding:'9px 20px', borderRadius:999, background:'var(--gold)', color:'#060D08', fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
          Vender mi propiedad
        </button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.1, animation:'slow-zoom 24s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.4) 0%, rgba(6,13,8,0.97) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, maxWidth:760, animation:'fadeUp 0.6s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'6px 16px', marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'oklch(0.75 0.06 150)', display:'inline-block' }}/>
            <span style={{ fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>Corredora Inmobiliaria · Costa Rica</span>
          </div>
          <h1 className="hero-h" style={{ fontFamily:'var(--serif)', fontSize:'clamp(44px,7vw,84px)', fontWeight:400, lineHeight:1.0, marginBottom:20, color:'white' }}>
            Vendé con el equipo<br/>que <em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>sí sabe cómo.</em>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:540, margin:'0 auto 40px' }}>
            NIDO es una corredora inmobiliaria con tecnología IA, asesores certificados y un proceso transparente diseñado para propietarios que quieren resultados reales.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/vendedor-onboarding')} className="cta-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white' }}>
              Quiero vender mi propiedad →
            </button>
            <a href="#dolor" className="cta-btn" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
              Ver cómo funcionamos ↓
            </a>
          </div>
        </div>
      </section>

      {/* PUNTOS DE DOLOR */}
      <section id="dolor" style={{ background:'var(--bg)', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>El problema real</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Vender solo es<br/><em style={{ fontStyle:'italic', color:'oklch(0.55 0.08 20)' }}>más difícil de lo que parece.</em>
            </h2>
          </div>
          <div className="grid-3" style={{ marginBottom:40 }}>
            {[
              { num:'01', titulo:'No sabés cuánto vale tu propiedad', desc:'Sin datos de mercado reales, la mayoría de propietarios pone un precio incorrecto: muy alto y no venden, muy bajo y pierden dinero. La diferencia puede ser de decenas de miles de dólares.' },
              { num:'02', titulo:'No tenés acceso a compradores calificados', desc:'Publicar en portales genéricos atrae curiosos, no compradores serios. Sin filtrado previo, perdés semanas en consultas que no van a ningún lado.' },
              { num:'03', titulo:'El proceso legal es complejo', desc:'Contratos de promesa, due diligence, escrituras, impuestos de traspaso, certificaciones registrales... Un error en el proceso puede costarte caro o frenar el cierre.' },
              { num:'04', titulo:'La negociación es un arte', desc:'Sin experiencia, es fácil ceder más de lo necesario o perder una venta por manejar mal una oferta. Un buen negociador puede cambiar completamente el resultado final.' },
              { num:'05', titulo:'No sabés a quién confiarle el proceso', desc:'El mercado está lleno de asesores sin experiencia, portales que cobran sin garantías y promesas que no se cumplen. ¿Cómo distinguir al profesional del improvisado?' },
              { num:'06', titulo:'El tiempo cuesta dinero', desc:'Cada mes que tu propiedad no se vende es un mes de gastos de mantenimiento, impuestos y oportunidades perdidas. La velocidad de venta depende de la estrategia.' },
            ].map((p, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'24px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'oklch(0.55 0.08 20)', marginBottom:12, letterSpacing:'0.1em' }}>{p.num}</div>
                <div style={{ fontSize:16, fontWeight:500, marginBottom:10, lineHeight:1.3 }}>{p.titulo}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.7 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.88 0.04 20)', borderRadius:14, padding:'24px 32px', textAlign:'center' }}>
            <p style={{ fontSize:16, color:'oklch(0.35 0.06 20)', lineHeight:1.7, fontFamily:'var(--serif)', fontStyle:'italic' }}>
              "El 73% de los propietarios que intentan vender solos terminan recurriendo a una inmobiliaria — pero después de perder meses y bajar el precio."
            </p>
          </div>
        </div>
      </section>

      {/* LA SOLUCIÓN NIDO */}
      <section id="solucion" style={{ background:'#060D08', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>La solución</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, color:'white' }}>
              Una corredora diferente.<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>Con tecnología y personas reales.</em>
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:560, margin:'16px auto 0' }}>
              NIDO combina asesores certificados, inteligencia artificial y un proceso probado para vender tu propiedad al mejor precio, en el menor tiempo posible.
            </p>
          </div>

          {/* Comparación */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, overflow:'hidden', marginBottom:40 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ padding:'16px 20px', fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Aspecto</div>
              <div style={{ padding:'16px 20px', fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', borderLeft:'1px solid rgba(255,255,255,0.06)' }}>Vendiendo solo</div>
              <div style={{ padding:'16px 20px', fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'oklch(0.75 0.06 150)', borderLeft:'1px solid rgba(255,255,255,0.06)' }}>Con NIDO</div>
            </div>
            {[
              { aspecto:'Valuación de precio', solo:'Estimación propia o por referencias', nido:'Análisis con Valeria IA + datos reales de mercado' },
              { aspecto:'Exposición', solo:'1-2 portales genéricos', nido:'Portal NIDO + campaña en redes + base de compradores activos' },
              { aspecto:'Calificación de compradores', solo:'Cualquiera que llame', nido:'Solo compradores pre-calificados por el asesor' },
              { aspecto:'Negociación', solo:'Sin experiencia ni respaldo', nido:'Asesor certificado con técnicas probadas de cierre' },
              { aspecto:'Proceso legal', solo:'Por tu cuenta o con notario propio', nido:'Asesoría legal y documental incluida en el proceso' },
              { aspecto:'Verificación registral', solo:'No incluida', nido:'Cotejo completo con el Registro Nacional' },
              { aspecto:'Marketing', solo:'Foto con teléfono, descripción básica', nido:'Fotografía profesional, campaña pagada en redes' },
              { aspecto:'Comisión', solo:'0% (pero tiempo, errores y precio menor)', nido:'4% solo si cerramos. Si no vendemos, no cobramos.' },
            ].map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ padding:'14px 20px', fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{row.aspecto}</div>
                <div style={{ padding:'14px 20px', fontSize:13, color:'rgba(255,255,255,0.3)', borderLeft:'1px solid rgba(255,255,255,0.04)' }}>✗ {row.solo}</div>
                <div style={{ padding:'14px 20px', fontSize:13, color:'oklch(0.75 0.06 150)', borderLeft:'1px solid rgba(255,255,255,0.04)' }}>✓ {row.nido}</div>
              </div>
            ))}
          </div>

          <div className="grid-3">
            {[
              { val:'4%', label:'Comisión por venta exitosa', sub:'Solo cobramos si vendemos' },
              { val:'90d', label:'Contrato de exclusividad', sub:'Compromiso total de ambos lados' },
              { val:'24h', label:'Respuesta de tu asesor', sub:'Siempre con un profesional real' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'20px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:40, color:'var(--gold)', marginBottom:6 }}>{s.val}</div>
                <div style={{ fontSize:13, fontWeight:500, color:'white', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTRO EQUIPO */}
      <section id="equipo" style={{ background:'var(--bg)', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Quiénes somos</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Asesores certificados.<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>Identificados. Comprometidos.</em>
            </h2>
            <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.75, maxWidth:560, margin:'16px auto 0' }}>
              Cada asesor NIDO pasa por un proceso de selección, certificación y verificación de identidad antes de representar la marca. No trabajamos con cualquiera.
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom:40 }}>
            {[
              { icon:'🎓', titulo:'Certificación NIDO', desc:'Todos nuestros asesores completan la Academia NIDO: ventas, negociación, aspectos legales y manejo de la plataforma. Solo los que pasan el estándar llevan la insignia NIDO.' },
              { icon:'🪪', titulo:'Identidad verificada', desc:'Verificamos la cédula de identidad y los datos de cada asesor antes de activar su cuenta. Sabés exactamente con quién estás trabajando.' },
              { icon:'⭐', titulo:'Calificados por clientes reales', desc:'Cada asesor tiene un historial de calificaciones verificadas por propietarios y compradores reales. La reputación es pública y no se manipula.' },
              { icon:'📍', titulo:'Especialistas por zona', desc:'Cada asesor declara sus zonas de especialidad. Tu propiedad la gestiona alguien que conoce el mercado local, los precios reales y los compradores activos.' },
              { icon:'🤖', titulo:'Potenciados por Valeria IA', desc:'Valeria asiste a cada asesor con análisis de mercado, redacción de fichas, seguimiento de leads y estrategias de cierre. IA al servicio del profesional.' },
              { icon:'📋', titulo:'Supervisados por NIDO', desc:'El equipo administrativo de NIDO supervisa la calidad del servicio, los tiempos de respuesta y el cumplimiento del proceso. Vos tenés respaldo institucional.' },
            ].map((item, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'24px' }}>
                <div style={{ fontSize:32, marginBottom:14 }}>{item.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{item.titulo}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Badge visual */}
          <div style={{ background:'var(--ink)', borderRadius:16, padding:'32px 40px', display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'var(--serif)', fontSize:36, fontStyle:'italic', color:'var(--gold)' }}>N</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>Identificación NIDO</div>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:24, color:'white', fontWeight:400, marginBottom:8 }}>Asesor Certificado NIDO</h3>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>Cada asesor activo tiene una ficha pública con su foto, zonas de especialidad, calificación real y número de propiedades gestionadas. Podés verificarlo antes de trabajar con él.</p>
            </div>
            <a href="/asesores" style={{ padding:'12px 24px', borderRadius:999, background:'var(--gold)', color:'#060D08', fontSize:14, fontWeight:600, textDecoration:'none', flexShrink:0 }}>
              Ver asesores →
            </a>
          </div>
        </div>
      </section>

      {/* EL PROCESO */}
      <section id="proceso" style={{ background:'#060D08', padding:'80px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>El proceso</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, color:'white' }}>
              De la decisión<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>al cierre.</em>
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {[
              { num:'01', titulo:'Te registrás y cargás tu propiedad', desc:'Completás el wizard con datos básicos y registrales. Tu propiedad queda en borrador — nadie la ve hasta que esté verificada y aprobada.' },
              { num:'02', titulo:'Verificamos tu identidad', desc:'Subís tu cédula y selfie. Un asesor NIDO te contacta en 24 horas hábiles para coordinar una llamada o visita a la propiedad.' },
              { num:'03', titulo:'Firmamos el contrato de exclusividad', desc:'Digitalmente, en la primera reunión. 90 días de exclusividad con NIDO. Desde ese momento comenzamos a trabajar para vos.' },
              { num:'04', titulo:'Lanzamos tu propiedad al mercado', desc:'Verificación registral completa, fotos profesionales, campaña en redes sociales y publicación destacada en el portal NIDO.' },
              { num:'05', titulo:'Gestionamos leads y visitas', desc:'Tu asesor filtra y califica a cada interesado. Coordinás visitas desde tu dashboard y ves todo en tiempo real.' },
              { num:'06', titulo:'Negociamos en tu nombre', desc:'Cuando llega una oferta, tu asesor te la presenta con análisis completo. Negociamos para que obtengas el mejor precio posible.' },
              { num:'07', titulo:'Cerramos con respaldo legal completo', desc:'Asesoría en contratos, due diligence, proceso notarial y traspaso. NIDO te acompaña hasta el último paso.' },
            ].map((paso, i) => (
              <div key={i} style={{ display:'flex', gap:24, paddingBottom:32, position:'relative' }}>
                {i < 6 && <div style={{ position:'absolute', left:19, top:44, bottom:0, width:2, background:'rgba(255,255,255,0.06)' }}/>}
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', fontFamily:'var(--mono)', fontSize:11, color:'white', flexShrink:0, zIndex:1 }}>{paso.num}</div>
                <div style={{ flex:1, paddingTop:8 }}>
                  <div style={{ fontSize:16, fontWeight:500, marginBottom:6, color:'white' }}>{paso.titulo}</div>
                  <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background:'var(--bg)', padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:16 }}>¿Listo para vender?</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(36px,6vw,60px)', fontWeight:400, lineHeight:1.0, marginBottom:16 }}>
            El equipo correcto<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>marca la diferencia.</em>
          </h2>
          <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.75, marginBottom:36 }}>
            Registrate, cargá tu propiedad y tu asesor NIDO te contactará en las próximas 24 horas. Sin costo inicial — solo pagás si vendés.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/vendedor-onboarding')} className="cta-btn" style={{ background:'var(--ink)', color:'white', fontSize:16 }}>
              Publicar mi propiedad →
            </button>
            <a href="/asesores" className="cta-btn" style={{ background:'transparent', color:'var(--ink)', border:'1px solid var(--rule)' }}>
              Conocer los asesores
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#040A06', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.04)', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontFamily:'var(--serif)', fontSize:18, color:'white' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></span>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>© 2026 NIDO Corredora · Costa Rica</span>
        <div style={{ display:'flex', gap:16 }}>
          <a href="/privacidad" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Privacidad</a>
          <a href="/terminos" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Términos</a>
        </div>
      </footer>
    </main>
  )
}
