'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .card{background:white;border:1px solid var(--rule);border-radius:12px;overflow:hidden}
  .row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--rule-soft);cursor:pointer;transition:background 0.15s}
  .row:last-child{border-bottom:none}
  .row:hover{background:var(--bg)}
  .badge{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:500}
  .field{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:14px;font-family:var(--sans);outline:none;transition:border-color 0.2s}
  .field:focus{border-color:var(--accent)}
  .btn{padding:10px 20px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.2s;font-family:var(--sans)}
  .btn-primary{background:var(--ink);color:white}
  .btn-accent{background:var(--accent);color:white}
  .btn-outline{background:transparent;border:1px solid var(--rule);color:var(--ink-2)}
  .drawer{position:fixed;top:0;right:0;bottom:0;width:440px;background:white;border-left:1px solid var(--rule);z-index:100;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,0.08)}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:99}
  @media(max-width:768px){.drawer{width:100%}.stats-grid{grid-template-columns:1fr 1fr!important}}
`

const ESTADOS: Record<string, {bg:string, color:string, label:string}> = {
  proyectada: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Proyectada' },
  en_proceso: { bg:'oklch(0.93 0.03 240)', color:'oklch(0.35 0.08 240)', label:'En proceso' },
  cobrada:    { bg:'var(--accent-tint)', color:'var(--accent)', label:'Cobrada' },
  cancelada:  { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Cancelada' },
}

const fmt = (n: number) => '$' + n.toLocaleString('es-CR', { minimumFractionDigits:0, maximumFractionDigits:0 })

export default function Comisiones() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [comisiones, setComisiones] = useState<any[]>([])
  const [resumen, setResumen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    propiedad_titulo:'', propiedad_ref:'', propiedad_zona:'',
    precio_venta:'', porcentaje_comision:'4', estado:'proyectada',
    fecha_cierre_estimada:'', notas:''
  })
  const setF = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const [{ data: coms }, { data: res }] = await Promise.all([
        supabase.from('comisiones').select('*').eq('asesor_email', user.email!).order('created_at', { ascending: false }),
        supabase.from('resumen_comisiones').select('*').eq('asesor_email', user.email!).maybeSingle()
      ])
      setComisiones(coms || [])
      setResumen(res)
      setLoading(false)
    })
  }, [])

  const reload = async () => {
    if (!user) return
    const [{ data: coms }, { data: res }] = await Promise.all([
      supabase.from('comisiones').select('*').eq('asesor_email', user.email!).order('created_at', { ascending: false }),
      supabase.from('resumen_comisiones').select('*').eq('asesor_email', user.email!).maybeSingle()
    ])
    setComisiones(coms || [])
    setResumen(res)
  }

  const guardar = async () => {
    if (!form.propiedad_titulo || !form.precio_venta) return
    setSaving(true)
    const precio = parseFloat(form.precio_venta.replace(/[^0-9.]/g, ''))
    const pct = parseFloat(form.porcentaje_comision) || 4
    const monto = precio * pct / 100
    await supabase.from('comisiones').insert({
      asesor_email: user.email,
      asesor_nombre: user.user_metadata?.nombre || user.email,
      propiedad_titulo: form.propiedad_titulo,
      propiedad_ref: form.propiedad_ref,
      propiedad_zona: form.propiedad_zona,
      precio_venta: precio,
      porcentaje_comision: pct,
      monto_comision: monto,
      estado: form.estado,
      fecha_cierre_estimada: form.fecha_cierre_estimada || null,
      notas: form.notas,
      creado_por: user.email,
    })
    setForm({ propiedad_titulo:'', propiedad_ref:'', propiedad_zona:'', precio_venta:'', porcentaje_comision:'4', estado:'proyectada', fecha_cierre_estimada:'', notas:'' })
    setShowForm(false)
    await reload()
    setSaving(false)
  }

  const actualizarEstado = async (id: string, estado: string) => {
    const update: any = { estado }
    if (estado === 'cobrada') update.fecha_cierre_real = new Date().toISOString().split('T')[0]
    await supabase.from('comisiones').update(update).eq('id', id)
    setSel((p:any) => ({ ...p, estado, ...update }))
    await reload()
  }

  const filtradas = filtro === 'todos' ? comisiones : comisiones.filter(c => c.estado === filtro)

  if (loading) return <div style={{ padding:40, fontFamily:'sans-serif', color:'#999' }}>Cargando...</div>

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:1200, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:22 }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:20, fontSize:13, color:'var(--ink-3)' }}>
            <a href="/dashboard">Dashboard</a>
            <a href="/dashboard/crm">CRM</a>
            <a href="/dashboard/comisiones" style={{ color:'var(--accent)', fontWeight:500 }}>Comisiones</a>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ fontSize:13 }}>+ Registrar negocio</button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Mis ingresos</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1 }}>
            Tracker de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>comisiones.</em>
          </h1>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {[
            { label:'Total cobrado', val:fmt(resumen?.total_cobrado||0), color:'var(--accent)', sub:`${resumen?.cerrados||0} negocios cerrados` },
            { label:'En pipeline', val:fmt(resumen?.total_proyectado||0), color:'oklch(0.45 0.08 80)', sub:`${(resumen?.proyectados||0)+(resumen?.en_proceso||0)} negocios activos` },
            { label:'Pipeline total', val:fmt(resumen?.total_pipeline||0), color:'var(--ink)', sub:'Cobrado + proyectado' },
            { label:'Comisión promedio', val: comisiones.length ? fmt(comisiones.reduce((a,c) => a+(c.monto_comision||0), 0)/comisiones.length) : '$0', color:'oklch(0.42 0.06 230)', sub:'Por negocio registrado' },
          ].map((s, i) => (
            <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'20px' }}>
              <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:28, color:s.color, marginBottom:4, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Proyección visual */}
        {comisiones.some(c => c.estado === 'proyectada' || c.estado === 'en_proceso') && (
          <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'20px 24px', marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:500, marginBottom:12, color:'var(--ink-2)' }}>Pipeline de comisiones</div>
            <div style={{ display:'flex', gap:4, height:12, borderRadius:999, overflow:'hidden', marginBottom:12 }}>
              {[
                { estado:'cobrada', color:'var(--accent)' },
                { estado:'en_proceso', color:'oklch(0.65 0.06 240)' },
                { estado:'proyectada', color:'oklch(0.88 0.05 80)' },
              ].map(({ estado, color }) => {
                const total = resumen?.total_pipeline || 1
                const monto = estado === 'cobrada' ? (resumen?.total_cobrado||0) : comisiones.filter(c => c.estado === estado).reduce((a,c) => a+(c.monto_comision||0), 0)
                const pct = Math.round(monto / total * 100)
                return pct > 0 ? <div key={estado} style={{ width:pct+'%', background:color, transition:'width 0.5s', minWidth:4 }}/> : null
              })}
            </div>
            <div style={{ display:'flex', gap:20, fontSize:12, color:'var(--ink-3)' }}>
              {[
                { label:'Cobrado', color:'var(--accent)', val:fmt(resumen?.total_cobrado||0) },
                { label:'En proceso', color:'oklch(0.65 0.06 240)', val:fmt(comisiones.filter(c=>c.estado==='en_proceso').reduce((a,c)=>a+(c.monto_comision||0),0)) },
                { label:'Proyectado', color:'oklch(0.88 0.05 80)', val:fmt(comisiones.filter(c=>c.estado==='proyectada').reduce((a,c)=>a+(c.monto_comision||0),0)) },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:item.color, display:'inline-block' }}/>
                  {item.label}: <strong>{item.val}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {['todos','proyectada','en_proceso','cobrada','cancelada'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding:'7px 16px', borderRadius:999, border:'1px solid var(--rule)', fontSize:12, cursor:'pointer', background:filtro===f?'var(--ink)':'transparent', color:filtro===f?'white':'var(--ink-2)', transition:'all 0.15s' }}>
              {f==='todos'?'Todos':ESTADOS[f]?.label} ({f==='todos'?comisiones.length:comisiones.filter(c=>c.estado===f).length})
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="card">
          {filtradas.length === 0 && (
            <div style={{ padding:'48px', textAlign:'center', color:'var(--ink-3)' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:15, marginBottom:8 }}>No hay negocios registrados</div>
              <p style={{ fontSize:13, marginBottom:20 }}>Registrá tu primer negocio para empezar a ver tus proyecciones</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Registrar negocio</button>
            </div>
          )}
          {filtradas.map(c => {
            const est = ESTADOS[c.estado] || ESTADOS.proyectada
            return (
              <div key={c.id} className="row" onClick={() => setSel(c)}>
                <div style={{ width:44, height:44, borderRadius:10, background:'var(--bg)', border:'1px solid var(--rule)', display:'grid', placeItems:'center', fontSize:18, flexShrink:0 }}>🏠</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{c.propiedad_titulo}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)', display:'flex', gap:10 }}>
                    {c.propiedad_ref && <span>{c.propiedad_ref}</span>}
                    {c.propiedad_zona && <span>· {c.propiedad_zona}</span>}
                    {c.fecha_cierre_estimada && <span>· Cierre est. {new Date(c.fecha_cierre_estimada).toLocaleDateString('es-CR')}</span>}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:16, fontWeight:500, color:c.estado==='cobrada'?'var(--accent)':'var(--ink)', marginBottom:4 }}>{fmt(c.monto_comision||0)}</div>
                  <span className="badge" style={{ background:est.bg, color:est.color }}>{est.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Drawer detalle */}
      {sel && (
        <>
          <div className="overlay" onClick={() => setSel(null)}/>
          <div className="drawer">
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Detalle del negocio</h2>
              <button onClick={() => setSel(null)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              {/* Monto destacado */}
              <div style={{ background:'var(--bg)', borderRadius:12, padding:'20px', textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Comisión {sel.porcentaje_comision}%</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:40, color:sel.estado==='cobrada'?'var(--accent)':'var(--ink)', marginBottom:4 }}>{fmt(sel.monto_comision||0)}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>sobre {fmt(sel.precio_venta||0)} de precio de venta</div>
              </div>

              {/* Datos */}
              <div style={{ marginBottom:20 }}>
                {[
                  { l:'Propiedad', v:sel.propiedad_titulo },
                  { l:'Referencia', v:sel.propiedad_ref||'—' },
                  { l:'Zona', v:sel.propiedad_zona||'—' },
                  { l:'Estado', v:ESTADOS[sel.estado]?.label },
                  { l:'Cierre estimado', v:sel.fecha_cierre_estimada?new Date(sel.fecha_cierre_estimada).toLocaleDateString('es-CR'):'—' },
                  { l:'Cierre real', v:sel.fecha_cierre_real?new Date(sel.fecha_cierre_real).toLocaleDateString('es-CR'):'—' },
                  { l:'Registrado', v:new Date(sel.created_at).toLocaleDateString('es-CR') },
                ].map(f => (
                  <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                    <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
                    <span style={{ fontWeight:500 }}>{f.v}</span>
                  </div>
                ))}
                {sel.notas && <div style={{ marginTop:12, fontSize:13, color:'var(--ink-2)', background:'var(--bg)', padding:'10px 12px', borderRadius:8 }}>{sel.notas}</div>}
              </div>

              {/* Cambiar estado */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Actualizar estado</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {Object.entries(ESTADOS).map(([key, val]) => (
                    <button key={key} onClick={() => actualizarEstado(sel.id, key)} style={{ padding:'10px 14px', borderRadius:8, border:'1px solid '+(sel.estado===key?val.color:'var(--rule)'), background:sel.estado===key?val.bg:'transparent', color:sel.estado===key?val.color:'var(--ink-2)', fontSize:13, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
                      {sel.estado===key?'✓':''} {val.label}
                      {key==='cobrada'&&sel.estado!=='cobrada'&&<span style={{ marginLeft:'auto', fontSize:11, color:'var(--ink-3)' }}>Registra fecha de cierre</span>}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={async () => {
                await supabase.from('comisiones').delete().eq('id', sel.id)
                setSel(null)
                await reload()
              }} style={{ width:'100%', padding:'10px', borderRadius:999, border:'1px solid oklch(0.85 0.06 20)', color:'oklch(0.45 0.08 20)', background:'transparent', fontSize:13, cursor:'pointer' }}>
                Eliminar registro
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal nuevo negocio */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)}/>
          <div className="drawer">
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>Registrar negocio</h2>
              <button onClick={() => setShowForm(false)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
            </div>
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Propiedad <span style={{ color:'var(--accent)' }}>*</span></label>
                <input className="field" placeholder="Ej. Casa en Escazú 3hab" value={form.propiedad_titulo} onChange={e => setF('propiedad_titulo', e.target.value)}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Ref NIDO</label>
                  <input className="field" placeholder="NIDO-0001" value={form.propiedad_ref} onChange={e => setF('propiedad_ref', e.target.value)}/>
                </div>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Zona</label>
                  <input className="field" placeholder="Escazú" value={form.propiedad_zona} onChange={e => setF('propiedad_zona', e.target.value)}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Precio de venta (USD) <span style={{ color:'var(--accent)' }}>*</span></label>
                  <input className="field" placeholder="350000" value={form.precio_venta} onChange={e => setF('precio_venta', e.target.value)}/>
                </div>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Comisión %</label>
                  <input className="field" type="number" min="1" max="10" value={form.porcentaje_comision} onChange={e => setF('porcentaje_comision', e.target.value)}/>
                </div>
              </div>

              {/* Preview comisión */}
              {form.precio_venta && parseFloat(form.precio_venta) > 0 && (
                <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'var(--ink-2)' }}>Tu comisión estimada</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:600, color:'var(--accent)' }}>
                    {fmt(parseFloat(form.precio_venta.replace(/[^0-9.]/g,'')) * (parseFloat(form.porcentaje_comision)||4) / 100)}
                  </span>
                </div>
              )}

              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Estado inicial</label>
                <select className="field" value={form.estado} onChange={e => setF('estado', e.target.value)}>
                  <option value="proyectada">Proyectada — en negociación</option>
                  <option value="en_proceso">En proceso — oferta aceptada</option>
                  <option value="cobrada">Cobrada — cierre completado</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Fecha de cierre estimada</label>
                <input className="field" type="date" value={form.fecha_cierre_estimada} onChange={e => setF('fecha_cierre_estimada', e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Notas</label>
                <textarea className="field" rows={3} placeholder="Observaciones del negocio..." value={form.notas} onChange={e => setF('notas', e.target.value)} style={{ resize:'vertical' }}/>
              </div>
              <button onClick={guardar} disabled={saving||!form.propiedad_titulo||!form.precio_venta} className="btn btn-primary" style={{ width:'100%', padding:'13px', fontSize:14, opacity:saving||!form.propiedad_titulo||!form.precio_venta?0.5:1 }}>
                {saving?'Guardando...':'Registrar negocio'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
