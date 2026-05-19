import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contratoId = searchParams.get('id')
  const correo = searchParams.get('correo')

  if (!correo) return NextResponse.json({ error: 'Sin correo' }, { status: 400 })

  // Get propietario data
  const { data: prop } = await supabaseAdmin.from('propietarios').select('*').eq('correo', correo).maybeSingle()

  const hoy = new Date()
  const vencimiento = new Date(hoy)
  vencimiento.setDate(vencimiento.getDate() + 90)
  const fmtDate = (d: Date) => d.toLocaleDateString('es-CR', { year:'numeric', month:'long', day:'numeric' })
  const tipo = searchParams.get('tipo') || 'exclusividad'

  const html = \`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Contrato de Corretaje NIDO</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; line-height: 1.8; color: #1a1a1a; background: white; padding: 60px; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #0D1F15; padding-bottom: 24px; margin-bottom: 32px; }
  .logo { font-family: 'EB Garamond', Georgia, serif; font-size: 36px; letter-spacing: 4px; color: #0D1F15; }
  .logo span { color: #1B5E3B; }
  .tagline { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666; margin-top: 6px; }
  .contrato-title { font-family: 'EB Garamond', Georgia, serif; font-size: 22px; font-weight: 400; margin-top: 16px; }
  .fecha { font-size: 12px; color: #666; margin-top: 4px; }
  h3 { font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin: 24px 0 8px; color: #0D1F15; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
  p { margin-bottom: 12px; color: #333; }
  .partes { background: #f8f8f6; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .partes p { margin-bottom: 8px; }
  ul { padding-left: 20px; margin-bottom: 12px; }
  li { margin-bottom: 6px; color: #333; }
  .firma-section { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; page-break-inside: avoid; }
  .firma-box { border-top: 1px solid #0D1F15; padding-top: 12px; }
  .firma-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #666; }
  .firma-nombre { font-weight: 500; margin-top: 4px; }
  .firma-cargo { font-size: 11px; color: #666; }
  .firma-espacio { height: 60px; border-bottom: 1px dashed #ccc; margin: 16px 0 8px; }
  .gaudi-box { background: #f0f7f3; border: 1px solid #c8e6d4; border-radius: 8px; padding: 16px 20px; margin: 32px 0; }
  .gaudi-title { font-size: 12px; font-weight: 600; color: #1B5E3B; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .gaudi-text { font-size: 12px; color: #374151; line-height: 1.6; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; text-align: center; }
  @media print { body { padding: 40px; } }
</style>
</head>
<body>

<div class="header">
  <div class="logo">NIDO<span>.</span></div>
  <div class="tagline">Plataforma Inmobiliaria · Costa Rica</div>
  <div class="contrato-title">\${tipo === 'exclusividad' ? 'Contrato de Corretaje con Exclusividad' : 'Contrato de Servicios Inmobiliarios Mensual'}</div>
  <div class="fecha">San José, Costa Rica · \${fmtDate(hoy)}</div>
</div>

<h3>Partes Contratantes</h3>
<div class="partes">
  <p><strong>EL CORREDOR:</strong> NIDO Plataforma Inmobiliaria, con domicilio en San José, Costa Rica, correo electrónico hola@nido-cr.com, sitio web www.nido-cr.com (en adelante "NIDO").</p>
  <p><strong>EL PROPIETARIO:</strong> \${prop?.nombre || '___________________'}, cédula de identidad \${prop?.cedula || '___________________'}, correo electrónico \${correo}, teléfono \${prop?.telefono || '___________________'} (en adelante "EL PROPIETARIO").</p>
</div>

<h3>Cláusula Primera — Objeto del Contrato</h3>
<p>\${tipo === 'exclusividad' ? 'EL PROPIETARIO otorga a NIDO la exclusividad para gestionar la venta de su propiedad por un período de noventa (90) días calendario contados a partir de la firma del presente contrato, es decir desde el ' + fmtDate(hoy) + ' hasta el ' + fmtDate(vencimiento) + '. Durante este período, NIDO será el único canal autorizado para gestionar, promocionar y negociar la venta de la propiedad.' : 'EL PROPIETARIO contrata los servicios de gestión inmobiliaria de NIDO en modalidad mensual, con un costo de $39.99 USD por mes, sin exclusividad. El contrato se renueva automáticamente cada mes hasta que cualquiera de las partes notifique su cancelación con al menos 5 días de anticipación.'}</p>

<h3>Cláusula Segunda — Servicios Incluidos</h3>
<p>NIDO se compromete a prestar los siguientes servicios:</p>
<ul>
  <li>Publicación de la propiedad en el portal digital de NIDO con ficha completa y fotografías</li>
  <li>Verificación de datos registrales con el Registro Nacional de Costa Rica</li>
  <li>Campaña de marketing digital en redes sociales (Instagram y Facebook)</li>
  <li>Gestión y calificación de leads y compradores interesados</li>
  <li>Asesoría en proceso de negociación y elaboración de ofertas</li>
  <li>Asesoría legal y documental durante el proceso de venta</li>
  <li>Acompañamiento hasta el proceso notarial y firma de escritura</li>
  \${tipo === 'exclusividad' ? '<li>Fotografía profesional básica de la propiedad (incluida en exclusividad)</li>' : ''}
  <li>Acceso a Valeria IA para análisis de mercado y valuación</li>
  <li>Dashboard de propietario con estadísticas en tiempo real</li>
</ul>

<h3>Cláusula Tercera — Comisión y Honorarios</h3>
<p>\${tipo === 'exclusividad' ? 'La comisión de NIDO por la venta exitosa de la propiedad será del cuatro por ciento (4%) sobre el precio final de venta acordado entre las partes. Esta comisión se devengará y será exigible únicamente al momento del cierre notarial. Si la venta no se concreta durante el período de exclusividad, NIDO no tendrá derecho a cobrar comisión alguna.' : 'EL PROPIETARIO pagará a NIDO la suma de $39.99 USD mensuales por los servicios descritos. En caso de que se concrete una venta a través de NIDO, se aplicará adicionalmente una comisión del cuatro por ciento (4%) sobre el precio final de venta.'}</p>
<p><strong>Principio de "no venta, no comisión":</strong> Si no logramos vender la propiedad durante la vigencia del contrato de exclusividad, no se cobra ningún honorario.</p>

\${tipo === 'exclusividad' ? \`
<h3>Cláusula Cuarta — Exclusividad</h3>
<p>Durante el período de exclusividad, EL PROPIETARIO se compromete a no publicar, ofrecer ni gestionar la venta de la propiedad a través de ningún otro canal, agencia, corredor o plataforma inmobiliaria. El incumplimiento de esta cláusula facultará a NIDO a reclamar una indemnización equivalente al 2% del precio de lista de la propiedad.</p>

<h3>Cláusula Quinta — Renovación y Opciones al Vencimiento</h3>
<p>Al vencimiento del período de exclusividad, EL PROPIETARIO podrá elegir entre:</p>
<ul>
  <li>a) Renovar el contrato de exclusividad por un nuevo período de 90 días bajo las mismas condiciones.</li>
  <li>b) Mantener los servicios de NIDO sin exclusividad mediante el plan mensual de $39.99 USD/mes.</li>
  <li>c) Dar por terminado el contrato sin penalización alguna.</li>
</ul>
\` : ''}

<h3>Cláusula \${tipo === 'exclusividad' ? 'Sexta' : 'Cuarta'} — Obligaciones del Propietario</h3>
<ul>
  <li>Proporcionar información veraz, completa y actualizada sobre la propiedad</li>
  <li>Mantener la documentación registral al día y libre de impedimentos legales</li>
  <li>Declarar expresamente cualquier gravamen, hipoteca, embargo o limitación sobre la propiedad</li>
  <li>Facilitar el acceso a la propiedad para visitas coordinadas por NIDO</li>
  <li>Notificar a NIDO cualquier cambio en las condiciones de la propiedad o en el precio de lista</li>
</ul>

<h3>Cláusula \${tipo === 'exclusividad' ? 'Sétima' : 'Quinta'} — Protección de Datos Personales</h3>
<p>El tratamiento de los datos personales de las partes se realizará conforme a la Ley N° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica y la Política de Privacidad de NIDO disponible en www.nido-cr.com/privacidad.</p>

<h3>Cláusula \${tipo === 'exclusividad' ? 'Octava' : 'Sexta'} — Resolución de Disputas</h3>
<p>Cualquier controversia derivada del presente contrato se resolverá preferiblemente de manera amigable. En caso de no alcanzarse un acuerdo, las partes se someten a la jurisdicción de los Tribunales de Justicia de la República de Costa Rica, con renuncia expresa a cualquier otro fuero.</p>

<div class="gaudi-box">
  <div class="gaudi-title">Instrucciones para firma digital con GAUDI</div>
  <div class="gaudi-text">
    Este contrato debe ser firmado digitalmente utilizando el sistema GAUDI (Gestión y Administración Unificada Digital de Identidad) del Ministerio de Ciencia, Innovación, Tecnología y Telecomunicaciones de Costa Rica.<br><br>
    1. Descargue este PDF en su dispositivo.<br>
    2. Ingrese a <strong>gaudi.go.cr</strong> con su firma digital o tarjeta de identificación.<br>
    3. Seleccione "Firmar documento" y cargue este PDF.<br>
    4. Complete el proceso de firma con su certificado digital.<br>
    5. Descargue el documento firmado (archivo .pdf con sello digital).<br>
    6. Súbalo en su panel de propietario en NIDO para su verificación.
  </div>
</div>

<div class="firma-section">
  <div class="firma-box">
    <div class="firma-label">Firma del Propietario</div>
    <div class="firma-espacio"></div>
    <div class="firma-nombre">\${prop?.nombre || '___________________'}</div>
    <div class="firma-cargo">Cédula: \${prop?.cedula || '___________________'}</div>
    <div class="firma-cargo">Fecha: \${fmtDate(hoy)}</div>
  </div>
  <div class="firma-box">
    <div class="firma-label">Firma NIDO</div>
    <div class="firma-espacio"></div>
    <div class="firma-nombre">NIDO Plataforma Inmobiliaria</div>
    <div class="firma-cargo">Representante Legal</div>
    <div class="firma-cargo">hola@nido-cr.com</div>
  </div>
</div>

<div class="footer">
  NIDO Plataforma Inmobiliaria · San José, Costa Rica · www.nido-cr.com · hola@nido-cr.com<br>
  Documento generado el \${fmtDate(hoy)} · Número de referencia: \${Date.now()}
</div>

</body>
</html>\`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'inline; filename="contrato-nido.html"'
    }
  })
}
