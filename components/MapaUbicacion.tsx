'use client'
import { useEffect, useRef, useState } from 'react'

const COORDS_FALLBACK: [number, number] = [-84.0875, 9.9281] // San José centro

export default function MapaUbicacion({ distrito, canton, provincia, titulo }: { distrito?: string, canton?: string, provincia?: string, titulo: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [loadingMapa, setLoadingMapa] = useState(true)

  useEffect(() => {
    const query = [distrito, canton, provincia, 'Costa Rica'].filter(Boolean).join(', ')
    if (!query) { setLoadingMapa(false); return }

    let cancelled = false

    const init = async () => {
      let coords: [number, number] = COORDS_FALLBACK
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=cr&limit=1`
        const res = await fetch(url)
        const json = await res.json()
        if (json.features && json.features[0]) {
          coords = json.features[0].center as [number, number]
        }
      } catch {}

      if (cancelled) return

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css'
      document.head.appendChild(link)

      const { default: mapboxgl } = await import('mapbox-gl')
      if (cancelled) return
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string

      if (!mapInstance.current) {
        const map = new mapboxgl.Map({
          container: mapRef.current as HTMLDivElement,
          style: 'mapbox://styles/mapbox/light-v11',
          center: coords,
          zoom: 14,
        })
        mapInstance.current = map
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

        map.on('load', () => {
          const el = document.createElement('div')
          el.style.cssText = 'width:18px;height:18px;border-radius:50%;background:oklch(0.42 0.06 150);border:3px solid white;box-shadow:0 0 0 6px oklch(0.42 0.06 150 / 0.25)'
          markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map)
          setLoadingMapa(false)
        })
      } else {
        mapInstance.current.flyTo({ center: coords, zoom: 14 })
        if (markerRef.current) markerRef.current.setLngLat(coords)
        setLoadingMapa(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [distrito, canton, provincia])

  useEffect(() => {
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [])

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {loadingMapa && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'oklch(0.95 0.005 80)', fontSize:13, color:'oklch(0.55 0.005 80)' }}>
          Cargando mapa...
        </div>
      )}
    </div>
  )
}
