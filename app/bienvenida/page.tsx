'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ROLES = [
  {
    id: 'comprador',
    titulo: 'Quiero comprar o alquilar',
    subtitulo: 'PARA COMPRADORES',
    desc: 'Encuentra tu hogar ideal con el apoyo de Valeria, tu asesora IA disponible 24/7.',
    features: ['Portal de propiedades exclusivas', 'Asesor IA personalizado', 'Tours 360° virtuales', 'Precalificación bancaria'],
    imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=90&fit=crop',
    cta: 'Explorar propiedades',
    href: '/comprador',
  },
  {
    id: 'propietario',
    titulo: 'Tengo una propiedad',
    subtitulo: 'PARA PROPIETARIOS',
    desc: 'Vende o alquila tu propiedad con reportes mensuales y valuación en tiempo real.',
    features: ['Publicación en minutos', 'Reportes mensuales', 'Valuación de mercado', 'Red de asesores'],
    imagen: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=90&fit=crop',
    cta: 'Publicar mi propiedad',
    href: '/propietario',
  },
  {
    id: 'asesor',
    titulo: 'Soy asesor inmobiliario',
    subtitulo: 'PARA PROFESIONALES',
    desc: 'Accede al CRM inteligente, Valeria Agent y la red colaborativa de asesores.',
    features: ['CRM con score de leads', 'NIDO Agent automatiza el 80%', 'Academia completa', 'Red colaborativa'],
    imagen: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=90&fit=crop',
    cta: 'Acceder a NIDO Pro',
    href: '/registro',
  }
]

export default function Bienvenida() {
  const router = useRouter()

  useEffect(() => {
    // No auto-redirect - let user choose every time
  }, [])

  const handleSelect = (role: typeof ROLES[0]) => {
    localStorage.setItem('nido_rol', role.id)
    router.push(role.href)
  }

  return (
    <main style={{ fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh', background: '#060D08' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .role-card { position: relative; overflow: hidden; cursor: pointer; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.2s, border-color 0.2s; -webkit-tap-highlight-color: transparent; }
        .role-card:active { transform: scale(0.98); border-color: rgba(200,169,110,0.4); }
        .role-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .role-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,13,8,0.92) 0%, rgba(6,13,8,0.4) 60%, rgba(6,13,8,0.2) 100%); }
        .role-content { position: relative; z-index: 2; padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
        .role-tag { font-size: 0.6rem; letter-spacing: 0.16em; color: #C8A96E; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px; }
        .role-tag::before { content: ''; width: 16px; height: 1px; background: #C8A96E; }
        .role-title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; color: white; line-height: 1.15; margin-bottom: 0.5rem; }
        .role-desc { font-size: 0.8rem; color: rgba(255,255,255,0.55); line-height: 1.6; margin-bottom: 1rem; font-weight: 300; }
        .role-features { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1.2rem; }
        .role-feature { font-size: 0.75rem; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 6px; }
        .role-feature::before { content: ''; width: 3px; height: 3px; background: #C8A96E; border-radius: 50%; flex-shrink: 0; }
        .role-cta { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.8); letter-spacing: 0.06em; border: none; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 0; }
        .role-cta-line { width: 28px; height: 1px; background: rgba(255,255,255,0.5); transition: width 0.3s; }
        @media (min-width: 768px) {
          .roles-grid { display: flex !important; flex-direction: row !important; height: 100vh !important; gap: 0 !important; padding: 0 !important; }
          .role-card { border-radius: 0 !important; border: none !important; border-right: 1px solid rgba(255,255,255,0.06) !important; flex: 1; transition: flex 0.7s cubic-bezier(0.4,0,0.2,1) !important; }
          .role-card:hover { flex: 2.5 !important; }
          .role-card:last-child { border-right: none !important; }
          .role-content { justify-content: flex-end !important; padding: 3rem !important; }
          .role-title { font-size: 2rem !important; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: 'linear-gradient(to bottom, rgba(6,13,8,0.8), transparent)' }}>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: 'white' }}>
          NIDO<span style={{ color: '#C8A96E' }}>.</span>
        </div>
        <a href="/login" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.75rem', letterSpacing: '0.1em' }}>INGRESAR</a>
      </nav>

      <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
        <div style={{ padding: '1rem 1rem 0.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C8A96E', marginBottom: '0.4rem' }}>BIENVENIDO A NIDO</p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', color: 'white', lineHeight: 1.2, marginBottom: '0.3rem' }}>¿Cómo podemos ayudarte?</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>Selecciona tu perfil</p>
        </div>

        <div className="roles-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
          {ROLES.map((role) => (
            <div
              key={role.id}
              className="role-card"
              style={{ height: '28vh', minHeight: '180px' }}
              onClick={() => handleSelect(role)}
            >
              <div className="role-bg" style={{ backgroundImage: 'url(' + role.imagen + ')' }} />
              <div className="role-overlay" />
              <div className="role-content">
                <div className="role-tag">{role.subtitulo}</div>
                <div className="role-title">{role.titulo}</div>
                <div className="role-desc">{role.desc}</div>
                <div className="role-features">
                  {role.features.slice(0, 2).map(f => (
                    <div key={f} className="role-feature">{f}</div>
                  ))}
                </div>
                <button className="role-cta">
                  <span className="role-cta-line" />
                  {role.cta.toUpperCase()}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', padding: '1rem', paddingBottom: '2rem' }}>PUEDES CAMBIAR TU PERFIL EN CUALQUIER MOMENTO</p>
      </div>
    </main>
  )
}