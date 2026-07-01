import type { Metadata, Viewport } from 'next'
import { StructuredDataOrg, StructuredDataWebsite } from '@/components/seo/StructuredData'
import { AuthProvider } from '@/lib/context/AuthContext'
import ChatWidgetComprador from '@/components/soporte/ChatWidgetComprador'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1F15',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nido-cr.com'),
  title: {
    default: 'NIDO · Propiedades en Costa Rica con IA',
    template: '%s · NIDO Costa Rica',
  },
  description: 'Comprá, alquilá o vendé propiedades en Costa Rica con Valeria IA. Portal inmobiliario premium con mapa, CRM y asesoría inteligente 24/7. Escazú, Santa Ana, Tamarindo, Nosara y más.',
  keywords: ['propiedades Costa Rica', 'casas en venta Costa Rica', 'alquiler apartamentos San José', 'inmobiliaria Costa Rica', 'real estate Costa Rica', 'properties for sale Costa Rica', 'Escazú real estate', 'Santa Teresa property', 'Tamarindo real estate', 'digital nomad Costa Rica', 'rentista visa Costa Rica'],
  authors: [{ name: 'NIDO', url: 'https://www.nido-cr.com' }],
  creator: 'NIDO',
  publisher: 'NIDO',
  category: 'Real Estate',
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    alternateLocale: 'en_US',
    url: 'https://www.nido-cr.com',
    siteName: 'NIDO · Inmobiliaria Costa Rica',
    title: 'NIDO · Propiedades en Costa Rica con IA',
    description: 'El portal inmobiliario más inteligente de Costa Rica. Comprá, alquilá o vendé con Valeria IA.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'NIDO · Propiedades en Costa Rica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIDO · Propiedades en Costa Rica con IA',
    description: 'El portal inmobiliario más inteligente de Costa Rica.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://www.nido-cr.com',
    languages: { 'es-CR': 'https://www.nido-cr.com', 'en': 'https://www.nido-cr.com/en' },
  },
  verification: {
    google: 'nido-google-verification',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body style={{ margin: 0, padding: 0 }}>
        <StructuredDataOrg/>
        <StructuredDataWebsite/>
        <AuthProvider>{children}</AuthProvider>
        <ChatWidgetComprador/>
      </body>
    </html>
  )
}
