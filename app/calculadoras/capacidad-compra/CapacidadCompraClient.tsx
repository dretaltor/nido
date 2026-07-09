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

export default function CapacidadCompraClient() {
  return (
    <Suspense fallback={null}>
      <CapacidadCompraInner />
    </Suspense>
  )
}

function CapacidadCompraInner() {
  const { asesorEmail, asesorNombre } = useAsesorRef()
  const [ingreso, setIngreso] = useState(3000)
  const [deudas, setDeudas] = useState(300)
  const [prima, setPrima] = useState(30000)
  const [pctIngreso, setPctIngreso] = useState(30)
  const [tasaAnual, setTasaAnual] = useState(9.5)
  const [plazoAnios, setPlazoAnios] = useState(30)

  const { cuotaMaxima, montoFinanciable, precioMaximo, pctReal, califica } = useMemo(() => {
    const cuota = Math.max(0, ingreso * (pctIngreso / 100) - deudas)
    const tasaMensual = tasaAnual / 100 / 12
    const n = plazoAnios * 12
    const monto = tasaMensual === 0
      ? cuota * n
      : cuota * (1 - Math.pow(1 + tasaMensual, -n)) / tasaMensual
    const precio = monto + prima
    return {
      cuotaMaxima: cuota,
      montoFinanciable: monto,
      precioMaximo: precio,
      pctReal: ingreso > 0 ? (cuota / ingreso) * 100 : 0,
      califica: cuota > 0,
    }
  }, [ingreso, deudas, prima, pctIngreso, tasaAnual, plazoAnios])

  const mensaje = `Calculadora de capacidad de compra: ingreso $${ingreso}, deudas $${deudas}, prima $${prima}, ${pctIngreso}% de ingreso, ${tasaAnual}% a ${plazoAnios} años → precio máximo estimado ${fmt(precioMaximo)}.`

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
            ¿Cuánto puedo pagar de propiedad?
          </h1>
          <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
            Estimá tu presupuesto máximo según tu ingreso, deudas y prima disponible — y mirá propiedades reales dentro de tu rango.
          </p>
        </div>

        <div className="calc-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 20px' }}>
              Tus datos financieros
            </h2>
            <div className="calc-input-row">
              <label>Ingreso mensual neto (USD)</label>
              <input type="number" value={ingreso} onChange={e => setIngreso(Number(e.target.value) || 0)} />
            </div>
            <div className="calc-input-row">
              <label>Deudas mensuales actuales (USD)</label>
              <input type="number" value={deudas} onChange={e => setDeudas(Number(e.target.value) || 0)} />
            </div>
            <div className="calc-input-row">
              <label>Prima disponible / ahorro (USD)</label>
              <input type="number" value={prima} onChange={e => setPrima(Number(e.target.value) || 0)} />
            </div>
            <div className="calc-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="calc-input-row">
                <label>Tasa de interés anual (%)</label>
                <input type="number" step="0.1" value={tasaAnual} onChange={e => setTasaAnual(Number(e.target.value) || 0)} />
              </div>
              <div className="calc-input-row">
                <label>Plazo (años)</label>
                <input type="number" value={plazoAnios} onChange={e => setPlazoAnios(Number(e.target.value) || 0)} />
              </div>
            </div>
            <div className="calc-input-row">
              <label>% de tu ingreso destinado a la cuota</label>
              <input type="number" value={pctIngreso} onChange={e => setPctIngreso(Number(e.target.value) || 0)} />
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
              Los bancos en Costa Rica suelen aprobar créditos donde la cuota no supere el 30% del ingreso mensual. Ajustá este porcentaje según tu perfil.
            </p>
          </div>

          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 20px' }}>
              Tu presupuesto estimado
            </h2>
            {califica ? (
              <>
                <div className="calc-line total"><span>Precio máximo de propiedad</span><span>{fmt(precioMaximo)}</span></div>
                <div className="calc-line"><span>Préstamo máximo</span><span>{fmt(montoFinanciable)}</span></div>
                <div className="calc-line"><span>Prima (tu aporte)</span><span>{fmt(prima)}</span></div>
                <div className="calc-line"><span>Cuota mensual máxima</span><span>{fmt(cuotaMaxima)}</span></div>
                <div className="calc-line"><span>% de ingreso usado</span><span>{pctReal.toFixed(1)}%</span></div>
              </>
            ) : (
              <p style={{ fontSize: 14, color: '#6B7280' }}>Con estas deudas actuales no queda espacio para una cuota — probá reduciendo las deudas o aumentando el % de ingreso destinado.</p>
            )}
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
              Cálculo educativo asumiendo amortización estándar. La aprobación real depende de tu historial crediticio y la política de cada banco.
            </p>
          </div>
        </div>

        {califica && <PropiedadesQueCalifican precioMax={precioMaximo} />}

        {califica && (
          <div style={{ marginTop: 28, maxWidth: 480 }}>
            <LeadCaptureCalculadora
              fuente="calculadora_capacidad"
              tipoBusqueda="compra"
              presupuesto={String(Math.round(precioMaximo))}
              mensaje={mensaje}
              titulo="Guardá tu presupuesto"
              textoBoton="Enviar mi resultado →"
              asesorEmail={asesorEmail}
              asesorNombre={asesorNombre}
              alertaPrecioMax={Math.round(precioMaximo)}
            />
          </div>
        )}

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>Otras calculadoras</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/calculadora" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Cuota y gastos de cierre</Link>
            <Link href="/calculadoras/roi-alquiler" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>ROI de alquiler</Link>
            <Link href="/calculadoras/impuesto-inmuebles" style={{ fontSize: 13, color: '#1B5E3B', textDecoration: 'none' }}>Impuesto de bienes inmuebles</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
