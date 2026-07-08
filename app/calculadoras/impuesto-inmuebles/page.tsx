import type { Metadata } from 'next'
import ImpuestoInmueblesClient from './ImpuestoInmueblesClient'

export const metadata: Metadata = {
  title: 'Calculadora de impuesto de bienes inmuebles Costa Rica · NIDO',
  description: 'Calculá el impuesto municipal anual y trimestral sobre tu propiedad en Costa Rica según el valor registrado y la tasa del 0.25%.',
  keywords: ['impuesto de bienes inmuebles Costa Rica', 'impuesto municipal propiedad', 'impuesto bienes inmuebles calculadora', 'valor registrado propiedad Costa Rica'],
  openGraph: {
    title: 'Calculadora de impuesto de bienes inmuebles · NIDO',
    description: 'Estimá el impuesto municipal anual y trimestral sobre tu propiedad en Costa Rica.',
    url: 'https://www.nido-cr.com/calculadoras/impuesto-inmuebles',
  },
  alternates: { canonical: 'https://www.nido-cr.com/calculadoras/impuesto-inmuebles' },
}

export default function ImpuestoInmueblesPage() {
  return <ImpuestoInmueblesClient />
}
