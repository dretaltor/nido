import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Este archivo construye HTML con texto plano (no es React, no escapa solo).
// Sin esto, un nombre/cedula con <script> se inyecta tal cual en el contrato generado.
function esc(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const correo = searchParams.get('correo') || ''
  // NIDO ya no ofrece un plan de suscripción mensual para propietarios. Los modelos son:
  // corretaje de venta con exclusividad (por defecto), corretaje de venta sin exclusividad
  // ("push de venta", solo como opción de renovación via Cláusula Quinta), y corretaje de
  // arrendamiento con exclusividad ("alquiler"), con administración opcional.
  const modoParam = searchParams.get('tipo')
  const tipo: 'exclusividad'|'no_exclusivo'|'alquiler' = modoParam === 'no_exclusivo' ? 'no_exclusivo' : modoParam === 'alquiler' ? 'alquiler' : 'exclusividad'
  const esExclusividad = tipo === 'exclusividad'
  const esAlquiler = tipo === 'alquiler'
  const incluyeAdmin = esAlquiler && searchParams.get('admin') === '1'
  const diasExclusividad = esAlquiler ? 60 : 90

  // Verificar sesion real — antes cualquiera podia pedir el contrato de cualquier correo sin login
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 })
  }
  const esElMismoPropietario = user.email === correo
  const { data: esAdmin } = await supabaseAdmin.from('admins').select('correo').eq('correo', user.email).maybeSingle()
  if (!esElMismoPropietario && !esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data: prop } = await supabaseAdmin.from('propietarios').select('*').eq('correo', correo).maybeSingle()

  const hoy = new Date()
  const vencimiento = new Date(hoy)
  vencimiento.setDate(vencimiento.getDate() + diasExclusividad)
  const fmtDate = (d: Date) => d.toLocaleDateString('es-CR', { year:'numeric', month:'long', day:'numeric' })

  const clausulaObjeto = esExclusividad
    ? 'EL PROPIETARIO otorga a NIDO la exclusividad para gestionar la venta de su propiedad por un período de noventa (90) días calendario contados a partir de la firma del presente contrato, es decir desde el ' + fmtDate(hoy) + ' hasta el ' + fmtDate(vencimiento) + '. Durante este período, NIDO será el único canal autorizado para gestionar, promocionar y negociar la venta de la propiedad.'
    : esAlquiler
    ? 'EL PROPIETARIO otorga a NIDO la exclusividad para gestionar el arrendamiento de su propiedad por un período de sesenta (60) días calendario contados a partir de la firma del presente contrato, es decir desde el ' + fmtDate(hoy) + ' hasta el ' + fmtDate(vencimiento) + '. Durante este período, NIDO será el único canal autorizado para gestionar, promocionar y negociar el arrendamiento de la propiedad.'
    : 'EL PROPIETARIO contrata a NIDO para la promoción y venta de su propiedad sin exclusividad, como complemento de venta ("push de venta"). EL PROPIETARIO puede comercializar la propiedad simultáneamente por cualquier otro canal, agencia o corredor. Este contrato no tiene plazo fijo de vencimiento y se mantiene vigente hasta que cualquiera de las partes lo dé por terminado, con al menos 5 días hábiles de aviso previo y sin penalización alguna.'

  const clausulaComision = esExclusividad
    ? 'La comisión de NIDO por la venta exitosa de la propiedad será del cuatro por ciento (4%) sobre el precio final de venta acordado entre las partes. Esta comisión se devengará y será exigible únicamente al momento del cierre notarial. Si la venta no se concreta durante el período de exclusividad, NIDO no tendrá derecho a cobrar comisión alguna. NIDO no ofrece ni opera ningún plan de suscripción para propietarios: el único modelo de servicio es el corretaje aquí descrito.'
    : esAlquiler
    ? 'La comisión de NIDO por la colocación exitosa de un inquilino será el equivalente a un (1) mes de renta mensual acordada entre las partes, exigible únicamente al momento de la firma del contrato de arrendamiento entre EL PROPIETARIO y el inquilino gestionado por NIDO. Si no se logra colocar un inquilino durante el período de exclusividad, NIDO no tendrá derecho a cobrar comisión alguna. NIDO no ofrece ni opera ningún plan de suscripción para propietarios: el único modelo de servicio es el corretaje aquí descrito.'
    : 'La comisión de NIDO será del cuatro por ciento (4%) sobre el precio final de venta, exigible únicamente si la venta se concreta a través de la gestión de NIDO. Si EL PROPIETARIO vende la propiedad por su cuenta o mediante otro canal, agencia o corredor, NIDO no tendrá derecho a cobrar comisión alguna. NIDO no ofrece ni opera ningún plan de suscripción para propietarios: el único modelo de servicio es el corretaje aquí descrito.'

  const principioNoComision = esAlquiler
    ? '<strong>Principio de no colocación, no comisión:</strong> Si no logramos alquilar la propiedad durante la vigencia del contrato de exclusividad, no se cobra ningún honorario.'
    : '<strong>Principio de no venta, no comisión:</strong> Si no logramos vender la propiedad durante la vigencia del contrato de exclusividad, no se cobra ningún honorario.'

  // Clausula de administracion (opcional, solo alquiler) — se cuenta como una clausula mas
  // en la numeracion, asi que hay que sumarla antes de calcular c6/c7/c8 mas abajo.
  const clausulaAdministracion = incluyeAdmin ? `
<h3>Cláusula Cuarta — Administración de la Propiedad (Servicio Opcional)</h3>
<p>Adicionalmente a la gestión de colocación, EL PROPIETARIO contrata a NIDO para la administración integral de la propiedad durante la vigencia del contrato de arrendamiento con el inquilino colocado. Este servicio es opcional, se factura por separado de la comisión de colocación, y puede cancelarse en cualquier momento con treinta (30) días naturales de aviso previo.</p>
<p>El servicio de administración incluye:</p>
<ul>
  <li>Cobro mensual de la renta y transferencia al PROPIETARIO dentro de los cinco (5) días hábiles siguientes</li>
  <li>Comunicación directa con el inquilino para consultas y gestión de la relación arrendaticia</li>
  <li>Coordinación de mantenimiento y reparaciones menores, con reporte y aprobación previa del PROPIETARIO para gastos que superen un tercio de la renta mensual</li>
  <li>Reporte mensual de estado de la propiedad y de cobros realizados</li>
</ul>
<p>Por este servicio, EL PROPIETARIO pagará a NIDO una comisión de administración equivalente al diez por ciento (10%) de la renta efectivamente cobrada cada mes, la cual se descuenta directamente del monto transferido al PROPIETARIO.</p>` : ''

  const clausulaExclusividad = (esExclusividad || esAlquiler) ? `
<h3>Cláusula ${incluyeAdmin ? 'Quinta' : 'Cuarta'} — Exclusividad</h3>
<p>${esAlquiler
    ? 'Durante el período de exclusividad, EL PROPIETARIO se compromete a no publicar, ofrecer ni gestionar el arrendamiento de la propiedad a través de ningún otro canal, agencia, corredor o plataforma inmobiliaria. El incumplimiento de esta cláusula facultará a NIDO a reclamar una indemnización equivalente a un (1) mes de renta según el precio de lista de la propiedad.'
    : 'Durante el período de exclusividad, EL PROPIETARIO se compromete a no publicar, ofrecer ni gestionar la venta de la propiedad a través de ningún otro canal, agencia, corredor o plataforma inmobiliaria. El incumplimiento de esta cláusula facultará a NIDO a reclamar una indemnización equivalente al 2% del precio de lista de la propiedad.'}</p>
<h3>Cláusula ${incluyeAdmin ? 'Sexta' : 'Quinta'} — Renovación y Opciones al Vencimiento</h3>
<p>Al vencimiento del período de exclusividad, EL PROPIETARIO podrá elegir entre:</p>
<ul>
  ${esAlquiler ? `
  <li>a) Renovar el contrato de exclusividad por un nuevo período de 60 días.</li>
  <li>b) Continuar con NIDO en modalidad sin exclusividad, como complemento de colocación ("push de alquiler"), sin costo de suscripción y con comisión de un mes de renta aplicable únicamente si la colocación se concreta a través de NIDO.</li>
  <li>c) Dar por terminado el contrato sin penalización alguna.</li>` : `
  <li>a) Renovar el contrato de exclusividad por un nuevo período de 90 días.</li>
  <li>b) Continuar con NIDO en modalidad sin exclusividad, como complemento de venta ("push de venta"), sin costo de suscripción y con comisión del 4% aplicable únicamente si la venta se concreta a través de NIDO.</li>
  <li>c) Dar por terminado el contrato sin penalización alguna.</li>`}
</ul>` : ''

  const numClausulasPrevias = 3 + (incluyeAdmin ? 1 : 0) + ((esExclusividad || esAlquiler) ? 2 : 0)
  const ORDINALES = ['Primera','Segunda','Tercera','Cuarta','Quinta','Sexta','Sétima','Octava','Novena','Décima']
  const c6 = ORDINALES[numClausulasPrevias]
  const c7 = ORDINALES[numClausulasPrevias + 1]
  const c8 = ORDINALES[numClausulasPrevias + 2]

  const fotoItem = esAlquiler
    ? (incluyeAdmin ? '' : '<li>Fotografía profesional básica de la propiedad</li>')
    : esExclusividad ? '<li>Fotografía profesional básica de la propiedad (incluida en exclusividad)</li>' : ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Contrato de Corretaje NIDO</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, Arial, sans-serif; font-size: 13px; line-height: 1.8; color: #1a1a1a; background: white; padding: 60px; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #0D1F15; padding-bottom: 24px; margin-bottom: 32px; }
  .logo { font-family: Georgia, serif; font-size: 36px; letter-spacing: 4px; color: #0D1F15; }
  .logo span { color: #1B5E3B; }
  .tagline { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666; margin-top: 6px; }
  .contrato-title { font-family: Georgia, serif; font-size: 20px; font-weight: 400; margin-top: 16px; }
  .fecha { font-size: 12px; color: #666; margin-top: 4px; }
  h3 { font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin: 24px 0 8px; color: #0D1F15; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
  p { margin-bottom: 12px; color: #333; }
  .partes { background: #f8f8f6; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  ul { padding-left: 20px; margin-bottom: 12px; }
  li { margin-bottom: 6px; color: #333; }
  .firma-section { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .firma-box { border-top: 1px solid #0D1F15; padding-top: 12px; }
  .firma-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #666; }
  .firma-espacio { height: 60px; border-bottom: 1px dashed #ccc; margin: 16px 0 8px; }
  .gaudi-box { background: #f0f7f3; border: 1px solid #c8e6d4; border-radius: 8px; padding: 16px 20px; margin: 32px 0; }
  .gaudi-title { font-size: 12px; font-weight: 600; color: #1B5E3B; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; text-align: center; }
  @media print { body { padding: 40px; } }
</style>
</head>
<body>

<div class="header">
  <div class="logo">NIDO<span>.</span></div>
  <div class="tagline">Plataforma Inmobiliaria · Costa Rica</div>
  <div class="contrato-title">${esExclusividad ? 'Contrato de Corretaje con Exclusividad' : esAlquiler ? 'Contrato de Corretaje de Arrendamiento con Exclusividad' : 'Contrato de Corretaje sin Exclusividad'}</div>
  <div class="fecha">San José, Costa Rica · ${fmtDate(hoy)}</div>
</div>

<h3>Partes Contratantes</h3>
<div class="partes">
  <p><strong>EL CORREDOR:</strong> NIDO Plataforma Inmobiliaria, con domicilio en San José, Costa Rica, correo electrónico hola@nido-cr.com, sitio web www.nido-cr.com (en adelante "NIDO").</p>
  <p><strong>EL PROPIETARIO:</strong> ${esc(prop?.nombre) || '___________________'}, cédula de identidad ${esc(prop?.cedula) || '___________________'}, correo electrónico ${esc(correo)}, teléfono ${esc(prop?.telefono) || '___________________'} (en adelante "EL PROPIETARIO").</p>
</div>

<h3>Cláusula Primera — Objeto del Contrato</h3>
<p>${clausulaObjeto}</p>

<h3>Cláusula Segunda — Servicios Incluidos</h3>
<p>NIDO se compromete a prestar los siguientes servicios:</p>
<ul>
  <li>Publicación de la propiedad en el portal digital de NIDO con ficha completa y fotografías</li>
  <li>Verificación de datos registrales con el Registro Nacional de Costa Rica</li>
  <li>Campaña de marketing digital en redes sociales (Instagram y Facebook)</li>
  ${esAlquiler ? `
  <li>Gestión y calificación de interesados en alquilar</li>
  <li>Verificación de referencias y capacidad de pago del inquilino</li>
  <li>Elaboración del contrato de arrendamiento conforme a la Ley General de Arrendamientos Urbanos y Suburbanos (Ley N° 7527)</li>
  <li>Asesoría legal durante el proceso de arrendamiento</li>
  ${fotoItem}
  <li>Acceso a Valeria IA para análisis de mercado y valuación de renta</li>` : `
  <li>Gestión y calificación de leads y compradores interesados</li>
  <li>Asesoría en proceso de negociación y elaboración de ofertas</li>
  <li>Asesoría legal y documental durante el proceso de venta</li>
  <li>Acompañamiento hasta el proceso notarial y firma de escritura</li>
  ${fotoItem}
  <li>Acceso a Valeria IA para análisis de mercado y valuación</li>
  <li>Dashboard de propietario con estadísticas en tiempo real</li>`}
</ul>

<h3>Cláusula Tercera — Comisión y Honorarios</h3>
<p>${clausulaComision}</p>
<p>${principioNoComision}</p>

${clausulaAdministracion}

${clausulaExclusividad}

<h3>Cláusula ${c6} — Obligaciones del Propietario</h3>
<ul>
  ${esAlquiler ? `
  <li>Proporcionar información veraz, completa y actualizada sobre la propiedad</li>
  <li>Mantener la documentación registral al día y libre de impedimentos legales</li>
  <li>Declarar expresamente cualquier gravamen, hipoteca, embargo o limitación sobre la propiedad</li>
  <li>Mantener la propiedad en condiciones habitables y facilitar el acceso para visitas coordinadas por NIDO</li>
  <li>Notificar a NIDO cualquier cambio en las condiciones de la propiedad o en el monto de renta solicitado</li>` : `
  <li>Proporcionar información veraz, completa y actualizada sobre la propiedad</li>
  <li>Mantener la documentación registral al día y libre de impedimentos legales</li>
  <li>Declarar expresamente cualquier gravamen, hipoteca, embargo o limitación sobre la propiedad</li>
  <li>Facilitar el acceso a la propiedad para visitas coordinadas por NIDO</li>
  <li>Notificar a NIDO cualquier cambio en las condiciones de la propiedad o en el precio de lista</li>`}
</ul>

<h3>Cláusula ${c7} — Protección de Datos Personales</h3>
<p>El tratamiento de los datos personales de las partes se realizará conforme a la Ley N° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica y la Política de Privacidad de NIDO disponible en www.nido-cr.com/privacidad.</p>

<h3>Cláusula ${c8} — Resolución de Disputas</h3>
<p>Cualquier controversia derivada del presente contrato se resolverá preferiblemente de manera amigable. En caso de no alcanzarse un acuerdo, las partes se someten a la jurisdicción de los Tribunales de Justicia de la República de Costa Rica, con renuncia expresa a cualquier otro fuero.</p>

<div class="gaudi-box">
  <div class="gaudi-title">Instrucciones para firma digital con GAUDI</div>
  <div style="font-size:12px;color:#374151;line-height:1.7">
    1. Descargue este PDF en su dispositivo (Archivo → Imprimir → Guardar como PDF).<br>
    2. Ingrese a <strong>gaudi.go.cr</strong> con su firma digital o tarjeta de identificación.<br>
    3. Seleccione "Firmar documento" y cargue este PDF.<br>
    4. Complete el proceso y descargue el PDF firmado con sello digital.<br>
    5. Súbalo en su panel de propietario en NIDO para verificación.
  </div>
</div>

<div class="firma-section">
  <div class="firma-box">
    <div class="firma-label">Firma del Propietario</div>
    <div class="firma-espacio"></div>
    <div style="font-weight:500">${esc(prop?.nombre) || '___________________'}</div>
    <div style="font-size:11px;color:#666">Cédula: ${esc(prop?.cedula) || '___________________'}</div>
    <div style="font-size:11px;color:#666">Fecha: ${fmtDate(hoy)}</div>
  </div>
  <div class="firma-box">
    <div class="firma-label">Firma NIDO</div>
    <div class="firma-espacio"></div>
    <div style="font-weight:500">NIDO Plataforma Inmobiliaria</div>
    <div style="font-size:11px;color:#666">Representante Legal</div>
    <div style="font-size:11px;color:#666">hola@nido-cr.com</div>
  </div>
</div>

<div class="footer">
  NIDO Plataforma Inmobiliaria · San José, Costa Rica · www.nido-cr.com · hola@nido-cr.com<br>
  Documento generado el ${fmtDate(hoy)} · Ref: ${Date.now()}
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    }
  })
}
