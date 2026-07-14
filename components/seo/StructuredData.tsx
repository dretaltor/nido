import type { Propiedad } from '../../lib/database.types'

export function StructuredDataOrg() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'NIDO',
    description: 'Plataforma inmobiliaria premium de Costa Rica con inteligencia artificial',
    url: 'https://www.nido-cr.com',
    logo: 'https://www.nido-cr.com/logo.png',
    address: { '@type': 'PostalAddress', addressCountry: 'CR', addressRegion: 'San José' },
    areaServed: { '@type': 'Country', name: 'Costa Rica' },
    priceRange: '$49-$129',
    sameAs: ['https://www.instagram.com/nido.cr', 'https://www.linkedin.com/company/nido-cr'],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}/>
}

export function StructuredDataWebsite() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NIDO',
    url: 'https://www.nido-cr.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://www.nido-cr.com/propiedades?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}/>
}

export function StructuredDataProperty({ propiedad }: { propiedad: Partial<Propiedad> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': propiedad.tipo === 'alquiler' ? 'ApartmentComplex' : 'SingleFamilyResidence',
    name: propiedad.titulo,
    description: propiedad.descripcion,
    address: { '@type': 'PostalAddress', addressLocality: propiedad.zona, addressCountry: 'CR' },
    offers: {
      '@type': 'Offer',
      price: propiedad.moneda === 'CRC' && propiedad.precio_moneda_original ? propiedad.precio_moneda_original : propiedad.precio,
      priceCurrency: propiedad.moneda === 'CRC' && propiedad.precio_moneda_original ? 'CRC' : 'USD',
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: propiedad.habitaciones,
    floorSize: { '@type': 'QuantitativeValue', value: propiedad.metros, unitCode: 'MTK' },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}/>
}
