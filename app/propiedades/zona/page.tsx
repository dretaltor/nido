import type { Metadata } from 'next'
import { COSTA_RICA } from '../../../lib/costaRicaData'
import { zonaSlug } from '../../../lib/zonas'
import { supabase } from '../../../lib/supabase'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Propiedades por zona en Costa Rica · NIDO',
  description: 'Explorá casas, apartamentos y lotes en venta por cantón en las 7 provincias de Costa Rica: San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas y Limón.',
  alternates: { canonical: 'https://www.nido-cr.com/propiedades/zona' },
}

export default async function ZonaIndexPage() {
  const { data } = await supabase
    .from('propiedades')
    .select('zona')
    .eq('disponible', true)
    .eq('verificacion_estado', 'aprobada')
  const conteos: Record<string, number> = {}
  ;(data || []).forEach((p: any) => { conteos[p.zona] = (conteos[p.zona] || 0) + 1 })

  return (
    <main style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', background: 'var(--bg)', minHeight: '100vh' }}>
      <style>{CSS}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'oklch(0.97 0.005 80/0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', maxWidth: 1600, margin: '0 auto' }}>
          <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500 }}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></a>
          <a href="/propiedades" style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>Ver todas las propiedades →</a>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Costa Rica</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,48px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 12 }}>
            Explorá propiedades <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>por zona.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 640 }}>
            Buscá por cantón en las 7 provincias de Costa Rica.
          </p>
        </div>

        {COSTA_RICA.map(provincia => (
          <div key={provincia.nombre} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 14, borderBottom: '1px solid var(--rule)', paddingBottom: 10 }}>{provincia.nombre}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {provincia.cantones.map(canton => {
                const n = conteos[canton.nombre] || 0
                return (
                  <a key={canton.nombre} href={`/propiedades/zona/${zonaSlug(canton.nombre)}`}
                    style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--rule)', background: n > 0 ? 'var(--accent-tint)' : 'var(--bg-card)', fontSize: 13, color: n > 0 ? 'var(--accent)' : 'var(--ink-2)', textDecoration: 'none' }}>
                    {canton.nombre}{n > 0 ? ` (${n})` : ''}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
  a{color:inherit}
`
