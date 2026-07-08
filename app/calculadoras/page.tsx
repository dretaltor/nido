import type { Metadata } from 'next'
import CalculadorasHubClient from './CalculadorasHubClient'

export const metadata: Metadata = {
  title: 'Calculadoras inmobiliarias Costa Rica · NIDO',
  description: 'Herramientas financieras gratuitas para planificar tu compra o inversión inmobiliaria en Costa Rica: cuota mensual, capacidad de compra, ROI de alquiler e impuesto de bienes inmuebles.',
  keywords: ['calculadora hipotecaria Costa Rica', 'calculadora inmobiliaria', 'capacidad de compra vivienda', 'ROI alquiler Costa Rica', 'impuesto bienes inmuebles Costa Rica'],
  openGraph: {
    title: 'Calculadoras inmobiliarias Costa Rica · NIDO',
    description: 'Cuota mensual, gastos de cierre, capacidad de compra, ROI de alquiler e impuesto de bienes inmuebles — con propiedades reales que califican según tu resultado.',
    url: 'https://www.nido-cr.com/calculadoras',
  },
  alternates: { canonical: 'https://www.nido-cr.com/calculadoras' },
}

export default function CalculadorasHubPage() {
  return <CalculadorasHubClient />
}
