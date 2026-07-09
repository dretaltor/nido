'use client'
import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import Nav from '../../../components/Nav'
import { LeadCaptureCalculadora } from '../../../components/calculadoras/LeadCaptureCalculadora'
import { PropiedadesQueCalifican } from '../../../components/calculadoras/PropiedadesQueCalifican'
import { useAsesorRef } from '../../../lib/useAsesorRef'

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CR')
}

function calificacionRoi(pct: number): { label: string; color: string } {
  if (pct < 4) return { label: 'Bajo', color: '#B45309' }
  if (pct < 8) return { label: 'Bueno', color: '#1B5E3B' }
  return { label: 'Excelente', color: '#0D7A45' }
}

export default function RoiAlquilerClient() {
  return (
    <Suspense fallback={null}>
      <RoiAlquilerInner />
    </Suspense>
  )
}

function RoiAlquilerInner() {
  const { asesorEmail, asesorNombre } = useAsesorRef()
  const [precioCompra, setPrecioCompra] = useState(200000)
  const [alquilerMensual, setAlquilerMensual] = useState(1200)
  const [gastosAnuales, setGastosAnuales] = useState(3000)

  const { ingresoNetoAnual, rendimientoBruto, rendimientoNeto, ingresoNetoMensual } = useMemo(() => {
    const bruto = alquilerMensual * 12
    const neto = bruto - gastosAnuales
    return {
      ingresoAnualBruto: bruto,
      ingresoNetoAnual: neto,
      rendimientoBruto: precioCompra > 0 ? (bruto / precioCompra) * 100 : 0,
      rendimientoNeto: precioCompra > 0 ? (neto / precioCompra) * 100 : 0,
      ingresoNetoMensual: neto / 12,
    }
  }, [precioCompra, alquilerMensual, gastosAnuales])

  const calif = calificacionRoi(rendimientoNeto)
  const barPct = Math.min(100, Math.max(0, (rendimientoNeto / 12) * 100))

  const mensaje = `Calculadora ROI de alquiler: precio de compra ${fmt(precioCompra)}, alquiler mensual ${fmt(alquilerMensual)}, gastos anuales ${fmt(gastosAnuales)} → rendimiento neto ${rendimientoNeto.toFixed(1)}%.`

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
        @media(max-width:768px){
          .calc-page-pad{padding:32px 16px 80px!important}
          .calc-grid-2{grid-template-columns:1fr!important;gap:16px!important}
          .calc-hero-title{font-size:30px!important}
          .calc-card{padding:24px 20px!important}
        }
      `}</style>

      <Nav />

      <div className="calc-page-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/calculadoras" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Todas las calculadoras</Link>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="calc-hero-title" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, color: '#0D1F15', margin: '0 0 10px' }}>
            Calculadora de ROI de alquiler
          </h1>
          <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
            Analizá el retorno de inversión de una propiedad en alquiler antes de comprar.
          </p>
        </div>

        <div className="calc-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 20px' }}>
              Datos de la propiedad
            </h2>
            <div className="calc-input-row">
              <label>Precio de compra (USD)</label>
              <input type="number" value={precioCompra} onChange={e => setPrecioCompra(Number(e.target.value) || 0)} />
            </div>
            <div className="calc-input-row">
              <label>Alquiler mensual esperado (USD)</label>
              <input type="number" value={alquilerMensual} onChange={e => setAlquilerMensual(Number(e.target.value) || 0)} />
            </div>
            <div className="calc-input-row">
              <label>Gastos anuales estimados (USD)</label>
              <input type="number" value={gastosAnuales} onChange={e => setGastosAnuales(Number(e.target.value) || 0)} />
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
              Mantenimiento, cuota de condominio, seguros, impuesto de bienes inmuebles y reparaciones estimadas.
            </p>
          </div>

          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 4px' }}>
              Rendimiento neto anual
            </h2>
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, color: calif.color, margin: '4px 0 2px' }}>
              {rendimientoNeto.toFixed(2)}%
            </div>
            <div style={{ fontSize: 13, color: calif.color, fontWeight: 500, marginBottom: 14 }}>{calif.label} · después de gastos</div>

            <div style={{ height: 8, borderRadius: 999, background: 'linear-gradient(to right, #DC2626 0%, #DC2626 33%, #B45309 33%, #B45309 66%, #0D7A45 66%, #0D7A45 100%)', position: 'relative', marginBottom: 20 }}>
              <div style={{ position: 'absolute', top: -3, left: `calc(${barPct}% - 6px)`, width: 14, height: 14, borderRadius: '50%', background: 'white', border: '3px solid #0D1F15' }} />
            </div>

            <div className="calc-line"><span>Rendimiento bruto</span><span>{rendimientoBruto.toFixed(2)}%</span></div>
            <div className="calc-line"><span>Ingreso neto anual</span><span>{fmt(ingresoNetoAnual)}</span></div>
            <div className="calc-line"><span>Ingreso neto mensual</span><span>{fmt(ingresoNetoMensual)}</span></div>
            <div className="calc-line total"><span>Renta mensual</span><span>{fmt(alquilerMensual)}</span></div>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
              En Costa Rica, un rendimiento neto del 5-8% se considera bueno para propiedades residenciales. Las propiedades vacacionales pueden rendir más, con más variabilidad.
            </p>
          </div>
        </div>

        <PropiedadesQueCalifican
          precioMax={Math.round(precioCompra * 1.15)}
          precioMin={Math.round(precioCompra * 0.7)}
          titulo="Propiedades similares para invertir"
        />

        <div style={{ marginTop: 28, maxWidth: 480 }}>
          <LeadCaptureCalculadora
            fuente="calculadora_roi"
            tipoBusqueda="inversion"
            presupuesto={String(Math.round(precioCompra))}
            mensaje={mensaje}
            titulo="Guardá este análisis"
            textoBoton="Enviar mi resultado →"
            asesorEmail={asesorEmail}
            asesorNombre={asesorNombre}
          />
        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>Otras calculadoras</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/calculadora" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Cuota y gastos de cierre</Link>
            <Link href="/calculadoras/capacidad-compra" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Capacidad de compra</Link>
            <Link href="/calculadoras/impuesto-inmuebles" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Impuesto de bienes inmuebles</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
