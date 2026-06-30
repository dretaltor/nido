'use client'
import { useEffect, useRef } from 'react'

interface PropiedadMapa {
  id: string
  titulo: string
  precio: number
  operacion?: string
  zona: string
  distrito?: string
  provincia?: string
  canton?: string
  habitaciones: number
  area_m2?: number
  area_lote?: number
  tipo?: string
}

interface Props {
  propiedades: PropiedadMapa[]
  onSelect?: (id: string) => void
}

const geocodeCache: Record<string, [number, number]> = {}

async function geocodeQuery(query: string, token: string): Promise<[number, number]> {
  if (geocodeCache[query]) return geocodeCache[query]
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=cr&limit=1`
    const res = await fetch(url)
    const json = await res.json()
    if (json.features && json.features[0]) {
      const coords = json.features[0].center as [number, number]
      geocodeCache[query] = coords
      return coords
    }
  } catch {}
  const fallback: [number, number] = [-84.0875, 9.9281]
  geocodeCache[query] = fallback
  return fallback
}

export default function MapaInteractivo({ propiedades, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const boundsRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css'
    document.head.appendChild(link)

    let cancelled = false

    import('mapbox-gl').then(async ({ default: mapboxgl }) => {
      if (cancelled) return
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string
      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapRef.current as HTMLDivElement,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-84.0875, 9.9281],
        zoom: 7.5,
      })
      mapInstance.current = map

      map.on('load', async () => {
        if (cancelled || propiedades.length === 0) return

        const bounds = new mapboxgl.LngLatBounds()

        for (const p of propiedades) {
          const query = [p.distrito, p.zona, p.provincia, 'Costa Rica'].filter(Boolean).join(', ')
          const coords = await geocodeQuery(query, token)
          if (cancelled) return

          bounds.extend(coords)

          const priceLabel = p.operacion === 'alquiler'
            ? '$' + (p.precio / 1000).toFixed(1) + 'k/m'
            : '$' + (p.precio / 1000).toFixed(0) + 'k'

          const el = document.createElement('div')
          el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer'

          const bubble = document.createElement('div')
          bubble.style.cssText = 'background:white;border:1.5px solid rgba(27,94,59,0.25);border-radius:999px;padding:5px 12px;font-size:12px;font-family:monospace;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.12);transition:all 0.2s;color:#1a1a1a'
          bubble.textContent = priceLabel

          const tail = document.createElement('div')
          tail.style.cssText = 'width:1px;height:8px;background:#9CA3AF'

          el.appendChild(bubble)
          el.appendChild(tail)

          el.addEventListener('mouseenter', () => {
            bubble.style.background = 'oklch(0.42 0.06 150)'
            bubble.style.color = 'white'
            bubble.style.borderColor = 'transparent'
          })
          el.addEventListener('mouseleave', () => {
            bubble.style.background = 'white'
            bubble.style.color = '#1a1a1a'
            bubble.style.borderColor = 'rgba(27,94,59,0.25)'
          })
          el.addEventListener('click', () => { if (onSelect) onSelect(p.id) })

          const detalle = p.tipo === 'lote' ? ((p.area_lote || p.area_m2 || 0) + 'm² terreno') : (p.habitaciones + ' hab · ' + (p.area_m2 || 0) + 'm²')
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML('<div style="font-family:DM Sans,sans-serif;padding:4px;min-width:150px"><div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:4px">' + p.zona + '</div><div style="font-weight:500;color:#1a1a1a;margin-bottom:4px">' + p.titulo + '</div><div style="font-size:12px;color:#6B7280">' + detalle + '</div></div>')

          new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(map)
        }

        if (!bounds.isEmpty() && !cancelled) {
          boundsRef.current = bounds
          map.fitBounds(bounds, { padding: 60, maxZoom: propiedades.length === 1 ? 13 : 14, duration: 0 })
        }
      })
    })

    return () => {
      cancelled = true
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [propiedades.map(p => p.id).join(',')])

  const recentrar = () => {
    if (mapInstance.current && boundsRef.current) {
      mapInstance.current.fitBounds(boundsRef.current, { padding: 60, maxZoom: propiedades.length === 1 ? 13 : 14, duration: 600 })
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <button onClick={recentrar} title="Volver a centrar" style={{ position:'absolute', top:12, right:12, width:36, height:36, borderRadius:8, background:'white', border:'1px solid rgba(0,0,0,0.1)', boxShadow:'0 2px 8px rgba(0,0,0,0.12)', cursor:'pointer', display:'grid', placeItems:'center', fontSize:16, zIndex:10 }}>
        ⟲
      </button>
    </div>
  )
}
