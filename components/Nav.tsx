'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Nav({ rol }: { rol?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const canGoBack = pathname !== '/' && pathname !== '/bienvenida'

  const links = rol === 'asesor'
    ? [{ label: 'Dashboard', href: '/dashboard' }, { label: 'CRM', href: '/dashboard/crm' }, { label: 'Academia', href: '/academia' }, { label: 'Precios', href: '/precios' }]
    : rol === 'propietario'
    ? [{ label: 'Mi propiedad', href: '/propietario' }, { label: 'Asesores', href: '/asesores' }, { label: 'Contacto', href: '/contacto' }]
    : [{ label: 'Propiedades', href: '/propiedades' }, { label: 'Asesores', href: '/asesores' }, { label: 'Calculadoras', href: '/calculadoras' }, { label: 'Academia', href: '/academia' }, { label: 'Precios', href: '/precios' }]

  return (
    <>
      <style>{`
        .nido-nav-wrap { position: sticky; top: 0; z-index: 100; background: rgba(250,250,248,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(27,94,59,0.08); transition: box-shadow 0.2s; }
        .nido-nav-wrap.scrolled { box-shadow: 0 2px 16px rgba(27,94,59,0.06); }
        .nido-nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1600px; margin: 0 auto; }
        .nav-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: #9CA3AF; font-size: 13px; cursor: pointer; padding: 0; font-family: inherit; transition: color 0.2s; }
        .nav-back:hover { color: #1B5E3B; }
        .nav-back svg { transition: transform 0.2s; }
        .nav-back:hover svg { transform: translateX(-2px); }
        .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-link { color: #6B7280; text-decoration: none; font-size: 13px; letter-spacing: 0.04em; transition: color 0.2s; padding: 4px 0; border-bottom: 1px solid transparent; }
        .nav-link:hover, .nav-link.active { color: #1B5E3B; }
        .nav-link.active { border-bottom-color: #1B5E3B; }
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { width: 22px; height: 1.5px; background: #1a1a1a; transition: all 0.3s; display: block; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(250,250,248,0.98); z-index: 200; flex-direction: column; padding: 24px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .mobile-menu-links { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .mobile-link { font-family: "Cormorant Garamond", serif; font-size: 36px; font-weight: 400; color: #0D1F15; text-decoration: none; padding: 12px 0; border-bottom: 1px solid rgba(27,94,59,0.08); display: block; transition: color 0.2s; }
        .mobile-link:hover { color: #1B5E3B; }
        .mobile-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 32px; }
        @media (max-width: 768px) {
          .nido-nav-inner { padding: 14px 20px; }
          .nav-links { display: none; }
          .nav-actions { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <header className={'nido-nav-wrap' + (scrolled ? ' scrolled' : '')}>
        <div className="nido-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {canGoBack && (
              <button className="nav-back" onClick={() => router.back()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
                <span style={{ display: 'none' }} className="nav-back-label">Volver</span>
              </button>
            )}
            <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 500, color: '#1B5E3B', textDecoration: 'none', letterSpacing: '0.02em' }}>
              NIDO<span style={{ color: '#C8A96E' }}>.</span>
            </Link>
          </div>

          <nav className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={'nav-link' + (pathname === l.href ? ' active' : '')}>{l.label}</Link>
            ))}
          </nav>

          <div className="nav-actions">
            <Link href="/login" style={{ border: '1px solid rgba(27,94,59,0.2)', background: 'transparent', color: '#1B5E3B', padding: '8px 16px', borderRadius: 999, fontSize: 13, textDecoration: 'none' }}>Ingresar</Link>
            <Link href="/registro" style={{ border: '1px solid #1B5E3B', background: '#1B5E3B', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 13, textDecoration: 'none' }}>Comenzar</Link>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menú">
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={'mobile-menu' + (menuOpen ? ' open' : '')}>
        <div className="mobile-menu-header">
          <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 500, color: '#1B5E3B', textDecoration: 'none' }}>NIDO<span style={{ color: '#C8A96E' }}>.</span></Link>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          {canGoBack && (
            <button onClick={() => { router.back(); setMenuOpen(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#9CA3AF', fontSize: 14, padding: '12px 0', borderBottom: '1px solid rgba(27,94,59,0.08)', fontFamily: 'inherit' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Volver atrás
            </button>
          )}
          {links.map(l => (
            <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
        </div>
        <div className="mobile-actions">
          <Link href="/login" style={{ display: 'block', padding: '14px', borderRadius: 10, border: '1px solid rgba(27,94,59,0.2)', color: '#1B5E3B', textAlign: 'center', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Ingresar</Link>
          <Link href="/registro" style={{ display: 'block', padding: '14px', borderRadius: 10, background: '#1B5E3B', color: 'white', textAlign: 'center', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Comenzar gratis</Link>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 24, letterSpacing: '0.08em' }}>NIDO · Costa Rica © 2026</p>
      </div>
    </>
  )
}