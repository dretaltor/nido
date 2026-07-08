'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Nav from '../../components/Nav'

const HERRAMIENTAS = [
  {
    href: '/calculadora',
    icon: '🏠',
    titulo: 'Cuota mensual y gastos de cierre',
    desc: 'Simulá la cuota de tu hipoteca y estimá traspaso, timbres y honorarios notariales antes de comprar.',
  },
  {
    href: '/calculadoras/capacidad-compra',
    icon: '💰',
    titulo: '¿Cuánto puedo pagar de propiedad?',
    desc: 'Descubrí tu presupuesto máximo según ingreso, deudas y prima disponible — y mirá propiedades reales que califican.',
  },
  {
    href: '/calculadoras/roi-alquiler',
    icon: '📈',
    titulo: 'ROI de alquiler',
    desc: 'Calculá el rendimiento bruto y neto anual de una propiedad en alquiler antes de invertir.',
  },
  {
    href: '/calculadoras/impuesto-inmuebles',
    icon: '🧾',
    titulo: 'Impuesto de bienes inmuebles',
    desc: 'Estimá el impuesto municipal anual y trimestral según el valor registrado de tu propiedad.',
  },
]

export default function CalculadorasHubClient() {
  return (
    <Suspense fallback={null}>
      <CalculadorasHubInner />
    </Suspense>
  )
}

function CalculadorasHubInner() {
  const params = useSearchParams()
  const ref = params.get('ref')
  const conRef = (href: string) => ref ? `${href}?ref=${encodeURIComponent(ref)}` : href

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');
        .hub-card { background: white; border: 1px solid rgba(27,94,59,0.1); border-radius: 20px; padding: 32px; text-decoration: none; display: block; transition: border-color 0.2s, transform 0.2s; }
        .hub-card:hover { border-color: #1B5E3B; transform: translateY(-2px); }
      `}</style>

      <Nav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>Herramientas gratuitas</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, color: '#0D1F15', margin: '0 0 10px' }}>
            Calculadoras inmobiliarias
          </h1>
          <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 620, margin: '0 auto' }}>
            Planificá tu compra o inversión en Costa Rica con datos reales — cada resultado se conecta con propiedades disponibles en NIDO.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {HERRAMIENTAS.map(h => (
            <Link key={h.href} href={conRef(h.href)} className="hub-card">
              <div style={{ fontSize: 28, marginBottom: 14 }}>{h.icon}</div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: '#0D1F15', margin: '0 0 8px' }}>{h.titulo}</h2>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{h.desc}</p>
              <span style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: '#1B5E3B', fontWeight: 500 }}>Usar calculadora →</span>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
            ¿Preferís hablar con alguien? Un asesor NIDO puede analizar tu situación y ayudarte a encontrar la propiedad ideal.
          </p>
          <Link href="/contacto" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, border: '1px solid #1B5E3B', color: '#1B5E3B', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Hablar con un asesor
          </Link>
        </div>
      </div>
    </main>
  )
}
