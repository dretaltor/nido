import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('app/precios', { recursive: true })
mkdirSync('app/api/stripe', { recursive: true })

const api = `import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan } = await req.json()

  const precios: Record<string, { amount: number, name: string }> = {
    basico: { amount: 4900, name: 'NIDO Pro Básico' },
    pro: { amount: 9900, name: 'NIDO Pro' },
    agencia: { amount: 29900, name: 'NIDO Agencia' }
  }

  const precio = precios[plan]
  if (!precio) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: precio.name },
        unit_amount: precio.amount,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    mode: 'subscription',
    success_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://www.nido-cr.com/dashboard?plan=' + plan : 'http://localhost:3000/dashboard?plan=' + plan,
    cancel_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://www.nido-cr.com/precios' : 'http://localhost:3000/precios',
  })

  return NextResponse.json({ url: session.url })
}`

const page = `'use client'
import { useState } from 'react'

const PLANES = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: 49,
    color: '#0ea5e9',
    desc: 'Para asesores independientes que quieren empezar',
    features: [
      'Hasta 10 propiedades activas',
      'CRM con gestión de leads',
      'NIDO Agent — asistente IA',
      'Formulario de contacto',
      'Soporte por email',
    ],
    popular: false
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: 99,
    color: '#15803d',
    desc: 'Para asesores que quieren crecer y destacar',
    features: [
      'Propiedades ilimitadas',
      'CRM completo con analytics',
      'NIDO Agent sin límites',
      'Academia completa',
      'Ranking de asesores destacado',
      'Integración Meta Ads',
      'Soporte prioritario',
    ],
    popular: true
  },
  {
    id: 'agencia',
    nombre: 'Agencia',
    precio: 299,
    color: '#7c3aed',
    desc: 'Para agencias con múltiples asesores',
    features: [
      'Todo lo de Pro',
      'Hasta 20 asesores',
      'Dashboard de agencia',
      'White label disponible',
      'API access',
      'Gerente de cuenta dedicado',
      'Onboarding personalizado',
    ],
    popular: false
  }
]

export default function Precios() {
  const [loadingPlan, setLoadingPlan] = useState('')

  const handlePago = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Error al procesar. Intenta de nuevo.')
    }
    setLoadingPlan('')
  }

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/login" style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #15803d', color: '#15803d', textDecoration: 'none', fontSize: '0.9rem' }}>Ingresar</a>
          <a href="/registro" style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Registrarse</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.5rem' }}>Planes y precios</h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>Sin contratos. Cancela cuando quieras.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {PLANES.map(plan => (
            <div key={plan.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: plan.popular ? '0 8px 32px rgba(21,128,61,0.15)' : '0 2px 8px rgba(0,0,0,0.08)', border: plan.popular ? '2px solid #15803d' : '2px solid transparent', position: 'relative' }}>
              {plan.popular && (
                <div style={{ backgroundColor: '#15803d', textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'white', letterSpacing: '0.05em' }}>
                  MÁS POPULAR
                </div>
              )}
              <div style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 0.3rem', color: plan.color, fontSize: '1.2rem', fontWeight: 'bold' }}>NIDO {plan.nombre}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>{plan.desc}</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#14532d' }}>${plan.precio}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>/mes</span>
                </div>
                <button onClick={() => handlePago(plan.id)} disabled={loadingPlan === plan.id} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: plan.color, color: 'white', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}>
                  {loadingPlan === plan.id ? 'Procesando...' : 'Comenzar ahora'}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '0.9rem' }}>✓</span>
                      <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem' }}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#374151', fontWeight: 'bold', margin: '0 0 0.5rem' }}>¿Tienes preguntas?</p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1rem' }}>Habla con nosotros antes de elegir tu plan</p>
          <a href="/contacto" style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', border: '1px solid #15803d', color: '#15803d', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Contactar ventas</a>
        </div>
      </div>
    </main>
  )
}`

writeFileSync('app/api/stripe/route.ts', api)
writeFileSync('app/precios/page.tsx', page)
console.log('Precios y pagos creados exitosamente')
