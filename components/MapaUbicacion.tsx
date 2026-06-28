'use client'
import { useEffect, useRef } from 'react'

const COORDS: Record<string, [number, number]> = {
  'Escazu': [-84.1366, 9.9194], 'Escazú': [-84.1366, 9.9194],
  'Santa Ana': [-84.1836, 9.9328], 'San Jose': [-84.0875, 9.9281], 'San José': [-84.0875, 9.9281],
  'Curridabat': [-84.0316, 9.9119], 'Heredia': [-84.1168, 9.9986], 'Alajuela': [-84.2141, 10.0162],
  'Cartago': [-83.9194, 9.8647], 'Liberia': [-85.4358, 10.6340], 'Tamarindo': [-85.8397, 10.2993],
  'Manuel Antonio': [-84.1564, 9.3908], 'Jaco': [-84.6275, 9.6127], 'Jacó': [-84.6275, 9.6127],
  'Monteverde': [-84.8239, 10.3082], 'Nosara': [-85.6531, 9.9791], 'Santa Teresa': [-85.1667, 9.6453],
  'Flamingo': [-85.7917, 10.4297], 'Quepos': [-84.1611, 9.4319], 'Puntarenas': [-84.8333, 9.9763],
  'Limón': [-83.0339, 9.9908], 'Guanacaste': [-85.4358, 10.6340],
}

function getCoords(zona: string): [number, number] {
  if (!zona) return [-84.0875, 9.9281]
  const entries = Object.entries(COORDS)
  for (let i = 0; i < entries.length; i++) {
    if (zona.toLowerCase().includes(entries[i][0].toLowerCase())) return entries[i][1] as [number, number]
  }
  return [-84.0875, 9.9281]
}

export default function MapaUbicacion({ zona, titulo }: { zona: string, titulo: string }) {
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
      const coords = getCoords(zona)

      const map = new mapboxgl.Map({
        container: mapRef.current as HTMLDivElement,
        style: 'mapbox://styles/mapbox/light-v11',
        center: coords,
        zoom: 13,
      })
      mapInstance.current = map

      map.on('load', () => {
        const el = document.createElement('div')
        el.style.cssText = 'width:18px;height:18px;border-radius:50%;background:oklch(0.42 0.06 150);border:3px solid white;box-shadow:0 0 0 6px oklch(0.42 0.06 150 / 0.25)'
        new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map)
      })

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    })

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [zona])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
