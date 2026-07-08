import type { Metadata } from 'next'
import CapacidadCompraClient from './CapacidadCompraClient'

export const metadata: Metadata = {
  title: '¿Cuánto puedo pagar de casa? Calculadora de capacidad de compra · NIDO',
  description: 'Calculá cuánto podés pagar por una propiedad en Costa Rica según tu ingreso, deudas y prima disponible. Mirá propiedades reales que califican según tu presupuesto.',
  keywords: ['cuánto puedo pagar de casa', 'capacidad de compra vivienda Costa Rica', 'calculadora hipotecaria Costa Rica', 'capacidad de endeudamiento'],
  openGraph: {
    title: '¿Cuánto puedo pagar de casa? · NIDO',
    description: 'Calculá tu presupuesto máximo de compra en Costa Rica y mirá propiedades reales que califican.',
    url: 'https://www.nido-cr.com/calculadoras/capacidad-compra',
  },
  alternates: { canonical: 'https://www.nido-cr.com/calculadoras/capacidad-compra' },
}

export default function CapacidadCompraPage() {
  return <CapacidadCompraClient />
}
