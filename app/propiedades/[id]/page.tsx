'use client'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import dynamic from 'next/dynamic'
const MapaUbicacion = dynamic(() => import('../../../components/MapaUbicacion'), { ssr: false })
import { VisitaForm } from '@/components/visitas/VisitaForm'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'
import { OfertaForm } from '@/components/ofertas/OfertaForm'
import { ContactoForm } from '@/components/contacto/ContactoForm'
import type { CalificacionPublica } from '../../../lib/database.types'

type PerfilAsesorState = { correo?: string, nombre?: string, foto_url?: string, equipo_nido_estado?: string, telefono?: string } | null

interface Propiedad {
  id: string; titulo: string; descripcion: string; precio: number; tipo: string;
  operacion: string; habitaciones: number; banos: number; metros: number;
  zona: string; direccion: string; asesor_nombre: string; asesor_email: string; asesor_telefono?: string; asesor_whatsapp: string; ref_id: string; fotos: string[];
  distrito?: string; provincia?: string; topografia?: string; uso_suelo?: string; terreno_tipo?: string; cuota_condominal?: number;
  created_at?: string | null;
}

function Icon({ name }: { name: string }) {
  const p = { width:18, height:18, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.5, strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name==='bed') return <svg {...p}><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7"/><path d="M3 14h18M3 18h18"/></svg>
  if (name==='bath') return <svg {...p}><path d="M4 12V6a2 2 0 0 1 4 0"/><path d="M3 12h18l-1 5a3 3 0 0 1-3 2H7a3 3 0 0 1-3-2l-1-5z"/></svg>
  if (name==='ruler') return <svg {...p}><path d="M3 17 17 3l4 4L7 21z"/><path d="M7 11l2 2M10 8l2 2"/></svg>
  if (name==='send') return <svg {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>
  if (name==='x') return <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
  if (name==='left') return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
  if (name==='heart') return <svg {...p}><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/></svg>
  if (name==='share') return <svg {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
  return null
}

export default function PropiedadDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [visitaOpen, setVisitaOpen] = useState<boolean>(false)
  const [visitaExito, setVisitaExito] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [ofertaOpen, setOfertaOpen] = useState(false)
  const [ofertaExito, setOfertaExito] = useState(false)
  const { user, isAsesor } = useAuth()
  const userEmail = user?.email || ''
  const userNombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || ''
  const [messages, setMessages] = useState<{role:string,content:string}[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [fav, setFav] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [activeFoto, setActiveFoto] = useState(0)
  const [perfilAsesor, setPerfilAsesor] = useState<PerfilAsesorState>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [asesorStats, setAsesorStats] = useState<{promedio:number|null,total:number,cerradas:number,activas:number}>({promedio:null,total:0,cerradas:0,activas:0})
  const [resenasPropiedad, setResenasPropiedad] = useState<Partial<CalificacionPublica>[]>([])

  useEffect(() => {
// Auth handled by AuthContext
    supabase.from('propiedades').select('id,titulo,descripcion,tipo,precio,zona,provincia,canton,distrito,disponible,fotos,habitaciones,banos,metros,lote_m2,estacionamientos,amenidades,asesor_email,asesor_nombre,asesor_whatsapp,verificacion_estado,created_at').eq('id', id).single().then(({ data }) => {
      setPropiedad(data as Propiedad | null)
      setLoading(false)
      if (data && data.asesor_email) {
        supabase.from('asesores_publicos').select('correo,nombre,foto_url,equipo_nido_estado').eq('correo', data.asesor_email).maybeSingle()
          .then(({ data: pf }) => setPerfilAsesor(pf))
        supabase.from('asesor_calificaciones').select('promedio,total').eq('asesor_email', data.asesor_email).maybeSingle()
          .then(({ data: rat }) => setAsesorStats(s => ({ ...s, promedio: rat?.promedio ?? null, total: rat?.total ?? 0 })))
        supabase.from('comisiones').select('id', { count:'exact', head:true }).eq('asesor_email', data.asesor_email).eq('estado','cobrada')
          .then(({ count }) => setAsesorStats(s => ({ ...s, cerradas: count || 0 })))
        supabase.from('propiedades').select('id', { count:'exact', head:true }).eq('asesor_email', data.asesor_email).eq('disponible', true)
          .then(({ count }) => setAsesorStats(s => ({ ...s, activas: count || 0 })))
      }
      if (data) {
        supabase.from('calificaciones_publicas').select('calificador_nombre,calificacion,comentario,created_at').eq('propiedad_id', data.id).order('created_at', { ascending:false }).limit(6)
          .then(({ data: res }) => setResenasPropiedad(res || []))
      }
      if (data) {
        setMessages([{ role:'assistant', content: 'Hola, soy Valeria. Veo que estás viendo ' + (data.titulo||'esta propiedad') + ' en ' + (data.zona||'Costa Rica') + '. ¿Tienes alguna pregunta? Puedo coordinar una visita, resolver dudas sobre la zona o ayudarte con la pre-aprobación bancaria.' }])
      }
    })
  }, [id])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = { role:'user', content:input }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: newMsgs }) })
      const data = await res.json()
      setMessages([...newMsgs, { role:'assistant', content: data.message }])
    } catch {}
    setSending(false)
  }

  const fmt = (n: number) => '$' + n.toLocaleString('en-US')

  if (loading) return (
    <main style={{fontFamily:"'DM Sans',sans-serif",minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{CSS}</style>
      <p style={{color:'var(--ink-3)'}}>Cargando propiedad...</p>
    </main>
  )

  if (!propiedad) return (
    <main style={{fontFamily:"'DM Sans',sans-serif",minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{CSS}</style>
      <div style={{textAlign:'center'}}>
        <p style={{color:'var(--ink-3)',marginBottom:16}}>Propiedad no encontrada</p>
        <Link href="/propiedades" style={{color:'var(--accent)'}}>← Volver al portal</Link>
      </div>
    </main>
  )

  const HUES = [80, 50, 200, 130, 160]
  const hue = HUES[propiedad.id.charCodeAt(0) % HUES.length]

  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",background:'var(--bg)',minHeight:'100vh',color:'var(--ink)'}}>
      <style>{CSS}</style>
      {copied && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'var(--ink)',color:'white',padding:'10px 24px',borderRadius:999,fontSize:13,zIndex:1000,pointerEvents:'none'}}>¡Enlace copiado! Compartilo con tu cliente.</div>}

      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 40px',maxWidth:1200,margin:'0 auto'}}>
          <Link href="/propiedades" style={{display:'flex',alignItems:'center',gap:8,color:'var(--ink-2)',textDecoration:'none',fontSize:14}}>
            <Icon name="left"/> Volver
          </Link>
          <Link href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'var(--ink)',textDecoration:'none'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></Link>
          <div style={{display:'flex',gap:10}}>
            <button onClick={() => setFav(!fav)} style={{width:36,height:36,borderRadius:'50%',border:'1px solid var(--rule)',background:'white',cursor:'pointer',display:'grid',placeItems:'center',color:fav?'#e11d48':'var(--ink-3)'}}>
              <Icon name="heart"/>
            </button>
            <button
              onClick={() => {
                const url = window.location.href
                if (navigator.share) {
                  navigator.share({ title: propiedad.titulo, text: '¡Mirá esta propiedad en NIDO! ' + propiedad.titulo + ' - ' + propiedad.zona, url })
                } else {
                  navigator.clipboard.writeText(url)
                  setCopied(true); setTimeout(() => setCopied(false), 2500)
                }
              }}
              title="Compartir ficha con cliente"
              style={{width:36,height:36,borderRadius:'50%',border:'1px solid var(--rule)',background:'white',cursor:'pointer',display:'grid',placeItems:'center',color:'var(--ink-3)'}}>
              <Icon name="share"/>
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 40px 80px'}}>

        {(() => {
          const fotosArr = (propiedad.fotos && propiedad.fotos.length > 0) ? propiedad.fotos : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80']
          const idx = Math.min(activeFoto, fotosArr.length - 1)
          return (
        <>
        <div style={{position:'relative',height:480,borderRadius:'0 0 16px 16px',overflow:'hidden',marginBottom:fotosArr.length>1?12:32,background:`oklch(0.88 0.03 ${hue})`}}>
          <img
            key={idx}
            src={fotosArr[idx]}
            alt={propiedad.titulo}
            className="ficha-foto-fade"
            onClick={() => setLightboxOpen(true)}
            style={{width:'100%',height:'100%',objectFit:'cover',cursor:'zoom-in'}}
          />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:24,left:32}}>
            <span style={{background:propiedad.operacion==='alquiler'?'rgba(0,0,0,0.7)':'var(--accent)',color:'white',padding:'4px 12px',borderRadius:999,fontSize:12,letterSpacing:'0.06em',textTransform:'uppercase'}}>
              {propiedad.operacion==='alquiler'?'Alquiler':'Venta'}
            </span>
          </div>
          {fotosArr.length > 1 && (
            <>
              <button onClick={() => setActiveFoto((idx - 1 + fotosArr.length) % fotosArr.length)} style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',width:40,height:40,borderRadius:'50%',background:'rgba(0,0,0,0.5)',border:'none',color:'white',cursor:'pointer',display:'grid',placeItems:'center',fontSize:18}}>‹</button>
              <button onClick={() => setActiveFoto((idx + 1) % fotosArr.length)} style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',width:40,height:40,borderRadius:'50%',background:'rgba(0,0,0,0.5)',border:'none',color:'white',cursor:'pointer',display:'grid',placeItems:'center',fontSize:18}}>›</button>
              <div style={{position:'absolute',bottom:24,right:32,background:'rgba(0,0,0,0.55)',color:'white',fontSize:12,padding:'4px 10px',borderRadius:999}}>{idx+1} / {fotosArr.length}</div>
            </>
          )}
        </div>
        {fotosArr.length > 1 && (
          <div style={{display:'flex',gap:8,overflowX:'auto',marginBottom:32,paddingBottom:4}}>
            {fotosArr.map((url: string, i: number) => (
              <button key={i} onClick={() => setActiveFoto(i)} style={{flexShrink:0,width:72,height:54,borderRadius:8,overflow:'hidden',border:i===idx?'2px solid var(--accent)':'2px solid transparent',padding:0,cursor:'pointer',opacity:i===idx?1:0.7}}>
                <img src={url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
              </button>
            ))}
          </div>
        )}
          </>
          )
        })()}

        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:48,alignItems:'start'}}>

          <div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:12,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:8}}>{propiedad.zona}</div>
              {propiedad.ref_id && <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'var(--accent)',letterSpacing:'0.12em',marginBottom:6}}>{propiedad.ref_id}</div>}
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,4vw,52px)',fontWeight:400,lineHeight:1.05,marginBottom:12}}>{propiedad.titulo}</h1>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,color:'var(--accent)',marginBottom:4}}>
                {fmt(propiedad.precio)}{propiedad.operacion==='alquiler'?<span style={{fontSize:14,color:'var(--ink-3)'}}>/mes</span>:null}
              </div>
              <div style={{fontSize:13,color:'var(--ink-3)'}}>{propiedad.direccion}</div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid var(--rule)',borderBottom:'1px solid var(--rule)',marginBottom:32}}>
              {(propiedad.tipo === 'lote' ? [
                {icon:'ruler',val:(propiedad.metros||0)+'m²',label:'Área terreno'},
                {icon:'ruler',val:({plano:'Plano',ligera_pendiente:'Ligera pend.',pendiente_pronunciada:'Pendiente',irregular:'Irregular'} as Record<string,string>)[propiedad.topografia||'']||'—',label:'Topografía'},
                {icon:'ruler',val:({residencial:'Residencial',comercial:'Comercial',agricola:'Agrícola',mixto:'Mixto',forestal:'Forestal'} as Record<string,string>)[propiedad.uso_suelo||'']||'—',label:'Uso de suelo'},
                {icon:'ruler',val:propiedad.terreno_tipo==='condominio'?('Condominio'+(propiedad.cuota_condominal?' · $'+propiedad.cuota_condominal+'/mes':'')):'Residencial libre',label:'Tipo'},
              ] : [
                {icon:'bed',val:propiedad.habitaciones||0,label:'Habitaciones'},
                {icon:'bath',val:propiedad.banos||0,label:'Baños'},
                {icon:'ruler',val:(propiedad.metros||0)+'m²',label:'Área'},
                {icon:'ruler',val:propiedad.tipo,label:'Tipo'},
              ]).map((s,i) => (
                <div key={i} style={{padding:'18px 0',paddingLeft:i>0?16:0,borderRight:i<3?'1px solid var(--rule-soft)':'none'}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,marginBottom:2}}>{s.val}</div>
                  <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)'}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:11,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>Descripción</h3>
              <p style={{fontSize:16,lineHeight:1.75,color:'var(--ink-2)'}}>{propiedad.descripcion||'Propiedad en excelentes condiciones. Contáctanos para más información y coordinar una visita.'}</p>
            </div>

            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:11,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:16}}>Ubicación</h3>
              <div style={{height:280,borderRadius:12,border:'1px solid var(--rule)',overflow:'hidden'}}>
                <MapaUbicacion distrito={propiedad.distrito} canton={propiedad.zona} provincia={propiedad.provincia} titulo={propiedad.titulo}/>
              </div>
              <p style={{fontSize:12,color:'var(--ink-3)',marginTop:8}}>{[propiedad.distrito, propiedad.zona].filter(Boolean).join(', ')} · {propiedad.direccion||'Costa Rica'}</p>
            </div>
          </div>

          <div style={{position:'sticky',top:80}}>
            <div style={{background:'white',border:'1px solid var(--rule)',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(27,94,59,0.08)',marginBottom:16}}>
              <div style={{background:'var(--ink)',padding:'20px 24px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),oklch(0.35 0.08 150))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontStyle:'italic',color:'oklch(0.85 0.06 80)',flexShrink:0}}>V</div>
                <div>
                  <div style={{color:'white',fontWeight:500,fontSize:15}}>Valeria</div>
                  <div style={{color:'oklch(0.85 0.06 80)',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                    Asesora IA · En línea
                  </div>
                </div>
                <button onClick={() => setChatOpen(!chatOpen)} style={{marginLeft:'auto',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,padding:'6px 14px',color:'white',fontSize:13,cursor:'pointer'}}>
                  {chatOpen?'Cerrar':'Consultar'}
                </button>
              </div>

              {chatOpen && (
                <div>
                  <div style={{height:280,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:12}}>
                    {messages.map((m,i) => (
                      <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                        <div style={{maxWidth:'85%',padding:'10px 14px',borderRadius:m.role==='user'?'16px 4px 16px 16px':'4px 16px 16px 16px',background:m.role==='user'?'var(--ink)':'var(--bg-elev)',color:m.role==='user'?'white':'var(--ink)',fontSize:13,lineHeight:1.6}}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {sending && <div style={{alignSelf:'flex-start',padding:'10px 14px',borderRadius:'4px 16px 16px 16px',background:'var(--bg-elev)',fontSize:13,color:'var(--ink-3)'}}>Escribiendo...</div>}
                  </div>
                  <div style={{padding:'10px 14px',borderTop:'1px solid var(--rule)',display:'flex',gap:8}}>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMessage()} placeholder="Pregunta sobre esta propiedad..." style={{flex:1,border:'1px solid var(--rule)',borderRadius:999,padding:'8px 14px',fontSize:13,outline:'none',fontFamily:"'DM Sans',sans-serif",color:'var(--ink)'}}/>
                    <button onClick={sendMessage} disabled={sending||!input.trim()} style={{width:34,height:34,borderRadius:'50%',background:'var(--ink)',border:'none',color:'white',cursor:'pointer',display:'grid',placeItems:'center'}}>
                      <Icon name="send"/>
                    </button>
                  </div>
                </div>
              )}

              {!chatOpen && (
                <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:8}}>
                  <p style={{fontSize:13,color:'var(--ink-2)',marginBottom:4}}>¿Te interesa esta propiedad?</p>
                  <button onClick={() => setChatOpen(true)} style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:'var(--ink)',color:'white',fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    Consultar con Valeria IA
                  </button>
                  <a href="/contacto" style={{display:'block',width:'100%',padding:'12px',borderRadius:10,border:'1px solid var(--rule)',color:'var(--ink)',fontSize:14,textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
                    Hablar con asesor humano
                  </a>
                </div>
              )}
            </div>

            {(propiedad.asesor_nombre || propiedad.asesor_email) && (
              <div style={{background:'white',border:'1px solid var(--rule)',borderRadius:16,overflow:'hidden'}}>
                {/* Header asesor */}
                <div style={{background:'var(--ink)',padding:'20px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'oklch(0.85 0.06 80)',flexShrink:0,overflow:'hidden'}}>
                      {perfilAsesor?.foto_url
                        ? <img src={perfilAsesor.foto_url} alt={propiedad.asesor_nombre} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : propiedad.asesor_nombre[0]}
                    </div>
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:'white',marginBottom:2}}>{propiedad.asesor_nombre}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                        {perfilAsesor?.equipo_nido_estado === 'aprobado' ? 'Asesor NIDO' : 'Asesor afiliado a NIDO'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats del asesor */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',borderBottom:'1px solid var(--rule)'}}>
                  {[
                    {val: asesorStats.promedio ? asesorStats.promedio+'★' : '—', label: asesorStats.promedio ? asesorStats.total+' reseña'+(asesorStats.total===1?'':'s') : 'Sin reseñas aún'},
                    {val:String(asesorStats.activas), label:'Activas'},
                    {val:String(asesorStats.cerradas), label:'Cierres'},
                  ].map((s,i) => (
                    <div key={i} style={{padding:'14px 12px',textAlign:'center',borderRight:i<2?'1px solid var(--rule)':'none'}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:'var(--accent)',marginBottom:2}}>{s.val}</div>
                      <div style={{fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--ink-3)'}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Info contacto */}
                <div style={{padding:'16px 20px'}}>
                  <div style={{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:12}}>Datos de contacto</div>
                  {[
                    {icon:'✉',label:'Correo',val:perfilAsesor?.correo||propiedad.asesor_email,href:'mailto:'+(perfilAsesor?.correo||propiedad.asesor_email)},
                    {icon:'📱',label:'WhatsApp',val:perfilAsesor?.telefono||propiedad.asesor_whatsapp||'No disponible',href:(perfilAsesor?.telefono||propiedad.asesor_whatsapp)?'https://wa.me/'+(perfilAsesor?.telefono||propiedad.asesor_whatsapp).replace(/[^0-9]/g,''):null},
                    {icon:'📍',label:'Zona',val:[propiedad.zona, propiedad.provincia].filter(Boolean).join(', ')||'Costa Rica',href:null},
                  ].map(c => (
                    <div key={c.label} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--rule-soft)'}}>
                      <span style={{fontSize:14,width:20,textAlign:'center'}}>{c.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:1}}>{c.label}</div>
                        {c.href
                          ? <a href={c.href} target="_blank" style={{fontSize:13,color:'var(--accent)',fontWeight:500,textDecoration:'none'}}>{c.val}</a>
                          : <span style={{fontSize:13,color:'var(--ink)'}}>{c.val}</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:8,borderTop:'1px solid var(--rule)'}}>
                  {!isAsesor && (
                    <div style={{marginBottom:12}}>
                      <ContactoForm
                        propiedadId={propiedad.id}
                        propiedadTitulo={propiedad.titulo}
                        asesorEmail={propiedad.asesor_email}
                        asesorNombre={propiedad.asesor_nombre}
                        asesorWhatsapp={propiedad.asesor_whatsapp}
                        asesorTelefono={propiedad.asesor_telefono}
                      />
                    </div>
                  )}
                  <button onClick={() => setVisitaOpen(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,background:'var(--accent)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer',width:'100%',marginBottom:6}}>
                    <span>📅</span> Agendar visita
                  </button>
                  <a href={'https://wa.me/'+((perfilAsesor?.telefono||propiedad.asesor_whatsapp||'50688226436').replace(/[^0-9]/g,''))+'?text=Hola, me interesa la propiedad '+propiedad.titulo} target="_blank" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,background:'#22c55e',color:'white',fontSize:13,fontWeight:500,textDecoration:'none'}}>
                    <span>💬</span> Contactar por WhatsApp
                  </a>
                  <a href={'https://wa.me/?text='+encodeURIComponent('🏠 Te comparto esta propiedad en NIDO: '+propiedad.titulo+' - '+propiedad.zona+' - $'+propiedad.precio.toLocaleString()+' - https://www.nido-cr.com/propiedades/'+propiedad.id)} target="_blank" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,border:'1px solid var(--rule)',color:'var(--ink)',fontSize:13,fontWeight:500,textDecoration:'none'}}>
                    <span>🔗</span> Compartir ficha por WhatsApp
                  </a>
                  <a href={'mailto:'+propiedad.asesor_email+'?subject=Consulta sobre '+propiedad.titulo} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,border:'1px solid var(--rule)',color:'var(--ink)',fontSize:13,fontWeight:500,textDecoration:'none'}}>
                    <span>✉</span> Enviar correo
                  </a>
                  <button onClick={() => setChatOpen(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',color:'var(--accent)',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic'}}>V</span> Consultar con Valeria IA
                  </button>
                  {isAsesor && (
                    ofertaExito ? (
                      <div style={{padding:'11px',borderRadius:10,background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',textAlign:'center',fontSize:13,color:'var(--accent)',fontWeight:500}}>
                        ✓ Oferta enviada al propietario
                      </div>
                    ) : (
                      <button onClick={() => setOfertaOpen(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,background:'var(--accent)',color:'white',border:'none',fontSize:13,fontWeight:500,width:'100%',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                        <span>📋</span> Enviar oferta al propietario
                      </button>
                    )
                  )}
                </div>

                {/* Valor para el comprador */}
                {(() => {
                  // Etiqueta informativa de "días publicada" — no crítica para memoización.
                  // eslint-disable-next-line react-hooks/purity
                  const dias = propiedad?.created_at ? Math.floor((Date.now() - new Date(propiedad.created_at).getTime())/(1000*60*60*24)) : null
                  return (
                    <div style={{margin:'0 16px 16px',background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:10,padding:'12px 14px'}}>
                      <div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:6,fontWeight:500}}>Valeria recomienda</div>
                      <p style={{fontSize:12,color:'var(--ink-2)',lineHeight:1.6}}>
                        {dias !== null ? `Esta propiedad lleva ${dias} día${dias===1?'':'s'} publicada en NIDO.` : 'Esta propiedad está activa en NIDO.'} ¿Querés saber cómo se compara con otras en {propiedad.zona||'la zona'}? Preguntale a Valeria.
                      </p>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {resenasPropiedad.length > 0 && (
          <div style={{maxWidth:800,margin:'0 auto',padding:'0 24px 48px'}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,marginBottom:16}}>
              Reseñas de visitantes {asesorStats.promedio && <span style={{color:'var(--accent)'}}>· {asesorStats.promedio}★</span>}
            </h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {resenasPropiedad.map((r,i:number) => (
                <div key={i} style={{background:'white',border:'1px solid var(--rule)',borderRadius:12,padding:'16px 20px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{fontSize:13,fontWeight:500}}>{r.calificador_nombre || 'Visitante NIDO'}</div>
                    <div style={{color:'oklch(0.62 0.10 75)',fontSize:13}}>{'★'.repeat(r.calificacion||0)}{'☆'.repeat(5-(r.calificacion||0))}</div>
                  </div>
                  {r.comentario && <p style={{fontSize:13,color:'var(--ink-2)',lineHeight:1.6}}>{r.comentario}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    {ofertaOpen && propiedad && (
        <OfertaForm
          propiedadId={propiedad.id}
          propiedadTitulo={propiedad.titulo}
          propiedadRef={propiedad.ref_id}
          propiedadPrecio={propiedad.precio}
          propiedadAsesorEmail={propiedad.asesor_email}
          propiedadAsesorWhatsapp={propiedad.asesor_whatsapp}
          asesorEmail={userEmail}
          asesorNombre={userNombre}
          onClose={() => setOfertaOpen(false)}
          onSuccess={() => { setOfertaOpen(false); setOfertaExito(true) }}
        />
      )}

      {lightboxOpen && propiedad && (() => {
        const fotosArr = (propiedad.fotos && propiedad.fotos.length > 0) ? propiedad.fotos : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80']
        const idx = Math.min(activeFoto, fotosArr.length - 1)
        return (
          <div onClick={() => setLightboxOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <button onClick={() => setLightboxOpen(false)} style={{position:'absolute',top:20,right:24,width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'none',color:'white',fontSize:20,cursor:'pointer',zIndex:301}}>×</button>
            {fotosArr.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); setActiveFoto((idx - 1 + fotosArr.length) % fotosArr.length) }} style={{position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'none',color:'white',fontSize:22,cursor:'pointer',zIndex:301}}>‹</button>
            )}
            <img src={fotosArr[idx]} onClick={(e) => e.stopPropagation()} alt={propiedad.titulo} style={{maxWidth:'90vw',maxHeight:'88vh',objectFit:'contain',borderRadius:8}}/>
            {fotosArr.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); setActiveFoto((idx + 1) % fotosArr.length) }} style={{position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'none',color:'white',fontSize:22,cursor:'pointer',zIndex:301}}>›</button>
            )}
            {fotosArr.length > 1 && (
              <div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',color:'rgba(255,255,255,0.7)',fontSize:13}}>{idx+1} / {fotosArr.length}</div>
            )}
          </div>
        )
      })()}

      {visitaOpen && propiedad && (
        <>
          <div onClick={() => setVisitaOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,backdropFilter:'blur(4px)'}}/>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:201,background:'white',borderRadius:16,padding:'28px',width:'90%',maxWidth:500,boxShadow:'0 24px 80px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400}}>Agendar visita</h3>
              <button onClick={() => setVisitaOpen(false)} style={{width:32,height:32,borderRadius:'50%',border:'1px solid var(--rule)',background:'transparent',fontSize:16,cursor:'pointer'}}>×</button>
            </div>
            {visitaExito ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:48,marginBottom:12}}>✅</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:8}}>Solicitud enviada</div>
                <p style={{fontSize:14,color:'var(--ink-3)',lineHeight:1.7,marginBottom:20}}>El asesor recibirá tu solicitud y te confirmará la visita por WhatsApp en las próximas horas.</p>
                <button onClick={() => { setVisitaOpen(false); setVisitaExito(false) }} style={{padding:'10px 24px',borderRadius:999,background:'var(--ink)',color:'white',border:'none',fontSize:14,cursor:'pointer'}}>Cerrar</button>
              </div>
            ) : (
              <VisitaForm
                propiedadId={propiedad.id}
                propiedadTitulo={propiedad.titulo}
                asesorEmail={propiedad.asesor_email || ''}
                asesorNombre={propiedad.asesor_nombre || ''}
                asesorWhatsapp={propiedad.asesor_whatsapp || ''}
                onClose={() => setVisitaOpen(false)}
                onSuccess={() => setVisitaExito(true)}
              />
            )}
          </div>
        </>
      )}
    </main>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150); }
  a { color:inherit; text-decoration:none; } button { font:inherit; color:inherit; cursor:pointer; }
  .ficha-foto-fade { animation: fichaFadeIn 0.35s ease; }
  @keyframes fichaFadeIn { from { opacity:0; transform:scale(1.02); } to { opacity:1; transform:scale(1); } }
  @media(max-width:768px){
    nav > div { padding: 12px 16px !important; }
    main > div:last-child { padding: 0 16px 80px !important; }
    main > div:last-child > div:first-child { height: 280px !important; }
    main > div:last-child > div:last-child { grid-template-columns: 1fr !important; gap: 24px !important; }
  }
`
