'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VendedorOnboarding() {
  const router = useRouter()

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}
    .section-dark{background:#060D08;color:white}
    .section-light{background:var(--bg);color:var(--ink)}
    .cta-btn{display:inline-block;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none;cursor:pointer;border:none;font-family:var(--sans);transition:all 0.2s}
    .cta-btn:hover{transform:translateY(-2px)}
    .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    @media(max-width:768px){.grid-3{grid-template-columns:1fr}.grid-2{grid-template-columns:1fr}.hide-mobile{display:none!important}}
  `

  return (
    <main style={{ fontFamily:'var(--sans)' }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(6,13,8,0.85)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', textDecoration:'none' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></Link>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <a href="/login-propietario" style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Ya tengo cuenta →</a>
          <button onClick={() => router.push('/registro-propietario')} style={{ padding:'9px 20px', borderRadius:999, background:'var(--gold)', color:'#060D08', fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
            Registrarme
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="section-dark" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.12, animation:'slow-zoom 20s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.5) 0%, rgba(6,13,8,0.95) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, maxWidth:700, animation:'fadeUp 0.6s ease' }}>
          <div style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Para propietarios · Costa Rica</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(40px,7vw,80px)', fontWeight:400, lineHeight:1.0, marginBottom:20 }}>
            Tu propiedad merece<br/>la mejor <em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>exposición.</em>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.55)', lineHeight:1.75, maxWidth:520, margin:'0 auto 36px' }}>
            NIDO conecta tu propiedad con compradores calificados, la verifica en el Registro Nacional y te acompaña con un asesor dedicado hasta el cierre.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/registro-propietario')} className="cta-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white' }}>
              Publicar mi propiedad →
            </button>
            <a href="#como-funciona" className="cta-btn" style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
              Ver cómo funciona ↓
            </a>
          </div>
          <div className="grid-3" style={{ marginTop:48, maxWidth:500, margin:'48px auto 0' }}>
            {[
              { val:'4%', label:'Comisión solo al cerrar' },
              { val:'100%', label:'Propiedades verificadas' },
              { val:'24h', label:'Respuesta del asesor' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--gold)', marginBottom:4 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="section-light" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>El proceso</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1 }}>
              Simple, transparente<br/>y <em style={{ fontStyle:'italic', color:'var(--accent)' }}>sin sorpresas.</em>
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {[
              { num:'01', titulo:'Te registrás y cargás tu propiedad', desc:'Completás un wizard guiado con los datos, fotos y datos registrales. Tu propiedad queda en borrador hasta la verificación.' },
              { num:'02', titulo:'Verificamos tu identidad y la propiedad', desc:'Subís tu cédula y una selfie. Un asesor NIDO te contacta en 24 horas para coordinar una llamada o visita y firmar el contrato de exclusividad.' },
              { num:'03', titulo:'Tu propiedad sale al mercado', desc:'Una vez aprobada, aparece en el portal NIDO con ficha completa, fotos y datos registrales verificados. Lanzamos la campaña de marketing incluida.' },
              { num:'04', titulo:'Recibís leads calificados y ofertas', desc:'Ves todos los interesados, visitas coordinadas y ofertas en tiempo real desde tu dashboard. El asesor filtra y califica a cada comprador.' },
              { num:'05', titulo:'Cerramos el trato juntos', desc:'Tu asesor NIDO coordina la negociación, la asesoría legal y documental, y el proceso notarial. Vos solo firmás.' },
            ].map((paso, i) => (
              <div key={i} style={{ display:'flex', gap:24, paddingBottom:32, position:'relative' }}>
                {i < 4 && <div style={{ position:'absolute', left:19, top:44, bottom:0, width:2, background:'var(--rule)' }}/>}
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', fontFamily:'var(--mono)', fontSize:11, color:'white', flexShrink:0, zIndex:1 }}>{paso.num}</div>
                <div style={{ flex:1, paddingTop:8 }}>
                  <div style={{ fontSize:17, fontWeight:500, marginBottom:6, color:'var(--ink)' }}>{paso.titulo}</div>
                  <div style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.7 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="section-dark" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Por qué NIDO</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1, color:'white' }}>
              Más que un portal —<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>un equipo a tu lado.</em>
            </h2>
          </div>
          <div className="grid-3" style={{ gap:12 }}>
            {[
              { icon:'🎯', titulo:'Compradores calificados', desc:'Solo recibís consultas de personas realmente interesadas. Filtramos el ruido.' },
              { icon:'📊', titulo:'Dashboard en tiempo real', desc:'Ves vistas, consultas, visitas y ofertas en un solo panel. Información clara.' },
              { icon:'✦', titulo:'Valeria IA de tu lado', desc:'Análisis de precio, descripción perfecta y seguimiento inteligente de leads.' },
              { icon:'⚖️', titulo:'Asesoría legal y documental', desc:'Te acompañamos en contratos, due diligence y todo el proceso notarial.' },
              { icon:'📣', titulo:'Campaña de marketing incluida', desc:'Al firmar la exclusividad lanzamos tu propiedad en Instagram, Facebook y NIDO.' },
              { icon:'🔐', titulo:'Verificación registral', desc:'Cotejamos los datos con el Registro Nacional para dar confianza total a los compradores.' },
            ].map((b, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'24px' }}>
                <div style={{ fontSize:32, marginBottom:14 }}>{b.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:8, color:'white' }}>{b.titulo}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.65 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXCLUSIVIDAD */}
      <section className="section-light" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Contrato de exclusividad</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1 }}>
              Una relación <em style={{ fontStyle:'italic', color:'var(--accent)' }}>transparente.</em>
            </h2>
            <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.7, maxWidth:520, margin:'16px auto 0' }}>
              Al publicar con NIDO firmás un contrato de exclusividad por <strong>90 días</strong>. Esto nos permite invertir tiempo, recursos y marketing en tu propiedad con total compromiso.
            </p>
          </div>
          <div className="grid-2">
            {[
              { titulo:'NIDO se compromete a', color:'var(--accent)', items:['Verificación registral completa','Fotografía profesional básica','Publicación destacada en el portal','Campaña de marketing en redes sociales','Asesor dedicado durante todo el proceso','Asesoría legal y documental','Filtrado de compradores calificados','Acompañamiento hasta el cierre notarial'] },
              { titulo:'Vos te comprometés a', color:'var(--ink-3)', items:['No publicar en otros portales durante 90 días','Mantener la información actualizada','Disponibilidad para coordinar visitas','Documentación registral al día','Comunicación fluida con el asesor','Transparencia total sobre la propiedad'] },
            ].map((col, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'24px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:col.color, marginBottom:18, textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.titulo}</div>
                {col.items.map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10, fontSize:14, color:'var(--ink-2)', lineHeight:1.5 }}>
                    <span style={{ color:'var(--accent)', flexShrink:0, marginTop:2 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COSTOS */}
      <section className="section-dark" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Transparencia total</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1, color:'white', marginBottom:16 }}>
            Sin sorpresas.<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>Solo resultados.</em>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:500, margin:'0 auto 40px' }}>
            Solo cobramos si vendemos. La comisión se aplica sobre el precio final de venta y se cobra al momento del cierre notarial.
          </p>
          <div style={{ background:'linear-gradient(135deg,oklch(0.42 0.06 150/0.15),oklch(0.28 0.08 150/0.08))', border:'1px solid oklch(0.42 0.06 150/0.3)', borderRadius:20, padding:'40px 48px', display:'inline-block', marginBottom:40 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'oklch(0.75 0.06 150)', marginBottom:8 }}>Comisión por venta exitosa</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:80, color:'white', lineHeight:1, marginBottom:8 }}>4<span style={{ fontSize:40 }}>%</span></div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)' }}>Si no cerramos, no cobramos</div>
          </div>
          <div style={{ maxWidth:600, margin:'0 auto' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.5)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Servicios opcionales adicionales</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { servicio:'Fotografía profesional premium', precio:'$150–$300' },
                { servicio:'Video tour o drone', precio:'$250–$500' },
                { servicio:'Tour virtual 360°', precio:'$200–$350' },
                { servicio:'Traducción al inglés', precio:'$80' },
                { servicio:'Análisis de mercado con Valeria IA', precio:'Incluido ✓', gratis:true },
                { servicio:'Campaña de marketing en redes', precio:'Incluido ✓', gratis:true },
              ].map((s, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 18px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8 }}>
                  <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{s.servicio}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:13, color:s.gratis?'oklch(0.75 0.06 150)':'var(--gold)' }}>{s.precio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MERCADO */}
      <section className="section-light" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Mercado inmobiliario · Mayo 2026</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1 }}>
              El momento es <em style={{ fontStyle:'italic', color:'var(--accent)' }}>ahora.</em>
            </h2>
          </div>
          <div className="grid-3" style={{ marginBottom:32 }}>
            {[
              { val:'+8.4%', label:'Valorización anual promedio', sub:'Últimos 3 años en zonas GAM' },
              { val:'+18%', label:'Demanda zona costera', sub:'Compradores extranjeros 2025–2026' },
              { val:'100%', label:'Propiedades verificadas NIDO', sub:'Confianza total para el comprador' },
            ].map(s => (
              <div key={s.val} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'20px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:40, color:'var(--accent)', marginBottom:6 }}>{s.val}</div>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:12, color:'var(--ink-3)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--rule)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', fontWeight:500 }}>
              <span>Zona</span><span>Tipo</span><span>Precio m²</span><span>Demanda</span>
            </div>
            {[
              { zona:'Escazú', tipo:'Residencial premium', precio:'$2,800', demanda:'Muy alta' },
              { zona:'Santa Ana', tipo:'Residencial familiar', precio:'$2,400', demanda:'Alta' },
              { zona:'Curridabat', tipo:'Mixto', precio:'$2,100', demanda:'Alta' },
              { zona:'Tamarindo', tipo:'Playa / Inversión', precio:'$3,200', demanda:'Alta' },
              { zona:'Santa Teresa', tipo:'Playa premium', precio:'$3,800', demanda:'Creciente' },
              { zona:'Heredia', tipo:'Primera vivienda', precio:'$1,900', demanda:'Media-alta' },
            ].map((z, i) => (
              <div key={i} style={{ padding:'14px 20px', borderBottom:i<5?'1px solid var(--rule-soft)':'none', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, fontSize:14 }}>
                <span style={{ fontWeight:500 }}>{z.zona}</span>
                <span style={{ color:'var(--ink-3)' }}>{z.tipo}</span>
                <span style={{ fontFamily:'var(--mono)', color:'var(--accent)' }}>{z.precio}</span>
                <span style={{ color:'oklch(0.42 0.06 150)', fontWeight:500 }}>{z.demanda}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:12, padding:'16px 20px', display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'#C8A96E', flexShrink:0 }}>V</div>
            <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65, fontStyle:'italic' }}>
              &quot;Las propiedades con precio ajustado al mercado y fotografías profesionales generan 3× más consultas. Tu asesor NIDO analizará el valor ideal de tu propiedad en la primera reunión.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section-dark" style={{ padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:16, letterSpacing:'0.06em' }}>¿Listo para vender?</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(36px,6vw,60px)', fontWeight:400, color:'white', marginBottom:16, lineHeight:1.0 }}>
            Empezá hoy.<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>Sin costo inicial.</em>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, marginBottom:36 }}>
            Registrate, cargá tu propiedad y tu asesor NIDO te contactará en las próximas 24 horas para coordinar la verificación y comenzar.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/registro-propietario')} className="cta-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white', fontSize:16 }}>
              Registrar mi propiedad →
            </button>
            <a href="/login-propietario" className="cta-btn" style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#040A06', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontFamily:'var(--serif)', fontSize:18, color:'white' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></span>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>© 2026 NIDO · Costa Rica</span>
        <a href="/privacidad" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Privacidad</a>
      </footer>
    </main>
  )
}
