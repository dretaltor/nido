import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { precioPrincipal } from '../../../lib/precioPropiedad'

export const alt = 'Propiedad en NIDO'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: p } = await supabase
    .from('propiedades')
    .select('titulo,precio,moneda,precio_moneda_original,zona,provincia,tipo,operacion,habitaciones,banos,metros,fotos')
    .eq('id', id)
    .maybeSingle()

  const foto = p?.fotos && p.fotos.length > 0 ? p.fotos[0] : null
  const titulo = p?.titulo || 'Propiedad en Costa Rica'
  const zona = [p?.zona, p?.provincia].filter(Boolean).join(', ')
  const operacionLabel = p?.operacion === 'alquiler' ? 'En alquiler' : 'En venta'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          position: 'relative', backgroundColor: '#0D1F15', fontFamily: 'sans-serif',
        }}
      >
        {foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
          />
        )}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: 1200, height: 630,
            background: 'linear-gradient(to top, rgba(13,31,21,0.92) 0%, rgba(13,31,21,0.55) 45%, rgba(13,31,21,0.25) 100%)',
            display: 'flex',
          }}
        />

        {/* Marca */}
        <div style={{ position: 'absolute', top: 40, left: 56, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 34, color: 'white', letterSpacing: 2 }}>NIDO</span>
          <span style={{ fontSize: 34, color: '#C8A96E' }}>.</span>
        </div>

        {/* Badge operacion */}
        <div style={{ position: 'absolute', top: 44, right: 56, display: 'flex', background: '#1B5E3B', color: 'white', padding: '8px 20px', borderRadius: 999, fontSize: 20 }}>
          {operacionLabel}
        </div>

        {/* Contenido inferior */}
        <div style={{ position: 'absolute', bottom: 48, left: 56, right: 56, display: 'flex', flexDirection: 'column' }}>
          {zona && (
            <div style={{ display: 'flex', fontSize: 24, color: '#C8A96E', letterSpacing: 1, marginBottom: 12 }}>
              {zona.toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 54, color: 'white', lineHeight: 1.1, marginBottom: 20, maxWidth: 1000 }}>
            {titulo}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 44, color: 'white', fontWeight: 700 }}>
              {precioPrincipal({ precio: p?.precio || 0, moneda: p?.moneda, precio_moneda_original: p?.precio_moneda_original })}
            </div>
            {p?.tipo !== 'lote' && (
              <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.75)', marginLeft: 28 }}>
                {p?.habitaciones ? `${p.habitaciones} hab · ` : ''}{p?.banos ? `${p.banos} baños · ` : ''}{p?.metros ? `${p.metros} m²` : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
