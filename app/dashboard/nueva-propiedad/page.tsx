'use client'
import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

const STEPS = [
  { key:'tipo', label:'Tipo', meta:'Operación y categoría' },
  { key:'ubic', label:'Ubicación', meta:'Cantón y dirección' },
  { key:'detalle', label:'Detalles', meta:'Habitaciones y áreas' },
  { key:'amen', label:'Amenidades', meta:'Lo que la hace especial' },
  { key:'fotos', label:'Fotos', meta:'Imágenes y tour' },
  { key:'desc', label:'Descripción', meta:'La historia' },
  { key:'precio', label:'Precio', meta:'Y rango sugerido' },
  { key:'rev', label:'Revisar', meta:'Y publicar' },
]

const PROVINCIAS = ['San José','Alajuela','Heredia','Cartago','Puntarenas','Guanacaste','Limón']
const CANTONES = ['Escazú','Santa Ana','Curridabat','Atenas','Santa Teresa','Tamarindo','Nosara','Monteverde','Sabana','Heredia Centro','San José Centro','Moravia','Tibás']
const AMENITIES = ['Piscina','Piscina infinita','Vista al mar','Vista a la montaña','Pet friendly','Jardín privado','Patio','Terraza','Balcón','Aire acondicionado','Cocina italiana','Isla en cocina','Walk-in closet','Cuarto de servicio','Gimnasio','Salón de eventos','Coworking','Rooftop','BBQ','Jacuzzi','Smart home','Generador eléctrico','Paneles solares','Cisterna','Seguridad 24/7','Acceso controlado','Internet 1 Gbps','Cerca de escuelas']

