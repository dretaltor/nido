import { ImageResponse } from 'next/og'

export const alt = 'NIDO · Propiedades en Venta y Alquiler · Costa Rica'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          <span style={{ fontSize: 46, color: 'white', letterSpacing: 2 }}>NIDO</span>
          <span style={{ fontSize: 46, color: '#C8A96E' }}>.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 58, color: 'white', lineHeight: 1.15, maxWidth: 900 }}>
          Propiedades en venta y alquiler en Costa Rica
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.7)', marginTop: 24 }}>
          Casas · Apartamentos · Villas · Lotes — verificadas con Valeria IA
        </div>
      </div>
    ),
    { ...size }
  )
}
