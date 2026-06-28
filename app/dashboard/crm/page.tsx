'use client'
import { VisitaForm } from '@/components/visitas/VisitaForm'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Lead {
  id: string; nombre: string; email: string; telefono: string
  mensaje: string; zona_interes: string; presupuesto: string
  tipo_busqueda: string; estado: string; created_at: string
  propiedad_id?: string; propiedad_titulo?: string; propiedad?: string
}

const ESTADOS = ['todos','nuevo','contactado','interesado','visita','oferta','cerrado','perdido']
const ESTADO_BADGE: Record<string,{bg:string,color:string}> = {
  nuevo:{bg:'oklch(0.93 0.03 240)',color:'oklch(0.35 0.08 240)'},
  contactado:{bg:'oklch(0.93 0.03 280)',color:'oklch(0.35 0.08 280)'},
  interesado:{bg:'oklch(0.93 0.05 80)',color:'oklch(0.45 0.08 80)'},
  visita:{bg:'oklch(0.93 0.04 200)',color:'oklch(0.35 0.07 200)'},
  oferta:{bg:'oklch(0.93 0.05 50)',color:'oklch(0.45 0.08 50)'},
  cerrado:{bg:'var(--accent-tint)',color:'var(--accent)'},
  perdido:{bg:'oklch(0.93 0.005 80)',color:'var(--ink-3)'},
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .lead-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--rule-soft);cursor:pointer;transition:background 0.15s}
  .lead-row:hover{background:var(--bg-elev);margin:0 -16px;padding:14px 16px;border-radius:8px;border-color:transparent}
  .lead-row:last-child{border-bottom:none}
  .chip{padding:7px 14px;border-radius:999px;border:1px solid var(--rule);font-size:12px;color:var(--ink-2);cursor:pointer;transition:all 0.15s;background:transparent}
  .chip:hover{border-color:var(--ink);color:var(--ink)}
  .chip.active{background:var(--ink);color:var(--bg);border-color:var(--ink)}
  .estado-btn{padding:6px 12px;border-radius:999px;border:1px solid var(--rule);font-size:11px;cursor:pointer;background:transparent;transition:all 0.15s}
  .estado-btn:hover{border-color:var(--accent);color:var(--accent)}
  .drawer{position:fixed;top:0;right:0;bottom:0;width:420px;background:white;border-left:1px solid var(--rule);z-index:100;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,0.08);animation:slideIn 0.3s ease}
  @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:99;animation:fadeIn 0.2s ease}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @media(max-width:768px){.drawer{width:100%!important}.nav-pad{padding:14px 16px!important}.page-pad{padding:24px 16px!important}}