export default function NuevaPropiedad() {
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [data, setData] = useState({ op:'venta', kind:'casa', provincia:'', canton:'', direccion:'', beds:3, baths:2, parking:2, area:0, lot:0, year:0, amenities:[] as string[], photos:[] as {id:number,url:string,uploading?:boolean}[], tour:false, title:'', desc:'', price:'' })
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [aiWriting, setAiWriting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const patch = (p: Partial<typeof data>) => setData(d => ({ ...d, ...p }))
  const setPhotos = (fn: any) => setData(d => ({ ...d, photos: typeof fn === 'function' ? fn(d.photos) : fn }))
  const next = () => { setCompleted(prev => new Set([...prev, current])); setCurrent(c => Math.min(7, c+1)); window.scrollTo({top:0,behavior:'smooth'}) }
  const back = () => { setCurrent(c => Math.max(0, c-1)); window.scrollTo({top:0,behavior:'smooth'}) }
  const jumpTo = (i: number) => { setCurrent(i); window.scrollTo({top:0,behavior:'smooth'}) }
  const toggleAmen = (a: string) => patch({ amenities: data.amenities.includes(a) ? data.amenities.filter(x => x!==a) : [...data.amenities, a] })

  const uploadFiles = async (files: FileList) => {
    const arr = Array.from(files)
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      const id = Date.now() + i
      const preview = URL.createObjectURL(file)
      setPhotos(prev => [...prev, { id, url: preview, uploading: true }])
      try {
        const ext = file.name.split('.').pop()
        const path = 'propiedades/' + id + '.' + ext
        const { error } = await supabase.storage.from('propiedades').upload(path, file, { upsert: true })
        if (!error) {
          const { data: urlData } = supabase.storage.from('propiedades').getPublicUrl(path)
          setPhotos(prev => prev.map(p => p.id === id ? { id, url: urlData.publicUrl, uploading: false } : p))
        } else {
          setPhotos(prev => prev.map(p => p.id === id ? { ...p, uploading: false } : p))
        }
      } catch {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, uploading: false } : p))
      }
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('propiedades').insert({
        titulo: data.title || data.kind + ' en ' + data.canton,
        descripcion: data.desc,
        precio: parseInt(data.price)||0,
        tipo: data.kind,
        operacion: data.op==='ambos'?'venta':data.op,
        habitaciones: data.beds,
        banos: data.baths,
        metros: data.area,
        zona: data.canton||data.provincia,
        direccion: data.direccion,
        disponible: true,
        asesor_email: user?.email||'',
        asesor_nombre: user?.user_metadata?.nombre||'',
      })
      setPublished(true)
    } catch { alert('Error al publicar.') }
    setPublishing(false)
  }

  const writeWithAI = async () => {
    setAiWriting(true)
    try {
      const ctx = 'Tipo: ' + data.kind + ', Ubicación: ' + (data.canton||data.provincia) + ', ' + data.beds + ' hab, ' + data.baths + ' baños, ' + data.area + 'm², amenidades: ' + data.amenities.join(', ') + '.'
      const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages:[{role:'user',content:'Eres copywriter inmobiliario de NIDO Costa Rica. Escribe descripción cálida y editorial (3-4 oraciones, máx 80 palabras) en español. Sin clichés. Datos: ' + ctx}] }) })
      const result = await res.json()
      patch({ desc: result.message })
    } catch {}
    setAiWriting(false)
  }

  const suggested = Math.round((data.area||200) * (data.kind==='lote'?800:2400))
  const fmtP = (n) => '$' + n.toLocaleString('en-US')
  const removePhoto = (id: number) => setPhotos(prev => prev.filter(p => p.id !== id))
  const moveToFirst = (id: number) => setPhotos(prev => {
    const idx = prev.findIndex(p => p.id === id)
    if (idx <= 0) return prev
    const arr = [...prev]
    const [item] = arr.splice(idx, 1)
    return [item, ...arr]
  })

  const checklist = [
    { label:'Tipo y operación', done:!!data.kind },
    { label:'Ubicación', done:!!data.canton && !!data.provincia },
    { label:'Detalles esenciales', done:data.beds>0 && data.area>0 },
    { label:'Amenidades (mín. 4)', done:data.amenities.length>=4 },
    { label:'Al menos 4 fotos', done:data.photos.length>=4 },
    { label:'Título y descripción', done:!!data.title && data.desc.length>20 },
    { label:'Precio definido', done:!!data.price },
  ]

  const s = { fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }

  if (published) return (
    <main style={s}>
      <style>{CSS}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        <div style={{maxWidth:520,textAlign:'center',padding:'0 24px'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'var(--accent)',display:'grid',placeItems:'center',margin:'0 auto 24px',color:'white',fontSize:24}}>✓</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,5vw,48px)',fontWeight:400,marginBottom:16}}>Tu propiedad está publicada.</h1>
          <p style={{color:'var(--ink-2)',lineHeight:1.65,marginBottom:32}}>Valeria está optimizando tu publicación. Pronto aparecerá en el portal.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <a href="/propiedades" style={{background:'var(--ink)',color:'var(--bg)',padding:'12px 24px',borderRadius:999,fontSize:14,textDecoration:'none'}}>Ver portal</a>
            <a href="/dashboard" style={{border:'1px solid var(--rule)',color:'var(--ink)',padding:'12px 24px',borderRadius:999,fontSize:14,textDecoration:'none'}}>Dashboard</a>
          </div>
        </div>
      </div>
    </main>
  )

  const renderStep = () => {
    if (current === 0) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 01 · Tipo de propiedad</div>
        <h1 className="wiz-h1">¿Qué estás <em>publicando</em>?</h1>
        <p className="wiz-sub">Elegí la operación y la categoría.</p>
        <div className="field-group">
          <label className="field-label">Operación</label>
          <div className="toggle-group">
            {[['venta','Vender'],['alquiler','Alquilar'],['ambos','Ambos']].map(([v,l]) => (
              <button key={v} className={data.op===v?'active':''} onClick={() => patch({op:v})}>{l}</button>
            ))}
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Categoría</label>
          <div className="tiles">
            {[{id:'casa',l:'Casa',m:'Independiente o en condominio'},{id:'apt',l:'Apartamento',m:'En torre o edificio'},{id:'villa',l:'Villa',m:'Lujo o resort'},{id:'loft',l:'Loft',m:'Estudio o planta abierta'},{id:'cabana',l:'Cabaña',m:'Montaña o bosque'},{id:'lote',l:'Lote',m:'Terreno o finca'}].map(t => (
              <button key={t.id} className={'tile'+(data.kind===t.id?' active':'')} onClick={() => patch({kind:t.id})}>
                <span className="tile-check">{data.kind===t.id && '✓'}</span>
                <span className="tile-title">{t.l}</span>
                <span className="tile-meta">{t.m}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
    if (current === 1) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 02 · Ubicación</div>
        <h1 className="wiz-h1">¿Dónde está <em>ubicada</em>?</h1>
        <p className="wiz-sub">La ubicación es el factor #1 para los compradores.</p>
        <div className="field-group">
          <label className="field-label">Provincia y cantón</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <select className="wiz-input" value={data.provincia} onChange={e => patch({provincia:e.target.value})}>
              <option value="">Provincia</option>
              {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="wiz-input" value={data.canton} onChange={e => patch({canton:e.target.value})}>
              <option value="">Cantón</option>
              {CANTONES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Dirección</label>
          <input className="wiz-input" placeholder="Ej. 200 m sur del parque central" value={data.direccion} onChange={e => patch({direccion:e.target.value})}/>
        </div>
        <div className="field-group">
          <label className="field-label">Zona</label>
          <div style={{background:'oklch(0.93 0.01 150)',borderRadius:8,height:160,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--rule)'}}>
            <div style={{textAlign:'center'}}>
              <div style={{width:14,height:14,borderRadius:'50%',background:'var(--accent)',margin:'0 auto 8px'}}/>
              <p style={{fontSize:12,color:'var(--ink-3)'}}>{data.canton||'Selecciona un cantón'}</p>
            </div>
          </div>
        </div>
      </div>
    )
    if (current === 2) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 03 · Detalles</div>
        <h1 className="wiz-h1">Lo <em>esencial</em>.</h1>
        <p className="wiz-sub">Los datos que filtran toda búsqueda.</p>
        <div className="field-group">
          {[{l:'Habitaciones',s:'Dormitorios principales',v:data.beds,k:'beds',max:15},{l:'Baños',s:'Completos y medios',v:data.baths,k:'baths',max:15,step:0.5},{l:'Estacionamientos',s:'Espacios cubiertos',v:data.parking,k:'parking',max:10}].map(f => (
            <div key={f.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0',borderBottom:'1px solid var(--rule-soft)'}}>
              <div><div style={{fontWeight:500,marginBottom:2}}>{f.l}</div><div style={{fontSize:12,color:'var(--ink-3)'}}>{f.s}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <button onClick={() => patch({[f.k]:Math.max(0,f.v-(f.step||1))})} style={{width:32,height:32,borderRadius:'50%',border:'1px solid var(--rule)',background:'var(--bg-card)',cursor:'pointer'}}>−</button>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,minWidth:36,textAlign:'center'}}>{f.v}</span>
                <button onClick={() => patch({[f.k]:Math.min(f.max,f.v+(f.step||1))})} style={{width:32,height:32,borderRadius:'50%',border:'1px solid var(--rule)',background:'var(--bg-card)',cursor:'pointer'}}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="field-group">
          <label className="field-label">Áreas</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:6}}>m² construidos</div><input className="wiz-input" type="number" placeholder="240" value={data.area||''} onChange={e => patch({area:parseInt(e.target.value)||0})}/></div>
            <div><div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:6}}>m² lote</div><input className="wiz-input" type="number" placeholder="420" value={data.lot||''} onChange={e => patch({lot:parseInt(e.target.value)||0})}/></div>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Año de construcción</label>
          <input className="wiz-input" type="number" placeholder="2021" value={data.year||''} onChange={e => patch({year:parseInt(e.target.value)||0})} style={{maxWidth:160}}/>
        </div>
      </div>
    )
    if (current === 3) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 04 · Amenidades</div>
        <h1 className="wiz-h1">¿Qué la hace <em>especial</em>?</h1>
        <p className="wiz-sub">Las propiedades con 8+ amenidades reciben un 40% más de visitas.</p>
        <div className="field-group">
          <label className="field-label">Seleccioná las que correspondan ({data.amenities.length})</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
            {AMENITIES.map(a => {
              const active = data.amenities.includes(a)
              return <button key={a} onClick={() => toggleAmen(a)} style={{padding:'7px 14px',borderRadius:999,border:'1px solid '+(active?'var(--ink)':'var(--rule)'),background:active?'var(--ink)':'transparent',color:active?'var(--bg)':'var(--ink-2)',fontSize:13,cursor:'pointer',transition:'all 0.15s'}}>{a}</button>
            })}
          </div>
        </div>
      </div>
    )
    if (current === 4) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 05 · Fotos</div>
        <h1 className="wiz-h1">Mostrala con <em>luz</em>.</h1>
        <p className="wiz-sub">Las publicaciones con 8+ fotos reciben 3× más visitas.</p>
        <div className="field-group">
          <label className="field-label">Galería ({data.photos.length} fotos)</label>
          <div
            onClick={() => inputRef.current && inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); if(e.dataTransfer.files.length>0) uploadFiles(e.dataTransfer.files) }}
            style={{border:'2px dashed '+(dragOver?'var(--accent)':'var(--rule)'),borderRadius:8,padding:'32px 20px',cursor:'pointer',background:dragOver?'var(--accent-tint)':'var(--bg-elev)',marginBottom:16,textAlign:'center',transition:'all 0.2s'}}
          >
            <input ref={inputRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e => e.target.files && uploadFiles(e.target.files)}/>
            <div style={{fontSize:32,marginBottom:8}}>📸</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,marginBottom:4}}>Subí tus fotos</div>
            <div style={{fontSize:13,color:'var(--ink-3)'}}>Arrastrá y soltá o hacé clic para seleccionar</div>
          </div>
          {data.photos.length > 0 && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
              {data.photos.map((photo, i) => (
                <div key={photo.id} style={{position:'relative',aspectRatio:'4/3',borderRadius:6,overflow:'hidden',border:i===0?'2px solid var(--accent)':'1px solid var(--rule)'}}>
                  <img src={photo.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  {photo.uploading && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'white',fontSize:10}}>SUBIENDO...</span></div>}
                  {i===0 && <span style={{position:'absolute',bottom:6,left:6,background:'var(--accent)',color:'white',fontSize:9,padding:'2px 7px',borderRadius:999}}>PORTADA</span>}
                  <button onClick={e => { e.stopPropagation(); removePhoto(photo.id) }} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'rgba(0,0,0,0.6)',border:'none',color:'white',cursor:'pointer',fontSize:12}}>×</button>
                  {i>0 && <button onClick={e => { e.stopPropagation(); moveToFirst(photo.id) }} style={{position:'absolute',bottom:4,right:4,background:'rgba(0,0,0,0.6)',border:'none',color:'white',cursor:'pointer',fontSize:9,padding:'2px 6px',borderRadius:4}}>Portada</button>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="field-group">
          <div style={{background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:8,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
            <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,marginBottom:4}}>Tour 360°</div><div style={{fontSize:13,color:'var(--ink-2)'}}>Un fotógrafo NIDO visitará la propiedad.</div></div>
            <button onClick={() => patch({tour:!data.tour})} style={{padding:'8px 18px',borderRadius:999,border:'1px solid '+(data.tour?'var(--accent)':'var(--rule)'),background:data.tour?'var(--accent)':'transparent',color:data.tour?'white':'var(--ink)',fontSize:13,cursor:'pointer'}}>{data.tour?'✓ Solicitado':'Solicitar'}</button>
          </div>
        </div>
      </div>
    )
    if (current === 5) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 06 · Descripción</div>
        <h1 className="wiz-h1">Contá su <em>historia</em>.</h1>
        <p className="wiz-sub">Una buena descripción ayuda a los compradores a imaginarse viviendo ahí.</p>
        <div className="field-group">
          <label className="field-label">Título público</label>
          <input className="wiz-input" placeholder="Ej. Casa Sereno" value={data.title} onChange={e => patch({title:e.target.value})}/>
        </div>
        <div className="field-group">
          <label className="field-label">Descripción</label>
          <textarea className="wiz-textarea" placeholder="Una residencia contemporánea..." value={data.desc} onChange={e => patch({desc:e.target.value})}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
            <button onClick={writeWithAI} disabled={aiWriting} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 18px',borderRadius:999,border:'1px solid var(--rule)',background:'var(--bg-card)',cursor:'pointer',fontSize:13}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:'italic',color:'var(--accent)'}}>V</span>
              {aiWriting?'Valeria está escribiendo...':'Escribir con Valeria IA'}
            </button>
          </div>
        </div>
      </div>
    )
    if (current === 6) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 07 · Precio</div>
        <h1 className="wiz-h1">Definí el <em>precio</em>.</h1>
        <p className="wiz-sub">Valeria estimó un rango de mercado para tu propiedad.</p>
        <div className="field-group">
          <label className="field-label">{data.op==='alquiler'?'Renta mensual':'Precio de venta'} (USD)</label>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,color:'var(--ink-3)'}}>$</span>
            <input className="wiz-input" type="number" placeholder={String(suggested)} value={data.price} onChange={e => patch({price:e.target.value})} style={{fontSize:22,fontFamily:"'JetBrains Mono',monospace",maxWidth:220}}/>
          </div>
          <div style={{marginTop:20,background:'var(--bg-elev)',border:'1px solid var(--rule)',borderRadius:8,padding:'16px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:10}}>
              <span>{fmtP(Math.round(suggested*0.92))}</span>
              <span style={{color:'var(--accent)',fontWeight:600}}>{fmtP(suggested)} ideal</span>
              <span>{fmtP(Math.round(suggested*1.08))}</span>
            </div>
            <div style={{height:6,background:'var(--rule)',borderRadius:999,marginBottom:10,position:'relative'}}>
              <div style={{position:'absolute',left:'10%',right:'10%',top:0,bottom:0,background:'var(--accent-tint)',borderRadius:999}}/>
            </div>
            <p style={{fontSize:12,color:'var(--ink-3)'}}>Las propiedades dentro del rango se venden 2.4× más rápido.</p>
          </div>
        </div>
      </div>
    )
    if (current === 7) return (
      <div className="wiz-body">
        <div className="wiz-eyebrow">Paso 08 · Revisión final</div>
        <h1 className="wiz-h1">Última <em>mirada</em>.</h1>
        <p className="wiz-sub">Revisá que todo se vea bien antes de publicar.</p>
        {[
          {label:'Tipo', body:data.kind+' · '+data.op, step:0},
          {label:'Ubicación', body:[data.canton,data.provincia].filter(Boolean).join(', ')||'—', step:1},
          {label:'Detalles', body:data.beds+' hab · '+data.baths+' baños · '+(data.area||'—')+'m²', step:2},
          {label:'Amenidades', body:data.amenities.length+' seleccionadas', step:3},
          {label:'Fotos', body:data.photos.length+' fotos · '+(data.tour?'Tour 360° solicitado':'Sin tour'), step:4},
          {label:'Descripción', body:data.title||'Sin título', step:5},
          {label:'Precio', body:data.price?'$'+parseInt(data.price).toLocaleString('en-US')+(data.op==='alquiler'?'/mes':''):'—', step:6},
        ].map(s => (
          <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--rule-soft)'}}>
            <div>
              <div style={{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:15}}>{s.body}</div>
            </div>
            <button onClick={() => jumpTo(s.step)} style={{fontSize:12,color:'var(--accent)',border:'none',background:'none',cursor:'pointer',padding:'4px 8px'}}>Editar</button>
          </div>
        ))}
        <div style={{marginTop:32,display:'flex',justifyContent:'flex-end'}}>
          <button onClick={handlePublish} disabled={publishing} style={{background:'var(--ink)',color:'var(--bg)',border:'none',padding:'14px 28px',borderRadius:999,fontSize:15,cursor:'pointer'}}>
            {publishing?'Publicando...':'Publicar propiedad →'}
          </button>
        </div>
      </div>
    )
    return null
  }

  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",minHeight:'100vh',background:'var(--bg)',color:'var(--ink)'}}>
      <style>{CSS}</style>
      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',maxWidth:1500,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:'var(--ink)',textDecoration:'none'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <div style={{fontSize:13,color:'var(--ink-3)'}}>Publicá tu propiedad · Paso {current+1} de 8</div>
          <a href="/dashboard" style={{border:'1px solid var(--rule)',color:'var(--ink)',padding:'8px 16px',borderRadius:999,fontSize:13,textDecoration:'none'}}>Salir</a>
        </div>
      </nav>
      <div className="wizard-grid" style={{maxWidth:1500,margin:'0 auto',padding:'40px 40px 80px',display:'grid',gridTemplateColumns:'200px 1fr 320px',gap:48,alignItems:'start'}}>
        <nav className="wizard-stepper" style={{position:'sticky',top:88,display:'flex',flexDirection:'column',gap:0}}>
          <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:18}}>Publicación</div>
          {STEPS.map((step,i) => {
            const done = completed.has(i), active = i===current, locked = i>current && !done
            return (
              <button key={step.key} onClick={() => !locked && jumpTo(i)} disabled={locked} style={{display:'flex',gap:12,padding:'12px 0',cursor:locked?'default':'pointer',alignItems:'flex-start',background:'transparent',border:'none',borderTop:'1px solid '+(active?'var(--ink)':'var(--rule-soft)'),textAlign:'left',width:'100%',opacity:locked?0.4:1}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:done?'var(--accent)':active?'var(--ink)':'var(--ink-3)',letterSpacing:'0.06em',paddingTop:3,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                <span style={{flex:1}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,lineHeight:1.15,color:active?'var(--ink)':'var(--ink-2)',fontStyle:active?'italic':'normal',display:'block'}}>{step.label}</span>
                  <small style={{fontSize:11,color:'var(--ink-3)',marginTop:2,display:'block'}}>{step.meta}</small>
                </span>
              </button>
            )
          })}
        </nav>
        <div>
          {renderStep()}
          {current < 7 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:48,paddingTop:24,borderTop:'1px solid var(--rule)'}}>
              <button onClick={back} disabled={current===0} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',color:current===0?'var(--ink-3)':'var(--ink)',cursor:current===0?'default':'pointer',fontSize:14}}>← Atrás</button>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'var(--ink-3)'}}>{String(current+1).padStart(2,'0')} / 08</span>
              <button onClick={next} style={{background:'var(--ink)',color:'var(--bg)',border:'none',padding:'10px 24px',borderRadius:999,fontSize:14,cursor:'pointer'}}>Continuar →</button>
            </div>
          )}
        </div>
        <aside className="wizard-preview" style={{position:'sticky',top:88}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)'}}>Vista previa</div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--accent)'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block'}}/>EN VIVO
            </div>
          </div>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--rule)',borderRadius:8,overflow:'hidden',marginBottom:16}}>
            {data.photos.length > 0 && data.photos[0] && data.photos[0].url ? (
              <img src={data.photos[0].url} alt="Portada" style={{width:'100%',aspectRatio:'4/3',objectFit:'cover'}}/>
            ) : (
              <div style={{aspectRatio:'4/3',background:'oklch(0.88 0.03 80)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'oklch(0.55 0.05 80)'}}>TU PROPIEDAD · PORTADA</span>
              </div>
            )}
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:11,textTransform:'uppercase',color:'var(--ink-3)'}}>{data.canton||'Ubicación'}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>{data.price?'$'+parseInt(data.price).toLocaleString('en-US'):'—'}</span>
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,marginBottom:8}}>{data.title||'Sin título aún'}</div>
              <div style={{display:'flex',gap:12,fontSize:12,color:'var(--ink-3)'}}>
                <span>{data.beds} hab</span>
                <span>{data.baths} baños</span>
                <span>{data.area||0}m²</span>
              </div>
            </div>
          </div>
          <div style={{background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:13,color:'var(--ink-2)',lineHeight:1.5}}>
            <b style={{color:'var(--accent)',display:'block',marginBottom:4,fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase'}}>Valeria · Sugerencia</b>
            {data.amenities.length<4?'Agregá al menos 4 amenidades.':data.photos.length<4?'Subí al menos 4 fotos.':!data.desc?'Una descripción aumenta el CTR 60%.':'¡Tu publicación se ve muy bien!'}
          </div>
          <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:10}}>Lista de verificación</div>
          {checklist.map(c => (
            <div key={c.label} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'1px solid var(--rule-soft)',fontSize:13,color:c.done?'var(--ink)':'var(--ink-3)'}}>
              <span style={{width:16,height:16,borderRadius:'50%',border:'1px solid '+(c.done?'var(--accent)':'var(--rule)'),background:c.done?'var(--accent)':'transparent',display:'grid',placeItems:'center',flexShrink:0,color:'white',fontSize:10}}>
                {c.done && '✓'}
              </span>
              {c.label}
            </div>
          ))}
        </aside>
      </div>
    </main>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150); }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  .wiz-body{animation:stepIn 0.3s ease}
  @keyframes stepIn{from{opacity:0;transform:translateY(6px)}to{opacity:1}}
  .wiz-eyebrow{font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px}
  .wiz-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4vw,56px);font-weight:400;line-height:1.02;letter-spacing:-0.012em;margin:0 0 12px}
  .wiz-h1 em{font-style:italic;color:var(--accent)}
  .wiz-sub{font-size:15px;line-height:1.6;color:var(--ink-2);max-width:56ch;margin:0 0 32px}
  .field-group{border-top:1px solid var(--rule);padding:20px 0}
  .field-label{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px;display:block}
  .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
  .tile{border:1px solid var(--rule);background:var(--bg-card);border-radius:8px;padding:16px;text-align:left;cursor:pointer;transition:all 0.15s;display:flex;flex-direction:column;gap:5px;position:relative}
  .tile:hover{border-color:var(--ink-2)}
  .tile.active{border-color:var(--ink);background:var(--bg-elev);box-shadow:inset 0 0 0 1px var(--ink)}
  .tile-check{position:absolute;top:12px;right:12px;width:18px;height:18px;border-radius:50%;border:1px solid var(--rule);background:var(--bg-card);display:grid;place-items:center}
  .tile.active .tile-check{background:var(--ink);border-color:var(--ink);color:var(--bg)}
  .tile-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400}
  .tile-meta{font-size:11px;color:var(--ink-3)}
  .toggle-group{display:inline-flex;border:1px solid var(--rule);border-radius:999px;padding:4px;background:var(--bg-card)}
  .toggle-group button{padding:8px 20px;border-radius:999px;border:none;background:transparent;color:var(--ink-2);font-size:13px;cursor:pointer;transition:all 0.15s}
  .toggle-group button.active{background:var(--ink);color:var(--bg)}
  .wiz-input{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:15px;color:var(--ink);background:var(--bg-card);outline:none;transition:border-color 0.15s;font-family:'DM Sans',sans-serif}
  .wiz-input:focus{border-color:var(--ink)}
  .wiz-textarea{width:100%;min-height:140px;padding:12px 14px;border:1px solid var(--rule);border-radius:8px;font-size:15px;color:var(--ink);background:var(--bg-card);outline:none;resize:vertical;line-height:1.6;font-family:'DM Sans',sans-serif}
  .wiz-textarea:focus{border-color:var(--ink)}
  @media(max-width:900px){.wizard-grid{grid-template-columns:1fr!important;padding:20px 16px 80px!important}.wizard-stepper{display:none!important}.wizard-preview{display:none!important}}
`
