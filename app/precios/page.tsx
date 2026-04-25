'use client'
import { useState } from 'react'

const PLANES = [
  { id: 'basico', nombre: 'Basico', precio: 49, color: '#0ea5e9', popular: false, features: ['Hasta 10 propiedades', 'CRM de leads', 'NIDO Agent', 'Soporte email'] },
  { id: 'pro', nombre: 'Pro', precio: 99, color: '#15803d', popular: true, features: ['Propiedades ilimitadas', 'CRM completo', 'NIDO Agent sin limites', 'Academia completa', 'Ranking destacado', 'Soporte prioritario'] },
  { id: 'agencia', nombre: 'Agencia', precio: 299, color: '#7c3aed', popular: false, features: ['Todo lo de Pro', 'Hasta 20 asesores', 'Dashboard agencia', 'API access', 'Gerente dedicado'] }
]

export default function Precios() {
  const [loadingPlan, setLoadingPlan] = useState('')

  const handlePago = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planId }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { alert('Error al procesar') }
    setLoadingPlan('')
  }

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <a href="/registro" style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Registrarse</a>
      </nav>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.5rem' }}>Planes y precios</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Sin contratos. Cancela cuando quieras.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {PLANES.map(plan => (
            <div key={plan.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: plan.popular ? '0 8px 32px rgba(21,128,61,0.15)' : '0 2px 8px rgba(0,0,0,0.08)', border: plan.popular ? '2px solid #15803d' : '2px solid transparent' }}>
              {plan.popular && <div style={{ backgroundColor: '#15803d', textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>MAS POPULAR</div>}
              <div style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: plan.color, fontSize: '1.2rem', fontWeight: 'bold' }}>NIDO {plan.nombre}</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#14532d' }}>${plan.precio}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>/mes</span>
                </div>
                <button onClick={() => handlePago(plan.id)} disabled={loadingPlan === plan.id} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: plan.color, color: 'white', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}>
                  {loadingPlan === plan.id ? 'Procesando...' : 'Comenzar ahora'}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <span style={{ color: '#15803d', fontWeight: 'bold' }}>✓</span>
                      <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem' }}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}