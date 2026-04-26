'use client'
import { useEffect, useRef } from 'react'

const COORDS: Record<string, [number, number]> = {
  'Escazu': [-84.1366, 9.9194],
  'Escazú': [-84.1366, 9.9194],
  'Santa Ana': [-84.1836, 9.9328],
  'San Jose': [-84.0875, 9.9281],
  'San José': [-84.0875, 9.9281],
  'Curridabat': [-84.0316, 9.9119],
  'Heredia': [-84.1168, 9.9986],
  'Alajuela': [-84.2141, 10.0162],
  'Cartago': [-83.9194, 9.8647],
  'Liberia': [-85.4358, 10.6340],
  'Tamarindo': [-85.8397, 10.2993],
  'Manuel Antonio': [-84.1564, 9.3908],
  'Jaco': [-84.6275, 9.6127],
  'Jacó': [-84.6275, 9.6127],
  'Monteverde': [-84.8239, 10.3082],
  'Nosara': [-85.6531, 9.9791],
}

function getCoords(zona: string): [number, number] {
  const entries = Object.entries(COORDS)
  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0]
    const coords = entries[i][1] as [number, number]
    if (zona.toLowerCase().includes(key.toLowerCase())) return coords
  }
  return [-84.0875, 9.9281]
}

interface PropiedadMapa {
  id: string
  titulo: string
  precio: number
  operacion: string
  zona: string
  habitaciones: number
  metros: number
}

interface Props {
  propiedades: PropiedadMapa[]
  onSelect?: (id: string) => void
}

export default function MapaInteractivo({ propiedades, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css'
    document.head.appendChild(link)

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string

      const map = new mapboxgl.Map({
        container: mapRef.current as HTMLDivElement,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-84.0875, 9.9281],
        zoom: 7.5,
      })

      mapInstance.current = map

      map.on('load', () => {
        propiedades.forEach(p => {
          const coords = getCoords(p.zona)
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

          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML('<div style="font-family:DM Sans,sans-serif;padding:4px;min-width:150px"><div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:4px">' + p.zona + '</div><div style="font-weight:500;color:#1a1a1a;margin-bottom:4px">' + p.titulo + '</div><div style="font-size:12px;color:#6B7280">' + p.habitaciones + ' hab · ' + p.metros + 'm²</div></div>')

          new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(map)
        })
      })
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}