`

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [sel, setSel] = useState<Lead | null>(null)
  const [visitaOpen, setVisitaOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMensaje, setAiMensaje] = useState('')
  const [aiAccion, setAiAccion] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserEmail(user.email || '')
      supabase.from('leads').select('*').eq('asesor_email', user.email).order('created_at', { ascending: false })
        .then(({ data }) => { setLeads(data || []); setLoading(false) })
    })
  }, [])

  const filtrados = filtro === 'todos' ? leads : leads.filter(l => l.estado === filtro)

  const generarMensajeIA = async (accion: string) => {
    if (!sel) return
    setAiLoading(true)
    setAiAccion(accion)
    setAiMensaje('')

    const prompts: Record<string,string> = {
      seguimiento: `Redactá un mensaje de seguimiento breve y profesional en español para un lead inmobiliario. Nombre: ${sel.nombre}. Interesado en: ${sel.zona_interes || 'propiedades en Costa Rica'}. Presupuesto: ${sel.presupuesto || 'no especificado'}. Estado actual: ${sel.estado}. El mensaje debe ser cálido, personal y terminar con una pregunta abierta. Máximo 3 oraciones. Solo el mensaje, sin saludos formales ni firma.`,
      propuesta: `Redactá un mensaje de propuesta de propiedad para un lead. Nombre: ${sel.nombre}. Zona de interés: ${sel.zona_interes || 'Costa Rica'}. Presupuesto: ${sel.presupuesto || 'no especificado'}. Indicá que tenés opciones que podrían interesarle e invitá a coordinar una visita. Máximo 4 oraciones. Solo el mensaje.`,
      recordatorio: `Redactá un recordatorio amigable para un cliente interesado en propiedades. Nombre: ${sel.nombre}. El objetivo es retomar contacto sin ser invasivo. Máximo 2 oraciones directas. Solo el mensaje.`,
      cierre: `Redactá un mensaje de cierre para un lead que ya mostró interés. Nombre: ${sel.nombre}. Zona: ${sel.zona_interes}. Creá urgencia genuina y ofrecé ayuda concreta para dar el siguiente paso. Máximo 3 oraciones. Solo el mensaje.`,
    }

    const res = await fetch('/api/valeria-crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompts[accion] })
    })
    const data = await res.json()
    setAiMensaje(data.text || '')
    setAiLoading(false)
  }

  const enviarWA = async (mensaje: string) => {
    if (!sel?.telefono || !mensaje) return
    const phone = sel.telefono.replace(/\D/g,'')
    const url = 'https://wa.me/' + (phone.startsWith('506') ? phone : '506'+phone) + '?text=' + encodeURIComponent(mensaje)
    window.open(url, '_blank')
  }

  const cambiarEstado = async (lead: Lead, nuevoEstado: string) => {
    setUpdatingId(lead.id)
    await supabase.from('leads').update({ estado: nuevoEstado }).eq('id', lead.id)
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, estado: nuevoEstado } : l))
    if (sel?.id === lead.id) setSel({ ...sel, estado: nuevoEstado })
    setUpdatingId(null)
  }

  const timeAgo = (s: string) => {
    const d = Date.now() - new Date(s).getTime(), m = Math.floor(d/60000)
    if (m < 60) return 'Hace ' + m + ' min'
    const h = Math.floor(m/60); if (h < 24) return 'Hace ' + h + 'h'
    return 'Hace ' + Math.floor(h/24) + 'd'
  }

  const counts = ESTADOS.slice(1).reduce((acc, e) => ({ ...acc, [e]: leads.filter(l => l.estado === e).length }), {} as Record<string,number>)

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1400, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-3)' }}>
            <a href="/dashboard">Dashboard</a>
            <a href="/dashboard/crm" style={{ color:'var(--accent)', fontWeight:500 }}>CRM</a>
            <a href="/propiedades">Portal</a>
          </div>
          <a href="/dashboard/nueva-propiedad" style={{ background:'var(--ink)', color:'white', padding:'8px 18px', borderRadius:999, fontSize:13 }}>+ Nueva propiedad</a>
        </div>
      </nav>

      <div className="page-pad" style={{ maxWidth:1400, margin:'0 auto', padding:'32px 40px 80px' }}>
        <div style={{ marginBottom:28, animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Gestión de contactos</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1, marginBottom:6 }}>CRM de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>leads.</em></h1>
          <p style={{ fontSize:14, color:'var(--ink-2)' }}>{leads.length} contactos · {counts['nuevo']||0} sin atender</p>
        </div>

        {/* Stats rápidas */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:24 }}>
          {ESTADOS.slice(1).map(e => (
            <div key={e} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:10, padding:'12px', textAlign:'center', cursor:'pointer', borderColor:filtro===e?'var(--accent)':'var(--rule)' }} onClick={() => setFiltro(filtro===e?'todos':e)}>
              <div style={{ fontFamily:'var(--serif)', fontSize:22, color:filtro===e?'var(--accent)':'var(--ink)' }}>{counts[e]||0}</div>
              <div style={{ fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-3)', marginTop:4 }}>{e}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
          {ESTADOS.map(e => (
            <button key={e} className={'chip'+(filtro===e?' active':'')} onClick={() => setFiltro(e)}>
              {e==='todos'?'Todos los leads':e} {e!=='todos'&&counts[e]?'('+counts[e]+')':''}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'0 16px' }}>
          {loading && <p style={{ padding:'24px', color:'var(--ink-3)', textAlign:'center', fontSize:14 }}>Cargando leads...</p>}
          {!loading && filtrados.length === 0 && <p style={{ padding:'32px', color:'var(--ink-3)', textAlign:'center', fontSize:14 }}>No hay leads {filtro!=='todos'?'con estado "'+filtro+'"':'aún'}.</p>}
          {filtrados.map((l, i) => {
            const badge = ESTADO_BADGE[l.estado] || ESTADO_BADGE.nuevo
            const propAnterior = i > 0 ? (filtrados[i-1].propiedad_titulo || filtrados[i-1].propiedad) : null
            const propActual = l.propiedad_titulo || l.propiedad
            const mostrarHeader = propActual && propActual !== propAnterior
            return (
              <div key={l.id}>
                {mostrarHeader && (
                  <div style={{ padding:'14px 0 6px', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', fontWeight:600, borderTop:i>0?'1px solid var(--rule-soft)':'none', marginTop:i>0?4:0 }}>
                    🏠 {propActual}
                  </div>
                )}
              <div className="lead-row" onClick={() => setSel(l)}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', border:'1px solid var(--rule)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:17, flexShrink:0 }}>
                  {(l.nombre||'?')[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{l.nombre||'Sin nombre'}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)', display:'flex', gap:12 }}>
                    <span>{l.email||'—'}</span>
                    {l.zona_interes && <span>· {l.zona_interes}</span>}
                    {l.presupuesto && <span>· {l.presupuesto}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                  <span style={{ fontSize:11, color:'var(--ink-3)' }}>{timeAgo(l.created_at)}</span>
                  <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:badge.bg, color:badge.color }}>{l.estado}</span>
                </div>
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
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'white', zIndex:1 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400 }}>{sel.nombre||'Sin nombre'}</h2>
              <button onClick={() => setSel(null)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center' }}>×</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Datos de contacto</div>
                {[{l:'Email',v:sel.email},{l:'Teléfono',v:sel.telefono},{l:'Zona de interés',v:sel.zona_interes},{l:'Presupuesto',v:sel.presupuesto},{l:'Tipo de búsqueda',v:sel.tipo_busqueda}].map(f => f.v ? (
                  <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:14 }}>
                    <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
                    <span style={{ fontWeight:500 }}>{f.v}</span>
                  </div>
                ) : null)}
              </div>
              {sel.mensaje && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Mensaje</div>
                  <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.65, background:'var(--bg-elev)', padding:'12px 14px', borderRadius:8 }}>{sel.mensaje}</p>
                </div>
              )}
              <div>
                <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Cambiar estado</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {ESTADOS.slice(1).map(e => {
                    const badge = ESTADO_BADGE[e]
                    return (
                      <button key={e} onClick={() => cambiarEstado(sel, e)} disabled={updatingId===sel.id} style={{ padding:'6px 14px', borderRadius:999, border:'1px solid '+(sel.estado===e?'var(--accent)':'var(--rule)'), background:sel.estado===e?'var(--accent)':'transparent', color:sel.estado===e?'white':'var(--ink-2)', fontSize:12, cursor:'pointer', transition:'all 0.15s', opacity:updatingId===sel.id?0.6:1 }}>
                        {e}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* ACCIONES IA */}
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Acciones con IA</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:12 }}>
                  {[
                    { id:'seguimiento', label:'💬 Seguimiento', desc:'Retomar contacto' },
                    { id:'propuesta', label:'🏠 Propuesta', desc:'Ofrecer propiedad' },
                    { id:'recordatorio', label:'🔔 Recordatorio', desc:'Suave recordatorio' },
                    { id:'cierre', label:'🎯 Cierre', desc:'Empujar decisión' },
                  ].map(a => (
                    <button key={a.id} onClick={() => generarMensajeIA(a.id)} disabled={aiLoading} style={{ padding:'10px 8px', borderRadius:10, border:'1px solid var(--rule)', background:aiAccion===a.id?'var(--accent-tint)':'white', cursor:'pointer', textAlign:'left', opacity:aiLoading&&aiAccion!==a.id?0.5:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:aiAccion===a.id?'var(--accent)':'var(--ink)' }}>{a.label}</div>
                      <div style={{ fontSize:10, color:'var(--ink-3)' }}>{a.desc}</div>
                    </button>
                  ))}
                </div>

                {aiLoading && (
                  <div style={{ padding:'12px', background:'var(--bg)', borderRadius:8, fontSize:12, color:'var(--ink-3)', textAlign:'center' }}>
                    Valeria está redactando...
                  </div>
                )}

                {aiMensaje && !aiLoading && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'12px 14px', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', fontSize:10, color:'white' }}>V</div>
                        <span style={{ fontSize:10, color:'var(--accent)', fontWeight:500 }}>Valeria · Mensaje sugerido</span>
                      </div>
                      <textarea value={aiMensaje} onChange={e => setAiMensaje(e.target.value)} rows={4} style={{ width:'100%', border:'none', background:'transparent', fontSize:13, color:'var(--ink-2)', lineHeight:1.65, resize:'vertical', fontFamily:'var(--sans)', outline:'none' }}/>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      {sel.telefono && (
                        <button onClick={() => enviarWA(aiMensaje)} style={{ flex:1, padding:'9px', borderRadius:999, background:'#22c55e', color:'white', border:'none', fontSize:12, fontWeight:500, cursor:'pointer' }}>
                          💬 Enviar por WhatsApp
                        </button>
                      )}
                      <button onClick={() => { navigator.clipboard.writeText(aiMensaje) }} style={{ padding:'9px 14px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:12, cursor:'pointer', color:'var(--ink-2)' }}>
                        📋 Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop:12, display:'flex', gap:10 }}>
                <a href={'mailto:'+sel.email} style={{ flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--rule)', fontSize:13, textAlign:'center', color:'var(--ink)', fontWeight:500 }}>Enviar email</a>
                {sel.telefono && <a href={'https://wa.me/'+sel.telefono.replace(/\D/g,'')} target="_blank" style={{ flex:1, padding:'10px', borderRadius:999, background:'var(--ink)', color:'white', fontSize:13, textAlign:'center', fontWeight:500 }}>WhatsApp</a>}
              </div>
            </div>
          </div>
        </>
      )}
      {visitaOpen && sel && (
        <>
          <div onClick={() => setVisitaOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300, backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:301, background:'white', borderRadius:16, padding:'28px', width:'90%', maxWidth:500, boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400 }}>Agendar visita</h3>
              <button onClick={() => setVisitaOpen(false)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, cursor:'pointer' }}>×</button>
            </div>
            <VisitaForm
              propiedadId={sel.propiedad_id || ''}
              propiedadTitulo={sel.propiedad_titulo || sel.propiedad || ''}
              asesorEmail={userEmail}
              asesorWhatsapp={''}
              onClose={() => setVisitaOpen(false)}
              onSuccess={() => { setVisitaOpen(false); alert('Visita agendada ✓') }}
            />
          </div>
        </>
      )}
    </main>
  )
}
