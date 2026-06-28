'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ContratoAsesor() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [aceptado, setAceptado] = useState(false)
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

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
    await supabase.from('perfiles').upsert({
      id: user.id,
      contrato_asesor_aceptado: true,
      contrato_asesor_aceptado_at: new Date().toISOString(),
    })
    setAceptado(true)
    setSaving(false)
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
              <p style={{ marginBottom:16 }}>NIDO no participa en las comisiones de corretaje pactadas entre el Asesor y el Propietario, salvo que se indique lo contrario en un acuerdo específico por propiedad. Las suscripciones a planes Pro/Enterprise son independientes de las comisiones de venta.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>3. Verificación de identidad</h3>
              <p style={{ marginBottom:16 }}>El Asesor declara que la información y documentos de verificación (KYC) suministrados son veraces y vigentes. NIDO puede suspender la cuenta ante inconsistencias.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>4. Calidad de las publicaciones</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a publicar únicamente propiedades reales, con autorización del propietario, y a mantener actualizada su disponibilidad.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>5. Uso de la plataforma</h3>
              <p style={{ marginBottom:16 }}>El Asesor se compromete a un uso ético del CRM, WhatsApp Business y herramientas de IA (Valeria), evitando spam o prácticas engañosas hacia los leads.</p>

              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>6. Terminación</h3>
              <p>Cualquiera de las partes puede terminar esta afiliación en cualquier momento. NIDO se reserva el derecho de suspender cuentas que incumplan estos términos.</p>
            </div>

            <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:24, fontSize:14, cursor:'pointer' }}>
              <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop:3 }} />
              <span>He leído y acepto los Términos de Afiliación de Asesor NIDO.</span>
            </label>

            <button onClick={aceptar} disabled={!checked || saving} style={{ width:'100%', padding:'14px', borderRadius:999, background:'oklch(0.20 0.005 80)', color:'white', border:'none', fontSize:15, fontWeight:500, cursor: checked ? 'pointer' : 'not-allowed', opacity: checked ? 1 : 0.5 }}>
              {saving ? 'Guardando...' : 'Aceptar y continuar →'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
