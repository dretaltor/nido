'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PASOS = [
  {
    id: 'bienvenida',
    titulo: 'Vendé más rápido y mejor con NIDO.',
    subtitulo: 'La plataforma inmobiliaria premium de Costa Rica',
    contenido: null,
  },
  {
    id: 'como_funciona',
    titulo: 'Cómo funciona NIDO para propietarios',
    subtitulo: 'Un proceso simple y transparente',
    contenido: [
      { num:'01', titulo:'Registrás tu propiedad', desc:'Completás el wizard con los datos, fotos y datos registrales de tu propiedad. Todo queda en borrador hasta la verificación.' },
      { num:'02', titulo:'Verificamos tu identidad', desc:'Un asesor NIDO revisa tus documentos y coordina una llamada o visita para conocer la propiedad en persona.' },
      { num:'03', titulo:'Tu propiedad sale al mercado', desc:'Una vez aprobada, tu propiedad aparece en el portal de NIDO con ficha completa, fotos y datos registrales.' },
      { num:'04', titulo:'Recibís leads y ofertas', desc:'Los compradores te contactan a través de NIDO. Ves todos los interesados, visitas agendadas y ofertas en tu dashboard.' },
      { num:'05', titulo:'Cerramos el trato', desc:'NIDO te acompaña en todo el proceso hasta el cierre. Nuestro asesor coordina la negociación y el proceso notarial.' },
    ]
  },
  {
    id: 'beneficios',
    titulo: 'Beneficios de publicar con NIDO',
    subtitulo: 'Más que un portal — un equipo a tu lado',
    contenido: [
      { icon:'🎯', titulo:'Compradores calificados', desc:'Solo recibís consultas de personas realmente interesadas. Filtramos el ruido para que no pierdas tiempo.' },
      { icon:'📊', titulo:'Dashboard en tiempo real', desc:'Ves cuántas personas vieron tu propiedad, cuántas consultaron, visitas agendadas y ofertas recibidas.' },
      { icon:'✦', titulo:'Valeria IA trabaja por vos', desc:'La inteligencia artificial de NIDO analiza el mercado, sugiere el precio ideal y redacta la descripción perfecta.' },
      { icon:'🔐', titulo:'Verificación registral', desc:'NIDO verifica los datos de tu propiedad en el Registro Nacional, dando confianza a los compradores.' },
      { icon:'📱', titulo:'Notificaciones instantáneas', desc:'Recibís alertas por WhatsApp y email cada vez que alguien consulta o hace una oferta.' },
      { icon:'🤝', titulo:'Asesor dedicado', desc:'Un asesor NIDO te acompaña desde la publicación hasta el cierre. No estás solo en el proceso.' },
    ]
  },
  {
    id: 'exclusividad',
    titulo: 'Contrato de exclusividad',
    subtitulo: 'Una relación clara y transparente',
    contenido: null,
    especial: 'exclusividad'
  },
  {
    id: 'costos',
    titulo: 'Servicios y costos',
    subtitulo: 'Transparencia total — sin sorpresas',
    contenido: null,
    especial: 'costos'
  },
  {
    id: 'mercado',
    titulo: 'El mercado hoy en Costa Rica',
    subtitulo: 'Datos actualizados de mayo 2026',
    contenido: null,
    especial: 'mercado'
  },
]

