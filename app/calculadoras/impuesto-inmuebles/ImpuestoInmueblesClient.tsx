'use client'
import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import Nav from '../../../components/Nav'
import { LeadCaptureCalculadora } from '../../../components/calculadoras/LeadCaptureCalculadora'
import { useAsesorRef } from '../../../lib/useAsesorRef'

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CR')
}

export default function ImpuestoInmueblesClient() {
  return (
    <Suspense fallback={null}>
      <ImpuestoInmueblesInner />
    </Suspense>
  )
}

function ImpuestoInmueblesInner() {
  const { asesorEmail, asesorNombre } = useAsesorRef()
  const [valor, setValor] = useState(150000)
  const [tasa, setTasa] = useState(0.25)

  const { impuestoAnual, impuestoTrimestral } = useMemo(() => {
    const anual = valor * (tasa / 100)
    return { impuestoAnual: anual, impuestoTrimestral: anual / 4 }
  }, [valor, tasa])

  const mensaje = `Calculadora de impuesto de bienes inmuebles: valor registrado ${fmt(valor)} a una tasa de ${tasa}% → impuesto anual estimado ${fmt(impuestoAnual)}.`

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');
        .calc-card { background: white; border: 1px solid rgba(27,94,59,0.1); border-radius: 20px; padding: 32px; }
        .calc-input-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .calc-input-row label { font-size: 13px; color: #6B7280; letter-spacing: 0.02em; }
        .calc-input-row input { border: 1px solid rgba(27,94,59,0.15); border-radius: 10px; padding: 10px 14px; font-size: 15px; font-family: inherit; color: #0D1F15; background: #FAFAF8; }
        .calc-input-row input:focus { outline: none; border-color: #1B5E3B; }
        .calc-line { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(27,94,59,0.06); font-size: 14px; color: #374151; }
        .calc-line.total { font-weight: 600; color: #0D1F15; font-size: 16px; border-bottom: none; padding-top: 16px; }
      `}</style>

      <Nav />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/calculadoras" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Todas las calculadoras</Link>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, color: '#0D1F15', margin: '0 0 10px' }}>
            Impuesto de bienes inmuebles
          </h1>
          <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
            Estimá el impuesto municipal anual y trimestral según el valor registrado de tu propiedad en Costa Rica.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 20px' }}>
              Datos de la propiedad
            </h2>
            <div className="calc-input-row">
              <label>Valor registrado ante la municipalidad (USD)</label>
              <input type="number" value={valor} onChange={e => setValor(Number(e.target.value) || 0)} />
            </div>
            <div className="calc-input-row">
              <label>Tasa del impuesto (%)</label>
              <input type="number" step="0.01" value={tasa} onChange={e => setTasa(Number(e.target.value) || 0)} />
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
              La Ley de Impuesto sobre Bienes Inmuebles fija una tasa nacional del 0.25% anual sobre el valor registrado. Confirmá el porcentaje exacto con tu municipalidad.
            </p>
          </div>

          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 20px' }}>
              Impuesto estimado
            </h2>
            <div className="calc-line total"><span>Impuesto anual</span><span>{fmt(impuestoAnual)}</span></div>
            <div className="calc-line"><span>Impuesto trimestral</span><span>{fmt(impuestoTrimestral)}</span></div>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
              Estimado educativo. El valor registrado se actualiza mediante declaración ante la municipalidad al menos cada 5 años y puede diferir del precio de mercado. Confirmá el monto exacto con tu municipalidad.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 28, maxWidth: 480, margin: '28px auto 0' }}>
          <LeadCaptureCalculadora
            fuente="calculadora_impuesto"
            mensaje={mensaje}
            titulo="¿Necesitás ayuda con trámites de tu propiedad?"
            textoBoton="Hablar con un asesor →"
            asesorEmail={asesorEmail}
            asesorNombre={asesorNombre}
          />
        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>Otras calculadoras</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/calculadora" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Cuota y gastos de cierre</Link>
            <Link href="/calculadoras/capacidad-compra" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Capacidad de compra</Link>
            <Link href="/calculadoras/roi-alquiler" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>ROI de alquiler</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
