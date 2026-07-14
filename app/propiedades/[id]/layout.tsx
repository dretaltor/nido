import { Metadata } from 'next'
import { supabase } from '../../../lib/supabase'
import { precioPrincipal } from '../../../lib/precioPropiedad'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data: p } = await supabase
    .from('propiedades')
    .select('titulo, descripcion, precio, moneda, precio_moneda_original, zona, tipo, operacion, ref_id, fotos')
    .eq('id', id)
    .maybeSingle()

  if (!p) return {
    title: 'Propiedad no encontrada · NIDO',
    description: 'Esta propiedad no está disponible en NIDO.',
  }

  const titulo = p.ref_id ? `${p.titulo} · ${p.ref_id} · NIDO` : `${p.titulo} · NIDO`
  const precio = p.precio ? precioPrincipal(p) : ''
  const desc = p.descripcion
    ? p.descripcion.slice(0, 155)
    : `${p.tipo || 'Propiedad'} en ${p.operacion || 'venta'} en ${p.zona || 'Costa Rica'}. ${precio}. Encontrala en NIDO.`

  // Sin "images" explicito: Next.js usa automaticamente opengraph-image.tsx (imagen
  // dinamica de marca con foto+precio+zona) de este mismo segmento de ruta.
  return {
    title: titulo,
    description: desc,
    openGraph: {
      title: titulo,
      description: desc,
      type: 'website',
      locale: 'es_CR',
      siteName: 'NIDO · Plataforma Inmobiliaria Costa Rica',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: desc,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
