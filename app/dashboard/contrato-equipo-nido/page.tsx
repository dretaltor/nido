'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ContratoEquipoNido() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [aceptado, setAceptado] = useState(false)
  const [aprobado, setAprobado] = useState(false)
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('perfiles').select('contrato_equipo_nido_aceptado,equipo_nido_estado').eq('id', user.id).maybeSingle()
      if (data?.contrato_equipo_nido_aceptado) setAceptado(true)
      setAprobado(data?.equipo_nido_estado === 'aprobado')
      setLoading(false)
    })
  }, [])

  const aceptar = async () => {
    if (!checked || !user) return
    setSaving(true)
    await supabase.from('perfiles').upsert({
      id: user.id,
      contrato_equipo_nido_aceptado: true,
      contrato_equipo_nido_aceptado_at: new Date().toISOString(),
    })
    setAceptado(true)
    setSaving(false)
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  if (loading) return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', color:'#999' }}>
      Cargando...
    </main>
  )

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'oklch(0.97 0.005 80)', color:'oklch(0.20 0.005 80)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500&family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'56px 24px' }}>
        <a href="/dashboard" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:'inherit', textDecoration:'none' }}>NIDO<span style={{ color:'oklch(0.42 0.06 150)' }}>.</span></a>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:400, margin:'32px 0 8px' }}>Addendum · Equipo NIDO</h1>
        <p style={{ fontSize:14, color:'oklch(0.55 0.005 80)', marginBottom:32 }}>Términos específicos para asesores incorporados al equipo interno de la inmobiliaria NIDO.</p>

        {!aprobado ? (
          <div style={{ background:'oklch(0.97 0.03 50)', border:'1px solid oklch(0.85 0.06 50)', borderRadius:14, padding:'28px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
            <div style={{ fontSize:17, fontWeight:500, marginBottom:8 }}>Tu solicitud está en revisión</div>
            <div style={{ fontSize:13, color:'oklch(0.55 0.005 80)' }}>Te vamos a notificar por correo cuando el equipo NIDO apruebe tu incorporación. Ahí vas a poder firmar este addendum.</div>
          </div>
        ) : aceptado ? (
          <div style={{ background:'oklch(0.95 0.02 150)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:14, padding:'32px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
            <div style={{ fontSize:17, fontWeight:500, marginBottom:4 }}>Addendum aceptado</div>
            <div style={{ fontSize:13, color:'oklch(0.55 0.005 80)' }}>Ya sos parte del Equipo NIDO. Redirigiendo a tu dashboard...</div>
          </div>
        ) : (
          <>
            <div style={{ background:'white', border:'1px solid oklch(0.88 0.006 80)', borderRadius:14, padding:'32px', marginBottom:24, fontSize:14, lineHeight:1.75, color:'oklch(0.30 0.005 80)', maxHeight:520, overflowY:'auto' }}>
              <div style={{ background:'oklch(0.95 0.02 150)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'14px 16px', marginBottom:20, fontSize:13 }}>
                Este addendum complementa el <a href="/dashboard/contrato-asesor" style={{ color:'oklch(0.42 0.06 150)', fontWeight:500 }}>Contrato de Afiliación de Asesor</a> y reemplaza sus términos de comisión únicamente para negociaciones realizadas como parte del Equipo NIDO.
              </div>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>1. Naturaleza de la relación — profesional independiente</h3>
              <p style={{ marginBottom:16 }}>El Asesor del Equipo NIDO es y permanece como un <strong>profesional independiente</strong>. Su incorporación al equipo NO genera relación laboral, patronal ni de subordinación con NIDO bajo ningún concepto. En consecuencia, este addendum <strong>no genera derecho a vacaciones, aguinaldo, cesantía, preaviso, cargas sociales patronales, seguro de riesgos del trabajo a cargo de NIDO, ni ningún otro beneficio propio de una relación laboral</strong> según el Código de Trabajo de Costa Rica. El Asesor es responsable de sus propias obligaciones fiscales y de seguridad social como trabajador independiente.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>2. Reparto de comisión 50/50</h3>
              <p style={{ marginBottom:16 }}>Toda comisión de corretaje generada por un cierre realizado mientras el Asesor forma parte del Equipo NIDO se divide en partes iguales: <strong>50% para el Asesor</strong> y <strong>50% para NIDO</strong>. Este reparto aplica a la comisión neta acordada con el Propietario o comprador, una vez confirmado y cobrado el cierre.</p>
              <p style={{ marginBottom:16 }}>NIDO transfiere el 50% correspondiente al Asesor dentro de los 5 días hábiles posteriores a la confirmación y cobro efectivo de la comisión.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>3. Beneficios incluidos para el Equipo NIDO</h3>
              <p style={{ marginBottom:8 }}>A cambio del reparto de comisión, el Asesor del Equipo NIDO recibe, sin costo adicional mientras permanezca activo en el equipo:</p>
              <ol style={{ paddingLeft:18, marginBottom:16 }}>
                <li style={{ marginBottom:6 }}><strong>Plataforma NIDO completa gratis</strong> — acceso sin costo de suscripción al plan NIDO Black (CRM, Valeria IA, propiedades ilimitadas, Academia completa), independientemente del plan que tuviera antes de unirse al equipo.</li>
                <li style={{ marginBottom:6 }}><strong>Acceso al inventario NIDO</strong> — visibilidad y posibilidad de trabajar sobre el inventario actual de propiedades de la inmobiliaria y del Equipo NIDO, no solo sus propias publicaciones.</li>
                <li style={{ marginBottom:6 }}><strong>Publicidad y marketing</strong> — sus propiedades activas pueden incluirse en las campañas pagas y contenido de marca de NIDO (redes sociales, portal, campañas digitales).</li>
                <li style={{ marginBottom:6 }}><strong>Capacitaciones exclusivas</strong> — acceso a sesiones de formación, mentoría y materiales reservados únicamente para el Equipo NIDO, además de la Academia pública.</li>
                <li style={{ marginBottom:6 }}><strong>Acceso al Equipo NIDO</strong> — participación en la red interna de asesores del equipo, leads internos distribuidos por NIDO, y respaldo institucional directo de la marca.</li>
                <li>Soporte prioritario y acompañamiento directo del equipo NIDO en negociaciones activas.</li>
              </ol>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>4. Uso de marca</h3>
              <p style={{ marginBottom:16 }}>Mientras forme parte del Equipo NIDO, el Asesor puede identificarse como &quot;Asesor del Equipo NIDO&quot; en sus comunicaciones profesionales. Este derecho cesa inmediatamente al finalizar la relación con el equipo, debiendo el Asesor remover cualquier referencia a &quot;Equipo NIDO&quot; de sus perfiles y materiales.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>5. Confidencialidad</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a mantener confidencial la información de leads, clientes, propietarios, inventario interno y estrategias a las que acceda como parte del Equipo NIDO, tanto durante como después de su participación en el equipo.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>6. Negociaciones en curso al momento de salida</h3>
              <p style={{ marginBottom:16 }}>Si el Asesor deja el Equipo NIDO con negociaciones activas iniciadas bajo este addendum, el reparto 50/50 se mantiene para esos cierres específicos ya en curso, salvo acuerdo distinto por escrito entre ambas partes.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>7. Terminación</h3>
              <p style={{ marginBottom:16 }}>Cualquiera de las partes puede finalizar la participación en el Equipo NIDO en cualquier momento, con notificación previa. Al finalizar, el Asesor conserva su cuenta NIDO bajo el plan que corresponda según su suscripción individual (los beneficios del punto 3 cesan, incluyendo el acceso al inventario interno).</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>8. Ley aplicable y jurisdicción</h3>
              <p style={{ marginBottom:16 }}>Este addendum se rige por las leyes de la República de Costa Rica y se interpreta de forma conjunta con el Contrato de Afiliación de Asesor y los <a href="/terminos" style={{ color:'oklch(0.42 0.06 150)' }}>Términos de Uso</a> de NIDO. Cualquier disputa se resuelve conforme a la cláusula de resolución de disputas de los Términos de Uso.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>9. Validez de la aceptación electrónica</h3>
              <p>La aceptación de este addendum mediante la casilla de verificación de abajo constituye una manifestación de voluntad válida y vinculante conforme a la Ley N° 8454 de Certificados, Firmas Digitales y Documentos Electrónicos de Costa Rica.</p>
            </div>

            <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:24, fontSize:14, cursor:'pointer' }}>
              <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop:3 }} />
              <span>He leído y acepto el Addendum del Equipo NIDO, incluyendo el reparto de comisión 50/50 y que esta relación es independiente, sin beneficios laborales.</span>
            </label>

            <button onClick={aceptar} disabled={!checked || saving} style={{ width:'100%', padding:'14px', borderRadius:999, background:'oklch(0.20 0.005 80)', color:'white', border:'none', fontSize:15, fontWeight:500, cursor: checked ? 'pointer' : 'not-allowed', opacity: checked ? 1 : 0.5 }}>
              {saving ? 'Guardando...' : 'Aceptar y unirme al Equipo NIDO →'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
