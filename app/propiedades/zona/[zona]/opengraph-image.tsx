import { ImageResponse } from 'next/og'
import { getZonaBySlug } from '../../../../lib/zonas'
import { createClient } from '@supabase/supabase-js'

export const alt = 'Propiedades por zona · NIDO'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Image({ params }: { params: Promise<{ zona: string }> }) {
  const { zona: slug } = await params
  const zona = getZonaBySlug(slug)
  const nombre = zona?.nombre || 'Costa Rica'
  const provincia = zona?.provincia || ''

  let total = 0
  if (zona) {
    const { count } = await supabase
      .from('propiedades')
      .select('id', { count: 'exact', head: true })
      .eq('zona', zona.nombre)
      .eq('disponible', true)
      .eq('verificacion_estado', 'aprobada')
    total = count || 0
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'center', position: 'relative',
          backgroundColor: '#0D1F15', fontFamily: 'sans-serif', padding: '0 80px',
        }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: 1200, height: 630,
            background: 'radial-gradient(circle at 75% 30%, rgba(27,94,59,0.55) 0%, rgba(13,31,21,0) 60%)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 40, color: 'white', letterSpacing: 2 }}>NIDO</span>
          <span style={{ fontSize: 40, color: '#C8A96E' }}>.</span>
        </div>
        {provincia && (
          <div style={{ display: 'flex', fontSize: 24, color: '#C8A96E', letterSpacing: 1, marginBottom: 12 }}>
            {provincia.toUpperCase()}, COSTA RICA
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 60, color: 'white', lineHeight: 1.1, maxWidth: 1000 }}>
          Propiedades en {nombre}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.75)', marginTop: 24 }}>
          {total > 0 ? `${total} propiedad${total === 1 ? '' : 'es'} disponible${total === 1 ? '' : 's'}` : 'Te avisamos cuando haya disponibilidad'}
        </div>
      </div>
    ),
    { ...size }
  )
}
