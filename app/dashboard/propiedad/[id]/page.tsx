// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { useTrial } from '../../../../lib/useTrial'
import { COSTA_RICA } from '../../../../lib/costaRicaData'
import { addWatermark } from '../../../../lib/watermark'

const AMENITIES = ['Piscina','Piscina infinita','Vista al mar','Vista a la montaña','Pet friendly','Jardín privado','Patio','Terraza','Balcón','Aire acondicionado','Cocina italiana','Isla en cocina','Walk-in closet','Cuarto de servicio','Gimnasio','Salón de eventos','Coworking','Rooftop','BBQ','Jacuzzi','Smart home','Generador eléctrico','Paneles solares','Cisterna','Seguridad 24/7','Acceso controlado','Internet 1 Gbps','Cerca de escuelas']

export default function EditarPropiedad() {
  const { bloqueado: trialBloqueado, checando: checandoTrial } = useTrial()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [msg, setMsg] = useState('')
  const [p, setP] = useState<any>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data, error } = await supabase.from('propiedades').select('*').eq('id', id).maybeSingle()
      if (error || !data || data.asesor_email !== user.email) { setNotFound(true); setLoading(false); return }
      setP({ ...data, fotos: data.fotos || [], amenidades: data.amenidades || [] })
      setLoading(false)
    })
  }, [id])

  const patch = (vals: any) => setP((prev: any) => ({ ...prev, ...vals }))

  const toggleAmen = (a: string) => {
    const list = p.amenidades || []
    patch({ amenidades: list.includes(a) ? list.filter((x: string) => x !== a) : [...list, a] })
  }

  const uploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const actuales = (p.fotos || []).length
    const disponibles = 15 - actuales
    if (disponibles <= 0) { setMsg('Ya tenés el máximo de 15 fotos. Eliminá alguna para subir nuevas.'); e.target.value=''; return }
    const filesToUpload = Array.from(files).slice(0, disponibles)
    if (files.length > disponibles) setMsg('Solo se subirán ' + disponibles + ' fotos (límite de 15 por propiedad).')
    setUploadingPhoto(true)
    const nuevas: string[] = []
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const watermarked = await addWatermark(file)
      const ext = file.name.split('.').pop()
      const path = 'propiedades/' + id + '_' + Date.now() + '_' + i + '.' + ext
      const { error } = await supabase.storage.from('Propiedades').upload(path, watermarked, { upsert: true, contentType: 'image/jpeg' })
      if (!error) {
        const { data: urlData } = supabase.storage.from('Propiedades').getPublicUrl(path)
        nuevas.push(urlData.publicUrl)
      }
    }
    patch({ fotos: [...(p.fotos || []), ...nuevas] })
    setUploadingPhoto(false)
  }

  const quitarFoto = (url: string) => {
    patch({ fotos: (p.fotos || []).filter((f: string) => f !== url) })
  }

  const [dragIdx, setDragIdx] = useState<number|null>(null)

  const moverFoto = (from: number, to: number) => {
    const arr = [...(p.fotos || [])]
    if (to < 0 || to >= arr.length) return
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    patch({ fotos: arr })
  }

  const onDragStart = (i: number) => setDragIdx(i)
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
  }
  const onDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return
    moverFoto(dragIdx, i)
    setDragIdx(null)
  }

  const guardar = async () => {
    setSaving(true)
    const { error } = await supabase.from('propiedades').update({
      titulo: p.titulo,
      descripcion: p.descripcion,
      precio: parseInt(p.precio) || 0,
      zona: p.zona,
      provincia: p.provincia,
      distrito: p.distrito,
      direccion: p.direccion,
      habitaciones: p.habitaciones,
      banos: p.banos,
      estacionamientos: p.estacionamientos,
      metros: p.metros,
      lote_m2: p.lote_m2,
      amenidades: p.amenidades,
      fotos: p.fotos,
      topografia: p.topografia,
      uso_suelo: p.uso_suelo,
      terreno_tipo: p.terreno_tipo,
      cuota_condominal: p.cuota_condominal ? parseFloat(p.cuota_condominal) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setSaving(false)
    if (error) { setMsg('Error al guardar: ' + error.message) }
    else {
      setMsg('✓ Cambios guardados'); setTimeout(() => setMsg(''), 3000)
      // Si el precio bajo, avisar a quien tenga una alerta de busqueda guardada que haga match
      fetch('/api/alertas/baja-precio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propiedadId: id }) }).catch(() => {})
    }
  }

  if (!checandoTrial && trialBloqueado) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f8f5' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
        <p style={{ fontSize:16, marginBottom:16 }}>Tu prueba de NIDO Black terminó.</p>
        <a href="/precios" style={{ background:'#1a1a1a', color:'white', padding:'12px 24px', borderRadius:999, textDecoration:'none', fontSize:14 }}>Ver planes →</a>
      </div>
    </main>
  )

  if (loading) return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', color:'#999' }}>Cargando...</main>
  )

  if (notFound) return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', flexDirection:'column', gap:16 }}>
      <p>No se encontró esta propiedad o no te pertenece.</p>
      <a href="/dashboard" style={{ color:'#15803d' }}>Volver al dashboard →</a>
    </main>
  )

  const esLote = p.tipo === 'lote'
  const cantonesDisponibles = COSTA_RICA.find((pr:any) => pr.nombre === p.provincia)?.cantones || []
  const distritosDisponibles = cantonesDisponibles.find((c:any) => c.nombre === p.zona)?.distritos || []

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'oklch(0.97 0.005 80)', color:'oklch(0.20 0.005 80)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500&family=DM+Sans:wght@400;500&display=swap');
      .inp{width:100%;padding:11px 14px;border:1px solid oklch(0.88 0.006 80);border-radius:10px;font-size:14px;font-family:inherit;background:white;outline:none;box-sizing:border-box}
      .inp:focus{border-color:oklch(0.42 0.06 150)}
      .lbl{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:oklch(0.55 0.005 80);margin-bottom:6px;display:block}
      .sec{background:white;border:1px solid oklch(0.88 0.006 80);border-radius:14px;padding:24px 28px;margin-bottom:16px}
      `}</style>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 24px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <a href="/dashboard" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'inherit', textDecoration:'none' }}>← NIDO<span style={{ color:'oklch(0.42 0.06 150)' }}>.</span></a>
          <a href={'/propiedades/'+id} target="_blank" style={{ fontSize:13, color:'oklch(0.42 0.06 150)' }}>Ver ficha pública →</a>
        </div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:400, marginBottom:4 }}>Editar propiedad</h1>
        <p style={{ fontSize:13, color:'oklch(0.55 0.005 80)', marginBottom:28 }}>{p.titulo}</p>

        {/* FOTOS */}
        <div className="sec">
          <label className="lbl">Fotos ({(p.fotos||[]).length})</label>
          <p style={{ fontSize:12, color:'oklch(0.55 0.005 80)', marginBottom:10 }}>La primera foto es la portada. Arrastrá para reordenar. Máx. 15 fotos · {(p.fotos||[]).length}/15</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
            {(p.fotos||[]).map((url: string, i: number) => (
              <div
                key={url}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDrop={() => onDrop(i)}
                style={{ position:'relative', aspectRatio:'1', borderRadius:8, overflow:'hidden', border: i===0 ? '2px solid var(--accent, oklch(0.42 0.06 150))' : '1px solid oklch(0.88 0.006 80)', cursor:'grab', opacity: dragIdx===i ? 0.4 : 1 }}
              >
                <img src={url} style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }} alt=""/>
                {i === 0 && (
                  <span style={{ position:'absolute', top:4, left:4, background:'oklch(0.42 0.06 150)', color:'white', fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:999 }}>Portada</span>
                )}
                <button onClick={() => quitarFoto(url)} style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,0.7)', color:'white', border:'none', fontSize:13, cursor:'pointer' }}>×</button>
                <div style={{ position:'absolute', bottom:4, left:4, right:4, display:'flex', justifyContent:'space-between' }}>
                  <button onClick={() => moverFoto(i, i-1)} disabled={i===0} style={{ width:22, height:22, borderRadius:6, background:'rgba(0,0,0,0.7)', color:'white', border:'none', fontSize:12, cursor:i===0?'default':'pointer', opacity:i===0?0.3:1 }}>◀</button>
                  <button onClick={() => moverFoto(i, i+1)} disabled={i===(p.fotos||[]).length-1} style={{ width:22, height:22, borderRadius:6, background:'rgba(0,0,0,0.7)', color:'white', border:'none', fontSize:12, cursor:'pointer', opacity:i===(p.fotos||[]).length-1?0.3:1 }}>▶</button>
                </div>
              </div>
            ))}
            {(p.fotos||[]).length < 15 && (
              <label style={{ aspectRatio:'1', borderRadius:8, border:'2px dashed oklch(0.85 0.006 80)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:24, color:'oklch(0.65 0.005 80)' }}>
                {uploadingPhoto ? '...' : '+'}
                <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={uploadFoto} disabled={uploadingPhoto}/>
              </label>
            )}
          </div>
        </div>

        {/* INFO BASICA */}
        <div className="sec">
          <div style={{ marginBottom:16 }}>
            <label className="lbl">Título</label>
            <input className="inp" value={p.titulo||''} onChange={e => patch({titulo:e.target.value})}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="lbl">Descripción</label>
            <textarea className="inp" rows={4} value={p.descripcion||''} onChange={e => patch({descripcion:e.target.value})}/>
          </div>
          <div>
            <label className="lbl">Precio (USD)</label>
            <input className="inp" type="number" value={p.precio||''} onChange={e => patch({precio:e.target.value})} style={{maxWidth:220}}/>
          </div>
        </div>

        {/* UBICACION */}
        <div className="sec">
          <label className="lbl">Ubicación</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            <select className="inp" value={p.provincia||''} onChange={e => patch({provincia:e.target.value, zona:'', distrito:''})}>
              <option value="">Provincia</option>
              {COSTA_RICA.map((pr:any) => <option key={pr.nombre}>{pr.nombre}</option>)}
            </select>
            <select className="inp" value={p.zona||''} onChange={e => patch({zona:e.target.value, distrito:''})} disabled={!p.provincia}>
              <option value="">Cantón</option>
              {cantonesDisponibles.map((c:any) => <option key={c.nombre}>{c.nombre}</option>)}
            </select>
            <select className="inp" value={p.distrito||''} onChange={e => patch({distrito:e.target.value})} disabled={!p.zona}>
              <option value="">Distrito</option>
              {distritosDisponibles.map((d:string) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <input className="inp" placeholder="Dirección exacta" value={p.direccion||''} onChange={e => patch({direccion:e.target.value})}/>
        </div>

        {/* DETALLES */}
        <div className="sec">
          <label className="lbl">Detalles</label>
          {esLote ? (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div><label className="lbl">m² del terreno</label><input className="inp" type="number" value={p.metros||''} onChange={e => patch({metros:parseInt(e.target.value)||0})}/></div>
                <div><label className="lbl">Topografía</label>
                  <select className="inp" value={p.topografia||''} onChange={e => patch({topografia:e.target.value})}>
                    <option value="">Seleccionar</option>
                    <option value="plano">Plano</option>
                    <option value="ligera_pendiente">Ligera pendiente</option>
                    <option value="pendiente_pronunciada">Pendiente pronunciada</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div><label className="lbl">Uso de suelo</label>
                  <select className="inp" value={p.uso_suelo||''} onChange={e => patch({uso_suelo:e.target.value})}>
                    <option value="">Seleccionar</option>
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                    <option value="agricola">Agrícola</option>
                    <option value="mixto">Mixto</option>
                    <option value="forestal">Forestal / Protegido</option>
                  </select>
                </div>
                <div><label className="lbl">Tipo de terreno</label>
                  <select className="inp" value={p.terreno_tipo||'residencial'} onChange={e => patch({terreno_tipo:e.target.value})}>
                    <option value="residencial">Residencial libre</option>
                    <option value="condominio">En condominio</option>
                  </select>
                </div>
              </div>
              {p.terreno_tipo === 'condominio' && (
                <div><label className="lbl">Cuota condominal mensual (USD)</label><input className="inp" type="number" value={p.cuota_condominal||''} onChange={e => patch({cuota_condominal:e.target.value})} style={{maxWidth:200}}/></div>
              )}
            </>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
              <div><label className="lbl">Habitaciones</label><input className="inp" type="number" value={p.habitaciones||''} onChange={e => patch({habitaciones:parseInt(e.target.value)||0})}/></div>
              <div><label className="lbl">Baños</label><input className="inp" type="number" step="0.5" value={p.banos||''} onChange={e => patch({banos:parseFloat(e.target.value)||0})}/></div>
              <div><label className="lbl">Parqueos</label><input className="inp" type="number" value={p.estacionamientos||''} onChange={e => patch({estacionamientos:parseInt(e.target.value)||0})}/></div>
              <div><label className="lbl">m² construidos</label><input className="inp" type="number" value={p.metros||''} onChange={e => patch({metros:parseInt(e.target.value)||0})}/></div>
            </div>
          )}
        </div>

        {/* AMENIDADES */}
        {!esLote && (
          <div className="sec">
            <label className="lbl">Amenidades ({(p.amenidades||[]).length})</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
              {AMENITIES.map(a => {
                const active = (p.amenidades||[]).includes(a)
                return <button key={a} onClick={() => toggleAmen(a)} style={{ padding:'6px 12px', borderRadius:999, border:'1px solid '+(active?'oklch(0.20 0.005 80)':'oklch(0.88 0.006 80)'), background:active?'oklch(0.20 0.005 80)':'transparent', color:active?'white':'oklch(0.40 0.005 80)', fontSize:12, cursor:'pointer' }}>{a}</button>
              })}
            </div>
          </div>
        )}

        {/* GUARDAR */}
        <div style={{ position:'sticky', bottom:0, background:'oklch(0.97 0.005 80)', padding:'16px 0', display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={guardar} disabled={saving} style={{ padding:'13px 32px', borderRadius:999, background:'oklch(0.20 0.005 80)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer', opacity:saving?0.6:1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {msg && <span style={{ fontSize:13, color: msg.includes('Error') ? '#dc2626' : 'oklch(0.42 0.06 150)' }}>{msg}</span>}
        </div>
      </div>
    </main>
  )
}
