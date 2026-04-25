'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ROLES = [
  {
    id: 'comprador',
    titulo: 'Quiero comprar\no alquilar',
    subtitulo: 'PARA COMPRADORES',
    desc: 'Encuentra tu hogar ideal con el apoyo de nuestro asesor IA disponible 24/7.',
    features: ['Portal de propiedades exclusivas', 'Asesor IA personalizado 24/7', 'Tours 360° virtuales', 'Precalificación bancaria'],
    imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=90&fit=crop',
    cta: 'Explorar propiedades',
    href: '/propiedades',
    nav: [
      { label: 'Propiedades', href: '/propiedades' },
      { label: 'Asesor IA', href: '/chat' },
      { label: 'Contacto', href: '/contacto' },
    ]
  },
  {
    id: 'propietario',
    titulo: 'Tengo una\npropiedad',
    subtitulo: 'PARA PROPIETARIOS',
    desc: 'Vende o alquila tu propiedad con reportes mensuales y valuación de mercado en tiempo real.',
    features: ['Publica en minutos', 'Reportes mensuales detallados', 'Valuación de mercado real', 'Red de asesores profesionales'],
    imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=90&fit=crop',
    cta: 'Publicar mi propiedad',
    href: '/propietario',
    nav: [
      { label: 'Mi propiedad', href: '/propietario' },
      { label: 'Asesores', href: '/asesores' },
      { label: 'Contacto', href: '/contacto' },
    ]
  },
  {
    id: 'asesor',
    titulo: 'Soy asesor\ninmobiliario',
    subtitulo: 'PARA PROFESIONALES',
    desc: 'Accede al CRM inteligente, NIDO Agent y la red colaborativa de asesores profesionales.',
    features: ['CRM con score de leads IA', 'NIDO Agent automatiza el 80%', 'Academia inmobiliaria completa', 'Red colaborativa de asesores'],
    imagen: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&q=90&fit=crop',
    cta: 'Acceder a NIDO Pro',
    href: '/registro',
    nav: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'CRM', href: '/dashboard/crm' },
      { label: 'Academia', href: '/academia' },
      { label: 'Precios', href: '/precios' },
    ]
  }
]

export default function Bienvenida() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('nido_rol')
    if (saved) {
      const role = ROLES.find(r => r.id === saved)
      if (role) router.push(role.href)
    }
  }, [])

  const handleSelect = (role: typeof ROLES[0]) => {
    if (selected) return
    setSelected(role.id)
    localStorage.setItem('nido_rol', role.id)
    setTimeout(() => router.push(role.href), 500)
  }

  const active = hovered || selected

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", height: '100vh', overflow: 'hidden', background: '#060D08' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .panel { position: relative; overflow: hidden; cursor: pointer; transition: flex 0.75s cubic-bezier(0.4,0,0.2,1); flex: 1; min-width: 0; }
        .panel.active { flex: 3; }
        .panel-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 0.9s ease, filter 0.6s; filter: brightness(0.35) saturate(0.8); }
        .panel.active .panel-bg { transform: scale(1.06); filter: brightness(0.3) saturate(0.9); }
        .panel-vignette { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(6,13,8,0.6) 0%, transparent 50%, rgba(6,13,8,0.8) 100%); }
        .panel-bottom { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(6,13,8,1) 0%, rgba(6,13,8,0.7) 40%, transparent 100%); height: 65%; }
        .panel-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 2.5rem 2.5rem 3rem; }
        .panel-index { font-family: 'Playfair Display', serif; font-size: 10rem; color: rgba(255,255,255,0.03); position: absolute; top: 1rem; right: 1.5rem; line-height: 1; font-style: italic; transition: opacity 0.5s; pointer-events: none; }
        .panel.active .panel-index { opacity: 0; }
        .panel-tag { display: inline-flex; align-items: center; gap: 0.5rem; color: rgba(200,169,110,0.7); font-size: 0.62rem; letter-spacing: 0.18em; font-weight: 500; margin-bottom: 1.2rem; transition: opacity 0.4s; }
        .panel-tag::before { content: ''; width: 20px; height: 1px; background: rgba(200,169,110,0.5); }
        .panel-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: white; line-height: 1.15; font-weight: 400; white-space: pre-line; }
        .panel-reveal { max-height: 0; overflow: hidden; transition: max-height 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.5s 0.1s; opacity: 0; }
        .panel.active .panel-reveal { max-height: 500px; opacity: 1; }
        .panel-desc { font-size: 0.82rem; color: rgba(255,255,255,0.45); line-height: 1.75; margin-top: 1rem; font-weight: 300; max-width: 320px; }
        .panel-line { width: 28px; height: 1px; background: rgba(200,169,110,0.35); margin: 1.4rem 0; }
        .feat { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.55rem; font-size: 0.75rem; color: rgba(255,255,255,0.5); letter-spacing: 0.01em; }
        .feat-mark { width: 3px; height: 3px; background: #C8A96E; border-radius: 50%; flex-shrink: 0; }
        .panel-btn { margin-top: 2rem; display: inline-flex; align-items: center; gap: 0.8rem; font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.8); letter-spacing: 0.06em; border: none; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 0; transition: color 0.2s; }
        .panel-btn:hover { color: white; }
        .panel-btn-line { width: 32px; height: 1px; background: currentColor; transition: width 0.3s; }
        .panel-btn:hover .panel-btn-line { width: 48px; }
        .sep { width: 1px; background: rgba(255,255,255,0.05); flex-shrink: 0; position: relative; z-index: 10; }
        .panel-side-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(90deg); white-space: nowrap; font-size: 0.6rem; letter-spacing: 0.2em; color: rgba(255,255,255,0.15); transition: opacity 0.4s; pointer-events: none; }
        .panel.active .panel-side-text { opacity: 0; }
      `}</style>

      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(6,13,8,0.8) 0%, transparent 100%)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'white', letterSpacing: '0.04em', fontWeight: 400 }}>
          NIDO<span style={{ color: '#C8A96E' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.72rem', letterSpacing: '0.12em' }}>INGRESAR</a>
          <a href="/propiedades" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.72rem', letterSpacing: '0.12em' }}>VER PORTAL</a>
        </div>
      </nav>

      <div style={{ display: 'flex', height: '100vh' }}>
        {ROLES.map((role, i) => (
          <div key={role.id} style={{ display: 'contents' }}>
            <div
              className={'panel' + (active === role.id ? ' active' : '')}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(role)}
            >
              <div className="panel-bg" style={{ backgroundImage: 'url(' + role.imagen + ')' }} />
              <div className="panel-vignette" />
              <div className="panel-bottom" />
              <div className="panel-index">{String(i+1).padStart(2,'0')}</div>
              <div className="panel-side-text">{role.subtitulo}</div>
              <div className="panel-content">
                <div className="panel-tag">{role.subtitulo}</div>
                <div className="panel-title">{role.titulo}</div>
                <div className="panel-reveal">
                  <div className="panel-desc">{role.desc}</div>
                  <div className="panel-line" />
                  {role.features.map(f => (
                    <div key={f} className="feat">
                      <div className="feat-mark" />
                      {f}
                    </div>
                  ))}
                  <button className="panel-btn" onClick={() => handleSelect(role)}>
                    <span className="panel-btn-line" />
                    {role.cta.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
            {i < ROLES.length - 1 && <div className="sep" />}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>SELECCIONA TU PERFIL PARA COMENZAR</p>
        <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      </div>
    </main>
  )
}