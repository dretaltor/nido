'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ContratoAsesor() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [aceptado, setAceptado] = useState(false)
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('perfiles').select('contrato_asesor_aceptado').eq('id', user.id).maybeSingle()
      if (data?.contrato_asesor_aceptado) setAceptado(true)
      setLoading(false)
    })
  }, [])

  const aceptar = async () => {
    if (!checked || !user) return
    setSaving(true)
    setError('')
    // Se incluye correo explícitamente porque perfiles.correo es NOT NULL: si por
    // algún motivo la fila del perfil todavía no existe, un upsert sin correo
    // fallaría al intentar el INSERT. Antes este error se ignoraba en silencio
    // y la UI mostraba "aceptado" aunque nada se hubiera guardado.
    const { error } = await supabase.from('perfiles').upsert({
      id: user.id,
      correo: user.email,
      contrato_asesor_aceptado: true,
      contrato_asesor_aceptado_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      setError('No se pudo guardar tu aceptación del contrato. Intentá de nuevo — si el problema sigue, escribinos a soporte. (' + error.message + ')')
      return
    }
    setAceptado(true)
    setTimeout(() => router.push('/dashboard/nueva-propiedad'), 1200)
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

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:400, margin:'32px 0 8px' }}>Contrato de Afiliación de Asesor</h1>
        <p style={{ fontSize:14, color:'oklch(0.55 0.005 80)', marginBottom:32 }}>Leé y aceptá los términos para empezar a publicar propiedades en NIDO.</p>

        {aceptado ? (
          <div style={{ background:'oklch(0.95 0.02 150)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:14, padding:'32px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
            <div style={{ fontSize:17, fontWeight:500, marginBottom:4 }}>Contrato aceptado</div>
            <div style={{ fontSize:13, color:'oklch(0.55 0.005 80)' }}>Redirigiendo a publicar tu propiedad...</div>
          </div>
        ) : (
          <>
            <div style={{ background:'white', border:'1px solid oklch(0.88 0.006 80)', borderRadius:14, padding:'32px', marginBottom:24, fontSize:14, lineHeight:1.75, color:'oklch(0.30 0.005 80)', maxHeight:480, overflowY:'auto' }}>
              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>1. Naturaleza de la relación</h3>
              <p style={{ marginBottom:16 }}>El Asesor actúa como corredor independiente afiliado a la plataforma NIDO, sin relación laboral ni de subordinación con NIDO. El Asesor es responsable de la veracidad de la información de las propiedades que publica.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>2. Comisión y pagos</h3>
              <p style={{ marginBottom:16 }}>Como regla general, NIDO no participa en las comisiones de corretaje pactadas entre el Asesor y el Propietario cuando el Asesor gestiona la negociación de forma independiente. Esto cambia en dos casos: (a) si el Asesor forma parte del Equipo NIDO, la comisión se reparte 50%/50% entre el Asesor y NIDO conforme al Addendum Equipo NIDO; y (b) si la propiedad está sujeta a un Contrato de Corretaje directo entre el Propietario y NIDO, NIDO cobra su comisión directamente del Propietario conforme a ese contrato, de forma independiente a cualquier comisión del Asesor. Las suscripciones a los planes Despega, Elite o Black son independientes de las comisiones de venta.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>3. Verificación de identidad</h3>
              <p style={{ marginBottom:16 }}>El Asesor declara que la información y documentos de verificación (KYC) suministrados son veraces y vigentes. NIDO puede suspender la cuenta ante inconsistencias.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>4. Calidad de las publicaciones</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a publicar únicamente propiedades reales, con autorización del propietario, y a mantener actualizada su disponibilidad.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>5. Uso de la plataforma</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a un uso ético del CRM, WhatsApp Business y herramientas de IA (Valeria), evitando spam o prácticas engañosas hacia los leads.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>6. Colaboración entre Asesores (50/50)</h3>
              <p style={{ marginBottom:16 }}>El Asesor puede colaborar con otro Asesor afiliado a NIDO en una misma negociación o cierre, bajo un esquema de comisión compartida 50/50, siempre que:</p>
              <ol style={{ paddingLeft:18, marginBottom:16 }}>
                <li style={{ marginBottom:6 }}>Ambos Asesores estén activos y verificados en NIDO al momento del acuerdo.</li>
                <li style={{ marginBottom:6 }}>El acuerdo de colaboración quede registrado por escrito (correo, WhatsApp Business o CRM de NIDO) antes del cierre de la negociación, indicando los nombres de ambos Asesores y la propiedad o lead involucrado.</li>
                <li style={{ marginBottom:6 }}>La distribución de la comisión total acordada con el Propietario o comprador se reparta en partes iguales (50% y 50%) entre ambos Asesores, salvo que exista un acuerdo distinto firmado por ambas partes.</li>
                <li style={{ marginBottom:6 }}>NIDO no media ni garantiza el cumplimiento de los acuerdos de colaboración entre Asesores; estos son responsabilidad exclusiva de quienes los suscriben.</li>
                <li>En caso de disputa entre Asesores colaboradores, NIDO podrá suspender el registro de la comisión en el sistema hasta que las partes resuelvan el conflicto o presenten evidencia del acuerdo original.</li>
              </ol>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>7. Responsabilidad y conducta profesional</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a actuar con honestidad ante propietarios, compradores y otros Asesores. NIDO puede suspender o dar de baja cuentas ante denuncias verificadas de fraude, suplantación de identidad, o incumplimiento reiterado de acuerdos de colaboración.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>8. Confidencialidad</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a mantener confidencial la información de leads, propietarios, compradores y demás datos a los que acceda a través del CRM de NIDO, y a no utilizarla para fines distintos a la gestión de las propiedades y negociaciones autorizadas por la plataforma. Esta obligación se mantiene vigente después de finalizada la afiliación.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>9. Protección de datos personales</h3>
              <p style={{ marginBottom:16 }}>El tratamiento de los datos personales del Asesor y de los terceros que gestiona a través de NIDO (propietarios, compradores, leads) se rige por la Ley N° 8968 de Costa Rica y por la <a href="/privacidad" style={{ color:'oklch(0.42 0.06 150)' }}>Política de Privacidad</a> de NIDO. El Asesor se compromete a tratar los datos personales a los que accede conforme a esa misma ley y únicamente para los fines propios de su actividad en la plataforma.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>10. Terminación</h3>
              <p style={{ marginBottom:16 }}>Cualquiera de las partes puede terminar esta afiliación en cualquier momento. NIDO se reserva el derecho de suspender cuentas que incumplan estos términos.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>11. Propiedades y leads al finalizar la afiliación</h3>
              <p style={{ marginBottom:16 }}>Al terminar la afiliación, las propiedades publicadas por el Asesor permanecen visibles en el portal por un período razonable mientras se reasignan a otro Asesor o se coordina con el Propietario, salvo solicitud expresa de retiro inmediato por parte del Propietario. El Asesor pierde acceso al CRM y a los datos de contacto de los leads y propietarios desde el momento en que la afiliación termina.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>12. Validez de la aceptación electrónica</h3>
              <p>La aceptación de este contrato mediante la casilla de verificación de abajo constituye una manifestación de voluntad válida y vinculante conforme a la Ley N° 8454 de Certificados, Firmas Digitales y Documentos Electrónicos de Costa Rica. NIDO conserva un registro electrónico de la fecha y hora de aceptación.</p>
            </div>

            <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:24, fontSize:14, cursor:'pointer' }}>
              <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop:3 }} />
              <span>He leído y acepto los Términos de Afiliación de Asesor NIDO.</span>
            </label>

            {error && (
              <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'oklch(0.45 0.08 20)', fontSize:13 }}>
                {error}
              </div>
            )}

            <button onClick={aceptar} disabled={!checked || saving} style={{ width:'100%', padding:'14px', borderRadius:999, background:'oklch(0.20 0.005 80)', color:'white', border:'none', fontSize:15, fontWeight:500, cursor: checked ? 'pointer' : 'not-allowed', opacity: checked ? 1 : 0.5 }}>
              {saving ? 'Guardando...' : 'Aceptar y continuar →'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
