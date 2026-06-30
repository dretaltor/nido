'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useTrial } from '../../../lib/useTrial'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .field-input{width:100%;padding:11px 14px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:var(--sans);color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .field-input:focus{border-color:var(--accent)}
  .field-input::placeholder{color:var(--ink-3)}
  .save-btn{padding:11px 28px;border-radius:999px;background:var(--ink);color:white;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:var(--sans)}
  .save-btn:hover:not(:disabled){background:oklch(0.28 0.006 80)}
  .save-btn:disabled{opacity:0.6;cursor:not-allowed}
  .section-card{background:white;border:1px solid var(--rule);border-radius:12px;padding:28px 32px;margin-bottom:20px}
`

function ValeriaPerfilResumen({ userId }: { userId: string }) {
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('perfiles').select('valeria_perfil, valeria_onboarding_completo').eq('id', userId).maybeSingle()
      .then(({ data }) => { setPerfil(data); setLoading(false) })
  }, [userId])

  if (loading) return <div style={{ fontSize:13, color:'var(--ink-3)' }}>Cargando...</div>

  if (!perfil?.valeria_onboarding_completo) return (
    <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:10, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>Valeria aún no está configurada</div>
        <div style={{ fontSize:12, color:'var(--ink-3)' }}>Completá el onboarding para personalizar tu asistente.</div>
      </div>
      <a href="/dashboard/valeria-onboarding" style={{ padding:'8px 18px', borderRadius:999, background:'var(--accent)', color:'white', fontSize:13, fontWeight:500, textDecoration:'none', flexShrink:0 }}>
        Configurar →
      </a>
    </div>
  )

  const p = perfil.valeria_perfil
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          { l:'Estilo', v:p?.estilo_comunicacion },
          { l:'Zonas', v:p?.zonas },
          { l:'Propiedades', v:p?.tipo_propiedades },
          { l:'Meta mensual', v:p?.objetivo_mensual },
          { l:'Estilo de cierre', v:p?.estilo_cierre },
          { l:'Rango de precio', v:p?.rango_precio },
        ].map(f => f.v ? (
          <div key={f.l} style={{ background:'var(--bg)', borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:4 }}>{f.l}</div>
            <div style={{ fontSize:13, color:'var(--ink)', fontWeight:500 }}>{f.v}</div>
          </div>
        ) : null)}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <a href="/chat" style={{ flex:1, padding:'10px', borderRadius:999, background:'var(--accent)', color:'white', fontSize:13, fontWeight:500, textDecoration:'none', textAlign:'center' }}>
          Hablar con Valeria →
        </a>
        <a href="/dashboard/valeria-onboarding" style={{ flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--rule)', color:'var(--ink)', fontSize:13, textDecoration:'none', textAlign:'center' }}>
          Reconfigurar
        </a>
      </div>
    </div>
  )
}

function VerificacionKYC({ userId }: { userId: string }) {
  const [estado, setEstado] = useState<any>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [docs, setDocs] = useState({ cedula_frente_url:'', cedula_reverso_url:'', selfie_url:'' })
  const [kycError, setKycError] = useState('')
  const refs = { cedula_frente: useRef<HTMLInputElement>(null), cedula_reverso: useRef<HTMLInputElement>(null), selfie: useRef<HTMLInputElement>(null) }

  useEffect(() => {
    if (!userId) return
    supabase.from('perfiles').select('verificado,verificacion_estado,cedula_frente_url,cedula_reverso_url,selfie_url,verificacion_notas').eq('id', userId).maybeSingle()
      .then(({ data }) => { if (data) { setEstado(data); setDocs({ cedula_frente_url: data.cedula_frente_url||'', cedula_reverso_url: data.cedula_reverso_url||'', selfie_url: data.selfie_url||'' }) } })
  }, [userId])

  const uploadDoc = async (tipo: string, file: File) => {
    setUploading(tipo)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tipo', tipo)
      const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir')
      const publicUrl = json.publicUrl
      const update = { [tipo + '_url']: publicUrl }
      await supabase.from('perfiles').upsert({ id: userId, ...update, verificacion_estado: 'en_revision' })
      setDocs(p => ({ ...p, [tipo + '_url']: publicUrl }))
      setEstado((p: any) => ({ ...p, verificacion_estado: 'en_revision' }))
    } catch (err: any) {
      setKycError('Error al subir documento: ' + err.message)
    } finally {
      setUploading(null)
    }
  }

  const estadoColor: Record<string, string> = {
    pendiente: 'oklch(0.93 0.005 80)',
    en_revision: 'oklch(0.93 0.05 80)',
    aprobado: 'var(--accent-tint)',
    rechazado: 'oklch(0.97 0.03 20)',
  }
  const estadoText: Record<string, string> = {
    pendiente: 'Pendiente de documentos',
    en_revision: 'En revisión — te notificaremos en 24h',
    aprobado: '✓ Identidad verificada',
    rechazado: 'Rechazado — revisá las notas',
  }

  const items = [
    { key:'cedula_frente', label:'Cédula — Frente', desc:'Foto clara del frente de tu cédula', icon:'🪪' },
    { key:'cedula_reverso', label:'Cédula — Reverso', desc:'Foto clara del reverso de tu cédula', icon:'🪪' },
    { key:'selfie', label:'Selfie con cédula', desc:'Foto tuya sosteniendo tu cédula', icon:'🤳' },
  ]

  return (
    <div>
      {/* Estado */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'12px 16px', borderRadius:10, background: estadoColor[estado?.verificacion_estado||'pendiente'] || 'var(--bg)' }}>
        <span style={{ fontSize:14, fontWeight:500 }}>{estadoText[estado?.verificacion_estado||'pendiente']}</span>
        {estado?.verificado && <span style={{ marginLeft:'auto', background:'var(--accent)', color:'white', padding:'2px 10px', borderRadius:999, fontSize:11, fontWeight:500 }}>✓ VERIFICADO</span>}
      </div>

      {estado?.verificacion_notas && (
        <div style={{ marginBottom:16, padding:'12px 14px', background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, fontSize:13, color:'oklch(0.45 0.08 20)' }}>
          <strong>Notas del revisor:</strong> {estado.verificacion_notas}
        </div>
      )}

      {kycError && <div style={{ marginBottom:12, padding:'10px 14px', background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, fontSize:13, color:'oklch(0.45 0.08 20)' }}>{kycError}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {items.map(item => {
          const url = (docs as any)[item.key + '_url']
          return (
            <div key={item.key} style={{ border:'1px solid var(--rule)', borderRadius:10, padding:'16px', display:'flex', alignItems:'center', gap:16, background: url ? 'var(--accent-tint)' : 'white' }}>
              <div style={{ width:48, height:48, borderRadius:8, background: url ? 'var(--accent)' : 'var(--bg)', display:'grid', placeItems:'center', fontSize:20, flexShrink:0 }}>
                {url ? '✓' : item.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{item.label}</div>
                <div style={{ fontSize:12, color:'var(--ink-3)' }}>{url ? 'Documento subido ✓' : item.desc}</div>
              </div>
              <div>
                {url ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <a href={url} target="_blank" style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>Ver →</a>
                    <button onClick={() => (refs as any)[item.key].current?.click()} style={{ fontSize:12, color:'var(--ink-3)', background:'none', border:'1px solid var(--rule)', padding:'4px 10px', borderRadius:999, cursor:'pointer' }}>Cambiar</button>
                  </div>
                ) : (
                  <button onClick={() => (refs as any)[item.key].current?.click()} disabled={uploading===item.key} style={{ fontSize:13, color:'white', background:'var(--ink)', border:'none', padding:'8px 16px', borderRadius:999, cursor:'pointer', opacity: uploading===item.key?0.6:1 }}>
                    {uploading===item.key ? 'Subiendo...' : 'Subir'}
                  </button>
                )}
                <input ref={(refs as any)[item.key]} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(item.key, f) }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Perfil() {
  const { bloqueado: trialBloqueado, checando: checandoTrial } = useTrial()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgPass, setMsgPass] = useState('')
  const [uploading, setUploading] = useState(false)
  const [perfil, setPerfil] = useState({ nombre:'', correo:'', telefono:'', cedula:'', codigo_corredor:'', foto_url:'' })
  const [pass, setPass] = useState({ nueva:'', confirmar:'' })

  const set = (k: string, v: string) => setPerfil(p => ({...p, [k]: v}))

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('perfiles').select('id,nombre,correo,telefono,cedula,codigo_corredor,foto_url,verificado,verificacion_estado,verificacion_notas,cedula_frente_url,cedula_reverso_url,selfie_url,compania,plan,valeria_perfil,valeria_onboarding_completo,contrato_asesor_aceptado,solicita_equipo_nido,equipo_nido_estado,contrato_equipo_nido_aceptado,created_at').eq('id', user.id).maybeSingle()
      setPerfil({
        nombre: data?.nombre || user.user_metadata?.nombre || '',
        correo: user.email || '',
        telefono: data?.telefono || '',
        cedula: data?.cedula || '',
        codigo_corredor: data?.codigo_corredor || '',
        foto_url: data?.foto_url || '',
      })
      setLoading(false)
    })
  }, [])

  const savePerfil = async () => {
    setSaving(true); setMsg('')
    const { error } = await supabase.from('perfiles').upsert({
      id: user.id, ...perfil, updated_at: new Date().toISOString()
    })
    if (error) { setMsg('Error: ' + error.message) }
    else {
      await supabase.auth.updateUser({ data: { nombre: perfil.nombre } })
      setMsg('✓ Perfil guardado correctamente')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const savePass = async () => {
    if (!pass.nueva || !pass.confirmar) { setMsgPass('Completá ambos campos.'); return }
    if (pass.nueva.length < 6) { setMsgPass('Mínimo 6 caracteres.'); return }
    if (pass.nueva !== pass.confirmar) { setMsgPass('Las contraseñas no coinciden.'); return }
    setSavingPass(true); setMsgPass('')
    const { error } = await supabase.auth.updateUser({ password: pass.nueva })
    if (error) { setMsgPass('Error: ' + error.message) }
    else { setMsgPass('✓ Contraseña actualizada'); setPass({ nueva:'', confirmar:'' }) }
    setSavingPass(false)
    setTimeout(() => setMsgPass(''), 4000)
  }

  const [fotoFeedback, setFotoFeedback] = useState<{buena:boolean,mensaje:string}|null>(null)

  const uploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tipo', 'perfil')
      const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir')
      const publicUrl = json.publicUrl
      // Guardar en estado local
      set('foto_url', publicUrl)
      // Guardar en tabla perfiles
      await supabase.from('perfiles').update({ foto_url: publicUrl }).eq('id', user.id)

      // Pedir feedback de calidad de foto a Valeria (vision)
      setFotoFeedback(null)
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        const { data: { session: sfb } } = await supabase.auth.getSession()
        const fbRes = await fetch('/api/foto-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sfb?.access_token },
          body: JSON.stringify({ imageBase64: base64, mediaType: file.type })
        })
        const fb = await fbRes.json()
        if (fb?.mensaje) setFotoFeedback({ buena: !!fb.buena, mensaje: fb.mensaje })
      } catch {}
    } catch (err: any) {
      setMsg('Error al subir foto: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div style={{padding:40,fontFamily:'sans-serif',color:'#999'}}>Cargando perfil...</div>

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:1000, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-3)' }}>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/dashboard/crm" className="nav-link">CRM</a>
            <a href="/dashboard/perfil" style={{ color:'var(--accent)', fontWeight:500, fontSize:13 }}>Perfil</a>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} style={{ fontSize:12, color:'var(--ink-3)', background:'none', border:'1px solid var(--rule)', padding:'6px 14px', borderRadius:999 }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 24px 80px', animation:'fadeUp 0.4s ease' }}>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Configuración</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,40px)', fontWeight:400 }}>
            Tu <em style={{ fontStyle:'italic', color:'var(--accent)' }}>perfil.</em>
          </h1>
        </div>

        {/* Foto + info básica */}
        <div className="section-card">
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:20 }}>Información personal</div>

          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--rule-soft)' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--accent-tint)', border:'2px solid var(--rule)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {perfil.foto_url ? (
                  <img src={perfil.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="Foto de perfil"/>
                ) : (
                  <span style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--accent)' }}>{(perfil.nombre||'A')[0].toUpperCase()}</span>
                )}
              </div>
              {uploading && <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white' }}>...</div>}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{perfil.nombre || 'Tu nombre'}</div>
              <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:12 }}>{perfil.correo}</div>
              <button onClick={() => fileRef.current?.click()} style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', padding:'6px 14px', borderRadius:999, cursor:'pointer' }}>
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadFoto} style={{ display:'none' }}/>
              {fotoFeedback && (
                <div style={{ marginTop:8, fontSize:12, lineHeight:1.5, color: fotoFeedback.buena ? 'var(--accent)' : 'oklch(0.5 0.1 50)', background: fotoFeedback.buena ? 'var(--accent-tint)' : 'oklch(0.97 0.03 50)', padding:'8px 12px', borderRadius:8, maxWidth:320 }}>
                  {fotoFeedback.buena ? '✓ ' : '💡 '}{fotoFeedback.mensaje}
                </div>
              )}
            </div>
          </div>

          {/* Campos */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { label:'Nombre completo', key:'nombre', placeholder:'María Rodríguez', required:true },
              { label:'Correo electrónico', key:'correo', placeholder:'tu@correo.com', disabled:true },
              { label:'Teléfono', key:'telefono', placeholder:'+506 8888-8888' },
              { label:'Cédula', key:'cedula', placeholder:'1-2345-6789' },
              { label:'Código de corredor (opcional)', key:'codigo_corredor', placeholder:'CR-XXXX', span:true },
            ].map((f:any) => (
              <div key={f.key} style={{ gridColumn: f.span ? '1 / -1' : 'auto' }}>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>
                  {f.label} {f.required && <span style={{ color:'var(--accent)' }}>*</span>}
                </label>
                <input
                  className="field-input"
                  placeholder={f.placeholder}
                  value={(perfil as any)[f.key]}
                  onChange={e => !f.disabled && set(f.key, e.target.value)}
                  disabled={f.disabled}
                  style={{ opacity: f.disabled ? 0.6 : 1, cursor: f.disabled ? 'not-allowed' : 'text' }}
                />
                {f.disabled && <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:4 }}>El correo no se puede cambiar desde aquí.</p>}
              </div>
            ))}
          </div>

          {msg && (
            <div style={{ marginTop:16, padding:'10px 14px', background: msg.startsWith('✓') ? 'var(--accent-tint)' : 'oklch(0.97 0.03 20)', border:'1px solid '+(msg.startsWith('✓')?'oklch(0.85 0.04 150)':'oklch(0.85 0.06 20)'), borderRadius:8, fontSize:13, color: msg.startsWith('✓') ? 'var(--accent)' : 'oklch(0.45 0.08 20)' }}>
              {msg}
            </div>
          )}

          <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
            <button className="save-btn" onClick={savePerfil} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* Seguridad */}
        <div className="section-card">
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:20 }}>Seguridad</div>

          {/* Cambiar contraseña */}
          <div style={{ marginBottom:28, paddingBottom:28, borderBottom:'1px solid var(--rule-soft)' }}>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, marginBottom:4 }}>Cambiar contraseña</h3>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:16, lineHeight:1.6 }}>Usá una contraseña de al menos 6 caracteres que no uses en otros sitios.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Nueva contraseña</label>
                <input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={pass.nueva} onChange={e => setPass(p => ({...p, nueva:e.target.value}))}/>
              </div>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Confirmar contraseña</label>
                <input className="field-input" type="password" placeholder="Repetí la contraseña" value={pass.confirmar} onChange={e => setPass(p => ({...p, confirmar:e.target.value}))} onKeyDown={e => e.key==='Enter' && savePass()}/>
              </div>
            </div>
            {msgPass && (
              <div style={{ marginTop:12, padding:'10px 14px', background: msgPass.startsWith('✓') ? 'var(--accent-tint)' : 'oklch(0.97 0.03 20)', border:'1px solid '+(msgPass.startsWith('✓')?'oklch(0.85 0.04 150)':'oklch(0.85 0.06 20)'), borderRadius:8, fontSize:13, color: msgPass.startsWith('✓') ? 'var(--accent)' : 'oklch(0.45 0.08 20)' }}>
                {msgPass}
              </div>
            )}
            <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
              <button className="save-btn" onClick={savePass} disabled={savingPass}>
                {savingPass ? 'Actualizando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, marginBottom:4 }}>Verificación en dos pasos</h3>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:16, lineHeight:1.6 }}>Agregá una capa extra de seguridad a tu cuenta. Al activarla, necesitarás un código adicional cada vez que ingreses.</p>
            <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:10, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>🔐</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>Autenticación de dos factores</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>Actualmente desactivada</div>
                </div>
              </div>
              <a href="https://supabase.com/docs/guides/auth/auth-mfa" target="_blank" style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>
                Activar →
              </a>
            </div>
            <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:8, lineHeight:1.6 }}>
              La verificación en dos pasos estará disponible próximamente desde el dashboard. Por ahora podés activarla desde la configuración de tu cuenta en Supabase.
            </p>
          </div>
        </div>

        {/* Verificación de identidad */}
        <div className="section-card">
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Verificación de identidad</div>
          <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65, marginBottom:20 }}>
            Para mostrar el badge de <strong>Asesor Verificado NIDO</strong> necesitamos validar tu identidad. Subí los documentos requeridos — el proceso tarda menos de 24 horas.
          </p>

          <VerificacionKYC userId={user?.id} />
        </div>

        {/* Configuración de Valeria */}
        <div className="section-card">
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Tu Valeria personal</div>
          <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65, marginBottom:20 }}>
            Valeria trabaja con tu estilo, tus zonas y tu forma de cerrar tratos. Podés reconfigurar tu perfil en cualquier momento.
          </p>
          <ValeriaPerfilResumen userId={user?.id} />
        </div>

        {/* Cerrar sesión */}
        <div style={{ textAlign:'center', paddingTop:8 }}>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} style={{ fontSize:13, color:'var(--ink-3)', background:'none', border:'1px solid var(--rule)', padding:'10px 24px', borderRadius:999, cursor:'pointer' }}>
            Cerrar sesión
          </button>
        </div>

      </div>
    </main>
  )
}
