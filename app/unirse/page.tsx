'use client'
import { useState, useEffect } from 'react'

const STATS = [
  { val: '2.4×', label: 'más cierres con Valeria IA' },
  { val: '87%', label: 'tasa de respuesta promedio' },
  { val: '412+', label: 'propiedades activas en NIDO' },
  { val: '4.9★', label: 'calificación promedio asesores' },
]

const PROBLEMAS = [
  { icon: '😤', problema: 'Perdés leads porque tardás en responder', solucion: 'Valeria responde en segundos, 24/7, mientras vos cerrás otras ventas' },
  { icon: '📋', problema: 'Gestionás todo en WhatsApp y planillas', solucion: 'CRM visual con pipeline, score de leads y seguimiento automático' },
  { icon: '📸', problema: 'Tus fotos y fichas se ven amateur', solucion: 'Wizard de publicación premium con galería, 360° y descripción IA' },
  { icon: '🎓', problema: 'No tenés tiempo para capacitarte', solucion: 'Academia integrada con cursos y certificación NIDO desde tu dashboard' },
  { icon: '📊', problema: 'No sabés qué propiedades generan más interés', solucion: 'Dashboard con métricas de vistas, consultas y tasa de conversión' },
  { icon: '🏆', problema: 'Los asesores top siempre llevan ventaja', solucion: 'Valeria te da estrategias específicas para mejorar tu ranking' },
]

const TESTIMONIOS = [
  { nombre: 'María Quesada', zona: 'Escazú · 3 meses en NIDO', texto: 'En mi primer mes cerré 2 propiedades usando Valeria para calificar leads. Nunca había tenido tanto orden en mi pipeline.', inicial: 'M', hue: 150 },
  { nombre: 'Daniel Sánchez', zona: 'Santa Teresa · 2 meses en NIDO', texto: 'Publiqué 5 propiedades en una tarde con el wizard. Las fichas se ven increíbles y los compradores preguntan más.', inicial: 'D', hue: 50 },
  { nombre: 'Lucía Vargas', zona: 'Escalante · 4 meses en NIDO', texto: 'La academia me ayudó a manejar objeciones de precio. Cerré una propiedad que llevaba 3 meses sin movimiento.', inicial: 'L', hue: 200 },
]

const PASOS = [
  { num: '01', titulo: 'Creá tu cuenta gratis', desc: 'Sin tarjeta de crédito. En 2 minutos tenés acceso a todas las herramientas básicas.' },
  { num: '02', titulo: 'Publicá tu primera propiedad', desc: 'El wizard de 8 pasos te guía. Valeria redacta la descripción por vos.' },
  { num: '03', titulo: 'Recibí tus primeros leads', desc: 'Compradores que usan NIDO conversan con Valeria y son enviados a tu CRM.' },
  { num: '04', titulo: 'Cerrá más rápido', desc: 'Con métricas, seguimiento y Valeria como mentora, tus cierres mejoran desde la primera semana.' },
]

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.06)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  .cta-btn{display:inline-flex;align-items:center;gap:10px;background:var(--accent);color:white;padding:16px 32px;border-radius:999px;font-size:16px;font-weight:500;text-decoration:none;transition:all 0.2s;border:none;cursor:pointer;font-family:var(--sans)}
  .cta-btn:hover{background:oklch(0.38 0.06 150);transform:translateY(-2px);box-shadow:0 8px 32px oklch(0.42 0.06 150/0.3)}
  .cta-btn.dark{background:var(--ink);color:white}
  .cta-btn.dark:hover{background:oklch(0.28 0.006 80)}
  .cta-btn.outline{background:transparent;border:1.5px solid rgba(255,255,255,0.3);color:white}
  .cta-btn.outline:hover{background:rgba(255,255,255,0.1)}
  .problema-card{background:white;border:1px solid var(--rule);border-radius:12px;padding:24px;transition:all 0.2s}
  .problema-card:hover{border-color:var(--accent);box-shadow:0 4px 20px oklch(0.42 0.06 150/0.1);transform:translateY(-2px)}
  .testimonio-card{background:white;border:1px solid var(--rule);border-radius:16px;padding:28px;transition:all 0.2s}
  @media(max-width:768px){.hero-grid{grid-template-columns:1fr!important}.stats-grid{grid-template-columns:1fr 1fr!important}.problemas-grid{grid-template-columns:1fr!important}.pasos-grid{grid-template-columns:1fr!important}.testimonios-grid{grid-template-columns:1fr!important}.nav-links{display:none!important}.page-pad{padding:0 16px!important}}
