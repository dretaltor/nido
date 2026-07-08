'use client'
import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import Nav from '../../components/Nav'
import { LeadCaptureCalculadora } from '../../components/calculadoras/LeadCaptureCalculadora'
import { useAsesorRef } from '../../lib/useAsesorRef'

function fmt(n: number, currency: 'USD' | 'CRC') {
  const symbol = currency === 'USD' ? '$' : '₡'
  return symbol + Math.round(n).toLocaleString('es-CR')
}

function calcularCuota(precio: number, primaPct: number, tasaAnual: number, plazoAnios: number) {
  const monto = precio * (1 - primaPct / 100)
  const tasaMensual = tasaAnual / 100 / 12
  const n = plazoAnios * 12
  const cuota = tasaMensual === 0
    ? monto / n
    : (monto * tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1)
  const total = cuota * n
  return { montoFinanciado: monto, cuotaMensual: cuota, totalPagado: total, totalIntereses: total - monto }
}

export default function CalculadoraPage() {
  return (
    <Suspense fallback={null}>
      <CalculadoraInner />
    </Suspense>
  )
}

function CalculadoraInner() {
  const { asesorEmail, asesorNombre } = useAsesorRef()
  const [currency, setCurrency] = useState<'USD' | 'CRC'>('USD')

  // ── Costos de cierre ──────────────────────────────────────────────
  const [precio, setPrecio] = useState(150000)
  const traspaso = precio * 0.015
  const timbresRegistro = precio * 0.008
  const honorariosNotariales = precio * 0.0125
  const ivaHonorarios = honorariosNotariales * 0.13
  const totalCierre = traspaso + timbresRegistro + honorariosNotariales + ivaHonorarios
  const pctCierre = precio > 0 ? (totalCierre / precio) * 100 : 0

  // ── Simulador de hipoteca ─────────────────────────────────────────
  const [precioHipoteca, setPrecioHipoteca] = useState(150000)
  const [primaPct, setPrimaPct] = useState(20)
  const [tasaAnual, setTasaAnual] = useState(9.5)
  const [plazoAnios, setPlazoAnios] = useState(20)
  const [comparar, setComparar] = useState(false)

  const { montoFinanciado, cuotaMensual, totalPagado, totalIntereses } = useMemo(
    () => calcularCuota(precioHipoteca, primaPct, tasaAnual, plazoAnios),
    [precioHipoteca, primaPct, tasaAnual, plazoAnios]
  )

  const escenarios = useMemo(() => [
    { label: 'Entrada baja', detalle: '10% prima · 30 años', activo: false, ...calcularCuota(precioHipoteca, 10, tasaAnual, 30) },
    { label: 'Tu escenario', detalle: `${primaPct}% prima · ${plazoAnios} años`, activo: true, ...calcularCuota(precioHipoteca, primaPct, tasaAnual, plazoAnios) },
    { label: 'Entrada alta', detalle: '30% prima · 15 años', activo: false, ...calcularCuota(precioHipoteca, 30, tasaAnual, 15) },
  ], [precioHipoteca, primaPct, tasaAnual, plazoAnios])

  const mensajeHipoteca = `Calculadora de cuota mensual: precio ${fmt(precioHipoteca, currency)}, ${primaPct}% de prima, ${tasaAnual}% a ${plazoAnios} años → cuota estimada ${fmt(cuotaMensual, currency)}/mes. Gastos de cierre estimados: ${fmt(totalCierre, currency)}.`

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
        .currency-toggle { display: inline-flex; border: 1px solid rgba(27,94,59,0.2); border-radius: 999px; overflow: hidden; }
        .currency-toggle button { padding: 6px 16px; border: none; background: transparent; font-size: 13px; cursor: pointer; color: #6B7280; font-family: inherit; }
        .currency-toggle button.active { background: #1B5E3B; color: white; }
      `}</style>

      <Nav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, color: '#0D1F15', margin: '0 0 10px' }}>
            Calculadora inmobiliaria
          </h1>
          <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
            Estimá los costos de cierre y la cuota mensual antes de comprar en Costa Rica.
          </p>
          <div style={{ marginTop: 18 }}>
            <div className="currency-toggle">
              <button className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>USD $</button>
              <button className={currency === 'CRC' ? 'active' : ''} onClick={() => setCurrency('CRC')}>Colones ₡</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Costos de cierre */}
          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, color: '#0D1F15', margin: '0 0 20px' }}>
              Costos de cierre estimados
            </h2>
            <div className="calc-input-row">
              <label>Precio de la propiedad</label>
              <input type="number" value={precio} onChange={e => setPrecio(Number(e.target.value) || 0)} />
            </div>

            <div className="calc-line"><span>Impuesto de traspaso (1.5%)</span><span>{fmt(traspaso, currency)}</span></div>
            <div className="calc-line"><span>Timbres y derechos de registro (~0.8%)</span><span>{fmt(timbresRegistro, currency)}</span></div>
            <div className="calc-line"><span>Honorarios notariales (~1.25%)</span><span>{fmt(honorariosNotariales, currency)}</span></div>
            <div className="calc-line"><span>IVA sobre honorarios (13%)</span><span>{fmt(ivaHonorarios, currency)}</span></div>
            <div className="calc-line total"><span>Total estimado ({pctCierre.toFixed(1)}%)</span><span>{fmt(totalCierre, currency)}</span></div>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
              Estimado educativo con base en porcentajes típicos del mercado costarricense. Los honorarios notariales
              varían según cada profesional y pueden aplicar tarifas escalonadas. Confirmá el monto exacto con tu
              notario o entidad bancaria antes de tomar una decisión.
            </p>
          </div>

          {/* Simulador de hipoteca */}
          <div className="calc-card">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, color: '#0D1F15', margin: '0 0 20px' }}>
              Simulador de cuota mensual
            </h2>
            <div className="calc-input-row">
              <label>Precio de la propiedad</label>
              <input type="number" value={precioHipoteca} onChange={e => setPrecioHipoteca(Number(e.target.value) || 0)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="calc-input-row">
                <label>Prima / entrada (%)</label>
                <input type="number" value={primaPct} onChange={e => setPrimaPct(Number(e.target.value) || 0)} />
              </div>
              <div className="calc-input-row">
                <label>Tasa de interés anual (%)</label>
                <input type="number" step="0.1" value={tasaAnual} onChange={e => setTasaAnual(Number(e.target.value) || 0)} />
              </div>
            </div>
            <div className="calc-input-row">
              <label>Plazo (años)</label>
              <input type="number" value={plazoAnios} onChange={e => setPlazoAnios(Number(e.target.value) || 0)} />
            </div>

            <div className="calc-line"><span>Monto a financiar</span><span>{fmt(montoFinanciado, currency)}</span></div>
            <div className="calc-line"><span>Total de intereses</span><span>{fmt(totalIntereses, currency)}</span></div>
            <div className="calc-line"><span>Total pagado al final del plazo</span><span>{fmt(totalPagado, currency)}</span></div>
            <div className="calc-line total"><span>Cuota mensual estimada</span><span>{fmt(cuotaMensual, currency)}</span></div>

            <button onClick={() => setComparar(!comparar)} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 999, background: comparar ? '#1B5E3B' : 'rgba(27,94,59,0.06)', color: comparar ? 'white' : '#1B5E3B', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {comparar ? 'Ocultar comparación de escenarios' : 'Comparar 3 escenarios →'}
            </button>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
              Cálculo educativo de amortización estándar. No incluye seguros, comisión bancaria, avalúo ni otros
              cargos del banco. No es una oferta de crédito — consultá con tu entidad financiera para una cotización
              formal.
            </p>
          </div>
        </div>

        {comparar && (
          <div className="calc-card" style={{ marginTop: 24 }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#0D1F15', margin: '0 0 20px' }}>
              Comparación de escenarios
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {escenarios.map(e => (
                <div key={e.label} style={{ border: e.activo ? '2px solid #1B5E3B' : '1px solid rgba(27,94,59,0.1)', borderRadius: 14, padding: '18px 16px', background: e.activo ? 'rgba(27,94,59,0.04)' : 'transparent' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: e.activo ? '#1B5E3B' : '#0D1F15', marginBottom: 2 }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>{e.detalle}</div>
                  <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: '#0D1F15', marginBottom: 8 }}>{fmt(e.cuotaMensual, currency)}<span style={{ fontSize: 12, color: '#9CA3AF' }}>/mes</span></div>
                  <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Financiado</span><span>{fmt(e.montoFinanciado, currency)}</span></div>
                  <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Intereses totales</span><span>{fmt(e.totalIntereses, currency)}</span></div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
              Los 3 escenarios usan el mismo precio y tasa de interés — solo varían la prima y el plazo, para que veas cómo cambia tu cuota mensual.
            </p>
          </div>
        )}

        <div style={{ marginTop: 28, maxWidth: 480, margin: '28px auto 0' }}>
          <LeadCaptureCalculadora
            fuente="calculadora_hipoteca"
            tipoBusqueda="compra"
            presupuesto={String(Math.round(precioHipoteca))}
            mensaje={mensajeHipoteca}
            titulo="Guardá este cálculo"
            textoBoton="Enviar mi resultado →"
            asesorEmail={asesorEmail}
            asesorNombre={asesorNombre}
            alertaPrecioMax={Math.round(precioHipoteca)}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/propiedades" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 999, background: '#1B5E3B', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Ver propiedades disponibles
          </Link>
          <div style={{ marginTop: 16 }}>
            <Link href="/calculadoras" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Ver todas las calculadoras →</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
