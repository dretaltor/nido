import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

function esc(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY no configurado en Vercel — correos deshabilitados')
      return NextResponse.json({ error: 'Servicio de correo no configurado' }, { status: 503 })
    }

    const permitido = await checkRateLimit('email:' + getClientIp(req), 20, 10)
    if (!permitido) {
      return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
    }

    const { to, tipo, data } = await req.json()

    // Plantillas oficiales que solo el admin debe poder disparar (texto libre o anuncios de aprobacion)
    const TIPOS_SOLO_ADMIN = ['mensaje_admin', 'kyc_aprobado', 'propiedad_aprobada', 'equipo_nido_aprobado']
    if (TIPOS_SOLO_ADMIN.includes(tipo)) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (!user) return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 })
      const { data: esAdmin } = await supabaseAdmin.from('admins').select('correo').eq('correo', user.email).maybeSingle()
      if (!esAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const templates: Record<string, { subject: string, html: string }> = {
      contrato_aprobado: {
        subject: '✅ Tu contrato NIDO está activo — podés publicar tu propiedad',
        html: `<html><body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0D1F15;margin:0 0 12px">¡Tu contrato está activo!</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 20px">Hola ${esc(data?.nombre)}, tu contrato de ${data?.tipo === 'exclusividad' ? 'exclusividad de 90 días' : 'servicios mensual'} con NIDO fue aprobado y está activo. Ya podés publicar tu propiedad.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard/propietario" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ir a mi panel →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:12px;color:#9CA3AF;margin:0">¿Dudas? Escribinos a <a href="mailto:hola@nido-cr.com" style="color:#1B5E3B">hola@nido-cr.com</a></p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body></html>`
      },
      nuevo_contrato: {
        subject: '📋 Nuevo contrato firmado · NIDO · Requiere contrafirma',
        html: `<html><body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 16px">Nuevo contrato firmado</h1>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:13px;color:#374151;margin:0 0 8px"><strong>Propietario:</strong> ${esc(data?.nombre)}</p>
              <p style="font-size:13px;color:#374151;margin:0 0 8px"><strong>Correo:</strong> ${esc(data?.correo)}</p>
              <p style="font-size:13px;color:#374151;margin:0 0 8px"><strong>Tipo:</strong> ${data?.tipo === 'exclusividad' ? 'Exclusividad' : data?.tipo === 'no_exclusivo' ? 'No exclusivo (push de venta)' : data?.tipo === 'mensual' ? 'Mensual (legado)' : esc(data?.tipo)}</p>
              <p style="font-size:13px;color:#374151;margin:0"><strong>Firma:</strong> ${data?.firma === 'digital' ? 'Digital (canvas)' : 'Física escaneada'}</p>
            </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/admin" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Revisar y contrafirmar →</a>
            </td></tr></table>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body></html>`
      },
      nuevo_propietario: {
        subject: '🏠 Nuevo propietario registrado · NIDO · Requiere verificación',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Nuevo Propietario · Requiere Verificación</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0D1F15;margin:0 0 16px">Nuevo propietario registrado</h1>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Datos del propietario</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:120px">Nombre</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.nombre)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Correo</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.correo)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.telefono || '—')}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Cédula</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.cedula || '—')}</td></tr>
                <tr><td style="padding:8px 0;font-size:13px;color:#6B7280">Relación</td><td style="padding:8px 0;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.relacion || '—')}</td></tr>
              </table>
            </td></tr>
            </table>
            <div style="background:#FEF9F0;border:1px solid #F5E6C8;border-radius:10px;padding:16px 20px;margin-bottom:24px">
              <p style="font-size:12px;font-weight:600;color:#92600A;margin:0 0 6px;text-transform:uppercase">⚠️ Acción requerida</p>
              <p style="font-size:13px;color:#374151;line-height:1.6;margin:0">Contactar al propietario para agendar verificación de identidad y visita a la propiedad. El perfil está en estado <strong>pendiente_docs</strong> hasta que subas los documentos.</p>
            </div>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/admin" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en backoffice →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0">NIDO · Backoffice Administrativo · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      nuevo_propietario_bienvenida: {
        subject: 'Bienvenido a NIDO · Próximos pasos para verificar tu propiedad',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Plataforma Inmobiliaria · Costa Rica</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">Hola ${esc(data?.nombre)},</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Gracias por registrarte en NIDO. Antes de publicar tu propiedad, necesitamos verificar tu identidad y la información registral. Es un proceso simple que garantiza la seguridad de todos.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              ${['Subí tu cédula (frente y reverso) y un selfie sosteniéndola en tu dashboard.', 'Un asesor NIDO te contactará en las próximas 24 horas para coordinar una llamada o visita.', 'Una vez verificado, tu propiedad se publicará en el portal y empezarás a recibir leads.'].map((paso, i) => `
              <tr><td style="padding:12px 0;border-bottom:1px solid #E5E3DC;display:flex;gap:12px;align-items:flex-start">
                <td style="width:28px;height:28px;border-radius:50%;background:#1B5E3B;color:white;text-align:center;line-height:28px;font-size:12px;font-weight:600;flex-shrink:0">${i+1}</td>
                <td style="font-size:14px;color:#374151;line-height:1.6;padding-left:12px">${paso}</td>
              </td></tr>`).join('')}
            </table>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard/propietario" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ir a mi panel →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:12px;color:#9CA3AF;margin:0">¿Dudas? Escribinos a <a href="mailto:hola@nido-cr.com" style="color:#1B5E3B">hola@nido-cr.com</a></p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      nuevo_lead: {
        subject: 'Nueva consulta · ' + (data?.propiedad || 'Tu propiedad') + ' · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Nueva Consulta de Comprador</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">Hola ${esc(data?.asesor_nombre || 'asesor')},</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Recibiste una consulta para <strong>${esc(data?.propiedad)}</strong>.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Datos del interesado</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:120px">Nombre</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.comprador_nombre)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Correo</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.comprador_email)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.comprador_telefono)}</td></tr>
                ${data?.mensaje ? '<tr><td style="padding:8px 0;font-size:13px;color:#6B7280;vertical-align:top">Mensaje</td><td style="padding:8px 0;font-size:13px;color:#0D1F15">' + data.mensaje + '</td></tr>' : ''}
              </table>
            </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en mi dashboard →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      nueva_visita: {
        subject: 'Nueva visita agendada · ' + (data?.propiedad || 'Tu propiedad') + ' · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Nueva Visita Agendada</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">Hola ${esc(data?.asesor_nombre || 'asesor')},</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Te agendaron una visita para <strong>${esc(data?.propiedad)}</strong>.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Detalle de la visita</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:140px">Comprador</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.comprador_nombre)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.comprador_telefono)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Fecha</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.fecha)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Hora</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.hora)}</td></tr>
                <tr><td style="padding:8px 0;font-size:13px;color:#6B7280">Tipo</td><td style="padding:8px 0;font-size:13px;font-weight:500;color:#0D1F15">${data?.tipo === 'virtual' ? 'Virtual' : 'Presencial'}</td></tr>
                ${data?.notas ? '<tr><td style="padding:8px 0;font-size:13px;color:#6B7280;vertical-align:top">Notas</td><td style="padding:8px 0;font-size:13px;color:#0D1F15">' + data.notas + '</td></tr>' : ''}
              </table>
            </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en mi dashboard →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      kyc_aprobado: {
        subject: '✓ Tu identidad fue verificada · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Verificación Aprobada</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">¡Felicidades, ${esc(data?.nombre || 'asesor')}!</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Tu identidad fue verificada y aprobada. Ya podés publicar propiedades en NIDO.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard/nueva-propiedad" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Publicar mi primera propiedad →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      equipo_nido_aprobado: {
        subject: '✓ ¡Bienvenido al Equipo NIDO!',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Equipo NIDO</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">¡Bienvenido, ${esc(data?.nombre || 'asesor')}!</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Tu solicitud para unirte al Equipo NIDO fue aprobada. Falta un último paso: firmar el addendum con los términos de comisión 50/50 y los beneficios exclusivos del equipo.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard/contrato-equipo-nido" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver y firmar addendum →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      propiedad_aprobada: {
        subject: '✓ Tu propiedad ya está publicada · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Propiedad Publicada</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">¡Listo, ${esc(data?.asesor_nombre || 'asesor')}!</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px"><strong>${esc(data?.propiedad)}</strong> fue aprobada y ya está visible en el portal público.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/propiedades/${esc(data?.propiedad_id || '')}" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver mi ficha publicada →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      mensaje_admin: {
        subject: data?.asunto || 'Mensaje del equipo NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Mensaje del equipo NIDO</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 16px">${esc(data?.asunto)}</h2>
            <div style="font-size:15px;color:#374151;line-height:1.75;white-space:pre-wrap">${esc(data?.mensaje)}</div>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <p style="font-size:12px;color:#9CA3AF;margin:0 0 8px">NIDO · Plataforma Inmobiliaria de Costa Rica</p>
              <p style="font-size:11px;color:#9CA3AF;margin:0">© 2026 NIDO. Todos los derechos reservados.</p>
            </td></tr></table>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      nueva_oferta: {
        subject: 'Nueva oferta recibida · ' + (data?.propiedad || 'Tu propiedad') + ' · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Nueva Oferta Recibida</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">Hola ${esc(data?.asesor_nombre || 'asesor')},</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Recibiste una nueva oferta para <strong>${esc(data?.propiedad)}</strong>.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Detalle de la oferta</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:140px">Comprador</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.comprador_nombre)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Valor ofertado</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:16px;font-weight:600;color:#1B5E3B">$${Number(data?.valor_oferta?.replace?.(/,/g,'')||0).toLocaleString()} USD</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Tipo de compra</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${data?.tipo_compra === 'contado' ? 'Contado' : 'Crédito bancario'}</td></tr>
                ${data?.condiciones ? '<tr><td style="padding:8px 0;font-size:13px;color:#6B7280;vertical-align:top">Condiciones</td><td style="padding:8px 0;font-size:13px;color:#0D1F15">' + data.condiciones + '</td></tr>' : ''}
              </table>
            </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en mi dashboard →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <p style="font-size:12px;color:#9CA3AF;margin:0 0 8px">NIDO · Plataforma Inmobiliaria de Costa Rica</p>
              <p style="font-size:11px;color:#9CA3AF;margin:0">© 2026 NIDO. Todos los derechos reservados.</p>
            </td></tr></table>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      solicitud_resena: {
        subject: '¿Cómo te fue en tu visita a ' + (data?.propiedad || 'la propiedad') + '? · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px;text-align:center">
            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0D1F15;margin:0 0 12px">Hola ${esc(data?.comprador_nombre || '')}, ¿cómo te fue?</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Nos encantaría conocer tu experiencia visitando <strong>${esc(data?.propiedad || 'la propiedad')}</strong>. Tu opinión toma menos de un minuto y ayuda a otros compradores.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="${esc(data?.link)}" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Dejar mi reseña →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      lead_sin_seguimiento: {
        subject: '⏰ Lead sin seguimiento hace ' + (data?.dias || '2') + ' días · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 12px">Hola ${esc(data?.asesor_nombre || '')}, tenés un lead esperando</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 20px"><strong>${esc(data?.lead_nombre || 'Un interesado')}</strong> ${esc(data?.zona ? 'busca en ' + data.zona : '')} y todavía no tiene seguimiento después de ${esc(data?.dias || '2')} días. Los leads que se contactan rápido cierran más — no lo dejés enfriar.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard/crm" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en mi CRM →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      leads_sin_asignar: {
        subject: '📋 ' + (data?.cantidad || '1') + ' lead(s) sin asesor asignado · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 12px">Hay leads sin asignar</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 20px">${esc(data?.cantidad || '1')} lead(s) llevan más de ${esc(data?.dias || '2')} días sin un asesor asignado. Repartilos para no perder la oportunidad.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/admin" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en /admin →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      alerta_baja_precio: {
        subject: '📉 Bajó de precio: ' + (data?.titulo || 'una propiedad') + ' · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 12px">Bajó de precio una propiedad que te interesa</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 20px"><strong>${esc(data?.titulo)}</strong> en ${esc(data?.zona)} bajó de <span style="text-decoration:line-through;color:#9CA3AF">$${esc(data?.precioAnterior ? Number(data.precioAnterior).toLocaleString('en-US') : '')}</span> a <strong style="color:#1B5E3B">$${esc(data?.precioNuevo ? Number(data.precioNuevo).toLocaleString('en-US') : '')}</strong>.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="${esc(data?.link)}" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver propiedad →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0 0 6px">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
            <a href="${esc(data?.bajaLink)}" style="font-size:11px;color:#9CA3AF">Dejar de recibir estas alertas</a>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      alerta_nueva_propiedad: {
        subject: '🏠 Nueva propiedad que coincide con tu búsqueda · NIDO',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 12px">Encontramos algo para vos</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 20px">Se publicó una propiedad que coincide con tu búsqueda guardada: <strong>${esc(data?.titulo)}</strong> en ${esc(data?.zona)} — $${esc(data?.precio ? Number(data.precio).toLocaleString('en-US') : '')}.</p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="${esc(data?.link)}" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver propiedad →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0 0 6px">NIDO · Plataforma Inmobiliaria de Costa Rica · © 2026</p>
            <a href="${esc(data?.bajaLink)}" style="font-size:11px;color:#9CA3AF">Dejar de recibir estas alertas</a>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      nuevo_ticket_soporte: {
        subject: '🎫 Nuevo ticket de soporte · ' + (data?.usuario_tipo || 'usuario') + ' · ' + (data?.asunto || 'NIDO'),
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Nuevo Ticket de Soporte</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 16px">${esc(data?.asunto || 'Consulta de soporte')}</h1>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Datos del solicitante</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:120px">Nombre</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.usuario_nombre)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Correo</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.usuario_email)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.usuario_telefono || '—')}</td></tr>
                <tr><td style="padding:8px 0;font-size:13px;color:#6B7280">Tipo</td><td style="padding:8px 0;font-size:13px;font-weight:500;color:#0D1F15">${esc(data?.usuario_tipo)}</td></tr>
              </table>
            </td></tr>
            </table>
            ${data?.resumen ? `<div style="background:#FEF9F0;border:1px solid #F5E6C8;border-radius:10px;padding:16px 20px;margin-bottom:24px">
              <p style="font-size:12px;font-weight:600;color:#92600A;margin:0 0 6px;text-transform:uppercase">Resumen de la conversación</p>
              <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;white-space:pre-wrap">${esc(data.resumen)}</p>
            </div>` : ''}
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/admin" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ver en bandeja de soporte →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:20px 40px;border-top:1px solid #E5E3DC;text-align:center">
            <p style="font-size:11px;color:#9CA3AF;margin:0">NIDO · Backoffice Administrativo · © 2026</p>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      },
      suscripcion_exitosa: {
        subject: 'Bienvenido a NIDO ' + (data?.plan || 'Pro') + ' · Tu suscripcion esta activa',
        html: `
        <html>
        <body style="margin:0;padding:0;background:#F4F3EF;font-family:'DM Sans',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3EF;padding:40px 0">
        <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E3DC">
          <tr><td style="background:#0D1F15;padding:28px 40px;text-align:center">
            <span style="font-family:Georgia,serif;font-size:28px;color:white;letter-spacing:2px">NIDO<span style="color:#C8A96E">.</span></span>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Plataforma Inmobiliaria · Costa Rica</p>
          </td></tr>
          <tr><td style="padding:40px 40px 32px">
            <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:400;color:#0D1F15;margin:0 0 12px">Tu plan ${esc(data?.plan || 'Pro')} esta activo.</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Gracias por suscribirte a NIDO. Tu cuenta ya tiene acceso completo a todas las funciones del plan ${esc(data?.plan || 'Pro')}.</p>
            <table cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;width:100%;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em">Lo que tenes disponible ahora</p>
              ${data?.plan === 'enterprise' ? `
              <p style="font-size:13px;color:#374151;line-height:1.8;margin:0">
                ✓ Propiedades ilimitadas<br>
                ✓ Valeria IA con memoria y contexto<br>
                ✓ CRM avanzado con score de leads<br>
                ✓ Tours 360 ilimitados<br>
                ✓ Academia completa + certificaciones<br>
                ✓ Soporte prioritario en 2 horas<br>
                ✓ Panel propietario avanzado
              </p>` : `
              <p style="font-size:13px;color:#374151;line-height:1.8;margin:0">
                ✓ 15 propiedades publicadas<br>
                ✓ Valeria IA 24/7<br>
                ✓ CRM de leads completo<br>
                ✓ Academia NIDO completa<br>
                ✓ Tour 360 (1 por mes)<br>
                ✓ Soporte en 24 horas
              </p>`}
            </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="https://www.nido-cr.com/dashboard" style="display:inline-block;background:#1B5E3B;color:white;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none">Ir a mi dashboard →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="padding:0 40px 32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;padding:18px">
            <tr>
              <td width="40" valign="top">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1B5E3B,#0D3D20);text-align:center;line-height:36px;font-family:Georgia,serif;font-size:16px;font-style:italic;color:#C8A96E">V</div>
              </td>
              <td style="padding-left:12px">
                <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em">Valeria · Tu mentora IA</p>
                <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;font-style:italic">"Bienvenido al plan ${esc(data?.plan || 'Pro')}. Estoy lista para ayudarte a publicar propiedades, gestionar leads y cerrar mas rapido. Nos vemos en el dashboard."</p>
              </td>
            </tr>
            </table>
          </td></tr>
          <tr><td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E5E3DC">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <p style="font-size:12px;color:#9CA3AF;margin:0 0 8px">NIDO · Plataforma Inmobiliaria de Costa Rica</p>
              <p style="font-size:12px;color:#9CA3AF;margin:0 0 8px">
                <a href="https://www.nido-cr.com/propiedades" style="color:#1B5E3B;text-decoration:none">Portal</a> &nbsp;·&nbsp;
                <a href="https://www.nido-cr.com/academia" style="color:#1B5E3B;text-decoration:none">Academia</a> &nbsp;·&nbsp;
                <a href="https://www.nido-cr.com/precios" style="color:#1B5E3B;text-decoration:none">Planes</a>
              </p>
              <p style="font-size:11px;color:#9CA3AF;margin:0">© 2026 NIDO. Todos los derechos reservados.</p>
            </td></tr></table>
          </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`
      }
    }

    const template = templates[tipo]
    if (!template) return NextResponse.json({ error: 'Tipo no valido' }, { status: 400 })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NIDO <hola@nido-cr.com>',
        to,
        subject: template.subject,
        html: template.html,
      })
    })

    const result = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(result))
    // Send WhatsApp notification if phone available
    if (data?.asesor_telefono || data?.telefono || data?.asesor_whatsapp) {
      const phone = data.asesor_telefono || data.telefono || data.asesor_whatsapp
      const waMsg = tipo === 'nuevo_lead' 
        ? `🏠 *Nuevo lead NIDO*\n\nPropiedad: ${esc(data?.propiedad || '—')}\nNombre: ${esc(data?.nombre || '—')}\nTeléfono: ${esc(data?.telefono || '—')}\nMensaje: ${esc(data?.mensaje || '—')}\n\nRespondé rápido — los primeros 2 min son clave.`
        : tipo === 'nueva_oferta'
        ? `💼 *Nueva oferta NIDO*\n\nPropiedad: ${esc(data?.propiedad || '—')}\nComprador: ${esc(data?.comprador || '—')}\nOferta: ${esc(data?.monto || '—')}\n\nRevisá tu dashboard para ver los detalles.`
        : tipo === 'kyc_aprobado'
        ? `✓ *Identidad verificada — NIDO*\n\n¡Felicidades! Tu KYC fue aprobado. Ya podés publicar propiedades en NIDO.\n\n🌐 nido-cr.com/dashboard/nueva-propiedad`
        : tipo === 'propiedad_aprobada'
        ? `✓ *Propiedad publicada — NIDO*\n\n${esc(data?.propiedad || 'Tu propiedad')} ya está visible en el portal público.\n\n🌐 nido-cr.com/propiedades/${esc(data?.propiedad_id || '')}`
        : null
      
      if (waMsg) {
        const { sendWhatsApp } = await import('../../../lib/whatsapp')
        await sendWhatsApp(phone, waMsg).catch(() => {})
      }
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
