import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Propiedades en Venta y Alquiler · Costa Rica',
  description: 'Buscá casas, apartamentos, villas y lotes en venta y alquiler en Costa Rica. Escazú, Santa Ana, Tamarindo, Nosara, Santa Teresa y más zonas premium. Asesoría IA incluida.',
  keywords: ['casas en venta Costa Rica', 'apartamentos alquiler San José', 'propiedades Escazú', 'casas Tamarindo', 'real estate Costa Rica', 'properties for sale Costa Rica'],
  openGraph: {
    title: 'Propiedades en Venta y Alquiler · Costa Rica · NIDO',
    description: 'Portal inmobiliario con mapa interactivo, filtros y Valeria IA para encontrar tu propiedad ideal.',
    url: 'https://www.nido-cr.com/propiedades',
    // Sin "images" explicito: Next.js usa automaticamente opengraph-image.tsx de este
    // mismo segmento de ruta (antes apuntaba a /og-propiedades.png, que no existe).
  },
  alternates: { canonical: 'https://www.nido-cr.com/propiedades' },
}
