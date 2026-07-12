'use client'
import Link from 'next/link'

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
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
        <Link href="/propiedades" style={{ fontSize:13, color:'var(--ink-3)' }}>Volver al portal →</Link>
      </nav>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 24px 80px' }}>

        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Legal</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,52px)', fontWeight:400, lineHeight:1.1, marginBottom:12 }}>
            Términos de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>uso.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)' }}>
            Última actualización: julio 2026 · Aplica para todos los usuarios de NIDO en Costa Rica.
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
          <p>NIDO ofrece los planes Despega (gratuito, hasta 5 propiedades), Elite ($59/mes) y Black ($99/mes). Los precios y características vigentes de cada plan se publican en <a href="/precios">nido-cr.com/precios</a> y prevalecen sobre cualquier monto mencionado en otro lugar. Los precios pueden cambiar con 30 días de aviso previo.</p>
          <h3>6.2 Facturación</h3>
          <p>Actualmente la activación y renovación de los planes de pago se gestiona de forma manual por el equipo de NIDO, tras confirmar el pago realizado por los medios que se te indiquen al momento de suscribirte (no se procesa mediante cobro automático recurrente con tarjeta en este momento). Si en el futuro NIDO incorpora un procesador de pagos automatizado, esta sección y la Política de Privacidad se actualizarán para reflejarlo antes de su entrada en vigencia.</p>
          <h3>6.3 Cancelación y reembolsos</h3>
          <p>Podés cancelar tu suscripción en cualquier momento escribiendo a <a href="mailto:hola@nido-cr.com">hola@nido-cr.com</a>. No ofrecemos reembolsos por períodos parciales ya facturados, salvo que la ley costarricense aplicable disponga lo contrario.</p>
          <h3>6.4 Prueba gratuita</h3>
          <p>Toda cuenta nueva de asesor inicia con 7 días de prueba gratuita del plan Black. Si no activás un plan de pago antes de que termine la prueba, tu cuenta pasa automáticamente al plan Despega (gratuito, con las limitaciones indicadas en /precios) sin que se realice ningún cobro.</p>
          <h3>6.5 Participación de NIDO en comisiones de cierre</h3>
          <p>Como regla general, NIDO no es parte en la comisión de corretaje pactada entre un Asesor independiente y el Propietario o comprador: esa comisión se negocia y se cobra directamente entre ellos, sin participación de NIDO. Existen dos excepciones en las que NIDO sí participa económicamente y gana comisión: (a) cuando el cierre lo gestiona un Asesor del Equipo NIDO, caso en el que la comisión se reparte 50%/50% entre el Asesor y NIDO conforme al Addendum Equipo NIDO; y (b) cuando el Propietario contrata directamente los servicios de corretaje de NIDO, caso en el que NIDO actúa como corredor y cobra la comisión pactada (actualmente 4% del precio de venta) conforme al Contrato de Corretaje con Propietarios. Fuera de esos dos escenarios, NIDO no recibe ninguna parte de la comisión de venta.</p>
        </div>

        <div className="section">
          <h2>7. Propiedad intelectual</h2>
          <p>NIDO y todo su contenido (diseño, código, marca, Valeria IA) son propiedad exclusiva de NIDO. No podés reproducir, modificar, distribuir ni usar el nombre o marca NIDO sin autorización escrita.</p>
          <p>Al publicar contenido en la plataforma (fotos, descripciones), otorgás a NIDO una licencia no exclusiva para mostrar ese contenido en la plataforma y materiales de marketing asociados.</p>
        </div>

        <div className="section">
          <h2>8. Limitación de responsabilidad</h2>
          <p>NIDO opera como plataforma de intermediación tecnológica para la generalidad de las transacciones entre Asesores independientes, Propietarios y compradores, y no es parte en esas negociaciones. La excepción son los dos escenarios descritos en la Sección 6.5 (cierres gestionados por el Equipo NIDO y contratos de corretaje directo con Propietarios), en los que NIDO sí es parte interesada y beneficiaria económica de la comisión. Fuera de esos dos escenarios, NIDO no garantiza:</p>
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
          <h2>10. Validez de la aceptación electrónica</h2>
          <p>La aceptación de estos Términos mediante un clic, casilla de verificación o mecanismo electrónico equivalente constituye una manifestación de voluntad válida y vinculante, con la misma fuerza probatoria que una firma autógrafa, conforme a la Ley N° 8454 de Certificados, Firmas Digitales y Documentos Electrónicos de Costa Rica. NIDO conserva un registro electrónico de la fecha, hora y versión del documento aceptado por cada usuario.</p>
        </div>

        <div className="section">
          <h2>11. Modificaciones a estos términos</h2>
          <p>NIDO puede modificar estos Términos de Uso en cualquier momento. Los cambios sustanciales se notificarán por correo electrónico o aviso dentro de la plataforma con al menos 15 días de anticipación a su entrada en vigencia. El uso continuado de NIDO después de esa fecha implica la aceptación de los nuevos términos.</p>
        </div>

        <div className="section">
          <h2>12. Fuerza mayor</h2>
          <p>NIDO no será responsable por incumplimientos o retrasos causados por circunstancias fuera de su control razonable, incluyendo fallas de proveedores de infraestructura (hosting, base de datos, conectividad), desastres naturales, actos de autoridad, o interrupciones generalizadas de internet.</p>
        </div>

        <div className="section">
          <h2>13. Divisibilidad y cesión</h2>
          <p>Si alguna disposición de estos Términos fuera declarada inválida o inaplicable por un tribunal competente, las demás disposiciones permanecerán en pleno vigor. NIDO puede ceder estos Términos, en todo o en parte, en caso de fusión, adquisición o venta de activos, previo aviso al usuario. El usuario no puede ceder sus derechos u obligaciones bajo estos Términos sin autorización escrita de NIDO.</p>
        </div>

        <div className="section">
          <h2>14. Resolución de disputas</h2>
          <p>Cualquier disputa derivada del uso de NIDO se resolverá preferiblemente de forma amigable. En caso de no llegar a un acuerdo, las partes se someten a la jurisdicción de los Tribunales de Justicia de la República de Costa Rica, con renuncia expresa a cualquier otro fuero.</p>
        </div>

        <div>
          <h2>15. Contacto</h2>
          <p>Para consultas sobre estos términos: <a href="mailto:legal@nido-cr.com">legal@nido-cr.com</a></p>
          <p>NIDO · San José, Costa Rica · <a href="/privacidad">Política de privacidad</a></p>
        </div>

      </div>

      <footer style={{ borderTop:'1px solid var(--rule)', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--ink)', textDecoration:'none' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
        <p style={{ fontSize:12, color:'var(--ink-3)' }}>© 2026 NIDO · Costa Rica</p>
        <a href="/privacidad" style={{ fontSize:13, color:'var(--ink-3)' }}>Política de privacidad →</a>
      </footer>
    </main>
  )
}
