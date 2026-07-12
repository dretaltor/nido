'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Propietario } from '../../../../lib/database.types'

type PropietarioState = (Partial<Propietario> & { [key: string]: unknown }) | null

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .field-input{width:100%;padding:11px 14px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:var(--sans);color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .field-input:focus{border-color:var(--accent)}
  .field-input::placeholder{color:var(--ink-3)}
  .save-btn{padding:11px 28px;border-radius:999px;background:var(--ink);color:white;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:var(--sans)}
  .save-btn:hover:not(:disabled){background:oklch(0.28 0.006 80)}
  .save-btn:disabled{opacity:0.6;cursor:not-allowed}
  .section-card{background:white;border:1px solid var(--rule);border-radius:12px;padding:28px 32px;margin-bottom:20px}
  .tab{padding:8px 18px;border-radius:999px;border:1px solid var(--rule);font-size:13px;cursor:pointer;transition:all 0.15s;background:transparent;color:var(--ink-2)}
  .tab.active{background:var(--ink);color:white;border-color:var(--ink)}
  @media(max-width:768px){.section-card{padding:20px}.grid-2{grid-template-columns:1fr!important}.top-nav-pad{padding:14px 16px!important;flex-wrap:wrap!important;gap:10px!important}.tabs-row{order:3;width:100%}}
`

export default function PerfilPropietario() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [propietario, setPropietario] = useState<PropietarioState>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgPass, setMsgPass] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<string|null>(null)
  const [docError, setDocError] = useState('')
  const [tab, setTab] = useState('perfil')

  const [form, setForm] = useState({ nombre:'', correo:'', telefono:'', cedula:'', relacion:'' })
  const [pass, setPass] = useState({ nueva:'', confirmar:'' })
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login-propietario'); return }
      setUser(user)
      const { data } = await supabase.from('propietarios').select('*').eq('correo', user.email!).maybeSingle()
      if (data) {
        setPropietario(data)
        setForm({ nombre: data.nombre||'', correo: user.email||'', telefono: data.telefono||'', cedula: data.cedula||'', relacion: data.relacion||'' })
      } else {
        setForm(p => ({ ...p, correo: user.email||'' }))
      }
      setLoading(false)
    })
  }, [])

  const savePerfil = async () => {
    if (!user) return
    setSaving(true); setMsg('')
    await supabase.from('propietarios').update({ nombre: form.nombre, telefono: form.telefono, cedula: form.cedula }).eq('correo', user.email!)
    await supabase.auth.updateUser({ data: { nombre: form.nombre } })
    setMsg('✓ Perfil actualizado correctamente')
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

  const uploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tipo', 'perfil_propietario')
      const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir')
      const publicUrl = json.publicUrl
      await supabase.from('propietarios').update({ foto_url: publicUrl }).eq('correo', user.email!)
      setPropietario((p) => ({ ...(p||{}), foto_url: publicUrl }))
    } catch (err) {
      setMsg('Error al subir foto: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploading(false)
    }
  }

  const uploadDoc = async (tipo: string, file: File) => {
    if (!user) return
    setUploadingDoc(tipo)
    setDocError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tipo', tipo + '_prop')
      const res = await fetch('/api/upload-firma', { method: 'POST', body: fd, headers: { 'Authorization': 'Bearer ' + session?.access_token } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir')
      const path = json.path
      const update: Record<string, unknown> = { [tipo + '_url']: path, verificacion_estado: 'en_revision' }
      await supabase.from('propietarios').update(update).eq('correo', user.email!)
      setPropietario((p) => ({ ...(p||{}), [tipo + '_url']: path, verificacion_estado: 'en_revision' }))
    } catch (err) {
      setDocError('Error al subir documento: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploadingDoc(null)
    }
  }

  if (loading) return <div style={{ padding:40, fontFamily:'sans-serif', color:'#999' }}>Cargando perfil...</div>

  const estadoKYC = propietario?.verificacion_estado || 'pendiente_docs'

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="top-nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:900, margin:'0 auto' }}>
          <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
          <div className="tabs-row" style={{ display:'flex', gap:8 }}>
            <button className={'tab'+(tab==='perfil'?' active':'')} onClick={() => setTab('perfil')}>Mi perfil</button>
            <button className={'tab'+(tab==='seguridad'?' active':'')} onClick={() => setTab('seguridad')}>Seguridad</button>
            <button className={'tab'+(tab==='verificacion'?' active':'')} onClick={() => setTab('verificacion')}>
              Verificación {estadoKYC !== 'aprobado' && <span style={{ marginLeft:4, width:6, height:6, borderRadius:'50%', background:'oklch(0.52 0.08 50)', display:'inline-block' }}/>}
            </button>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <a href="/dashboard/propietario" style={{ fontSize:13, color:'var(--ink-3)' }}>← Mi panel</a>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/bienvenida'))} style={{ fontSize:12, color:'var(--ink-3)', background:'none', border:'1px solid var(--rule)', padding:'6px 14px', borderRadius:999 }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 24px 80px', animation:'fadeUp 0.4s ease' }}>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Propietario</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,40px)', fontWeight:400 }}>
            Tu <em style={{ fontStyle:'italic', color:'var(--accent)' }}>perfil.</em>
          </h1>
        </div>

        {/* ── PERFIL ── */}
        {tab === 'perfil' && (
          <div className="section-card">
            <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:20 }}>Información personal</div>

            {/* Avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--rule-soft)' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--accent-tint)', border:'2px solid var(--rule)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {propietario?.foto_url ? (
                    <img src={propietario.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="Foto"/>
                  ) : (
                    <span style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--accent)' }}>{(form.nombre||'P')[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{form.nombre || 'Tu nombre'}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:8 }}>{form.correo}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => fileRef.current?.click()} style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', padding:'5px 12px', borderRadius:999, cursor:'pointer' }}>
                    {uploading ? 'Subiendo...' : 'Cambiar foto'}
                  </button>
                  <span className="badge" style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:estadoKYC==='aprobado'?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:estadoKYC==='aprobado'?'var(--accent)':'var(--ink-3)' }}>
                    {estadoKYC==='aprobado'?'✓ Verificado':'Pendiente verificación'}
                  </span>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={uploadFoto} style={{ display:'none' }}/>
              </div>
            </div>

            <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { label:'Nombre completo', key:'nombre', placeholder:'María Rodríguez', required:true },
                { label:'Correo electrónico', key:'correo', placeholder:'tu@correo.com', disabled:true },
                { label:'Teléfono', key:'telefono', placeholder:'+506 8888-8888' },
                { label:'Cédula', key:'cedula', placeholder:'1-2345-6789' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>
                    {f.label} {f.required && <span style={{ color:'var(--accent)' }}>*</span>}
                  </label>
                  <input className="field-input" placeholder={f.placeholder} value={(form as Record<string,string>)[f.key]} onChange={e => !f.disabled && set(f.key, e.target.value)} disabled={f.disabled} style={{ opacity:f.disabled?0.6:1 }}/>
                  {f.disabled && <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:4 }}>El correo no se puede cambiar.</p>}
                </div>
              ))}
            </div>

            <div style={{ marginTop:16 }}>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Relación con la propiedad</label>
              <input className="field-input" value={form.relacion} disabled style={{ opacity:0.6 }}/>
            </div>

            {msg && <div style={{ marginTop:16, padding:'10px 14px', background:msg.startsWith('✓')?'var(--accent-tint)':'oklch(0.97 0.03 20)', border:'1px solid '+(msg.startsWith('✓')?'oklch(0.85 0.04 150)':'oklch(0.85 0.06 20)'), borderRadius:8, fontSize:13, color:msg.startsWith('✓')?'var(--accent)':'oklch(0.45 0.08 20)' }}>{msg}</div>}

            <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
              <button className="save-btn" onClick={savePerfil} disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
            </div>
          </div>
        )}

        {/* ── SEGURIDAD ── */}
        {tab === 'seguridad' && (
          <div className="section-card">
            <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:20 }}>Seguridad</div>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, marginBottom:4 }}>Cambiar contraseña</h3>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:20, lineHeight:1.6 }}>Usá una contraseña de al menos 6 caracteres que no uses en otros sitios.</p>
            <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Nueva contraseña</label>
                <input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={pass.nueva} onChange={e => setPass(p => ({...p, nueva:e.target.value}))}/>
              </div>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Confirmar contraseña</label>
                <input className="field-input" type="password" placeholder="Repetí la contraseña" value={pass.confirmar} onChange={e => setPass(p => ({...p, confirmar:e.target.value}))} onKeyDown={e => e.key==='Enter' && savePass()}/>
              </div>
            </div>
            {msgPass && <div style={{ marginBottom:16, padding:'10px 14px', background:msgPass.startsWith('✓')?'var(--accent-tint)':'oklch(0.97 0.03 20)', border:'1px solid '+(msgPass.startsWith('✓')?'oklch(0.85 0.04 150)':'oklch(0.85 0.06 20)'), borderRadius:8, fontSize:13, color:msgPass.startsWith('✓')?'var(--accent)':'oklch(0.45 0.08 20)' }}>{msgPass}</div>}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button className="save-btn" onClick={savePass} disabled={savingPass}>{savingPass?'Actualizando...':'Cambiar contraseña'}</button>
            </div>
          </div>
        )}

        {/* ── VERIFICACIÓN ── */}
        {tab === 'verificacion' && (
          <div>
            <div className="section-card">
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Verificación de identidad</div>
              <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65, marginBottom:20 }}>Para publicar tu propiedad verificamos tu identidad con los documentos del Registro Nacional. Es un proceso simple que tarda menos de 24 horas hábiles.</p>

              {/* Estado */}
              <div style={{ marginBottom:20, padding:'14px 18px', borderRadius:10, background:
                estadoKYC==='aprobado'?'var(--accent-tint)':estadoKYC==='rechazado'?'oklch(0.97 0.03 20)':estadoKYC==='en_revision'?'oklch(0.93 0.05 80)':'oklch(0.93 0.005 80)',
                border:'1px solid '+(estadoKYC==='aprobado'?'oklch(0.85 0.04 150)':estadoKYC==='rechazado'?'oklch(0.85 0.06 20)':estadoKYC==='en_revision'?'oklch(0.88 0.05 80)':'var(--rule)')
              }}>
                <div style={{ fontSize:14, fontWeight:500, color:estadoKYC==='aprobado'?'var(--accent)':estadoKYC==='rechazado'?'oklch(0.45 0.08 20)':estadoKYC==='en_revision'?'oklch(0.45 0.08 80)':'var(--ink-3)' }}>
                  {estadoKYC==='aprobado'?'✓ Identidad verificada — podés publicar propiedades':
                   estadoKYC==='rechazado'?'✗ Verificación rechazada':
                   estadoKYC==='en_revision'?'⏳ Documentos en revisión — te contactaremos pronto':
                   'Pendiente — subí tus documentos para comenzar'}
                </div>
                {propietario?.verificacion_notas && <p style={{ fontSize:13, color:'var(--ink-2)', marginTop:8, lineHeight:1.6 }}>Nota: {propietario.verificacion_notas}</p>}
              </div>

              {docError && <div style={{ marginBottom:16, padding:'10px 14px', background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, fontSize:13, color:'oklch(0.45 0.08 20)' }}>{docError}</div>}

              {/* Documentos */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                {[
                  { key:'cedula_frente', label:'Cédula — Frente', desc:'Foto clara del frente de tu cédula', icon:'🪪' },
                  { key:'cedula_reverso', label:'Cédula — Reverso', desc:'Foto clara del reverso de tu cédula', icon:'🪪' },
                  { key:'selfie', label:'Selfie con cédula', desc:'Foto tuya sosteniéndola visible', icon:'🤳' },
                ].map(doc => {
                  const url = propietario?.[doc.key + '_url']
                  return (
                    <div key={doc.key} style={{ border:'1px solid var(--rule)', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, background:url?'var(--accent-tint)':'white' }}>
                      <div style={{ width:40, height:40, borderRadius:8, background:url?'var(--accent)':'var(--bg)', display:'grid', placeItems:'center', fontSize:18, flexShrink:0 }}>{url?'✓':doc.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{doc.label}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{url?'Documento subido ✓':doc.desc}</div>
                      </div>
                      <label style={{ padding:'7px 14px', borderRadius:999, background:url?'var(--bg)':'var(--ink)', color:url?'var(--ink-2)':'white', fontSize:12, fontWeight:500, cursor:'pointer', border:url?'1px solid var(--rule)':'none', flexShrink:0 }}>
                        {uploadingDoc===doc.key?'Subiendo...':url?'Cambiar':'Subir'}
                        <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if(f) uploadDoc(doc.key, f) }}/>
                      </label>
                    </div>
                  )
                })}
              </div>

              {/* Contacto */}
              <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:10, padding:'16px 20px' }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:6 }}>¿Necesitás ayuda para coordinar la verificación?</div>
                <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6, marginBottom:14 }}>Un asesor NIDO te contactará en las próximas 24 horas. También podés escribirnos directamente.</p>
                <div style={{ display:'flex', gap:10 }}>
                  <a href="mailto:hola@nido-cr.com?subject=Verificación NIDO" style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:13, fontWeight:500, textDecoration:'none' }}>✉ Enviar email</a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
