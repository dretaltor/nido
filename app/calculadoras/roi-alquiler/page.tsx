import type { Metadata } from 'next'
import RoiAlquilerClient from './RoiAlquilerClient'

export const metadata: Metadata = {
  title: 'Calculadora de ROI de alquiler Costa Rica · NIDO',
  description: 'Calculá el rendimiento bruto y neto anual de una propiedad en alquiler en Costa Rica antes de invertir. Compará contra benchmarks del mercado y mirá propiedades similares.',
  keywords: ['ROI alquiler Costa Rica', 'rentabilidad inversión inmobiliaria', 'calculadora rendimiento alquiler', 'inversión bienes raíces Costa Rica'],
  openGraph: {
    title: 'Calculadora de ROI de alquiler · NIDO',
    description: 'Rendimiento bruto y neto anual de una propiedad en alquiler en Costa Rica, con propiedades reales similares para invertir.',
    url: 'https://www.nido-cr.com/calculadoras/roi-alquiler',
  },
  alternates: { canonical: 'https://www.nido-cr.com/calculadoras/roi-alquiler' },
}

export default function RoiAlquilerPage() {
  return <RoiAlquilerClient />
}
