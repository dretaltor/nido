'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Propietario, Propiedad, Contrato } from '../../../../lib/database.types'

export default function ContratoPage() {
  return (
    <Suspense fallback={<div style={{ padding:40, fontFamily:'sans-serif', color:'#999' }}>Cargando...</div>}>
      <Contrato />
    </Suspense>
  )
}

function Contrato() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [propietario, setPropietario] = useState<Partial<Propietario> | null>(null)
  const [propiedades, setPropiedades] = useState<Partial<Propiedad>[]>([])
  const [step, setStep] = useState(1)
  const [firmaTipo, setFirmaTipo] = useState<'digital'|'fisica'|''>('')
  const [propiedadId, setPropiedadId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contratoExistente, setContratoExistente] = useState<Partial<Contrato> | null>(null)
  // NIDO solo opera con propietarios bajo el modelo de corretaje (comisión al cierre, nunca suscripción).
  // Por defecto se firma con exclusividad de 90 días. La única otra modalidad es "sin exclusividad" —
  // disponible exclusivamente como opción de renovación (Cláusula Quinta) cuando un dueño con contrato
  // de exclusividad vencido no quiere renovarla, vía el enlace ?modo=no_exclusivo desde su panel.
  const tipoContrato: 'exclusividad'|'no_exclusivo' = searchParams.get('modo') === 'no_exclusivo' ? 'no_exclusivo' : 'exclusividad'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [firmaDigital, setFirmaDigital] = useState('')
  const [firmaFisicaUrl, setFirmaFisicaUrl] = useState('')
  const [uploadingFirma, setUploadingFirma] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [contratoError, setContratoError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login-propietario'); return }
      setUser(user)
      const [{ data: prop }, { data: props }, { data: contrato }] = await Promise.all([
        supabase.from('propietarios').select('id,nombre,correo,telefono,cedula,verificado,verificacion_estado,created_at').eq('correo', user.email!).maybeSingle(),
        supabase.from('propiedades').select('id,titulo,zona,ref_id').eq('propietario_email', user.email!),
        supabase.from('contratos').select('id,propietario_correo,propietario_nombre,propiedad_id,tipo,estado,firmado_propietario,firmado_nido,firmado_at,firma_tipo,firma_url,comision_porcentaje,created_at').eq('propietario_correo', user.email!).eq('estado', 'activo').maybeSingle()
      ])
      setPropietario(prop)
      setPropiedades(props || [])
      setContratoExistente(contrato)
      setLoading(false)
    })
  }, [])

  const hoy = new Date()
  const vencimiento = new Date(hoy)
  vencimiento.setDate(vencimiento.getDate() + 90)
  const fmtDate = (d: Date) => d.toLocaleDateString('es-CR', { year:'numeric', month:'long', day:'numeric' })

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0D1F15'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }
  const endDraw = () => {
    setDrawing(false)
    const canvas = canvasRef.current!
    setFirmaDigital(canvas.toDataURL())
  }
  const clearCanvas = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setFirmaDigital('')
  }

  const uploadFirmaFisica = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingFirma(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tipo', 'fisica')
      const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir archivo')
      setFirmaFisicaUrl(json.publicUrl)
    } catch (err) {
      setContratoError('Error al subir firma: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploadingFirma(false)
    }
  }

  const firmarContrato = async () => {
    if (!aceptaTerminos || !user) return
    if (firmaTipo === 'digital' && !firmaDigital) return
    if (firmaTipo === 'fisica' && !firmaFisicaUrl) return
    setSaving(true)

    const fechaInicio = new Date().toISOString().split('T')[0]
    let fechaVencStr: string | null = null
    if (tipoContrato === 'exclusividad') {
      const fechaVenc = new Date()
      fechaVenc.setDate(fechaVenc.getDate() + 90)
      fechaVencStr = fechaVenc.toISOString().split('T')[0]
    }
    // 'no_exclusivo' no tiene fecha de vencimiento fija: se mantiene vigente hasta que
    // cualquiera de las partes lo termine, con 5 días hábiles de aviso (Cláusula Primera).

    await supabase.from('contratos').insert({
      propietario_correo: user.email,
      propietario_nombre: propietario?.nombre,
      propiedad_id: propiedadId || null,
      tipo: tipoContrato,
      estado: 'pendiente',
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencStr,
      periodo_dias: tipoContrato === 'exclusividad' ? 90 : null,
      precio_mensual: null,
      firma_tipo: firmaTipo,
      firma_url: firmaTipo === 'digital' ? firmaDigital : firmaFisicaUrl,
      firmado_propietario: true,
      firmado_nido: false,
      comision_porcentaje: 4,
      creado_por: user.email,
    })

    // Notify admin
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'davidretanaalvarez@gmail.com',
        tipo: 'nuevo_contrato',
        data: { nombre: propietario?.nombre, correo: user.email, tipo: tipoContrato, firma: firmaTipo }
      })
    }).catch(() => {})

    setSaving(false)
    setStep(4)
  }

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
    a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .btn-primary{padding:12px 28px;border-radius:999px;background:var(--ink);color:white;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:var(--sans)}
    .btn-primary:hover:not(:disabled){background:oklch(0.28 0.006 80)}
    .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
    .btn-outline{padding:12px 28px;border-radius:999px;background:transparent;color:var(--ink-2);border:1px solid var(--rule);font-size:14px;cursor:pointer;font-family:var(--sans)}
    .card{background:white;border:1px solid var(--rule);border-radius:14px;padding:28px 32px}
    .option-card{border:2px solid var(--rule);border-radius:12px;padding:20px 24px;cursor:pointer;transition:all 0.2s}
    .option-card:hover{border-color:var(--accent)}
    .option-card.selected{border-color:var(--accent);background:var(--accent-tint)}
    canvas{border:1px solid var(--rule);border-radius:8px;cursor:crosshair;touch-action:none}
  `

  if (loading) return <div style={{ padding:40, fontFamily:'sans-serif', color:'#999' }}>Cargando...</div>

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)', padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:900, margin:'0 auto' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22 }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
        <a href="/dashboard/propietario" style={{ fontSize:13, color:'var(--ink-3)' }}>← Volver al panel</a>
      </nav>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 24px 80px', animation:'fadeUp 0.4s ease' }}>

        {/* Contrato existente activo */}
        {contratoExistente && (
          <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:14, padding:'24px 28px', marginBottom:32 }}>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--accent)', marginBottom:8 }}>✓ Tenés un contrato activo con NIDO</div>
            <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.7 }}>
              Tipo: Exclusividad 90 días ·
              Vence: {contratoExistente.fecha_vencimiento?new Date(contratoExistente.fecha_vencimiento).toLocaleDateString('es-CR'):'—'} ·
              Estado: {contratoExistente.estado}
            </div>
            <a href="/dashboard/propietario" style={{ display:'inline-block', marginTop:12, padding:'9px 20px', borderRadius:999, background:'var(--accent)', color:'white', fontSize:13, fontWeight:500 }}>
              Ir al panel →
            </a>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Contrato de servicios</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1 }}>
            Contrato de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>corretaje NIDO.</em>
          </h1>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:8, marginBottom:32 }}>
          {['Cómo funciona', 'Revisar contrato', 'Firma', 'Confirmación'].map((s, i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ height:4, borderRadius:999, background:i+1<=step?'var(--accent)':'var(--rule)', transition:'background 0.3s' }}/>
              <div style={{ fontSize:11, color:i+1<=step?'var(--accent)':'var(--ink-3)' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* STEP 1 — Cómo funciona */}
        {step === 1 && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>
              {tipoContrato === 'exclusividad' ? 'Así funciona el contrato con NIDO' : 'Continuar sin exclusividad'}
            </h2>
            <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.7, marginBottom:24 }}>NIDO trabaja como corredor de tu propiedad: no pagás ninguna suscripción mensual, solo una comisión cuando se concreta la venta.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:28 }}>
              {tipoContrato === 'exclusividad' ? (
                <div className="option-card selected">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:500, marginBottom:4 }}>Contrato de exclusividad · 90 días</div>
                      <div style={{ fontSize:13, color:'var(--ink-3)' }}>Recomendado · Sin costo mensual</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--accent)' }}>4%</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>solo al cerrar</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {['Sin costo previo — pagás solo si vendés','Exclusividad de 90 días con NIDO','Campaña de marketing incluida','Fotografía profesional básica incluida','Asesor dedicado + asesoría legal completa','Si no vendemos en 90 días, podés renovar o continuar sin exclusividad'].map(b => (
                      <div key={b} style={{ display:'flex', gap:8, fontSize:13, color:'var(--ink-2)' }}>
                        <span style={{ color:'var(--accent)', flexShrink:0 }}>✓</span> {b}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="option-card selected">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:500, marginBottom:4 }}>Continuación sin exclusividad · push de venta</div>
                      <div style={{ fontSize:13, color:'var(--ink-3)' }}>Para quien no quiere renovar la exclusividad · Sin costo mensual</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--accent)' }}>4%</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>solo si vendemos</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {['Sin costo de suscripción — nunca pagás por mes','Sin exclusividad — podés vender por otros canales en paralelo','NIDO sigue promocionando tu propiedad como push de venta','Acceso al dashboard y leads se mantiene activo','Terminá cuando quieras, con 5 días hábiles de aviso'].map(b => (
                      <div key={b} style={{ display:'flex', gap:8, fontSize:13, color:'var(--ink-2)' }}>
                        <span style={{ color:'var(--accent)', flexShrink:0 }}>✓</span> {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button className="btn-primary" onClick={() => setStep(2)}>Ver contrato completo →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Contrato */}
        {step === 2 && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:20 }}>Revisá el contrato</h2>

            <div className="card" style={{ marginBottom:24, fontFamily:'Georgia, serif' }}>
              {/* Encabezado */}
              <div style={{ textAlign:'center', marginBottom:28, paddingBottom:20, borderBottom:'2px solid var(--ink)' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:28, marginBottom:4 }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)' }}>Plataforma Inmobiliaria · Costa Rica</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:20, marginTop:16, fontWeight:400 }}>
                  {tipoContrato === 'exclusividad' ? 'Contrato de Corretaje con Exclusividad' : 'Contrato de Corretaje sin Exclusividad'}
                </div>
                <div style={{ fontSize:13, color:'var(--ink-3)', marginTop:4 }}>San José, Costa Rica · {fmtDate(hoy)}</div>
              </div>

              <div style={{ fontSize:14, lineHeight:1.9, color:'var(--ink-2)' }}>

                <p style={{ marginBottom:16 }}><strong>PARTES CONTRATANTES</strong></p>
                <p style={{ marginBottom:8 }}>
                  <strong>EL CORREDOR:</strong> NIDO Plataforma Inmobiliaria, con domicilio en San José, Costa Rica, correo electrónico hola@nido-cr.com, sitio web www.nido-cr.com (en adelante &quot;NIDO&quot;).
                </p>
                <p style={{ marginBottom:20 }}>
                  <strong>EL PROPIETARIO:</strong> {propietario?.nombre || '___________________'}, cédula de identidad {propietario?.cedula || '___________________'}, correo electrónico {user?.email}, teléfono {propietario?.telefono || '___________________'} (en adelante &quot;EL PROPIETARIO&quot;).
                </p>

                <p style={{ marginBottom:12 }}><strong>CLÁUSULA PRIMERA — OBJETO DEL CONTRATO</strong></p>
                <p style={{ marginBottom:20 }}>
                  {tipoContrato === 'exclusividad'
                    ? <>EL PROPIETARIO otorga a NIDO la exclusividad para gestionar la venta de su propiedad por un período de noventa (90) días calendario contados a partir de la firma del presente contrato, es decir desde el {fmtDate(hoy)} hasta el {fmtDate(vencimiento)}. Durante este período, NIDO será el único canal autorizado para gestionar, promocionar y negociar la venta de la propiedad.</>
                    : 'EL PROPIETARIO contrata a NIDO para la promoción y venta de su propiedad sin exclusividad, como complemento de venta ("push de venta"). EL PROPIETARIO puede comercializar la propiedad simultáneamente por cualquier otro canal, agencia o corredor. Este contrato no tiene plazo fijo de vencimiento y se mantiene vigente hasta que cualquiera de las partes lo dé por terminado, con al menos 5 días hábiles de aviso previo y sin penalización alguna.'}
                </p>

                <p style={{ marginBottom:12 }}><strong>CLÁUSULA SEGUNDA — SERVICIOS INCLUIDOS</strong></p>
                <p style={{ marginBottom:8 }}>NIDO se compromete a prestar los siguientes servicios:</p>
                <div style={{ marginBottom:20, paddingLeft:16 }}>
                  {[
                    'Publicación de la propiedad en el portal digital de NIDO con ficha completa y fotografías',
                    'Verificación de datos registrales con el Registro Nacional de Costa Rica',
                    'Campaña de marketing digital en redes sociales (Instagram y Facebook)',
                    'Gestión y calificación de leads y compradores interesados',
                    'Asesoría en proceso de negociación y elaboración de ofertas',
                    'Asesoría legal y documental durante el proceso de venta',
                    'Acompañamiento hasta el proceso notarial y firma de escritura',
                    tipoContrato === 'exclusividad' ? 'Fotografía profesional básica de la propiedad (incluida en exclusividad)' : 'Acceso al dashboard de propietario con estadísticas en tiempo real',
                    'Acceso a Valeria IA para análisis de mercado y valuación',
                  ].map((s, i) => <div key={i} style={{ marginBottom:4 }}>• {s}</div>)}
                </div>

                <p style={{ marginBottom:12 }}><strong>CLÁUSULA TERCERA — COMISIÓN Y HONORARIOS</strong></p>
                <p style={{ marginBottom:8 }}>
                  {tipoContrato === 'exclusividad'
                    ? 'La comisión de NIDO por la venta exitosa de la propiedad será del cuatro por ciento (4%) sobre el precio final de venta acordado entre las partes. Esta comisión se devengará y será exigible únicamente al momento del cierre notarial. Si la venta no se concreta durante el período de exclusividad, NIDO no tendrá derecho a cobrar comisión alguna.'
                    : 'La comisión de NIDO será del cuatro por ciento (4%) sobre el precio final de venta, exigible únicamente si la venta se concreta a través de la gestión de NIDO. Si EL PROPIETARIO vende la propiedad por su cuenta o mediante otro canal, agencia o corredor, NIDO no tendrá derecho a cobrar comisión alguna.'}
                </p>
                <p style={{ marginBottom:20, fontWeight:500, color:'var(--ink)' }}>
                  NIDO aplica el principio de &quot;no venta, no comisión&quot;: si no logramos vender la propiedad, no se cobra ningún honorario. NIDO no ofrece ni opera ningún plan de suscripción para propietarios: el único modelo de servicio es el corretaje descrito en esta cláusula.
                </p>

                {tipoContrato === 'exclusividad' && <>
                  <p style={{ marginBottom:12 }}><strong>CLÁUSULA CUARTA — EXCLUSIVIDAD</strong></p>
                  <p style={{ marginBottom:20 }}>
                    Durante el período de exclusividad, EL PROPIETARIO se compromete a no publicar, ofrecer ni gestionar la venta de la propiedad a través de ningún otro canal, agencia, corredor o plataforma inmobiliaria. El incumplimiento de esta cláusula facultará a NIDO a reclamar una indemnización equivalente al 2% del precio de lista de la propiedad.
                  </p>

                  <p style={{ marginBottom:12 }}><strong>CLÁUSULA QUINTA — RENOVACIÓN Y OPCIONES AL VENCIMIENTO</strong></p>
                  <p style={{ marginBottom:8 }}>Al vencimiento del período de exclusividad, EL PROPIETARIO podrá elegir entre:</p>
                  <div style={{ marginBottom:20, paddingLeft:16 }}>
                    <div style={{ marginBottom:4 }}>a) Renovar el contrato de exclusividad por un nuevo período de 90 días bajo las mismas condiciones.</div>
                    <div style={{ marginBottom:4 }}>b) Continuar con NIDO en modalidad sin exclusividad, como complemento de venta (&quot;push de venta&quot;): la propiedad permanece publicada y promocionada por NIDO sin costo de suscripción, EL PROPIETARIO puede comercializarla simultáneamente por otros canales, y la comisión del 4% aplica únicamente si la venta se concreta a través de NIDO.</div>
                    <div style={{ marginBottom:4 }}>c) Dar por terminado el contrato sin penalización alguna.</div>
                  </div>
                </>}

                <p style={{ marginBottom:12 }}><strong>{tipoContrato === 'exclusividad' ? 'CLÁUSULA SEXTA' : 'CLÁUSULA CUARTA'} — OBLIGACIONES DEL PROPIETARIO</strong></p>
                <div style={{ marginBottom:20, paddingLeft:16 }}>
                  {[
                    'Proporcionar información veraz, completa y actualizada sobre la propiedad',
                    'Mantener la documentación registral al día y libre de impedimentos legales',
                    'Declarar expresamente cualquier gravamen, hipoteca, embargo o limitación sobre la propiedad',
                    'Facilitar el acceso a la propiedad para visitas coordinadas por NIDO',
                    'Notificar a NIDO cualquier cambio en las condiciones de la propiedad o en el precio de lista',
                    'Mantener comunicación activa con el asesor NIDO asignado',
                  ].map((s, i) => <div key={i} style={{ marginBottom:4 }}>• {s}</div>)}
                </div>

                <p style={{ marginBottom:12 }}><strong>{tipoContrato === 'exclusividad' ? 'CLÁUSULA SÉTIMA' : 'CLÁUSULA QUINTA'} — PROTECCIÓN DE DATOS PERSONALES</strong></p>
                <p style={{ marginBottom:20 }}>
                  El tratamiento de los datos personales de las partes se realizará conforme a la Ley N° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica y la Política de Privacidad de NIDO disponible en www.nido-cr.com/privacidad.
                </p>

                <p style={{ marginBottom:12 }}><strong>{tipoContrato === 'exclusividad' ? 'CLÁUSULA OCTAVA' : 'CLÁUSULA SEXTA'} — RESOLUCIÓN DE DISPUTAS</strong></p>
                <p style={{ marginBottom:20 }}>
                  Cualquier controversia derivada del presente contrato se resolverá preferiblemente de manera amigable. En caso de no alcanzarse un acuerdo, las partes se someten a la jurisdicción de los Tribunales de Justicia de la República de Costa Rica, con renuncia expresa a cualquier otro fuero.
                </p>

                <p style={{ marginBottom:12 }}><strong>{tipoContrato === 'exclusividad' ? 'CLÁUSULA NOVENA' : 'CLÁUSULA SÉTIMA'} — DESTINO DE LA PUBLICACIÓN AL FINALIZAR EL CONTRATO</strong></p>
                <p style={{ marginBottom:24 }}>
                  Al finalizar o terminar este contrato por cualquier causa, NIDO retira la publicación de la propiedad del portal público en un plazo máximo de 5 días hábiles, salvo que EL PROPIETARIO solicite su retiro inmediato. Las fotografías y datos de la propiedad se conservan conforme a los plazos indicados en la Política de Privacidad de NIDO, y pueden eliminarse antes a solicitud expresa de EL PROPIETARIO.
                </p>

                <div style={{ borderTop:'1px solid var(--rule)', paddingTop:20, marginTop:8 }}>
                  <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:8 }}>Este contrato se celebra en San José, Costa Rica, el {fmtDate(hoy)}. La firma digital con certificado GAUDI, aceptada a través de este formulario, tiene la misma validez y eficacia jurídica que una firma autógrafa, conforme al artículo 8 de la Ley N° 8454 de Certificados, Firmas Digitales y Documentos Electrónicos de Costa Rica. La firma física escaneada o fotografiada, aceptada como alternativa, constituye igualmente una manifestación de voluntad válida y vinculante entre las partes conforme a dicha ley, si bien —al no tratarse de una firma digital certificada— su fuerza probatoria ante un eventual conflicto depende de la valoración judicial de la prueba, junto con el registro electrónico de fecha, hora e identidad del firmante que NIDO conserva. Este documento es un contrato privado entre las partes y no constituye ni sustituye un instrumento público ni una autenticación notarial.</p>
                  <p style={{ fontSize:13, color:'var(--ink-3)' }}>NIDO · hola@nido-cr.com · www.nido-cr.com</p>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Atrás</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Proceder a firmar →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Firma */}
        {step === 3 && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:400, marginBottom:8 }}>Firmá el contrato</h2>
            <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.7, marginBottom:24 }}>Elegí cómo querés firmar. Ambas opciones tienen la misma validez legal.</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
              <div className={'option-card'+(firmaTipo==='digital'?' selected':'')} onClick={() => setFirmaTipo('digital')} style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔐</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>Firma digital GAUDI</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Firmá con tu certificado digital oficial de Costa Rica</div>
              </div>
              <div className={'option-card'+(firmaTipo==='fisica'?' selected':'')} onClick={() => setFirmaTipo('fisica')} style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>Firma física</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>Subí una foto de tu firma de puño y letra</div>
              </div>
            </div>

            {firmaTipo === 'digital' && (
              <div style={{ marginBottom:24 }}>
                <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:12, padding:'20px 24px', marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:12 }}>Proceso de firma con GAUDI</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {['Descargá el contrato en PDF usando el botón de abajo', 'Ingresá a gaudi.go.cr con tu firma digital o tarjeta de identidad', 'Seleccioná "Firmar documento" y cargá el PDF descargado', 'Completá el proceso y descargá el PDF firmado con sello digital', 'Subí el archivo firmado en el campo de abajo'].map((s, i) => (
                      <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--ink-2)' }}>
                        <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--accent)', color:'white', display:'grid', placeItems:'center', fontSize:11, fontWeight:600, flexShrink:0 }}>{i+1}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                  <button onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession()
                    const res = await fetch('/api/contrato-pdf?correo='+user?.email+'&tipo='+tipoContrato, { headers: { 'Authorization': 'Bearer ' + session?.access_token } })
                    if (!res.ok) { setContratoError('No se pudo cargar el contrato'); return }
                    const html = await res.text()
                    const blob = new Blob([html], { type: 'text/html' })
                    window.open(URL.createObjectURL(blob), '_blank')
                  }} style={{ flex:1, padding:'12px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:14, fontWeight:500, border:'none', cursor:'pointer', textAlign:'center' }}>
                    ⬇ Descargar contrato PDF
                  </button>
                  <a href="https://gaudi.go.cr" target="_blank" style={{ flex:1, padding:'12px', borderRadius:999, background:'transparent', border:'1px solid var(--rule)', color:'var(--ink-2)', fontSize:14, textDecoration:'none', textAlign:'center' }}>
                    Ir a GAUDI →
                  </a>
                </div>
                <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:10 }}>Subí el PDF firmado con GAUDI:</div>
                <label style={{ display:'block', border:'2px dashed var(--rule)', borderRadius:10, padding:'24px', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s' }}>
                  {firmaDigital ? (
                    <div style={{ fontSize:14, color:'var(--accent)', fontWeight:500 }}>✓ Archivo cargado — PDF firmado con GAUDI</div>
                  ) : (
                    <div>
                      <div style={{ fontSize:24, marginBottom:8 }}>📎</div>
                      <div style={{ fontSize:14, color:'var(--ink-3)' }}>{uploadingFirma ? 'Subiendo...' : 'Subí el PDF firmado con GAUDI'}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:4 }}>Archivos .pdf con firma digital válida</div>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.p7s" style={{ display:'none' }} onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file || !user) return
                    setUploadingFirma(true)
                    const ext = file.name.split('.').pop()
                    const { data: { session } } = await supabase.auth.getSession()
                    const fd = new FormData()
                    fd.append('file', file)
                    fd.append('tipo', 'gaudi')
                    const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
                    const json = await res.json()
                    if (!res.ok) { setContratoError('Error al subir: ' + (json.error || 'intenta de nuevo')); setUploadingFirma(false); return }
                    const publicUrl = json.publicUrl
                    setFirmaDigital(publicUrl)
                    setUploadingFirma(false)
                  }}/>
                </label>
              </div>
            )}

            {firmaTipo === 'fisica' && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:10 }}>Subí una foto clara de tu firma:</div>
                <label style={{ display:'block', border:'2px dashed var(--rule)', borderRadius:10, padding:'32px', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s' }}>
                  {firmaFisicaUrl ? (
                    <img src={firmaFisicaUrl} style={{ maxHeight:120, maxWidth:'100%', objectFit:'contain' }} alt="Firma"/>
                  ) : (
                    <div>
                      <div style={{ fontSize:28, marginBottom:8 }}>📷</div>
                      <div style={{ fontSize:14, color:'var(--ink-3)' }}>{uploadingFirma ? 'Subiendo...' : 'Tocá para subir la foto de tu firma'}</div>
                    </div>
                  )}
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={uploadFirmaFisica}/>
                </label>
              </div>
            )}

            {/* Aceptar términos */}
            <div onClick={() => setAceptaTerminos(!aceptaTerminos)} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'16px 20px', background:aceptaTerminos?'var(--accent-tint)':'var(--bg)', border:'1px solid '+(aceptaTerminos?'oklch(0.85 0.04 150)':'var(--rule)'), borderRadius:10, cursor:'pointer', marginBottom:24 }}>
              <div style={{ width:20, height:20, borderRadius:4, border:'2px solid '+(aceptaTerminos?'var(--accent)':'var(--rule)'), background:aceptaTerminos?'var(--accent)':'transparent', display:'grid', placeItems:'center', flexShrink:0, marginTop:1 }}>
                {aceptaTerminos && <span style={{ color:'white', fontSize:12, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65 }}>
                He leído y acepto el contrato de corretaje {tipoContrato === 'exclusividad' ? 'con exclusividad de 90 días' : 'sin exclusividad'} de NIDO. Entiendo que al firmar autorizo a NIDO a gestionar mi propiedad según los términos descritos.
              </div>
            </div>

            {contratoError && <p style={{ color:'oklch(0.45 0.08 20)', fontSize:13, marginBottom:12, padding:'10px 14px', background:'oklch(0.97 0.02 20)', borderRadius:8, border:'1px solid oklch(0.88 0.04 20)' }}>{contratoError}</p>}

            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Atrás</button>
              <button className="btn-primary" onClick={firmarContrato}
                disabled={saving || !aceptaTerminos || (firmaTipo === 'digital' && !firmaDigital) || (firmaTipo === 'fisica' && !firmaFisicaUrl) || !firmaTipo}>
                {saving ? 'Enviando...' : 'Firmar y enviar contrato →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Confirmación */}
        {step === 4 && (
          <div style={{ textAlign:'center', animation:'fadeUp 0.4s ease', padding:'40px 0' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', margin:'0 auto 24px', fontSize:28 }}>✓</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400, marginBottom:12 }}>
              Contrato <em style={{ fontStyle:'italic', color:'var(--accent)' }}>enviado.</em>
            </h2>
            <p style={{ fontSize:15, color:'var(--ink-3)', lineHeight:1.75, maxWidth:480, margin:'0 auto 28px' }}>
              Recibimos tu firma. Un asesor NIDO revisará y contrafirmará el contrato en las próximas 24 horas hábiles. Te notificaremos por correo cuando esté activo.
            </p>
            <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:12, padding:'20px', maxWidth:400, margin:'0 auto 28px', textAlign:'left' }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Próximos pasos:</div>
              {['NIDO contrafirma el contrato (24h hábiles)','Tu propiedad se activa en el portal','Comenzamos la campaña de marketing','Recibís leads calificados directamente'].map((s, i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:8, fontSize:13, color:'var(--ink-2)' }}>
                  <span style={{ width:20, height:20, borderRadius:'50%', background:'var(--accent-tint)', color:'var(--accent)', display:'grid', placeItems:'center', fontSize:10, fontWeight:600, flexShrink:0 }}>{i+1}</span>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <a href="/dashboard/propietario" style={{ padding:'12px 24px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:14, fontWeight:500, textDecoration:'none' }}>
                Ir al panel →
              </a>
              <a href={'mailto:hola@nido-cr.com?subject=Firma%20de%20contrato%20de%20propietario&body=Hola%20NIDO%2C%20acabo%20de%20firmar%20el%20contrato%20de%20'+(tipoContrato === 'exclusividad' ? 'exclusividad' : 'sin%20exclusividad')+'.%20Mi%20correo%20es%20'+user?.email} style={{ padding:'12px 24px', borderRadius:999, border:'1px solid var(--rule)', color:'var(--ink)', fontSize:14, fontWeight:500, textDecoration:'none' }}>
                ✉ Contactar equipo NIDO
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
