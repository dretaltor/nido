import { writeFileSync } from 'fs'

const landing = `import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF8', color: '#1a1a1a', margin: 0 }}>
      <style>{
        \`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --green: #1B5E3B; --green-light: #2D7A52; --gold: #C8A96E; --cream: #F7F4EE; --dark: #0D1F15; --gray: #6B7280; }
        .nav-link { color: #6B7280; text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
        .nav-link:hover { color: #1B5E3B; }
        .btn-primary { background: #1B5E3B; color: white; padding: 0.65rem 1.6rem; border-radius: 100px; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s; display: inline-block; }
        .btn-primary:hover { background: #2D7A52; transform: translateY(-1px); }
        .btn-outline { border: 1px solid #1B5E3B; color: #1B5E3B; padding: 0.65rem 1.6rem; border-radius: 100px; font-size: 0.88rem; font-weight: 500; text-decoration: none; display: inline-block; }
        .feature-card { background: white; border: 1px solid rgba(27,94,59,0.08); border-radius: 16px; padding: 1.8rem; transition: all 0.2s; }
        .feature-card:hover { border-color: rgba(27,94,59,0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(27,94,59,0.08); }
        .stat-item { padding: 2rem 1.5rem; text-align: center; border-right: 1px solid rgba(27,94,59,0.08); }
        .stat-item:last-child { border-right: none; }
        \`
      }</style>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 4rem', background: 'rgba(250,250,248,0.95)', borderBottom: '1px solid rgba(27,94,59,0.08)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#1B5E3B', letterSpacing: '-0.02em' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/propiedades" className="nav-link">Propiedades</a>
          <a href="/asesores" className="nav-link">Asesores</a>
          <a href="/propietario" className="nav-link">Propietarios</a>
          <a href="/academia" className="nav-link">Academia</a>
          <a href="/precios" className="nav-link">Precios</a>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <a href="/login" className="btn-outline">Ingresar</a>
          <a href="/registro" className="btn-primary">Comenzar gratis</a>
        </div>
      </nav>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 4rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F7F4EE', border: '1px solid rgba(200,169,110,0.3)', color: '#C8A96E', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em', marginBottom: '1.5rem' }}>
            <span style={{ width: '6px', height: '6px', background: '#C8A96E', borderRadius: '50%', display: 'inline-block' }}></span>
            IA Inmobiliaria · Costa Rica
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.4rem', lineHeight: 1.15, color: '#0D1F15', marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>
            Encuentra tu hogar con un <span style={{ color: '#1B5E3B' }}>asesor inteligente</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', fontWeight: 300, maxWidth: '440px' }}>
            NIDO combina inteligencia artificial con experiencia humana para que encuentres la propiedad perfecta. Sin perderte en catálogos.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/chat" className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}>Buscar propiedades</a>
            <a href="/registro" style={{ color: '#1B5E3B', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>Soy asesor →</a>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1rem' }}>Sin tarjeta de crédito · Gratis para empezar</p>
        </div>
        <div style={{ background: '#0D1F15', borderRadius: '20px', overflow: 'hidden', padding: '1.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '38px', height: '38px', background: '#1B5E3B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white', fontWeight: 500 }}>IA</div>
            <div>
              <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>Asesor IA de NIDO</div>
              <div style={{ color: '#C8A96E', fontSize: '0.72rem' }}>● En línea ahora</div>
            </div>
          </div>
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px 12px 12px 4px', padding: '0.8rem 1rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', lineHeight: 1.5, maxWidth: '85%' }}>¡Hola! ¿Qué tipo de propiedad estás buscando? Te ayudo a encontrar la perfecta. 🏡</div>
          </div>
          <div style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#1B5E3B', borderRadius: '12px 12px 4px 12px', padding: '0.8rem 1rem', color: 'white', fontSize: '0.82rem', maxWidth: '85%' }}>Busco casa en Escazú, 3 habitaciones, hasta $280k</div>
          </div>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px 12px 12px 4px', padding: '0.8rem 1rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', lineHeight: 1.5, maxWidth: '90%' }}>Encontré 8 opciones perfectas. La mejor: Los Laureles, 180m², jardín privado. ¿La vemos en tour virtual? ✨</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.6rem 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Escribe tu búsqueda...</div>
            <a href="/chat" style={{ background: '#1B5E3B', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: '1rem' }}>→</a>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid rgba(27,94,59,0.08)', borderBottom: '1px solid rgba(27,94,59,0.08)' }}>
        {[
          { num: '1,200+', label: 'PROPIEDADES ACTIVAS' },
          { num: '300+', label: 'ASESORES VERIFICADOS' },
          { num: '98%', label: 'CLIENTES SATISFECHOS' },
          { num: '24/7', label: 'ASESOR IA DISPONIBLE' },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1B5E3B', marginBottom: '0.3rem' }}>{s.num}</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 4rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', fontWeight: 500, marginBottom: '0.8rem' }}>CARACTERÍSTICAS</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', color: '#0D1F15', letterSpacing: '-0.02em' }}>Todo lo que necesitas,<br/>en un solo lugar</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
          {[
            { icon: '🤖', title: 'Asesor IA 24/7', desc: 'Conversa naturalmente y recibe recomendaciones personalizadas al instante.' },
            { icon: '🏠', title: 'Tours 360°', desc: 'Visita propiedades virtualmente desde la comodidad de tu hogar.' },
            { icon: '🏦', title: 'Precalificación bancaria', desc: 'Conoce tu capacidad de compra conectándote con los mejores bancos.' },
            { icon: '📊', title: 'Valuación de mercado', desc: 'Precios reales por zona para que tomes la mejor decisión de compra.' },
            { icon: '🤝', title: 'Red colaborativa', desc: 'Accede al inventario de cientos de asesores verificados en NIDO.' },
            { icon: '📱', title: 'CRM inteligente', desc: 'El asesor IA gestiona tu pipeline de principio a fin automáticamente.' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div style={{ width: '44px', height: '44px', background: '#F7F4EE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '1.2rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#0D1F15', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: '#0D1F15', margin: '0 4rem 4rem', borderRadius: '24px', padding: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#C8A96E', marginBottom: '0.8rem' }}>PARA ASESORES INMOBILIARIOS</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'white', maxWidth: '420px', lineHeight: 1.3 }}>
            Deja que la <span style={{ color: '#C8A96E' }}>IA trabaje</span> por ti. Tú solo cierra.
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <a href="/registro" style={{ background: '#C8A96E', color: '#0D1F15', padding: '0.85rem 2.2rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>Comenzar gratis →</a>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.8rem' }}>14 días gratis · Sin compromiso</p>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(27,94,59,0.08)', padding: '2.5rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1B5E3B' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></div>
        <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>© 2026 NIDO — La plataforma inmobiliaria inteligente de Costa Rica</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/precios" style={{ color: '#9CA3AF', fontSize: '0.8rem', textDecoration: 'none' }}>Precios</a>
          <a href="/academia" style={{ color: '#9CA3AF', fontSize: '0.8rem', textDecoration: 'none' }}>Academia</a>
          <a href="/contacto" style={{ color: '#9CA3AF', fontSize: '0.8rem', textDecoration: 'none' }}>Contacto</a>
        </div>
      </footer>
    </main>
  )
}`

writeFileSync('app/page.tsx', landing)
console.log('Landing premium aplicada')
