'use client'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../lib/supabase'
import type { AsesorPublico, CalificacionPublica } from '../../../lib/database.types'
import { precioPrincipal } from '../../../lib/precioPropiedad'

interface PropiedadMini {
  id: string
  titulo: string
  precio: number
  moneda?: string
  precio_moneda_original?: number
  zona: string
  tipo: string
  operacion?: string
  habitaciones?: number | null
  banos?: number | null
  metros?: number | null
  fotos?: string[] | null
}

export default function PerfilAsesor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [asesor, setAsesor] = useState<AsesorPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [propiedades, setPropiedades] = useState<PropiedadMini[]>([])
  const [resenas, setResenas] = useState<Partial<CalificacionPublica>[]>([])
  const [califCounts, setCalifCounts] = useState<number[]>([0, 0, 0, 0, 0])
  const [stats, setStats] = useState<{ promedio: number | null, total: number, cerradas: number, activas: number }>({ promedio: null, total: 0, cerradas: 0, activas: 0 })

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setLoading(true)
      const cols = 'id,nombre,correo,foto_url,valeria_perfil,equipo_nido_estado,telefono,bio_publica,anos_experiencia,hobbies,zona_trabajo_publica,slug,oficina_id,oficina_nombre'
      let { data } = await supabase.from('asesores_publicos').select(cols).eq('slug', slug).maybeSingle()
      if (!data) {
        const byId = await supabase.from('asesores_publicos').select(cols).eq('id', slug).maybeSingle()
        data = byId.data
      }
      if (cancelado) return
      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setAsesor(data)
      const correo = data.correo as string
      const [props, resenasData, calif, cerradas, activas] = await Promise.all([
        supabase.from('propiedades').select('id,titulo,precio,moneda,precio_moneda_original,zona,tipo,operacion,habitaciones,banos,metros,fotos').eq('asesor_email', correo).eq('disponible', true).order('created_at', { ascending: false }),
        supabase.from('calificaciones_publicas').select('calificador_nombre,calificacion,comentario,created_at').eq('asesor_email', correo).order('created_at', { ascending: false }).limit(12),
        supabase.from('calificaciones_publicas').select('calificacion').eq('asesor_email', correo),
        supabase.from('comisiones').select('id', { count: 'exact', head: true }).eq('asesor_email', correo).eq('estado', 'cobrada'),
        supabase.from('propiedades').select('id', { count: 'exact', head: true }).eq('asesor_email', correo).eq('disponible', true),
      ])
      if (cancelado) return
      setPropiedades((props.data || []) as PropiedadMini[])
      setResenas(resenasData.data || [])
      const califs = (calif.data || []).map((c) => c.calificacion || 0)
      const total = califs.length
      const promedio = total > 0 ? Math.round((califs.reduce((a, b) => a + b, 0) / total) * 10) / 10 : null
      // Las barras de distribucion se calculan sobre el set completo (calif, sin
      // limite), no sobre `resenas` (limitado a 12 para la lista de comentarios),
      // para que la suma de las barras siempre coincida con el total mostrado.
      setCalifCounts([1, 2, 3, 4, 5].map(n => califs.filter(c => c === n).length))
      setStats({ promedio, total, cerradas: cerradas.count || 0, activas: activas.count || 0 })
      setLoading(false)
    }
    cargar()
    return () => { cancelado = true }
  }, [slug])

  if (loading) return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
      <p>Cargando perfil...</p>
    </main>
  )

  if (notFound || !asesor) return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', color: '#999' }}>
      <p>No encontramos este perfil de asesor.</p>
      <Link href="/asesores" style={{ color: '#3a7d5c' }}>Ver todos los asesores →</Link>
    </main>
  )

  const esEquipoNido = asesor.equipo_nido_estado === 'aprobado'
  const hobbies = Array.isArray(asesor.hobbies) ? (asesor.hobbies as string[]).filter(h => typeof h === 'string') : []
  const maxCount = Math.max(1, ...califCounts)
  const numeroWhatsapp = (asesor.telefono || '').replace(/[^0-9]/g, '')

  return (
    <main style={{ fontFamily: "'DM Sans',sans-serif", background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
        .prop-card{background:var(--bg-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;transition:box-shadow 0.2s}
        .prop-card:hover{box-shadow:0 8px 24px oklch(0.2 0.02 80/0.08)}
        .bar-row{display:grid;grid-template-columns:16px 1fr 28px;gap:10px;align-items:center;font-size:12px;color:var(--ink-3)}
        .bar-track{height:8px;border-radius:999px;background:var(--rule-soft);overflow:hidden}
        .bar-fill{height:100%;background:var(--accent);border-radius:999px}
        @media(max-width:768px){.profile-hero{grid-template-columns:1fr!important;text-align:center}.profile-hero .hero-photo{margin:0 auto}.props-grid{grid-template-columns:1fr!important}.stats-row{grid-template-columns:repeat(2,1fr)!important}.section-pad{padding:32px 16px!important}}
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'oklch(0.97 0.005 80/0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', maxWidth: 1200, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--ink)' }}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></Link>
          <Link href="/asesores" style={{ fontSize: 13, color: 'var(--ink-2)' }}>← Todos los asesores</Link>
        </div>
      </nav>

      <section className="section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px 32px' }}>
        <div className="profile-hero" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
          <div className="hero-photo" style={{ width: 220, height: 220, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 72, color: 'oklch(0.9 0.04 80)', flexShrink: 0 }}>
            {asesor.foto_url ? <img src={asesor.foto_url} alt={asesor.nombre || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (asesor.nombre || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              {esEquipoNido ? 'Asesor NIDO' : ('Asesor afiliado a NIDO' + (asesor.oficina_nombre ? ' · ' + asesor.oficina_nombre : ''))}
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px,4.5vw,56px)', fontWeight: 400, lineHeight: 1, marginBottom: 14 }}>{asesor.nombre}</h1>
            {asesor.zona_trabajo_publica && (
              <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 14 }}>📍 {asesor.zona_trabajo_publica}</div>
            )}
            {asesor.bio_publica && (
              <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 16, maxWidth: 620 }}>{asesor.bio_publica}</p>
            )}
            {hobbies.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {hobbies.map(h => <span key={h} style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--bg-elev)', border: '1px solid var(--rule)', fontSize: 12, color: 'var(--ink-3)' }}>{h}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              {numeroWhatsapp && (
                <a href={'https://wa.me/' + numeroWhatsapp + '?text=' + encodeURIComponent('Hola ' + (asesor.nombre || '') + ', vi tu perfil en NIDO y me gustaría contactarte.')} target="_blank" style={{ padding: '10px 20px', borderRadius: 999, background: '#22c55e', color: 'white', fontSize: 13, fontWeight: 500 }}>💬 Contactar por WhatsApp</a>
              )}
              <a href={'mailto:' + asesor.correo} style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid var(--rule)', fontSize: 13, color: 'var(--ink-2)' }}>✉ Correo</a>
            </div>
          </div>
        </div>

        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)', borderRadius: 12, overflow: 'hidden', marginTop: 40 }}>
          {[
            { val: asesor.anos_experiencia ? String(asesor.anos_experiencia) : '—', label: asesor.anos_experiencia === 1 ? 'Año de experiencia' : 'Años de experiencia' },
            { val: String(stats.activas), label: 'Propiedades activas' },
            { val: String(stats.cerradas), label: 'Negocios cerrados' },
            { val: stats.promedio ? stats.promedio + '★' : '—', label: stats.total ? stats.total + ' reseña' + (stats.total === 1 ? '' : 's') : 'Sin reseñas aún' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 30, color: 'var(--accent)', marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 40px 56px' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 20 }}>Propiedades de {(asesor.nombre || '').split(' ')[0]}</h2>
        {propiedades.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>Este asesor no tiene propiedades activas en este momento.</p>
        ) : (
          <div className="props-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {propiedades.map(p => (
              <Link key={p.id} href={'/propiedades/' + p.id} className="prop-card">
                <div style={{ aspectRatio: '4/3', background: 'var(--accent-tint)', overflow: 'hidden' }}>
                  {p.fotos && p.fotos.length > 0 ? (
                    <img src={p.fotos[0]} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase' }}>{p.titulo}</div>
                  )}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>
                    <span>{p.zona}</span>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{precioPrincipal(p)}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{p.titulo}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 40px 80px' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 20 }}>Reseñas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 12, padding: 28 }}>
          <div style={{ textAlign: 'center', borderRight: '1px solid var(--rule)', paddingRight: 24 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 48, color: 'var(--accent)' }}>{stats.promedio ? stats.promedio : '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{stats.total} reseña{stats.total === 1 ? '' : 's'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            {[5, 4, 3, 2, 1].map(n => (
              <div key={n} className="bar-row">
                <span>{n}★</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: (califCounts[n - 1] / maxCount * 100) + '%' }} /></div>
                <span>{califCounts[n - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        {resenas.filter(r => r.comentario).length > 0 && (
          <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
            {resenas.filter(r => r.comentario).slice(0, 6).map((r, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.calificador_nombre || 'Cliente NIDO'}</span>
                  <span style={{ color: 'var(--accent)', fontSize: 13 }}>{'★'.repeat(r.calificacion || 0)}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{r.comentario}</p>
              </div>
            ))}
          </div>
        )}
        {stats.total === 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 16 }}>Este asesor todavía no tiene reseñas.</p>
        )}
      </section>
    </main>
  )
}