export default function VendedorOnboarding() {
  const router = useRouter()
  const [paso, setPaso] = useState(0)

  const actual = PASOS[paso]
  const esUltimo = paso === PASOS.length - 1

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.06)}}
  `

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'#060D08', color:'white', display:'flex', flexDirection:'column' }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'white' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></div>
        <div style={{ display:'flex', gap:6 }}>
          {PASOS.map((_, i) => (
            <div key={i} style={{ width:i===paso?24:6, height:6, borderRadius:999, background:i<paso?'var(--accent)':i===paso?'var(--gold)':'rgba(255,255,255,0.15)', transition:'all 0.3s', cursor:'pointer' }} onClick={() => i < paso && setPaso(i)}/>
          ))}
        </div>
        <button onClick={() => router.push('/registro-propietario')} style={{ fontSize:12, color:'rgba(255,255,255,0.4)', background:'none', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 14px', borderRadius:999, cursor:'pointer' }}>
          Saltar →
        </button>
      </nav>

      {/* Contenido */}
      <div style={{ flex:1, overflowY:'auto', padding:'40px 24px', maxWidth:800, width:'100%', margin:'0 auto', animation:'fadeUp 0.5s ease' }} key={paso}>

        {/* Bienvenida */}
        {actual.id === 'bienvenida' && (
          <div style={{ textAlign:'center', paddingTop:40 }}>
            <div style={{ position:'relative', width:120, height:120, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 32px', boxShadow:'0 0 60px oklch(0.42 0.06 150/0.4)' }}>
              <span style={{ fontFamily:'var(--serif)', fontSize:52, fontStyle:'italic', color:'var(--gold)' }}>N</span>
            </div>
            <div style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:16 }}>Para propietarios</div>
            <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(36px,6vw,64px)', fontWeight:400, lineHeight:1.05, marginBottom:16 }}>
              Vendé más rápido<br/>y mejor con <em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>NIDO.</em>
            </h1>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.55)', lineHeight:1.75, maxWidth:520, margin:'0 auto 40px' }}>
              Conectamos tu propiedad con compradores calificados, la verificamos en el Registro Nacional y te acompañamos hasta el cierre del trato.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, maxWidth:540, margin:'0 auto' }}>
              {[
                { val:'45 días', label:'tiempo promedio de venta' },
                { val:'100%', label:'propiedades verificadas' },
                { val:'4.9★', label:'satisfacción de propietarios' },
              ].map(s => (
                <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 12px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--gold)', marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cómo funciona */}
        {actual.id === 'como_funciona' && actual.contenido && (
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{actual.subtitulo}</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,44px)', fontWeight:400, marginBottom:32, lineHeight:1.1 }}>{actual.titulo}</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {actual.contenido.map((item:any, i:number) => (
                <div key={i} style={{ display:'flex', gap:20, paddingBottom:24, position:'relative' }}>
                  {i < actual.contenido!.length - 1 && <div style={{ position:'absolute', left:20, top:44, bottom:0, width:1, background:'rgba(255,255,255,0.08)' }}/>}
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', fontFamily:'var(--mono)', fontSize:11, color:'white', flexShrink:0 }}>{item.num}</div>
                  <div style={{ flex:1, paddingTop:8 }}>
                    <div style={{ fontSize:16, fontWeight:500, marginBottom:6 }}>{item.titulo}</div>
                    <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beneficios */}
        {actual.id === 'beneficios' && actual.contenido && (
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{actual.subtitulo}</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,44px)', fontWeight:400, marginBottom:32, lineHeight:1.1 }}>{actual.titulo}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {actual.contenido.map((item:any, i:number) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'20px', animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>{item.icon}</div>
                  <div style={{ fontSize:15, fontWeight:500, marginBottom:6 }}>{item.titulo}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.65 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exclusividad */}
        {actual.especial === 'exclusividad' && (
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{actual.subtitulo}</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,44px)', fontWeight:400, marginBottom:24, lineHeight:1.1 }}>{actual.titulo}</h2>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'28px 32px', marginBottom:20 }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--gold)', marginBottom:16 }}>¿Qué es la exclusividad?</div>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', lineHeight:1.75, marginBottom:16 }}>
                Al publicar con NIDO, firmás un contrato de exclusividad por <strong style={{ color:'white' }}>90 días</strong>. Durante ese período, NIDO es el único canal autorizado para gestionar la venta de tu propiedad.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', lineHeight:1.75 }}>
                Esto nos permite invertir tiempo, recursos y marketing en tu propiedad con la certeza de que el proceso se maneja de forma profesional y ordenada.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[
                { titulo:'Lo que NIDO se compromete', items:['Verificación registral completa','Fotografía profesional (paquete básico)','Publicación destacada en el portal','Asesor dedicado durante todo el proceso','Filtrado de compradores calificados','Acompañamiento hasta el cierre notarial'] },
                { titulo:'Lo que vos te comprometés', items:['No publicar la propiedad en otros portales','Mantener la información actualizada','Disponibilidad para coordinar visitas','Documentación registral al día','Comunicación fluida con el asesor NIDO','Exclusividad por 90 días calendario'] },
              ].map((col, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'20px' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--accent)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.titulo}</div>
                  {col.items.map(item => (
                    <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8, fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>
                      <span style={{ color:'var(--accent)', flexShrink:0, marginTop:1 }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background:'oklch(0.42 0.06 150/0.1)', border:'1px solid oklch(0.42 0.06 150/0.3)', borderRadius:10, padding:'14px 18px', fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
              ℹ️ El contrato de exclusividad se firma digitalmente durante el proceso de verificación con tu asesor NIDO asignado.
            </div>
          </div>
        )}

        {/* Costos */}
        {actual.especial === 'costos' && (
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{actual.subtitulo}</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,44px)', fontWeight:400, marginBottom:24, lineHeight:1.1 }}>{actual.titulo}</h2>

            {/* Comisión principal */}
            <div style={{ background:'linear-gradient(135deg,oklch(0.42 0.06 150/0.15),oklch(0.28 0.08 150/0.1))', border:'1px solid oklch(0.42 0.06 150/0.3)', borderRadius:16, padding:'28px 32px', marginBottom:20, textAlign:'center' }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'oklch(0.75 0.06 150)', marginBottom:12 }}>Comisión por venta exitosa</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:64, color:'white', lineHeight:1, marginBottom:8 }}>3<span style={{ fontSize:36 }}>%</span></div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>
                Solo pagás si vendés. La comisión se aplica sobre el precio final de venta y se cobra al momento del cierre notarial. <strong style={{ color:'white' }}>Si no cerramos, no cobramos.</strong>
              </p>
            </div>

            {/* Servicios adicionales */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', marginBottom:14, letterSpacing:'0.06em', textTransform:'uppercase' }}>Servicios opcionales</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { servicio:'Fotografía profesional', precio:'$150 - $300', desc:'Set fotográfico con edición profesional, 20-40 fotos de alta calidad' },
                  { servicio:'Video tour o drone', precio:'$250 - $500', desc:'Video promocional para redes sociales y el portal NIDO' },
                  { servicio:'Tour virtual 360°', precio:'$200 - $350', desc:'Recorrido virtual interactivo para compradores remotos o internacionales' },
                  { servicio:'Valuación con IA + mercado', precio:'Incluido', desc:'Análisis de precio con Valeria IA y comparables de zona — sin costo adicional', gratis:true },
                  { servicio:'Publicidad en redes sociales', precio:'Desde $100/mes', desc:'Campaña pagada en Instagram y Facebook para acelerar la venta' },
                  { servicio:'Traducción al inglés', precio:'$80', desc:'Ficha de propiedad en inglés para compradores extranjeros y nómadas digitales' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{s.servicio}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{s.desc}</div>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:13, color:s.gratis?'var(--accent)':'var(--gold)', flexShrink:0 }}>{s.precio}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 18px', fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
              💡 Los servicios opcionales se coordinan con tu asesor NIDO y se pagan por separado de la comisión de venta.
            </div>
          </div>
        )}

        {/* Mercado */}
        {actual.especial === 'mercado' && (
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{actual.subtitulo}</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,44px)', fontWeight:400, marginBottom:24, lineHeight:1.1 }}>{actual.titulo}</h2>

            {/* Tiempo de venta */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
              {[
                { val:'45 días', label:'Tiempo promedio de venta en GAM', sub:'Propiedades bien fotografiadas y con precio de mercado' },
                { val:'8.4%', label:'Valorización anual promedio', sub:'Últimos 3 años en zonas premium' },
                { val:'+18%', label:'Demanda zona costera', sub:'Crecimiento de compradores extranjeros 2025-2026' },
              ].map(s => (
                <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'18px 16px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--gold)', marginBottom:6 }}>{s.val}</div>
                  <div style={{ fontSize:12, fontWeight:500, marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Zonas activas */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>Zonas más activas hoy</div>
              {[
                { zona:'Escazú', tipo:'Residencial premium', precio:'$2,800/m²', demanda:'Muy alta', tiempo:'30 días' },
                { zona:'Santa Ana', tipo:'Residencial familiar', precio:'$2,400/m²', demanda:'Alta', tiempo:'38 días' },
                { zona:'Curridabat', tipo:'Mixto', precio:'$2,100/m²', demanda:'Alta', tiempo:'42 días' },
                { zona:'Tamarindo', tipo:'Playa / Inversión', precio:'$3,200/m²', demanda:'Alta', tiempo:'60 días' },
                { zona:'Santa Teresa', tipo:'Playa premium', precio:'$3,800/m²', demanda:'Creciente', tiempo:'75 días' },
                { zona:'Heredia', tipo:'Familiar / Primera vivienda', precio:'$1,900/m²', demanda:'Media-alta', tiempo:'50 días' },
              ].map((z, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', gap:8, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:13 }}>
                  <span style={{ fontWeight:500 }}>{z.zona}</span>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>{z.tipo}</span>
                  <span style={{ fontFamily:'var(--mono)', color:'var(--gold)' }}>{z.precio}</span>
                  <span style={{ color:'oklch(0.75 0.06 150)' }}>{z.demanda}</span>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>{z.tiempo}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'oklch(0.42 0.06 150/0.1)', border:'1px solid oklch(0.42 0.06 150/0.3)', borderRadius:10, padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:13, fontStyle:'italic', color:'var(--gold)' }}>V</div>
                <span style={{ fontSize:13, fontWeight:500 }}>Valeria · Análisis de mercado</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.65, fontStyle:'italic' }}>
                "El mercado inmobiliario en Costa Rica mantiene una tendencia positiva. Las propiedades con precio dentro del 5% del valor de mercado se venden 2.3× más rápido. Te recomiendo agendar una valuación gratuita con tu asesor NIDO."
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Footer nav */}
      <div style={{ padding:'20px 32px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(12px)' }}>
        <button onClick={() => paso > 0 && setPaso(p => p-1)} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', background:'none', border:'1px solid rgba(255,255,255,0.1)', padding:'10px 20px', borderRadius:999, cursor:'pointer', opacity:paso===0?0:1 }}>
          ← Anterior
        </button>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em' }}>
          {paso+1} de {PASOS.length}
        </span>
        {esUltimo ? (
          <button onClick={() => window.location.href='/registro-propietario'} style={{ fontSize:14, fontWeight:500, color:'var(--ink)', background:'var(--gold)', border:'none', padding:'12px 28px', borderRadius:999, cursor:'pointer' }}>
            Registrarme ahora →
          </button>
        ) : (
          <button onClick={() => setPaso(p => p+1)} style={{ fontSize:14, fontWeight:500, color:'white', background:'var(--accent)', border:'none', padding:'12px 28px', borderRadius:999, cursor:'pointer' }}>
            Continuar →
          </button>
        )}
      </div>
    </main>
  )
}
