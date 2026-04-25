export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', margin: 0 }}>NIDO</h1>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/propiedades" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Propiedades</a>
          <a href="/asesores" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Asesores</a>
          <a href="/propietario" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Propietarios</a>
          <a href="/academia" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Academia</a>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #15803d', backgroundColor: 'white', color: '#15803d', cursor: 'pointer', fontSize: '0.9rem' }}>Ingresar</button>
          <button style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: '#15803d', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>Registrarse</button>
        </div>
      </nav>
      <section style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3.2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 1rem' }}>
          Encuentra tu hogar ideal con Inteligencia Artificial
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          NIDO es la plataforma inmobiliaria mas inteligente de Costa Rica. Conversa con nuestro asesor IA y encuentra la propiedad perfecta para ti.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/chat" style={{ padding: '0.9rem 2rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}>Buscar propiedades</a>
          <a href="/chat" style={{ padding: '0.9rem 2rem', borderRadius: '10px', border: '2px solid #15803d', backgroundColor: 'white', color: '#15803d', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}>Soy asesor inmobiliario</a>
        </div>
      </section>
      <section style={{ display: 'flex', justifyContent: 'center', gap: '4rem', padding: '3rem 2rem', backgroundColor: '#ffffff', flexWrap: 'wrap' }}>
        {[
          { number: '1,200+', label: 'Propiedades activas' },
          { number: '300+', label: 'Asesores verificados' },
          { number: '98%', label: 'Clientes satisfechos' },
          { number: '24/7', label: 'Asesor IA disponible' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{stat.number}</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.3rem 0 0' }}>{stat.label}</p>
          </div>
        ))}
      </section>
      <section style={{ padding: '4rem 2rem', backgroundColor: '#f9fafb' }}>
        <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#14532d', marginBottom: '3rem' }}>Todo lo que necesitas en un solo lugar</h3>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { icon: '🤖', title: 'Asesor IA 24/7', desc: 'Conversa naturalmente y recibe recomendaciones personalizadas al instante.' },
            { icon: '🏠', title: 'Tours 360', desc: 'Visita propiedades virtualmente desde la comodidad de tu hogar.' },
            { icon: '🏦', title: 'Precalificacion bancaria', desc: 'Conoce tu capacidad de compra conectandote con los mejores bancos.' },
            { icon: '📊', title: 'Valuacion de mercado', desc: 'Precios reales por zona para que tomes la mejor decision.' },
            { icon: '🤝', title: 'Red de asesores', desc: 'Accede al inventario colaborativo de cientos de asesores verificados.' },
            { icon: '📱', title: 'Seguimiento inteligente', desc: 'El asesor IA gestiona tu proceso de principio a fin.' },
          ].map((feature) => (
            <div key={feature.title} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '280px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 0.8rem' }}>{feature.icon}</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#14532d', margin: '0 0 0.5rem' }}>{feature.title}</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ backgroundColor: '#15803d', padding: '4rem 2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem' }}>Eres asesor inmobiliario?</h3>
        <p style={{ color: '#dcfce7', fontSize: '1.1rem', margin: '0 0 2rem' }}>Unete a NIDO Pro y deja que la IA trabaje por ti. Cierra mas tratos en menos tiempo.</p>
        <a href="/chat" style={{ padding: '0.9rem 2.5rem', borderRadius: '10px', border: '2px solid white', backgroundColor: 'white', color: '#15803d', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}>Comenzar gratis</a>
      </section>
      <footer style={{ backgroundColor: '#14532d', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#86efac', margin: 0, fontSize: '0.9rem' }}>2026 NIDO - La plataforma inmobiliaria inteligente de Costa Rica</p>
      </footer>
    </main>
  )
}