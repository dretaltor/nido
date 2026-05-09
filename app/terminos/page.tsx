'use client'

export default function Terminos() {
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

      <nav style={{ borderBottom:'1px solid var(--rule)', padding:'16px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', position:'sticky', top:0, zIndex:50 }}>
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
        <a href="/propiedades" style={{ fontSize:13, color:'var(--ink-3)' }}>Volver al portal →</a>
      </nav>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 24px 80px' }}>

        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Legal</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1, marginBottom:12 }}>
            Términos de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>uso.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)' }}>
            Última actualización: mayo 2026 · Aplica para todos los usuarios de NIDO en Costa Rica.
          </p>
        </div>

        <div className="section">
          <h2>1. Aceptación de los términos</h2>
          <p>Al registrarte y usar NIDO, aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna parte, no podés usar la plataforma. El uso continuado después de cambios implica aceptación de los nuevos términos.</p>
        </div>

        <div className="section">
          <h2>2. Descripción del servicio</h2>
          <p>NIDO es una plataforma digital que conecta asesores inmobiliarios, propietarios y compradores en Costa Rica. Ofrecemos:</p>
          <ul>
            <li>Portal de publicación y búsqueda de propiedades</li>
            <li>CRM de leads para asesores inmobiliarios</li>
            <li>Asistente de inteligencia artificial (Valeria)</li>
            <li>Academia inmobiliaria con cursos y certificaciones</li>
            <li>Panel de gestión para propietarios</li>
            <li>Sistema de verificación de identidad (KYC)</li>
          </ul>
        </div>

        <div className="section">
          <h2>3. Registro y cuentas</h2>
          <h3>3.1 Elegibilidad</h3>
          <p>Podés usar NIDO si tenés al menos 18 años y capacidad legal para celebrar contratos según la legislación costarricense.</p>
          <h3>3.2 Responsabilidad de la cuenta</h3>
          <p>Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Debés notificarnos de inmediato ante cualquier uso no autorizado.</p>
          <h3>3.3 Información veraz</h3>
          <p>Te comprometés a proporcionar información veraz, precisa y actualizada. NIDO puede suspender cuentas con información falsa o engañosa.</p>
        </div>

        <div className="section">
          <h2>4. Reglas para asesores inmobiliarios</h2>
          <ul>
            <li>Debés contar con licencia o habilitación vigente para ejercer como asesor inmobiliario en Costa Rica.</li>
            <li>La información de las propiedades publicadas debe ser veraz, precisa y autorizada por el propietario.</li>
            <li>No podés publicar propiedades con gravámenes o limitaciones legales que impidan su libre disposición sin declararlo explícitamente.</li>
            <li>Las fotos deben ser reales y corresponder a la propiedad anunciada.</li>
            <li>Está prohibido publicar precios inflados, información engañosa o realizar prácticas de fraude inmobiliario.</li>
            <li>NIDO se reserva el derecho de verificar cualquier propiedad publicada y rechazar o eliminar publicaciones que no cumplan con los estándares de la plataforma.</li>
          </ul>
        </div>

        <div className="section">
          <h2>5. Verificación de propiedades (KYC registral)</h2>
          <p>Todas las propiedades publicadas en NIDO pasan por un proceso de verificación registral antes de ser visibles en el portal público. Al publicar una propiedad:</p>
          <ul>
            <li>Declarás que la información registral proporcionada es veraz y actualizada.</li>
            <li>Confirmás que la propiedad está libre de gravámenes, hipotecas, embargos o anotaciones que impidan su venta, o declarás expresamente su existencia.</li>
            <li>Autorizás a NIDO a verificar la información con el Registro Nacional de Costa Rica.</li>
          </ul>
          <p>NIDO no publica propiedades con limitaciones legales no declaradas. La falsedad en esta declaración puede resultar en la suspensión permanente de la cuenta y acciones legales.</p>
        </div>

        <div className="section">
          <h2>6. Planes y pagos</h2>
          <h3>6.1 Planes disponibles</h3>
          <p>NIDO ofrece planes Gratis, Pro ($49/mes) y Enterprise ($129/mes). Los precios pueden cambiar con 30 días de aviso previo.</p>
          <h3>6.2 Facturación</h3>
          <p>Los planes de pago se facturan mensual o anualmente según tu selección. El pago se procesa a través de Stripe con renovación automática.</p>
          <h3>6.3 Cancelación y reembolsos</h3>
          <p>Podés cancelar tu suscripción en cualquier momento. No ofrecemos reembolsos por períodos parciales en planes mensuales. Los planes anuales no tienen reembolso una vez iniciado el período.</p>
          <h3>6.4 Prueba gratuita</h3>
          <p>Los planes Pro y Enterprise incluyen 7 días de prueba gratuita. Si cancelás antes del día 7, no se realiza ningún cobro.</p>
        </div>

        <div className="section">
          <h2>7. Propiedad intelectual</h2>
          <p>NIDO y todo su contenido (diseño, código, marca, Valeria IA) son propiedad exclusiva de NIDO. No podés reproducir, modificar, distribuir ni usar el nombre o marca NIDO sin autorización escrita.</p>
          <p>Al publicar contenido en la plataforma (fotos, descripciones), otorgás a NIDO una licencia no exclusiva para mostrar ese contenido en la plataforma y materiales de marketing asociados.</p>
        </div>

        <div className="section">
          <h2>8. Limitación de responsabilidad</h2>
          <p>NIDO es una plataforma de intermediación. No somos parte en las transacciones inmobiliarias entre asesores, propietarios y compradores. No garantizamos:</p>
          <ul>
            <li>La exactitud de la información publicada por terceros.</li>
            <li>El resultado de ninguna transacción inmobiliaria.</li>
            <li>La disponibilidad ininterrumpida del servicio.</li>
          </ul>
          <p>En ningún caso nuestra responsabilidad excederá el monto pagado por el usuario en los últimos 3 meses.</p>
        </div>

        <div className="section">
          <h2>9. Conductas prohibidas</h2>
          <ul>
            <li>Publicar información falsa, engañosa o fraudulenta.</li>
            <li>Usar la plataforma para actividades ilegales o contrarias a la legislación costarricense.</li>
            <li>Intentar acceder sin autorización a sistemas o datos de NIDO o de otros usuarios.</li>
            <li>Hacer scraping o extracción automatizada de datos.</li>
            <li>Usar la IA Valeria para generar contenido fraudulento o engañoso.</li>
            <li>Suplantar la identidad de otro asesor, propietario o de NIDO.</li>
          </ul>
          <p>El incumplimiento puede resultar en suspensión inmediata de la cuenta y acciones legales.</p>
        </div>

        <div className="section">
          <h2>10. Resolución de disputas</h2>
          <p>Cualquier disputa derivada del uso de NIDO se resolverá preferiblemente de forma amigable. En caso de no llegar a un acuerdo, las partes se someten a la jurisdicción de los Tribunales de Justicia de la República de Costa Rica, con renuncia expresa a cualquier otro fuero.</p>
        </div>

        <div>
          <h2>11. Contacto</h2>
          <p>Para consultas sobre estos términos: <a href="mailto:legal@nido-cr.com">legal@nido-cr.com</a></p>
          <p>NIDO · San José, Costa Rica · <a href="/privacidad">Política de privacidad</a></p>
        </div>

      </div>

      <footer style={{ borderTop:'1px solid var(--rule)', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white' }}>
        <a href="/" style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
        <p style={{ fontSize:12, color:'var(--ink-3)' }}>© 2026 NIDO · Costa Rica</p>
        <a href="/privacidad" style={{ fontSize:13, color:'var(--ink-3)' }}>Política de privacidad →</a>
      </footer>
    </main>
  )
}
