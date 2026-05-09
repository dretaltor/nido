'use client'
// @ts-nocheck
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'
import { OfertaForm } from '@/components/ofertas/OfertaForm'
import { ContactoForm } from '@/components/contacto/ContactoForm'

interface Propiedad {
  id: string; titulo: string; descripcion: string; precio: number; tipo: string;
  operacion: string; habitaciones: number; banos: number; metros: number;
  zona: string; direccion: string; asesor_nombre: string; asesor_email: string; asesor_whatsapp: string; ref_id: string; fotos: string[];
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
  const { id } = require('react').use(params)
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
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
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
// Auth handled by AuthContext
    supabase.from('propiedades').select('*').eq('id', id).single().then(({ data }) => {
      setPropiedad(data)
      setLoading(false)
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
        <a href="/propiedades" style={{color:'var(--accent)'}}>← Volver al portal</a>
      </div>
    </main>
  )

  const HUES = [80, 50, 200, 130, 160]
  const hue = HUES[propiedad.id.charCodeAt(0) % HUES.length]

  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",background:'var(--bg)',minHeight:'100vh',color:'var(--ink)'}}>
      <style>{CSS}</style>

      <nav style={{position:'sticky',top:0,zIndex:50,background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--rule)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 40px',maxWidth:1200,margin:'0 auto'}}>
          <a href="/propiedades" style={{display:'flex',alignItems:'center',gap:8,color:'var(--ink-2)',textDecoration:'none',fontSize:14}}>
            <Icon name="left"/> Volver
          </a>
          <a href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'var(--ink)',textDecoration:'none'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
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
                  alert('¡Enlace copiado! Compartilo con tu cliente.')
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

        <div style={{position:'relative',height:480,borderRadius:'0 0 16px 16px',overflow:'hidden',marginBottom:32,background:`oklch(0.88 0.03 ${hue})`}}>
          {!imgError ? (
            <img
              src={propiedad.fotos && propiedad.fotos.length > 0 ? propiedad.fotos[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'}
              alt={propiedad.titulo}
              style={{width:'100%',height:'100%',objectFit:'cover'}}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:'0.1em',color:`oklch(0.55 0.05 ${hue})`}}>{propiedad.titulo.toUpperCase()} · FOTO</span>
            </div>
          )}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)'}}/>
          <div style={{position:'absolute',bottom:24,left:32}}>
            <span style={{background:propiedad.operacion==='alquiler'?'rgba(0,0,0,0.7)':'var(--accent)',color:'white',padding:'4px 12px',borderRadius:999,fontSize:12,letterSpacing:'0.06em',textTransform:'uppercase'}}>
              {propiedad.operacion==='alquiler'?'Alquiler':'Venta'}
            </span>
          </div>
        </div>

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
              {[
                {icon:'bed',val:propiedad.habitaciones,label:'Habitaciones'},
                {icon:'bath',val:propiedad.banos,label:'Baños'},
                {icon:'ruler',val:propiedad.metros+'m²',label:'Área'},
                {icon:'ruler',val:propiedad.tipo,label:'Tipo'},
              ].map((s,i) => (
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
              <div style={{height:220,borderRadius:12,background:'oklch(0.93 0.01 150)',border:'1px solid var(--rule)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,oklch(0.90 0.02 150),oklch(0.95 0.01 80))'}}/>
                <div style={{position:'relative',textAlign:'center'}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:'var(--accent)',boxShadow:'0 0 0 6px oklch(0.42 0.06 150/0.2)',margin:'0 auto 10px'}}/>
                  <p style={{fontSize:13,color:'var(--ink-2)',fontWeight:500}}>{propiedad.zona}</p>
                  <p style={{fontSize:12,color:'var(--ink-3)',marginTop:4}}>{propiedad.direccion||'Costa Rica'}</p>
                </div>
              </div>
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
                    <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'oklch(0.85 0.06 80)',flexShrink:0}}>
                      {propiedad.asesor_nombre[0]}
                    </div>
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:'white',marginBottom:2}}>{propiedad.asesor_nombre}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                        Asesor certificado NIDO
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats del asesor */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',borderBottom:'1px solid var(--rule)'}}>
                  {[
                    {val:'4.9★',label:'Calificación'},
                    {val:'87%',label:'Resp. en 2h'},
                    {val:'142',label:'Cierres'},
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
                    {icon:'✉',label:'Correo',val:propiedad.asesor_email,href:'mailto:'+propiedad.asesor_email},
                    {icon:'📱',label:'WhatsApp',val:'+506 8888-0000',href:propiedad.asesor_whatsapp?'https://wa.me/'+propiedad.asesor_whatsapp.replace(/[^0-9]/g,''):null},
                    {icon:'📍',label:'Zona',val:propiedad.zona||'Costa Rica',href:null},
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
                      />
                    </div>
                  )}
                  <a href={'https://wa.me/50688880000?text=Hola, me interesa la propiedad '+propiedad.titulo} target="_blank" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:999,background:'#22c55e',color:'white',fontSize:13,fontWeight:500,textDecoration:'none'}}>
                    <span>💬</span> Contactar por WhatsApp
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
                <div style={{margin:'0 16px 16px',background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:6,fontWeight:500}}>Valeria recomienda</div>
                  <p style={{fontSize:12,color:'var(--ink-2)',lineHeight:1.6}}>
                    Esta propiedad lleva menos de 30 dias en el mercado. Los inmuebles en {propiedad.zona||'esta zona'} se venden en promedio en 45 dias. Considera actuar pronto.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    {ofertaOpen && propiedad && (
        <OfertaForm
          propiedadId={propiedad.id}
          propiedadTitulo={propiedad.titulo}
          propiedadRef={propiedad.ref_id}
          propiedadPrecio={propiedad.precio}
          propiedadAsesorEmail={propiedad.asesor_email}
          asesorEmail={userEmail}
          asesorNombre={userNombre}
          onClose={() => setOfertaOpen(false)}
          onSuccess={() => { setOfertaOpen(false); setOfertaExito(true) }}
        />
      )}
    </main>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150); }
  a { color:inherit; text-decoration:none; } button { font:inherit; color:inherit; cursor:pointer; }
  @media(max-width:768px){
    nav > div { padding: 12px 16px !important; }
    main > div:last-child { padding: 0 16px 80px !important; }
    main > div:last-child > div:first-child { height: 280px !important; }
    main > div:last-child > div:last-child { grid-template-columns: 1fr !important; gap: 24px !important; }
  }
`
