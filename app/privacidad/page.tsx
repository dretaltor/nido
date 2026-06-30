'use client'

export default function Privacidad() {
  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
        a{color:var(--accent);text-decoration:none} a:hover{text-decoration:underline}
        h2{font-family:var(--serif);font-size:24px;font-weight:400;margin:40px 0 12px;color:var(--ink)}
        h3{font-size:16px;font-weight:500;margin:24px 0 8px;color:var(--ink)}
        p{font-size:15px;color:var(--ink-2);line-height:1.75;margin-bottom:12px}
        ul{padding-left:20px;margin-bottom:12px}
        li{font-size:15px;color:var(--ink-2);line-height:1.75;margin-bottom:6px}
        .section{border-bottom:1px solid var(--rule);padding-bottom:32px;margin-bottom:8px}
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom:'1px solid var(--rule)', padding:'16px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', position:'sticky', top:0, zIndex:50 }}>
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
        <a href="/propiedades" style={{ fontSize:13, color:'var(--ink-3)' }}>Volver al portal →</a>
      </nav>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Legal</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1, marginBottom:12 }}>
            Política de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>privacidad.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)' }}>
            Última actualización: julio 2026 · Rige bajo la <strong>Ley N° 8968</strong> de Protección de la Persona frente al tratamiento de sus Datos Personales de Costa Rica.
          </p>
        </div>

        <div className="section">
          <h2>1. Responsable del tratamiento</h2>
          <p>
            <strong>NIDO</strong> (en adelante "NIDO", "nosotros" o "la plataforma") es responsable del tratamiento de los datos personales recolectados a través de <a href="https://www.nido-cr.com">www.nido-cr.com</a> y sus aplicaciones asociadas.
          </p>
          <p>Para consultas sobre privacidad: <a href="mailto:privacidad@nido-cr.com">privacidad@nido-cr.com</a></p>
        </div>

        <div className="section">
          <h2>2. Datos que recopilamos</h2>
          <h3>2.1 Datos que nos proporcionás directamente</h3>
          <ul>
            <li>Nombre completo y número de cédula (para verificación de identidad)</li>
            <li>Correo electrónico y número de teléfono</li>
            <li>Fotografía de perfil y documentos de identidad (frente y reverso de cédula, selfie)</li>
            <li>Información de propiedades: ubicación, precio, características, fotos</li>
            <li>Datos registrales: número de finca, plano, naturaleza, colindancias</li>
            <li>Código de corredor inmobiliario (opcional)</li>
          </ul>
          <h3>2.2 Datos que recopilamos automáticamente</h3>
          <ul>
            <li>Dirección IP y datos de navegación</li>
            <li>Tipo de dispositivo y navegador</li>
            <li>Páginas visitadas y tiempo de uso</li>
            <li>Interacciones con propiedades (vistas, consultas, favoritos)</li>
          </ul>
          <h3>2.3 Datos de terceros</h3>
          <ul>
            <li>Comprobante o referencia de pago cuando activás un plan pago (la activación es manual; NIDO no almacena ni procesa datos de tarjetas de crédito o débito)</li>
            <li>Datos de autenticación gestionados por Supabase Auth</li>
          </ul>
        </div>

        <div className="section">
          <h2>3. Finalidad del tratamiento</h2>
          <p>Tratamos tus datos personales para las siguientes finalidades:</p>
          <ul>
            <li><strong>Prestación del servicio:</strong> crear y gestionar tu cuenta, publicar propiedades, conectar compradores y asesores.</li>
            <li><strong>Verificación de identidad (KYC):</strong> validar la identidad de asesores inmobiliarios para garantizar la confianza en la plataforma.</li>
            <li><strong>Comunicaciones:</strong> enviarte notificaciones sobre leads, ofertas, actualizaciones del servicio y comunicados del equipo NIDO.</li>
            <li><strong>Facturación:</strong> procesar pagos de suscripciones y emitir comprobantes.</li>
            <li><strong>Mejora del servicio:</strong> análisis de uso para mejorar la experiencia de la plataforma.</li>
            <li><strong>Cumplimiento legal:</strong> atender requerimientos de autoridades competentes conforme a la ley costarricense.</li>
          </ul>
        </div>

        <div className="section">
          <h2>4. Base jurídica del tratamiento</h2>
          <p>El tratamiento de tus datos se basa en:</p>
          <ul>
            <li><strong>Consentimiento:</strong> otorgado al registrarte en la plataforma y aceptar estos términos.</li>
            <li><strong>Ejecución contractual:</strong> necesario para prestarte los servicios de NIDO.</li>
            <li><strong>Interés legítimo:</strong> para mejorar el servicio y prevenir fraudes.</li>
            <li><strong>Obligación legal:</strong> cuando lo exija la legislación costarricense.</li>
          </ul>
        </div>

        <div className="section">
          <h2>5. Conservación de los datos</h2>
          <p>Conservamos tus datos durante el tiempo que mantengas tu cuenta activa. Una vez que eliminés tu cuenta:</p>
          <ul>
            <li>Los datos de perfil se eliminan en un plazo de 30 días.</li>
            <li>Los documentos de identidad (KYC) se eliminan en un plazo de 90 días.</li>
            <li>Los datos de facturación se conservan por 5 años según la legislación fiscal costarricense.</li>
            <li>Los logs de actividad se conservan por 12 meses por razones de seguridad.</li>
          </ul>
        </div>

        <div className="section">
          <h2>6. Compartición de datos con terceros</h2>
          <p>NIDO no vende ni alquila tus datos personales. Podemos compartir información con:</p>
          <ul>
            <li><strong>Supabase:</strong> proveedor de base de datos e infraestructura (servidores en AWS).</li>
            <li><strong>Resend:</strong> envío de correos electrónicos transaccionales.</li>
            <li><strong>Anthropic:</strong> procesamiento de las conversaciones que mantenés con la IA Valeria, conforme a la política de retención y uso de datos de Anthropic para su API (no se usa para entrenar sus modelos salvo que la ley lo exija o exista abuso reportado). Consultá la política vigente de Anthropic para más detalle.</li>
            <li><strong>Vercel:</strong> hosting y despliegue de la plataforma.</li>
            <li><strong>Mapbox:</strong> generación de mapas interactivos del portal de propiedades.</li>
            <li><strong>Autoridades competentes:</strong> cuando sea requerido por ley o resolución judicial.</li>
          </ul>
          <p>Si en el futuro incorporamos un procesador de pagos de terceros (por ejemplo Stripe), actualizaremos esta sección antes de que ese proveedor reciba cualquier dato tuyo.</p>
          <p>Todos los proveedores cumplen con estándares internacionales de protección de datos.</p>
        </div>

        <div className="section">
          <h2>7. Tus derechos bajo la Ley 8968</h2>
          <p>Como titular de datos personales en Costa Rica, tenés los siguientes derechos:</p>
          <ul>
            <li><strong>Acceso:</strong> solicitar información sobre qué datos tuyos tratamos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos ("derecho al olvido").</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para finalidades específicas.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y legible por máquina.</li>
            <li><strong>Revocación del consentimiento:</strong> retirar tu consentimiento en cualquier momento.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escribinos a <a href="mailto:privacidad@nido-cr.com">privacidad@nido-cr.com</a> con el asunto "Derechos ARCO" e indicá tu nombre completo y correo registrado. Respondemos en un plazo máximo de 10 días hábiles.
          </p>
          <p>
            También podés presentar una denuncia ante la <strong>Agencia de Protección de Datos de los Habitantes (PRODHAB)</strong>: <a href="https://www.prodhab.go.cr" target="_blank">www.prodhab.go.cr</a>
          </p>
        </div>

        <div className="section">
          <h2>8. Seguridad de los datos</h2>
          <p>Implementamos medidas técnicas y organizativas para proteger tus datos:</p>
          <ul>
            <li>Cifrado en tránsito mediante TLS/HTTPS.</li>
            <li>Cifrado en reposo para datos sensibles.</li>
            <li>Autenticación de dos factores: en desarrollo, próximamente disponible para todas las cuentas.</li>
            <li>Acceso restringido por roles — solo personal autorizado puede ver datos sensibles.</li>
            <li>Auditorías de seguridad periódicas.</li>
          </ul>
          <p>En caso de una brecha de seguridad que afecte tus datos, te notificaremos dentro de las 72 horas siguientes a tener conocimiento del incidente.</p>
        </div>

        <div className="section">
          <h2>9. Cookies y tecnologías de seguimiento</h2>
          <p>NIDO utiliza cookies esenciales para el funcionamiento de la plataforma (sesión de usuario, preferencias). Próximamente implementaremos un gestor de cookies que te permitirá controlar las cookies no esenciales de analítica.</p>
          <p>No utilizamos cookies de publicidad ni compartimos datos de navegación con redes publicitarias.</p>
        </div>

        <div className="section">
          <h2>10. Transferencias internacionales</h2>
          <p>
            Algunos de nuestros proveedores (Supabase, Stripe, Vercel) procesan datos fuera de Costa Rica, principalmente en Estados Unidos. Estas transferencias se realizan bajo garantías contractuales adecuadas y con proveedores que cumplen estándares internacionales equivalentes a la Ley 8968.
          </p>
        </div>

        <div className="section">
          <h2>11. Menores de edad</h2>
          <p>
            NIDO está dirigido exclusivamente a personas mayores de 18 años. No recopilamos datos de menores de edad de forma intencional. Si identificamos que un menor ha creado una cuenta, procederemos a eliminarla de inmediato.
          </p>
        </div>

        <div>
          <h2>12. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Te notificaremos por correo electrónico sobre cambios significativos con al menos 15 días de anticipación. El uso continuado de la plataforma después de la notificación implica tu aceptación de los cambios.
          </p>
          <p>
            Para consultas: <a href="mailto:privacidad@nido-cr.com">privacidad@nido-cr.com</a>
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--rule)', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white' }}>
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
        <p style={{ fontSize:12, color:'var(--ink-3)' }}>© 2026 NIDO · Costa Rica · Ley 8968</p>
        <a href="/propiedades" style={{ fontSize:13, color:'var(--ink-3)' }}>Volver al portal →</a>
      </footer>
    </main>
  )
}
