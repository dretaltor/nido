import { writeFileSync, mkdirSync } from 'fs'
mkdirSync('app/dashboard/nueva-propiedad', { recursive: true })

const code = `'use client'
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

interface Photo { id: number; url: string; uploading?: boolean }
interface WData {
  op: string; kind: string; provincia: string; canton: string; direccion: string
  beds: number; baths: number; parking: number; area: number; lot: number; year: number
  amenities: string[]; photos: Photo[]; tour: boolean; title: string; desc: string; price: string
}

function WIcon({ name }: { name: string }) {
  const p = { width:18, height:18, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.5, strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name==='house') return <svg {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-4v-7h-8v7H4a1 1 0 0 1-1-1z"/></svg>
  if (name==='apt') return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>
  if (name==='villa') return <svg {...p}><path d="M2 20h20M4 20V10l8-6 8 6v10M9 20v-6h6v6"/></svg>
  if (name==='loft') return <svg {...p}><rect x="3" y="6" width="18" height="14" rx="1"/><path d="M3 11h18M9 11v9"/></svg>
  if (name==='land') return <svg {...p}><path d="M3 18l5-8 5 6 3-4 5 6"/><path d="M3 21h18"/></svg>
  if (name==='cabin') return <svg {...p}><path d="M3 21V10l9-6 9 6v11"/><path d="M9 21v-6h6v6"/><path d="M3 14h18"/></svg>
  if (name==='check') return <svg {...p}><path d="M5 12l4 4L19 6"/></svg>
  if (name==='plus') return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
  if (name==='minus') return <svg {...p}><path d="M5 12h14"/></svg>
  if (name==='right') return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  if (name==='left') return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
  if (name==='bed') return <svg {...p}><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7"/><path d="M3 14h18M3 18h18"/></svg>
  if (name==='bath') return <svg {...p}><path d="M4 12V6a2 2 0 0 1 4 0"/><path d="M3 12h18l-1 5a3 3 0 0 1-3 2H7a3 3 0 0 1-3-2l-1-5z"/></svg>
  if (name==='ruler') return <svg {...p}><path d="M3 17 17 3l4 4L7 21z"/><path d="M7 11l2 2M10 8l2 2"/></svg>
  return null
}

function Counter({ value, onChange, min=0, max=20, step=1 }: { value:number, onChange:(v:number)=>void, min?:number, max?:number, step?:number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <button onClick={() => onChange(Math.max(min, value-step))} disabled={value<=min} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'var(--bg-card)', cursor:'pointer', display:'grid', placeItems:'center' }}>
        <WIcon name="minus"/>
      </button>
      <span style={{ fontFamily:'var(--serif)', fontSize:28, minWidth:36, textAlign:'center' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value+step))} disabled={value>=max} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'var(--bg-card)', cursor:'pointer', display:'grid', placeItems:'center' }}>
        <WIcon name="plus"/>
      </button>
    </div>
  )
}

function PhotoStep({ photos, setPhotos, tour, setTour }: { photos: Photo[], setPhotos: (p: Photo[]) => void, tour: boolean, setTour: (t: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const id = Date.now() + i
      const preview = URL.createObjectURL(file)
      setPhotos([...photos, { id, url: preview, uploading: true }])
      try {
        const ext = file.name.split('.').pop()
        const path = \`propiedades/\${id}.\${ext}\`
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files)
  }

  const removePhoto = (id: number) => setPhotos(photos.filter(p => p.id !== id))
  const moveToFirst = (id: number) => {
    const idx = photos.findIndex(p => p.id === id)
    if (idx <= 0) return
    const arr = [...photos]
    const [item] = arr.splice(idx, 1)
    setPhotos([item, ...arr])
  }

  return (
    <div className="wiz-body">
      <div className="wiz-eyebrow">Paso 05 · Fotos</div>
      <h1 className="wiz-h1">Mostrala con <em>luz</em>.</h1>
      <p className="wiz-sub">Las publicaciones con 8+ fotos reciben 3× más visitas. La primera será tu portada.</p>
      <div className="field-group">
        <label className="field-label">Galería ({photos.length} fotos)</label>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ border:\`2px dashed \${dragOver ? 'var(--accent)' : 'var(--rule)'}\`, borderRadius:8, padding:'32px 20px', cursor:'pointer', background:dragOver?'var(--accent-tint)':'var(--bg-elev)', marginBottom:16, textAlign:'center', transition:'all 0.2s' }}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => e.target.files && uploadFiles(e.target.files)} />
          <div style={{ fontSize:32, marginBottom:8 }}>📸</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:4 }}>Subí tus fotos</div>
          <div style={{ fontSize:13, color:'var(--ink-3)' }}>Arrastrá y soltá o hacé clic para seleccionar</div>
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:4 }}>JPG, PNG, WEBP · Máx 10MB por foto</div>
        </div>
        {photos.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8 }}>
            {photos.map((p, i) => (
              <div key={p.id} style={{ position:'relative', aspectRatio:'4/3', borderRadius:6, overflow:'hidden', border:i===0?'2px solid var(--accent)':'1px solid var(--rule)' }}>
                <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                {p.uploading && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'white', fontSize:10, letterSpacing:'0.1em' }}>SUBIENDO...</span>
                  </div>
                )}
                {i===0 && <span style={{ position:'absolute', bottom:6, left:6, background:'var(--accent)', color:'white', fontSize:9, padding:'2px 7px', borderRadius:999, letterSpacing:'0.06em' }}>PORTADA</span>}
                <button onClick={e => { e.stopPropagation(); removePhoto(p.id) }} style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', color:'white', cursor:'pointer', fontSize:12, display:'grid', placeItems:'center' }}>×</button>
                {i>0 && <button onClick={e => { e.stopPropagation(); moveToFirst(p.id) }} style={{ position:'absolute', bottom:4, right:4, background:'rgba(0,0,0,0.6)', border:'none', color:'white', cursor:'pointer', fontSize:9, padding:'2px 6px', borderRadius:4 }}>Portada</button>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="field-group">
        <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:8, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:'var(--serif)', fontSize:18, marginBottom:4 }}>Tour 360°</div>
            <div style={{ fontSize:13, color:'var(--ink-2)' }}>Un fotógrafo NIDO visitará la propiedad para crear la experiencia virtual.</div>
          </div>
          <button onClick={() => setTour(!tour)} style={{ padding:'8px 18px', borderRadius:999, border:\`1px solid \${tour?'var(--accent)':'var(--rule)'}\`, background:tour?'var(--accent)':'transparent', color:tour?'white':'var(--ink)', fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>
            {tour?'✓ Solicitado':'Solicitar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CSS = \`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);
    --ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);
    --rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);
    --accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);
    --serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace;
  }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  .wiz-body{animation:stepIn 0.3s ease}
  @keyframes stepIn{from{opacity:0;transform:translateY(6px)}to{opacity:1}}
  .wiz-eyebrow{font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px}
  .wiz-h1{font-family:var(--serif);font-size:clamp(36px,4vw,56px);font-weight:400;line-height:1.02;letter-spacing:-0.012em;margin:0 0 12px}
  .wiz-h1 em{font-style:italic;color:var(--accent)}
  .wiz-sub{font-size:15px;line-height:1.6;color:var(--ink-2);max-width:56ch;margin:0 0 32px}
  .field-group{border-top:1px solid var(--rule);padding:20px 0}
  .field-label{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px;display:block}
  .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
  .tile{border:1px solid var(--rule);background:var(--bg-card);border-radius:8px;padding:16px;text-align:left;cursor:pointer;transition:all 0.15s;display:flex;flex-direction:column;gap:5px;position:relative}
  .tile:hover{border-color:var(--ink-2)}
  .tile.active{border-color:var(--ink);background:var(--bg-elev);box-shadow:inset 0 0 0 1px var(--ink)}
  .tile-check{position:absolute;top:12px;right:12px;width:18px;height:18px;border-radius:50%;border:1px solid var(--rule);background:var(--bg-card);display:grid;place-items:center;color:transparent}
  .tile.active .tile-check{background:var(--ink);border-color:var(--ink);color:var(--bg)}
  .tile-title{font-family:var(--serif);font-size:18px;font-weight:400}
  .tile-meta{font-size:11px;color:var(--ink-3)}
  .toggle-group{display:inline-flex;border:1px solid var(--rule);border-radius:999px;padding:4px;background:var(--bg-card)}
  .toggle-group button{padding:8px 20px;border-radius:999px;border:none;background:transparent;color:var(--ink-2);font-size:13px;cursor:pointer;transition:all 0.15s}
  .toggle-group button.active{background:var(--ink);color:var(--bg)}
  .wiz-input{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-family:var(--sans);font-size:15px;color:var(--ink);background:var(--bg-card);outline:none;transition:border-color 0.15s}
  .wiz-input:focus{border-color:var(--ink)}
  .wiz-textarea{width:100%;min-height:140px;padding:12px 14px;border:1px solid var(--rule);border-radius:8px;font-family:var(--sans);font-size:15px;color:var(--ink);background:var(--bg-card);outline:none;resize:vertical;line-height:1.6}
  .wiz-textarea:focus{border-color:var(--ink)}
  @media(max-width:900px){
    .wizard-grid{grid-template-columns:1fr!important;padding:20px 16px 80px!important}
    .wizard-stepper{display:none!important}
    .wizard-preview{display:none!important}
  }
\`

export default function NuevaPropiedad() {
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState(new Set<number>())
  const [data, setData] = useState<WData>({ op:'venta', kind:'casa', provincia:'', canton:'', direccion:'', beds:3, baths:2, parking:2, area:0, lot:0, year:0, amenities:[], photos:[], tour:false, title:'', desc:'', price:'' })
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [aiWriting, setAiWriting] = useState(false)

  const set = (patch: Partial<WData>) => setData(d => ({ ...d, ...patch }))
  const next = () => { setCompleted(prev => new Set([...prev, current])); setCurrent(c => Math.min(7, c+1)); window.scrollTo({top:0,behavior:'smooth'}) }
  const back = () => { setCurrent(c => Math.max(0, c-1)); window.scrollTo({top:0,behavior:'smooth'}) }
  const jumpTo = (i: number) => { setCurrent(i); window.scrollTo({top:0,behavior:'smooth'}) }
  const toggleAmen = (a: string) => set({ amenities: data.amenities.includes(a) ? data.amenities.filter(x => x!==a) : [...data.amenities, a] })

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
      const ctx = \`Tipo: \${data.kind}, Ubicación: \${data.canton||data.provincia}, \${data.beds} hab, \${data.baths} baños, \${data.area}m², amenidades: \${data.amenities.join(', ')}.\`
      const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages:[{role:'user',content:'Eres copywriter inmobiliario de NIDO Costa Rica. Escribe descripción cálida y editorial (3-4 oraciones, máx 80 palabras) en español. Sin clichés. Datos: '+ctx}] }) })
      const result = await res.json()
      set({ desc: result.message })
    } catch {}
    setAiWriting(false)
  }

  const suggested = Math.round((data.area||200) * (data.kind==='lote'?800:2400))
  const fmtP = (n: number) => '$'+n.toLocaleString('en-US')

  const checklist = [
    { label:'Tipo y operación', done:!!data.kind },
    { label:'Ubicación', done:!!data.canton && !!data.provincia },
    { label:'Detalles esenciales', done:data.beds>0 && data.area>0 },
    { label:'Amenidades (mín. 4)', done:data.amenities.length>=4 },
    { label:'Al menos 4 fotos', done:data.photos.length>=4 },
    { label:'Título y descripción', done:!!data.title && data.desc.length>20 },
    { label:'Precio definido', done:!!data.price },
  ]

  if (published) return (
    <main style={{fontFamily:'var(--sans)',minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{CSS}</style>
      <div style={{maxWidth:520,textAlign:'center',padding:'0 24px'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'var(--accent)',display:'grid',placeItems:'center',margin:'0 auto 24px',color:'white'}}><WIcon name="check"/></div>
        <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(32px,5vw,48px)',fontWeight:400,marginBottom:16}}>Tu propiedad está <em style={{color:'var(--accent)'}}>publicada</em>.</h1>
        <p style={{color:'var(--ink-2)',lineHeight:1.65,marginBottom:32}}>Valeria está optimizando tu publicación. Pronto aparecerá en el portal.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/propiedades" style={{background:'var(--ink)',color:'var(--bg)',padding:'12px 24px',borderRadius:999,fontSize:14,textDecoration:'none'}}>Ver portal</a>
          <a href="/dashboard" style={{border:'1px solid var(--rule)',color:'var(--ink)',padding:'12px 24px',borderRadius:999,fontSize:14,textDecoration:'none'}}>Ir al dashboard</a>
        </div>
      </div>
    </main>
  )

  const renderStep = () => {
    switch(current) {
      case 0: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 01 · Tipo de propiedad</div>
          <h1 className="wiz-h1">¿Qué estás <em>publicando</em>?</h1>
          <p className="wiz-sub">Elegí la operación y la categoría.</p>
          <div className="field-group">
            <label className="field-label">Operación</label>
            <div className="toggle-group">
              {[['venta','Vender'],['alquiler','Alquilar'],['ambos','Ambos']].map(([v,l]) => (
                <button key={v} className={data.op===v?'active':''} onClick={() => set({op:v})}>{l}</button>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Categoría</label>
            <div className="tiles">
              {[{id:'casa',l:'Casa',m:'Independiente o en condominio',i:'house'},{id:'apt',l:'Apartamento',m:'En torre o edificio',i:'apt'},{id:'villa',l:'Villa',m:'Lujo o resort',i:'villa'},{id:'loft',l:'Loft',m:'Estudio o planta abierta',i:'loft'},{id:'cabana',l:'Cabaña',m:'Montaña o bosque',i:'cabin'},{id:'lote',l:'Lote',m:'Terreno o finca',i:'land'}].map(t => (
                <button key={t.id} className={'tile'+(data.kind===t.id?' active':'')} onClick={() => set({kind:t.id})}>
                  <span className="tile-check">{data.kind===t.id && <WIcon name="check"/>}</span>
                  <WIcon name={t.i}/><span className="tile-title">{t.l}</span><span className="tile-meta">{t.m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
      case 1: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 02 · Ubicación</div>
          <h1 className="wiz-h1">¿Dónde está <em>ubicada</em>?</h1>
          <p className="wiz-sub">La ubicación es el factor #1 para los compradores.</p>
          <div className="field-group">
            <label className="field-label">Provincia y cantón</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <select className="wiz-input" value={data.provincia} onChange={e => set({provincia:e.target.value})}>
                <option value="">Provincia</option>
                {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select className="wiz-input" value={data.canton} onChange={e => set({canton:e.target.value})}>
                <option value="">Cantón</option>
                {CANTONES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Dirección</label>
            <input className="wiz-input" placeholder="Ej. 200 m sur del parque central" value={data.direccion} onChange={e => set({direccion:e.target.value})}/>
          </div>
          <div className="field-group">
            <label className="field-label">Zona en el mapa</label>
            <div style={{background:'oklch(0.93 0.01 150)',borderRadius:8,height:160,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--rule)'}}>
              <div style={{textAlign:'center'}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:'var(--accent)',margin:'0 auto 8px'}}/>
                <p style={{fontSize:12,color:'var(--ink-3)',letterSpacing:'0.08em'}}>{data.canton||'Selecciona un cantón'}</p>
              </div>
            </div>
          </div>
        </div>
      )
      case 2: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 03 · Detalles</div>
          <h1 className="wiz-h1">Lo <em>esencial</em>.</h1>
          <p className="wiz-sub">Los datos que filtran toda búsqueda.</p>
          <div className="field-group">
            {[{l:'Habitaciones',s:'Dormitorios principales',v:data.beds,k:'beds' as const,max:15},{l:'Baños',s:'Completos y medios',v:data.baths,k:'baths' as const,max:15,step:0.5},{l:'Estacionamientos',s:'Espacios cubiertos',v:data.parking,k:'parking' as const,max:10}].map(f => (
              <div key={f.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0',borderBottom:'1px solid var(--rule-soft)'}}>
                <div><div style={{fontWeight:500,color:'var(--ink)',marginBottom:2}}>{f.l}</div><div style={{fontSize:12,color:'var(--ink-3)'}}>{f.s}</div></div>
                <Counter value={f.v} onChange={v => set({[f.k]:v})} max={f.max} step={f.step||1}/>
              </div>
            ))}
          </div>
          <div className="field-group">
            <label className="field-label">Áreas</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:6}}>m² construidos</div>
                <input className="wiz-input" type="number" placeholder="240" value={data.area||''} onChange={e => set({area:parseInt(e.target.value)||0})}/>
              </div>
              <div>
                <div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:6}}>m² lote</div>
                <input className="wiz-input" type="number" placeholder="420" value={data.lot||''} onChange={e => set({lot:parseInt(e.target.value)||0})}/>
              </div>
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Año de construcción</label>
            <input className="wiz-input" type="number" placeholder="2021" value={data.year||''} onChange={e => set({year:parseInt(e.target.value)||0})} style={{maxWidth:160}}/>
          </div>
        </div>
      )
      case 3: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 04 · Amenidades</div>
          <h1 className="wiz-h1">¿Qué la hace <em>especial</em>?</h1>
          <p className="wiz-sub">Las propiedades con 8+ amenidades reciben un 40% más de visitas.</p>
          <div className="field-group">
            <label className="field-label">Seleccioná las que correspondan ({data.amenities.length})</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
              {AMENITIES.map(a => {
                const active = data.amenities.includes(a)
                return (
                  <button key={a} onClick={() => toggleAmen(a)} style={{padding:'7px 14px',borderRadius:999,border:\`1px solid \${active?'var(--ink)':'var(--rule)'}\`,background:active?'var(--ink)':'transparent',color:active?'var(--bg)':'var(--ink-2)',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all 0.15s'}}>
                    {active && <WIcon name="check"/>}{a}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )
      case 4: return <PhotoStep photos={data.photos} setPhotos={p => set({photos:p})} tour={data.tour} setTour={t => set({tour:t})}/>
      case 5: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 06 · Descripción</div>
          <h1 className="wiz-h1">Contá su <em>historia</em>.</h1>
          <p className="wiz-sub">Una buena descripción ayuda a los compradores a imaginarse viviendo ahí.</p>
          <div className="field-group">
            <label className="field-label">Título público</label>
            <input className="wiz-input" placeholder="Ej. Casa Sereno" value={data.title} onChange={e => set({title:e.target.value})}/>
          </div>
          <div className="field-group">
            <label className="field-label">Descripción</label>
            <textarea className="wiz-textarea" placeholder="Una residencia contemporánea en condominio cerrado..." value={data.desc} onChange={e => set({desc:e.target.value})}/>
            <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
              <button onClick={writeWithAI} disabled={aiWriting} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 18px',borderRadius:999,border:'1px solid var(--rule)',background:'var(--bg-card)',cursor:'pointer',fontSize:13,fontFamily:'var(--sans)'}}>
                <span style={{fontFamily:'var(--serif)',fontSize:16,fontStyle:'italic',color:'var(--accent)'}}>V</span>
                {aiWriting?'Valeria está escribiendo...':'Escribir con Valeria IA'}
              </button>
              <span style={{fontSize:12,color:'var(--ink-3)'}}>Genera una descripción a partir de los detalles cargados.</span>
            </div>
          </div>
        </div>
      )
      case 6: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 07 · Precio</div>
          <h1 className="wiz-h1">Definí el <em>precio</em>.</h1>
          <p className="wiz-sub">Valeria analizó propiedades comparables y estima un rango de mercado.</p>
          <div className="field-group">
            <label className="field-label">{data.op==='alquiler'?'Renta mensual':'Precio de venta'} (USD)</label>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontFamily:'var(--mono)',fontSize:24,color:'var(--ink-3)'}}>$</span>
              <input className="wiz-input" type="number" placeholder={String(suggested)} value={data.price} onChange={e => set({price:e.target.value})} style={{fontSize:22,fontFamily:'var(--mono)',maxWidth:220}}/>
            </div>
            <div style={{marginTop:20,background:'var(--bg-elev)',border:'1px solid var(--rule)',borderRadius:8,padding:'16px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,fontSize:13,color:'var(--ink-2)'}}>
                <span style={{width:20,height:20,borderRadius:'50%',background:'var(--accent)',color:'white',display:'grid',placeItems:'center',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:11}}>V</span>
                Rango sugerido por Valeria IA
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:10}}>
                <span>{fmtP(Math.round(suggested*0.92))}</span>
                <span style={{color:'var(--accent)',fontWeight:600}}>{fmtP(suggested)} ideal</span>
                <span>{fmtP(Math.round(suggested*1.08))}</span>
              </div>
              <div style={{height:6,background:'var(--rule)',borderRadius:999,marginBottom:10,position:'relative'}}>
                <div style={{position:'absolute',left:'10%',right:'10%',top:0,bottom:0,background:'var(--accent-tint)',borderRadius:999}}/>
              </div>
              <p style={{fontSize:12,color:'var(--ink-3)',lineHeight:1.5}}>Las propiedades dentro del rango se venden 2.4× más rápido.</p>
            </div>
          </div>
        </div>
      )
      case 7: return (
        <div className="wiz-body">
          <div className="wiz-eyebrow">Paso 08 · Revisión final</div>
          <h1 className="wiz-h1">Última <em>mirada</em>.</h1>
          <p className="wiz-sub">Revisá que todo se vea bien antes de publicar.</p>
          {[
            {label:'Tipo',body:\`\${data.kind} · \${data.op}\`,step:0},
            {label:'Ubicación',body:\`\${[data.canton,data.provincia].filter(Boolean).join(', ')||'—'}\`,step:1},
            {label:'Detalles',body:\`\${data.beds} hab · \${data.baths} baños · \${data.area||'—'}m²\`,step:2},
            {label:'Amenidades',body:\`\${data.amenities.length} seleccionadas\`,step:3},
            {label:'Fotos',body:\`\${data.photos.length} fotos · \${data.tour?'Tour 360° solicitado':'Sin tour'}\`,step:4},
            {label:'Descripción',body:data.title||'Sin título',step:5},
            {label:'Precio',body:data.price?\`$\${parseInt(data.price).toLocaleString('en-US')}\${data.op==='alquiler'?'/mes':''}\`:'—',step:6},
          ].map(s => (
            <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--rule-soft)'}}>
              <div>
                <div style={{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:3}}>{s.label}</div>
                <div style={{fontSize:15,color:'var(--ink)'}}>{s.body}</div>
              </div>
              <button onClick={() => jumpTo(s.step)} style={{fontSize:12,color:'var(--accent)',border:'none',background:'none',cursor:'pointer',padding:'4px 8px'}}>Editar</button>
            </div>
          ))}
          <div style={{marginTop:32,display:'flex',justifyContent:'flex-end'}}>
            <button onClick={handlePublish} disabled={publishing} style={{display:'flex',alignItems:'center',gap:10,background:'var(--ink)',color:'var(--bg)',border:'none',padding:'14px 28px',borderRadius:999,fontSize:15,cursor:'pointer',fontFamily:'var(--sans)'}}>
              {publishing?'Publicando...':'Publicar propiedad'} <WIcon name="right"/>
            </button>
          </div>
        </div>
      )
      default: return null
    }
  }

  return (
    <main style={{fontFamily:'var(--sans)',minHeight:'100vh',background:'var(--bg)',color:'var(--ink)'}}>
      <style>{CSS}</style>
      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',maxWidth:1500,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:26,color:'var(--ink)',textDecoration:'none'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <div style={{fontSize:13,color:'var(--ink-3)'}}>Publicá tu propiedad · Paso {current+1} de 8</div>
          <a href="/dashboard" style={{border:'1px solid var(--rule)',color:'var(--ink)',padding:'8px 16px',borderRadius:999,fontSize:13,textDecoration:'none'}}>Salir</a>
        </div>
      </nav>

      <div className="wizard-grid" style={{maxWidth:1500,margin:'0 auto',padding:'40px 40px 80px',display:'grid',gridTemplateColumns:'200px 1fr 320px',gap:48,alignItems:'start'}}>
        <nav className="wizard-stepper" style={{position:'sticky',top:88,display:'flex',flexDirection:'column',gap:0}}>
          <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:18}}>Publicación</div>
          {STEPS.map((s,i) => {
            const done = completed.has(i), active = i===current, locked = i>current && !done
            return (
              <button key={s.key} onClick={() => !locked && jumpTo(i)} disabled={locked} style={{display:'flex',gap:12,padding:'12px 0',cursor:locked?'default':'pointer',alignItems:'flex-start',background:'transparent',border:'none',borderTop:\`1px solid \${active?'var(--ink)':'var(--rule-soft)'}\`,textAlign:'left',width:'100%',opacity:locked?0.4:1}}>
                <span style={{fontFamily:'var(--mono)',fontSize:11,color:done?'var(--accent)':active?'var(--ink)':'var(--ink-3)',letterSpacing:'0.06em',paddingTop:3,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                <span style={{flex:1}}>
                  <span style={{fontFamily:'var(--serif)',fontSize:17,lineHeight:1.15,color:active?'var(--ink)':'var(--ink-2)',fontStyle:active?'italic':'normal',display:'block'}}>{s.label}</span>
                  <small style={{fontSize:11,color:'var(--ink-3)',marginTop:2,display:'block'}}>{s.meta}</small>
                </span>
              </button>
            )
          })}
        </nav>

        <div>
          {renderStep()}
          {current < 7 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:48,paddingTop:24,borderTop:'1px solid var(--rule)'}}>
              <button onClick={back} disabled={current===0} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',color:current===0?'var(--ink-3)':'var(--ink)',cursor:current===0?'default':'pointer',fontSize:14,fontFamily:'var(--sans)'}}>
                <WIcon name="left"/> Atrás
              </button>
              <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--ink-3)',letterSpacing:'0.06em'}}>{String(current+1).padStart(2,'0')} / 08</span>
              <button onClick={next} style={{display:'flex',alignItems:'center',gap:8,background:'var(--ink)',color:'var(--bg)',border:'none',padding:'10px 24px',borderRadius:999,fontSize:14,cursor:'pointer',fontFamily:'var(--sans)'}}>
                Continuar <WIcon name="right"/>
              </button>
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
            {data.photos.length > 0 ? (
              <img src={data.photos[0].url} alt="Portada" style={{width:'100%',aspectRatio:'4/3',objectFit:'cover'}}/>
            ) : (
              <div style={{aspectRatio:'4/3',background:'oklch(0.88 0.03 80)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:'oklch(0.55 0.05 80)',letterSpacing:'0.12em'}}>TU PROPIEDAD · PORTADA</span>
              </div>
            )}
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)'}}>{data.canton||'Ubicación'}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:13}}>{data.price?'$'+parseInt(data.price).toLocaleString('en-US'):'—'}</span>
              </div>
              <div style={{fontFamily:'var(--serif)',fontSize:20,marginBottom:8}}>{data.title||'Sin título aún'}</div>
              <div style={{display:'flex',gap:12,fontSize:12,color:'var(--ink-3)'}}>
                <span style={{display:'flex',alignItems:'center',gap:4}}><WIcon name="bed"/>{data.beds}</span>
                <span style={{display:'flex',alignItems:'center',gap:4}}><WIcon name="bath"/>{data.baths}</span>
                <span style={{display:'flex',alignItems:'center',gap:4}}><WIcon name="ruler"/>{data.area||0}m²</span>
              </div>
            </div>
          </div>
          <div style={{background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:13,color:'var(--ink-2)',lineHeight:1.5}}>
            <b style={{color:'var(--accent)',display:'block',marginBottom:4,fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase'}}>Valeria · Sugerencia</b>
            {data.amenities.length<4?'Agregá al menos 4 amenidades para aparecer en filtros.':data.photos.length<4?'Subí al menos 4 fotos para destacar.':!data.desc?'Una descripción detallada aumenta el CTR 60%.':'¡Tu publicación se ve muy bien!'}
          </div>
          <div style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:10}}>Lista de verificación</div>
          {checklist.map(c => (
            <div key={c.label} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'1px solid var(--rule-soft)',fontSize:13,color:c.done?'var(--ink)':'var(--ink-3)'}}>
              <span style={{width:16,height:16,borderRadius:'50%',border:\`1px solid \${c.done?'var(--accent)':'var(--rule)'}\`,background:c.done?'var(--accent)':'transparent',display:'grid',placeItems:'center',flexShrink:0,color:'white'}}>
                {c.done && <WIcon name="check"/>}
              </span>
              {c.label}
            </div>
          ))}
        </aside>
      </div>
    </main>
  )
}`

writeFileSync('app/dashboard/nueva-propiedad/page.tsx', code)
console.log('Wizard con upload de fotos creado: ' + code.split('\n').length + ' lineas')
