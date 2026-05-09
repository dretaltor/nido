import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, tipo, data } = await req.json()

    const templates: Record<string, { subject: string, html: string }> = {
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
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">Hola ${data?.asesor_nombre || 'asesor'},</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Recibiste una consulta para <strong>${data?.propiedad}</strong>.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Datos del interesado</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:120px">Nombre</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${data?.comprador_nombre}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Correo</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${data?.comprador_email}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${data?.comprador_telefono}</td></tr>
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
            <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0D1F15;margin:0 0 16px">${data?.asunto}</h2>
            <div style="font-size:15px;color:#374151;line-height:1.75;white-space:pre-wrap">${data?.mensaje}</div>
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
            <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0D1F15;margin:0 0 8px">Hola ${data?.asesor_nombre || 'asesor'},</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Recibiste una nueva oferta para <strong>${data?.propiedad}</strong>.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F3;border:1px solid #C8E6D4;border-radius:12px;margin-bottom:24px">
            <tr><td style="padding:20px 24px">
              <p style="font-size:12px;font-weight:600;color:#1B5E3B;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">Detalle de la oferta</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;color:#6B7280;width:140px">Comprador</td><td style="padding:8px 0;border-bottom:1px solid #E5E3DC;font-size:13px;font-weight:500;color:#0D1F15">${data?.comprador_nombre}</td></tr>
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
            <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:400;color:#0D1F15;margin:0 0 12px">Tu plan ${data?.plan || 'Pro'} esta activo.</h1>
            <p style="font-size:15px;color:#6B7280;line-height:1.65;margin:0 0 24px">Gracias por suscribirte a NIDO. Tu cuenta ya tiene acceso completo a todas las funciones del plan ${data?.plan || 'Pro'}.</p>
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
                <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;font-style:italic">"Bienvenido al plan ${data?.plan || 'Pro'}. Estoy lista para ayudarte a publicar propiedades, gestionar leads y cerrar mas rapido. Nos vemos en el dashboard."</p>
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
    return NextResponse.json({ success: true, id: result.id })
  } catch (error: any) {
    console.error('Email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
