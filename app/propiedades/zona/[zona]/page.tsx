import type { Metadata } from 'next'
import { cache } from 'react'
import { supabase } from '../../../../lib/supabase'
import { ZONAS, getZonaBySlug } from '../../../../lib/zonas'
import { ZonaLeadForm } from '../../../../components/zonas/ZonaLeadForm'
import Link from 'next/link'

export const revalidate = 3600
export const dynamicParams = true

const HUES = [80, 50, 200, 130, 160, 240, 100, 170]
function fmt(n: number): string { return n.toLocaleString('en-US') }

const getListado = cache(async (zonaNombre: string) => {
  const { data } = await supabase
    .from('propiedades')
    .select('id,ref_id,titulo,precio,tipo,operacion,habitaciones,banos,metros,lote_m2,zona,provincia,fotos')
    .eq('zona', zonaNombre)
    .eq('disponible', true)
    .eq('verificacion_estado', 'aprobada')
    .order('created_at', { ascending: false })
  return data || []
})

export async function generateStaticParams() {
  const { data } = await supabase
    .from('propiedades')
    .select('zona')
    .eq('disponible', true)
    .eq('verificacion_estado', 'aprobada')
  const zonasConListado = new Set((data || []).map((p: { zona: string }) => p.zona))
  return ZONAS.filter(z => zonasConListado.has(z.nombre)).map(z => ({ zona: z.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ zona: string }> }): Promise<Metadata> {
  const { zona: slug } = await params
  const zona = getZonaBySlug(slug)
  if (!zona) return { title: 'Zona no encontrada · NIDO' }
  const listado = await getListado(zona.nombre)
  const title = `Propiedades en venta en ${zona.nombre}, ${zona.provincia} · NIDO`
  const description = listado.length > 0
    ? `${listado.length} propiedad${listado.length === 1 ? '' : 'es'} disponible${listado.length === 1 ? '' : 's'} en ${zona.nombre}, ${zona.provincia}. Casas, apartamentos y lotes verificados con asesoría de Valeria IA.`
    : `Buscá casas, apartamentos y lotes en ${zona.nombre}, ${zona.provincia}, Costa Rica. Registrate para que te avisemos apenas haya propiedades disponibles en esta zona.`
  const url = `https://www.nido-cr.com/propiedades/zona/${zona.slug}`
  return {
    title,
    description,
    keywords: [`propiedades en ${zona.nombre}`, `casas en venta ${zona.nombre}`, `bienes raices ${zona.nombre}`, `real estate ${zona.nombre} Costa Rica`],
    openGraph: { title, description, url },
    alternates: { canonical: url },
  }
}

export default async function ZonaPage({ params }: { params: Promise<{ zona: string }> }) {
  const { zona: slug } = await params
  const zona = getZonaBySlug(slug)

  if (!zona) {
    return (
      <main style={{ fontFamily: 'var(--sans)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <style>{CSS}</style>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 12 }}>Zona no encontrada</h1>
          <Link href="/propiedades" style={{ color: 'var(--accent)' }}>← Volver al catálogo</Link>
        </div>
      </main>
    )
  }

  const listado = await getListado(zona.nombre)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Propiedades', item: 'https://www.nido-cr.com/propiedades' },
          { '@type': 'ListItem', position: 2, name: zona.nombre, item: `https://www.nido-cr.com/propiedades/zona/${zona.slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: listado.map((p, i: number) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://www.nido-cr.com/propiedades/${p.id}`,
          item: {
            '@type': 'Residence',
            name: p.titulo,
            address: { '@type': 'PostalAddress', addressLocality: zona.nombre, addressRegion: zona.provincia, addressCountry: 'CR' },
          },
        })),
      },
    ],
  }

  return (
    <main style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', background: 'var(--bg)', minHeight: '100vh' }}>
      <style>{CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'oklch(0.97 0.005 80/0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', maxWidth: 1600, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500 }}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></Link>
          <Link href="/propiedades" style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>Ver todas las propiedades →</Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 80px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>
          <Link href="/propiedades" style={{ color: 'var(--ink-3)' }}>Propiedades</Link> · <Link href="/propiedades/zona" style={{ color: 'var(--ink-3)' }}>Zonas</Link> · {zona.nombre}
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>{zona.provincia}, Costa Rica</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,48px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 12 }}>
            Propiedades en <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{zona.nombre}.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 640 }}>
            {listado.length > 0
              ? `${listado.length} propiedad${listado.length === 1 ? '' : 'es'} disponible${listado.length === 1 ? '' : 's'} en ${zona.nombre}, verificada${listado.length === 1 ? '' : 's'} por el equipo NIDO.`
              : `Todavía no tenemos propiedades publicadas en ${zona.nombre}. Dejanos tus datos y te avisamos apenas haya disponibilidad.`}
          </p>
        </div>

        {listado.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {listado.map((p, i: number) => {
              const hue = HUES[i % HUES.length]
              return (
                <a key={p.id} href={`/propiedades/${p.id}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 8, overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: `oklch(0.88 0.03 ${hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.fotos && p.fotos.length > 0 ? (
                      <img src={p.fotos[0]} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: `oklch(0.55 0.05 ${hue})`, textTransform: 'uppercase', textAlign: 'center', padding: '0 1rem' }}>
                        {p.titulo.toUpperCase()} · FOTO
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{p.zona}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 15 }}>${fmt(p.precio)}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, margin: '0 0 10px', lineHeight: 1.1 }}>{p.titulo}</h3>
                    <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--ink-3)' }}>
                      {p.tipo === 'lote' ? (
                        <span>{p.metros || p.lote_m2} m² terreno</span>
                      ) : (
                        <>
                          <span>{p.habitaciones} hab</span>
                          <span>{p.banos} baños</span>
                          <span>{p.metros || p.lote_m2} m²</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div style={{ maxWidth: 480 }}>
            <ZonaLeadForm zona={zona.nombre} />
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 20, lineHeight: 1.6 }}>
              ¿Tenés una propiedad en {zona.nombre}? <a href="/registro-propietario" style={{ color: 'var(--accent)' }}>Publicala en NIDO →</a>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit}
`
