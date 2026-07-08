'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import type { User } from '@supabase/supabase-js'

const PREGUNTAS = [
  {
    id: 'nombre',
    valeria: '¡Hola! Soy Valeria, tu asistente de inteligencia artificial en NIDO. Voy a hacerte unas preguntas para conocerte mejor y trabajar exactamente como vos querés. ¿Cómo te llamás?',
    placeholder: 'Tu nombre...',
    tipo: 'texto'
  },
  {
    id: 'estilo_comunicacion',
    valeria: (nombre: string) => `Mucho gusto, ${nombre}. ¿Cómo preferís comunicarte con tus clientes?`,
    opciones: ['Formal y profesional', 'Cercano y amigable', 'Directo y al grano', 'Depende del cliente'],
    tipo: 'opciones'
  },
  {
    id: 'zonas',
    valeria: '¿En qué zonas de Costa Rica te especializás o preferís trabajar?',
    placeholder: 'Ej. Escazú, Santa Ana, Heredia, zona de playa...',
    tipo: 'texto'
  },
  {
    id: 'tipo_propiedades',
    valeria: '¿Qué tipos de propiedades manejás principalmente?',
    opciones: ['Casas residenciales', 'Apartamentos', 'Locales comerciales', 'Terrenos', 'Propiedades de playa', 'Todo tipo'],
    tipo: 'opciones_multiple'
  },
  {
    id: 'rango_precio',
    valeria: '¿En qué rango de precios trabajás más cómodo?',
    opciones: ['Menos de $150K', '$150K - $300K', '$300K - $600K', 'Más de $600K', 'Todos los rangos'],
    tipo: 'opciones'
  },
  {
    id: 'objetivo_mensual',
    valeria: '¿Cuántas transacciones mensuales es tu meta este año?',
    opciones: ['1-2 cierres', '3-5 cierres', '6-10 cierres', 'Más de 10 cierres'],
    tipo: 'opciones'
  },
  {
    id: 'estilo_cierre',
    valeria: '¿Cómo describís tu estilo para cerrar tratos?',
    opciones: ['Paciente — dejo que el cliente decida a su ritmo', 'Proactivo — propongo y sigo activamente', 'Consultor — educo y asesoro antes de cerrar', 'Negociador — busco el mejor trato para ambas partes'],
    tipo: 'opciones'
  },
  {
    id: 'diferenciador',
    valeria: '¿Qué te hace diferente como asesor? ¿Cuál es tu propuesta de valor?',
    placeholder: 'Ej. Especialista en primera vivienda, amplia red de compradores extranjeros, servicio post-venta...',
    tipo: 'texto'
  },
  {
    id: 'disponibilidad',
    valeria: '¿Cuándo preferís que te contacten los clientes?',
    opciones: ['Horario de oficina (8am-5pm)', 'Disponible toda la semana', 'Solo por WhatsApp', 'Solo por email', 'Cualquier medio y horario'],
    tipo: 'opciones'
  },
  {
    id: 'meta_nido',
    valeria: (nombre: string) => `Última pregunta, ${nombre}. ¿Qué esperás lograr usando NIDO?`,
    opciones: ['Conseguir más leads calificados', 'Automatizar mi trabajo administrativo', 'Construir mi marca personal', 'Cerrar más rápido mis transacciones', 'Todo lo anterior'],
    tipo: 'opciones'
  },
]

