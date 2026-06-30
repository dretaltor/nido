import { Metadata } from 'next'
import { supabase } from '../../../lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data: p } = await supabase
    .from('propiedades')
    .select('titulo, descripcion, precio, zona, tipo, operacion, ref_id, fotos')
    .eq('id', id)
    .maybeSingle()

  if (!p) return {
    title: 'Propiedad no encontrada · NIDO',
    description: 'Esta propiedad no está disponible en NIDO.',
  }

  const titulo = p.ref_id ? `${p.titulo} · ${p.ref_id} · NIDO` : `${p.titulo} · NIDO`
  const precio = p.precio ? `$${Number(p.precio).toLocaleString()} USD` : ''
  const desc = p.descripcion
    ? p.descripcion.slice(0, 155)
    : `${p.tipo || 'Propiedad'} en ${p.operacion || 'venta'} en ${p.zona || 'Costa Rica'}. ${precio}. Encontrala en NIDO.`
  const imagen = p.fotos?.[0] || 'https://www.nido-cr.com/og-default.jpg'

  return {
    title: titulo,
    description: desc,
    openGraph: {
      title: titulo,
      description: desc,
      images: [{ url: imagen, width: 1200, height: 630, alt: p.titulo }],
      type: 'website',
      locale: 'es_CR',
      siteName: 'NIDO · Plataforma Inmobiliaria Costa Rica',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: desc,
      images: [imagen],
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