`

export default function Unirse() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  return (
    <main style={{fontFamily:'var(--sans)',background:'var(--bg)',color:'var(--ink)',overflowX:'hidden'}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 40px',maxWidth:1400,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:24,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <div className="nav-links" style={{display:'flex',gap:28,fontSize:13,color:'var(--ink-3)'}}>
            <a href="#como-funciona">¿Cómo funciona?</a>
            <a href="#problemas">Qué resuelve</a>
            <a href="#precios">Precios</a>
            <a href="#testimonios">Testimonios</a>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <a href="/login" style={{padding:'9px 20px',fontSize:14,color:'var(--ink)',border:'1px solid var(--rule)',borderRadius:999,textDecoration:'none',fontWeight:500,transition:'all 0.2s'}}>Ingresar</a>
            <a href="/registro" className="cta-btn" style={{padding:'10px 22px',fontSize:14}}>Empezar gratis →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:'relative',background:'#060D08',overflow:'hidden',minHeight:'90vh',display:'flex',alignItems:'center'}}>
        <div style={{position:'absolute',inset:'-5%',backgroundImage:'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80)',backgroundSize:'cover',backgroundPosition:'center',opacity:0.2,animation:'slow-zoom 20s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(6,13,8,0.85) 0%,rgba(6,13,8,0.6) 100%)'}}/>
        <div style={{position:'absolute',top:'20%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,oklch(0.42 0.06 150/0.1) 0%,transparent 70%)'}}/>

        <div style={{position:'relative',zIndex:2,maxWidth:1400,margin:'0 auto',padding:'80px 40px',width:'100%'}}>
          <div className="hero-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
            <div style={{animation:'fadeUp 0.6s ease'}}>
              <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'oklch(0.85 0.06 80)',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:24,height:1,background:'oklch(0.85 0.06 80)',display:'inline-block'}}/>
                Para asesores inmobiliarios en Costa Rica
              </div>
              <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(40px,5vw,72px)',fontWeight:300,color:'white',lineHeight:1.0,letterSpacing:'-0.02em',marginBottom:20}}>
                Cerrá más.<br/>
                <em style={{fontStyle:'italic',color:'oklch(0.55 0.07 150)'}}>Trabajá menos.</em><br/>
                Con IA.
              </h1>
              <p style={{fontSize:17,color:'rgba(255,255,255,0.6)',lineHeight:1.7,marginBottom:36,maxWidth:'48ch'}}>
                NIDO es la plataforma inmobiliaria costarricense con Valeria IA integrada — tu mentora, tu CRM y tu portal en un solo lugar. Los asesores NIDO cierran 2.4× más rápido.
              </p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:40}}>
                <a href="/registro" className="cta-btn">Empezar 30 días gratis →</a>
                <a href="#como-funciona" className="cta-btn outline">Ver cómo funciona</a>
              </div>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.3)',letterSpacing:'0.06em'}}>Sin tarjeta de crédito · Cancela cuando quieras · Soporte en español</p>
            </div>

            {/* Valeria card flotante */}
            <div style={{animation:'fadeUp 0.6s ease 0.2s both'}}>
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:24,backdropFilter:'blur(20px)',marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--serif)',fontSize:18,fontStyle:'italic',color:'oklch(0.85 0.06 80)',flexShrink:0}}>V</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'white'}}>Valeria</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:5}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                      Mentora IA · En línea ahora
                    </div>
                  </div>
                </div>
                <div style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'14px 16px',marginBottom:12,fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>
                  María, tenés 3 leads nuevos esta semana. El de Escazú lleva 48 horas sin respuesta — eso reduce tu probabilidad de cierre un 60%. ¿Te ayudo a redactar un mensaje?
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {['Sí, redactá el mensaje','Ver mis leads pendientes','Analizar mi pipeline'].map(s => (
                    <span key={s} style={{padding:'6px 12px',borderRadius:999,border:'1px solid rgba(255,255,255,0.15)',fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer'}}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{val:'$380K',label:'Propiedad cerrada esta semana',icon:'🏠'},{val:'+3',label:'Leads nuevos hoy',icon:'👥'}].map(s => (
                  <div key={s.label} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'16px',backdropFilter:'blur(12px)'}}>
                    <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
                    <div style={{fontFamily:'var(--serif)',fontSize:22,color:'white',marginBottom:2}}>{s.val}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',lineHeight:1.4}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{background:'var(--ink)',padding:'48px 40px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0}}>
            {STATS.map((s,i) => (
              <div key={i} style={{padding:'24px 32px',borderRight:i<3?'1px solid rgba(255,255,255,0.08)':'none',textAlign:'center'}}>
                <div style={{fontFamily:'var(--serif)',fontSize:48,color:'white',lineHeight:1,marginBottom:6}}>{s.val}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:'0.04em'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMAS */}
      <section id="problemas" style={{padding:'96px 40px',maxWidth:1400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:14}}>Lo que NIDO resuelve</div>
          <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(32px,4vw,56px)',fontWeight:400,lineHeight:1.05,marginBottom:16}}>
            ¿Te suena <em style={{fontStyle:'italic',color:'var(--accent)'}}>familiar?</em>
          </h2>
          <p style={{fontSize:16,color:'var(--ink-2)',maxWidth:'52ch',margin:'0 auto',lineHeight:1.65}}>
            Estos son los problemas que enfrentan los asesores en Costa Rica todos los días. NIDO los resuelve con IA.
          </p>
        </div>
        <div className="problemas-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {PROBLEMAS.map((p,i) => (
            <div key={i} className="problema-card">
              <div style={{fontSize:28,marginBottom:12}}>{p.icon}</div>
              <div style={{fontSize:14,color:'var(--ink-3)',marginBottom:10,lineHeight:1.5,textDecoration:'line-through'}}>{p.problema}</div>
              <div style={{width:32,height:2,background:'var(--accent)',borderRadius:999,marginBottom:10}}/>
              <div style={{fontSize:15,color:'var(--ink)',lineHeight:1.6,fontWeight:500}}>{p.solucion}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{background:'var(--ink)',padding:'96px 40px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'oklch(0.85 0.06 80)',marginBottom:14}}>Proceso</div>
            <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(32px,4vw,56px)',fontWeight:400,color:'white',lineHeight:1.05}}>
              De cero a tu primera venta<br/>en <em style={{fontStyle:'italic',color:'oklch(0.55 0.07 150)'}}>una semana.</em>
            </h2>
          </div>
          <div className="pasos-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24}}>
            {PASOS.map((p,i) => (
              <div key={i} style={{position:'relative'}}>
                {i < PASOS.length-1 && <div style={{position:'absolute',top:20,left:'calc(100% - 12px)',width:'24px',height:1,background:'rgba(255,255,255,0.1)',zIndex:1}}/>}
                <div style={{width:40,height:40,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:12,color:'var(--accent)',marginBottom:16}}>{p.num}</div>
                <h3 style={{fontFamily:'var(--serif)',fontSize:20,fontWeight:400,color:'white',marginBottom:10}}>{p.titulo}</h3>
                <p style={{fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.65}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" style={{padding:'96px 40px',maxWidth:1400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:14}}>Testimonios</div>
          <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(32px,4vw,56px)',fontWeight:400,lineHeight:1.05}}>
            Lo que dicen los <em style={{fontStyle:'italic',color:'var(--accent)'}}>asesores NIDO.</em>
          </h2>
        </div>
        <div className="testimonios-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:48}}>
          {TESTIMONIOS.map((t,i) => (
            <div key={i} className="testimonio-card">
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'oklch(0.88 0.03 '+t.hue+')',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--serif)',fontSize:18,color:'oklch(0.35 0.06 '+t.hue+')',flexShrink:0}}>{t.inicial}</div>
                <div>
                  <div style={{fontFamily:'var(--serif)',fontSize:18,marginBottom:2}}>{t.nombre}</div>
                  <div style={{fontSize:12,color:'var(--ink-3)'}}>{t.zona}</div>
                </div>
              </div>
              <p style={{fontSize:14,color:'var(--ink-2)',lineHeight:1.7,fontStyle:'italic'}}>"{t.texto}"</p>
              <div style={{display:'flex',gap:2,marginTop:14}}>
                {[1,2,3,4,5].map(s => <span key={s} style={{color:'oklch(0.62 0.10 75)',fontSize:14}}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" style={{background:'var(--bg-elev)',padding:'96px 40px',borderTop:'1px solid var(--rule)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:14}}>Inversión</div>
            <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(32px,4vw,56px)',fontWeight:400,lineHeight:1.05,marginBottom:16}}>
              Un solo cliente cubre<br/>
              <em style={{fontStyle:'italic',color:'var(--accent)'}}>todo el año.</em>
            </h2>
            <p style={{fontSize:16,color:'var(--ink-2)',maxWidth:'52ch',margin:'0 auto',lineHeight:1.65}}>
              NIDO Pro cuesta $49/mes. Con una sola comisión cubrís 24 meses. El ROI es inmediato.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,maxWidth:900,margin:'0 auto'}}>
            {[
              { plan:'Gratis', precio:'$0', periodo:'siempre', desc:'Para explorar NIDO', features:['2 propiedades','Valeria IA básica','Portal público','Perfil de asesor'], cta:'Crear cuenta', href:'/registro', featured:false },
              { plan:'Pro', precio:'$49', periodo:'/mes', desc:'Para asesores activos', features:['15 propiedades','Valeria IA 24/7','CRM de leads','Academia completa','Tour 360° (1/mes)','Soporte en 24h'], cta:'Empezar Pro', href:'/registro?plan=pro', featured:true },
              { plan:'Enterprise', precio:'$129', periodo:'/mes', desc:'Para asesores top', features:['Propiedades ilimitadas','Valeria IA con memoria','CRM con score de leads','Tours 360° ilimitados','Soporte en 2 horas','Panel propietario'], cta:'Empezar Enterprise', href:'/registro?plan=enterprise', featured:false },
            ].map((p,i) => (
              <div key={i} style={{background:p.featured?'var(--ink)':'white',border:'1px solid '+(p.featured?'var(--ink)':'var(--rule)'),borderRadius:16,padding:28,position:'relative',transform:p.featured?'scale(1.04)':'none'}}>
                {p.featured && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'var(--accent)',color:'white',fontSize:10,padding:'4px 14px',borderRadius:999,letterSpacing:'0.1em',fontWeight:500,textTransform:'uppercase',whiteSpace:'nowrap'}}>Más popular</div>}
                <div style={{fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:p.featured?'rgba(255,255,255,0.5)':'var(--ink-3)',marginBottom:8}}>{p.plan}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:6}}>
                  <span style={{fontFamily:'var(--serif)',fontSize:44,color:p.featured?'white':'var(--ink)',lineHeight:1}}>{p.precio}</span>
                  <span style={{fontSize:14,color:p.featured?'rgba(255,255,255,0.4)':'var(--ink-3)'}}>{p.periodo}</span>
                </div>
                <p style={{fontSize:13,color:p.featured?'rgba(255,255,255,0.5)':'var(--ink-3)',marginBottom:20}}>{p.desc}</p>
                <div style={{borderTop:'1px solid '+(p.featured?'rgba(255,255,255,0.1)':'var(--rule)'),paddingTop:20,marginBottom:24,display:'flex',flexDirection:'column',gap:10}}>
                  {p.features.map((f,j) => (
                    <div key={j} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:p.featured?'rgba(255,255,255,0.8)':'var(--ink-2)'}}>
                      <span style={{width:16,height:16,borderRadius:'50%',background:p.featured?'var(--accent)':'var(--accent-tint)',display:'grid',placeItems:'center',fontSize:9,color:p.featured?'white':'var(--accent)',flexShrink:0}}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href={p.href} style={{display:'block',textAlign:'center',padding:'12px',borderRadius:999,background:p.featured?'white':'var(--ink)',color:p.featured?'var(--ink)':'white',fontSize:14,fontWeight:500,textDecoration:'none',transition:'all 0.2s'}}>
                  {p.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'96px 40px',textAlign:'center',background:'#060D08',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:'-5%',backgroundImage:'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80)',backgroundSize:'cover',backgroundPosition:'center',opacity:0.15,animation:'slow-zoom 20s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',inset:0,background:'rgba(6,13,8,0.85)'}}/>
        <div style={{position:'relative',zIndex:2,maxWidth:700,margin:'0 auto'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--serif)',fontSize:28,fontStyle:'italic',color:'oklch(0.85 0.06 80)',margin:'0 auto 24px',animation:'float 4s ease-in-out infinite'}}>V</div>
          <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(32px,5vw,60px)',fontWeight:300,color:'white',lineHeight:1.05,marginBottom:16}}>
            Tu siguiente cierre<br/>empieza <em style={{fontStyle:'italic',color:'oklch(0.55 0.07 150)'}}>hoy.</em>
          </h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:36,maxWidth:'46ch',margin:'0 auto 36px'}}>
            Más de 400 propiedades publicadas. Asesores que cierran 2.4× más rápido. Costa Rica merece una plataforma que esté a su nivel.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/registro" className="cta-btn" style={{fontSize:16}}>Empezar 30 días gratis →</a>
            <a href="/precios" className="cta-btn outline">Ver todos los planes</a>
          </div>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.25)',marginTop:20,letterSpacing:'0.06em'}}>Sin tarjeta · Sin compromiso · Soporte en español</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'var(--ink)',padding:'40px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:22,color:'white'}}>NIDO<span style={{color:'oklch(0.85 0.06 80)'}}>.</span></a>
          <div style={{display:'flex',gap:24,fontSize:13,color:'rgba(255,255,255,0.4)'}}>
            <a href="/propiedades" style={{color:'rgba(255,255,255,0.4)'}}>Portal</a>
            <a href="/academia" style={{color:'rgba(255,255,255,0.4)'}}>Academia</a>
            <a href="/precios" style={{color:'rgba(255,255,255,0.4)'}}>Precios</a>
            <a href="/login" style={{color:'rgba(255,255,255,0.4)'}}>Ingresar</a>
          </div>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>© 2026 NIDO · Plataforma Inmobiliaria de Costa Rica</p>
        </div>
      </footer>
    </main>
  )
}