export default function ValeriaOnboarding() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string | string[]>>({})
  const [input, setInput] = useState('')
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState<string[]>([])
  const [mensajes, setMensajes] = useState<{rol: 'valeria'|'asesor', texto: string}[]>([])
  const [guardando, setGuardando] = useState(false)
  const [completado, setCompletado] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      
      // Check if already completed
      const { data } = await supabase.from('perfiles').select('valeria_onboarding_completo, nombre').eq('id', user.id).maybeSingle()
      if (data?.valeria_onboarding_completo) { router.push('/dashboard'); return }
      
      // Start with first question
      const nombre = data?.nombre || user.user_metadata?.nombre || ''
      const primeraPregunta = PREGUNTAS[0]
      setMensajes([{ rol: 'valeria', texto: typeof primeraPregunta.valeria === 'function' ? primeraPregunta.valeria(nombre) : primeraPregunta.valeria }])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const preguntaActual = PREGUNTAS[paso]

  const responder = async (respuesta: string) => {
    const nuevasRespuestas = { ...respuestas, [preguntaActual.id]: respuesta }
    setRespuestas(nuevasRespuestas)

    // Add asesor message
    const nuevosMensajes = [...mensajes, { rol: 'asesor' as const, texto: respuesta }]
    setMensajes(nuevosMensajes)
    setInput('')
    setOpcionesSeleccionadas([])

    if (paso < PREGUNTAS.length - 1) {
      const siguientePregunta = PREGUNTAS[paso + 1]
      const nombre = String(nuevasRespuestas.nombre || '')
      
      setTimeout(() => {
        setMensajes(prev => [...prev, {
          rol: 'valeria',
          texto: typeof siguientePregunta.valeria === 'function' 
            ? siguientePregunta.valeria(nombre) 
            : siguientePregunta.valeria
        }])
        setPaso(p => p + 1)
      }, 600)
    } else {
      // All done - generate profile and save
      setTimeout(() => {
        setMensajes(prev => [...prev, {
          rol: 'valeria',
          texto: `¡Perfecto, ${nuevasRespuestas.nombre}! Ya te conozco bien. Voy a trabajar exactamente como vos querés — con tu estilo, en tus zonas, para tus clientes. Estoy lista para ayudarte a cerrar más transacciones. ¡Empecemos!`
        }])
        guardarPerfil(nuevasRespuestas)
      }, 600)
    }
  }

  const guardarPerfil = async (resp: Record<string, string | string[]>) => {
    if (!user) return
    setGuardando(true)
    
    const perfil = {
      nombre_asesor: resp.nombre,
      estilo_comunicacion: resp.estilo_comunicacion,
      zonas: resp.zonas,
      tipo_propiedades: resp.tipo_propiedades,
      rango_precio: resp.rango_precio,
      objetivo_mensual: resp.objetivo_mensual,
      estilo_cierre: resp.estilo_cierre,
      diferenciador: resp.diferenciador,
      disponibilidad: resp.disponibilidad,
      meta_nido: resp.meta_nido,
      configurado_at: new Date().toISOString(),
    }

    await supabase.from('perfiles').upsert({
      id: user.id,
      nombre: resp.nombre,
      valeria_perfil: perfil,
      valeria_onboarding_completo: true,
      updated_at: new Date().toISOString(),
    })

    setGuardando(false)
    setCompletado(true)
  }

  const handleOpcionMultiple = (opcion: string) => {
    setOpcionesSeleccionadas(prev => 
      prev.includes(opcion) ? prev.filter(o => o !== opcion) : [...prev, opcion]
    )
  }

  const confirmarMultiple = () => {
    if (opcionesSeleccionadas.length === 0) return
    responder(opcionesSeleccionadas.join(', '))
  }

  if (completado) return (
    <main style={{ minHeight:'100vh', background:'#060D08', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');`}</style>
      <div style={{ textAlign:'center', padding:40, animation:'fadeUp 0.6s ease' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 0 40px oklch(0.42 0.06 150/0.4)' }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</span>
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:400, color:'white', marginBottom:12 }}>
          ¡Todo listo, {respuestas.nombre}!
        </h1>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', marginBottom:32, lineHeight:1.7, maxWidth:400 }}>
          Tu Valeria está configurada. Ya conoce tu estilo, tus zonas y cómo querés trabajar.
        </p>
        <a href="/dashboard" style={{ display:'inline-block', padding:'14px 32px', borderRadius:999, background:'oklch(0.42 0.06 150)', color:'white', fontSize:15, fontWeight:500, textDecoration:'none' }}>
          Ir a mi dashboard →
        </a>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px oklch(0.42 0.06 150/0.3)}50%{box-shadow:0 0 40px oklch(0.42 0.06 150/0.6)}}
        .msg-valeria{animation:fadeUp 0.4s ease}
        .msg-asesor{animation:fadeUp 0.3s ease}
        .opcion-btn{border:1px solid rgba(255,255,255,0.12);borderRadius:10px;padding:12px 16px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);font-size:14px;cursor:pointer;transition:all 0.15s;text-align:left;font-family:"DM Sans",sans-serif;width:100%}
        .opcion-btn:hover{border-color:oklch(0.42 0.06 150);background:oklch(0.42 0.06 150/0.1);color:white}
        .opcion-btn.selected{border-color:oklch(0.42 0.06 150);background:oklch(0.42 0.06 150/0.2);color:white}
      `}</style>

      {/* Nav */}
      <nav style={{ padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'white' }}>NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span></div>
        <div style={{ display:'flex', gap:6 }}>
          {PREGUNTAS.map((_, i) => (
            <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:i < paso ? 'oklch(0.42 0.06 150)' : i === paso ? 'white' : 'rgba(255,255,255,0.2)', transition:'all 0.3s' }}/>
          ))}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{paso + 1} / {PREGUNTAS.length}</div>
      </nav>

      {/* Chat */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 16px', maxWidth:640, width:'100%', margin:'0 auto' }}>
        {mensajes.map((m, i) => (
          <div key={i} className={m.rol === 'valeria' ? 'msg-valeria' : 'msg-asesor'} style={{ marginBottom:16, display:'flex', justifyContent: m.rol === 'asesor' ? 'flex-end' : 'flex-start', gap:12 }}>
            {m.rol === 'valeria' && (
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,oklch(0.42 0.06 150),oklch(0.28 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, animation:'pulse-glow 3s ease infinite' }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</span>
              </div>
            )}
            <div style={{ maxWidth:'80%', padding:'12px 16px', borderRadius: m.rol === 'valeria' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: m.rol === 'valeria' ? 'rgba(255,255,255,0.07)' : 'oklch(0.42 0.06 150)', fontSize:14, color: m.rol === 'valeria' ? 'rgba(255,255,255,0.85)' : 'white', lineHeight:1.6 }}>
              {m.texto}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input area */}
      <div style={{ padding:'16px 16px 32px', maxWidth:640, width:'100%', margin:'0 auto' }}>
        {preguntaActual?.tipo === 'texto' && paso <= mensajes.filter(m => m.rol === 'valeria').length - 1 && (
          <div style={{ display:'flex', gap:10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim() && responder(input.trim())}
              placeholder={typeof preguntaActual.placeholder === 'string' ? preguntaActual.placeholder : 'Escribí tu respuesta...'}
              style={{ flex:1, padding:'13px 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, fontSize:14, color:'white', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
              autoFocus
            />
            <button onClick={() => input.trim() && responder(input.trim())} disabled={!input.trim()} style={{ padding:'13px 20px', borderRadius:12, background:'oklch(0.42 0.06 150)', color:'white', border:'none', fontSize:14, cursor:'pointer', opacity:!input.trim()?0.5:1 }}>
              →
            </button>
          </div>
        )}

        {preguntaActual?.tipo === 'opciones' && paso <= mensajes.filter(m => m.rol === 'valeria').length - 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {preguntaActual.opciones?.map(op => (
              <button key={op} className="opcion-btn" onClick={() => responder(op)}>
                {op}
              </button>
            ))}
          </div>
        )}

        {preguntaActual?.tipo === 'opciones_multiple' && paso <= mensajes.filter(m => m.rol === 'valeria').length - 1 && (
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
              {preguntaActual.opciones?.map(op => (
                <button key={op} className={'opcion-btn'+(opcionesSeleccionadas.includes(op)?' selected':'')} onClick={() => handleOpcionMultiple(op)}>
                  <span style={{ marginRight:8 }}>{opcionesSeleccionadas.includes(op)?'✓':'○'}</span>{op}
                </button>
              ))}
            </div>
            <button onClick={confirmarMultiple} disabled={opcionesSeleccionadas.length === 0} style={{ width:'100%', padding:'13px', borderRadius:12, background:'oklch(0.42 0.06 150)', color:'white', border:'none', fontSize:14, cursor:'pointer', opacity:opcionesSeleccionadas.length===0?0.5:1, fontFamily:"'DM Sans',sans-serif" }}>
              Confirmar selección →
            </button>
          </div>
        )}

        {guardando && (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:13 }}>
            Guardando tu perfil...
          </div>
        )}
      </div>
    </main>
  )
}
