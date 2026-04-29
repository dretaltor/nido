'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const CURSOS: Record<number, any> = {
  1: {
    titulo: 'Fundamentos de ventas inmobiliarias',
    cat: 'Ventas', nivel: 'Basico', dur: '2 horas', icon: '🏠', hue: 150,
    modulos: [
      {
        id: 1, titulo: 'Que busca realmente un comprador',
        contenido: `Cuando alguien dice que busca una casa de 3 habitaciones, en realidad busca seguridad, estatus o una inversion.

EL ERROR MAS COMUN es responder a las necesidades declaradas en lugar de las reales.

LAS 5 NECESIDADES REALES:

1. Seguridad y estabilidad - El comprador quiere sentir que su familia esta protegida.

2. Estatus y pertenencia - Las zonas premium como Escazu no se venden solo por metros cuadrados, sino por el estilo de vida que representan.

3. Practicidad y tiempo - A que distancia trabaja? En el GAM esto puede ser determinante.

4. Inversion a largo plazo - Les interesa saber cuanto se ha revalorizado la zona en los ultimos 5 anos.

5. Sueno y emocion - La decision final siempre es emocional, aunque el proceso sea racional.

LA TECNICA DEL ICEBERG:
Lo que el cliente dice = la punta del iceberg.
Lo que el cliente quiere = lo que esta bajo el agua.

EJERCICIO PRACTICO: En tu proxima consulta, antes de mostrar propiedades, hace estas preguntas:
- Como imaginas tu vida ideal en 5 anos?
- Que es lo que mas te importa del lugar donde vivis?
- Has vivido en otra zona antes? Que te gusto o no te gusto?`,
        recursos: [
          { nombre: 'Guia: Las 20 preguntas clave para calificar compradores', tipo: 'PDF' },
          { nombre: 'Plantilla: Ficha de perfil del cliente', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Cual es el error mas comun del asesor novato?', opciones: ['No mostrar suficientes propiedades', 'Responder a necesidades declaradas en lugar de reales', 'No conocer bien la zona', 'Cobrar comision muy alta'], correcta: 1 },
          { pregunta: 'Cuantas necesidades reales existen detras de cada compra?', opciones: ['3', '4', '5', '6'], correcta: 2 },
        ]
      },
      {
        id: 2, titulo: 'Como hacer una presentacion efectiva',
        contenido: `Una presentacion inmobiliaria no es un recorrido turistico. Es una experiencia disenada para que el cliente se imagine viviendo ahi.

LOS 3 ERRORES FATALES:

Error 1: Hablar demasiado - El 80% del tiempo deberias estar escuchando.

Error 2: Empezar por lo peor - Siempre empieza por el punto mas fuerte de la propiedad.

Error 3: Ignorar las senales - Cuando el cliente toca algo o hace una pregunta especifica, esta interesado.

LA ESTRUCTURA GANADORA:

Paso 1: Pre-visita - Manda un mensaje anticipando los puntos destacados. Crea expectativa.

Paso 2: La llegada - Los primeros 90 segundos son irreversibles. Luces encendidas, temperatura agradable.

Paso 3: El recorrido estrategico - Empieza por el punto mas fuerte, guarda el segundo para el final.

Paso 4: El silencio estrategico - Despues del punto culminante, callate. El primero que habla pierde.

Paso 5: El cierre de la visita - Nunca preguntes que te parecio. Pregunta: de todo lo que viste, que fue lo que mas te llamo la atencion?`,
        recursos: [
          { nombre: 'Checklist: Preparacion de propiedad para visita', tipo: 'PDF' },
          { nombre: 'Script: Guion de presentacion de alto impacto', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Con que parte de la propiedad deberias empezar la presentacion?', opciones: ['La mas economica', 'El punto mas fuerte', 'La entrada principal', 'La cocina'], correcta: 1 },
          { pregunta: 'Que pregunta deberias hacer al cerrar la visita?', opciones: ['Que te parecio?', 'Lo compras?', 'Que fue lo que mas te llamo la atencion?', 'Tenes el presupuesto?'], correcta: 2 },
        ]
      },
      {
        id: 3, titulo: 'Manejo de objeciones',
        contenido: `Una objecion no es un rechazo, es una peticion de mas informacion.

LAS 5 OBJECIONES MAS COMUNES:

1. Esta muy caro - Rara vez es sobre el dinero, es sobre el valor percibido.
Respuesta: Entiendo. Con que estas comparando? Quiero asegurarme de que la comparacion sea justa.

2. Necesito pensarlo - No me has convencido del todo o tengo miedo de decidir mal.
Respuesta: Por supuesto. Que informacion adicional te ayudaria a decidir con mas confianza?

3. Mi conyuge tiene que verla - No es una objecion, es una condicion. Nunca presiones aqui.
Respuesta: Absolutamente. Cuando podemos coordinar para que ambos la vean?

4. El vecindario no me convence - Pregunta que es especificamente lo que le preocupa.

5. Necesito vender primero - Ofreceles acompanamiento en el proceso de venta. Duplicas tu comision.

LA FORMULA AEA:
Acuerdo - Exploracion - Argumento

1. Acuerda con la emocion: Entiendo perfectamente tu preocupacion
2. Explora la raiz real: Que es especificamente lo que te genera esa duda?
3. Argumenta con datos y emocion combinados`,
        recursos: [
          { nombre: 'Guia: Las 30 objeciones mas comunes y como manejarlas', tipo: 'PDF' },
          { nombre: 'Tarjetas: Objeciones y respuestas para imprimir', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que significa realmente una objecion?', opciones: ['Un rechazo definitivo', 'Una peticion de mas informacion', 'Que el cliente no tiene dinero', 'Que la propiedad no es buena'], correcta: 1 },
          { pregunta: 'Cual es la formula AEA?', opciones: ['Analisis-Evaluacion-Accion', 'Acuerdo-Exploracion-Argumento', 'Atencion-Emocion-Acuerdo', 'Argumento-Evaluacion-Acuerdo'], correcta: 1 },
        ]
      },
      {
        id: 4, titulo: 'Tecnicas de cierre',
        contenido: `El cierre no es el final de la venta, es el inicio de una relacion.

SENALES DE QUE EL CLIENTE ESTA LISTO:
- Pregunta sobre gastos de cierre o notario
- Habla en posesivo: mi sala, mi cuarto
- Pregunta si pueden hacer algun cambio
- Pide ver la propiedad por segunda vez

LAS 4 TECNICAS MAS EFECTIVAS:

1. El cierre de la alternativa - No preguntes lo compras? sino prefieren escriturar en enero o en febrero?

2. El cierre del resumen - Entonces tenemos: 3 habitaciones, zona segura, dentro de tu presupuesto. Avanzamos?

3. El cierre de la urgencia genuina - Solo usala cuando sea real: hay otra familia evaluandola. No quiero que pierdas esta oportunidad.

4. El cierre del silencio - Hace la pregunta de cierre y callate. La primera persona que habla, pierde.

POST-CIERRE:
Inmediatamente despues de que el cliente dice si, cambia el tema. No sigas vendiendo, ya vendiste. Habla de la mudanza y los proximos pasos. El cliente necesita sentir que tomo la decision correcta.`,
        recursos: [
          { nombre: 'Guia: 15 tecnicas de cierre con scripts', tipo: 'PDF' },
          { nombre: 'Checklist: Pasos del proceso de cierre en CR', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Cual es una senal de que el cliente esta listo para cerrar?', opciones: ['Pide descuento', 'Habla en posesivo sobre la propiedad', 'Llega tarde a la visita', 'No hace preguntas'], correcta: 1 },
          { pregunta: 'Que es el cierre de la alternativa?', opciones: ['Ofrecer dos propiedades distintas', 'Preguntar entre dos fechas de escritura', 'Dar dos opciones de precio', 'Mostrar dos vecindarios'], correcta: 1 },
        ]
      },
    ]
  },
  2: {
    titulo: 'Como usar Valeria IA para multiplicar tus ventas',
    cat: 'IA', nivel: 'Basico', dur: '1.5 horas', icon: '✦', hue: 200,
    modulos: [
      {
        id: 1, titulo: 'Generar emails con IA',
        contenido: `Valeria puede redactar emails profesionales en segundos.

TIPOS DE EMAILS QUE VALERIA PUEDE ESCRIBIR:

Email de seguimiento a lead frio:
Pedile: Escribe un email de seguimiento para un lead que vio una casa en Santa Ana hace 2 semanas y no ha respondido. Tono calido, no invasivo.

Email de presentacion de propiedad:
Redacta un email presentando una casa de 3 habitaciones en Escazu, precio, con piscina y vista a la montana.

Email post-visita:
Escribe un email de seguimiento despues de una visita. El cliente mostro interes pero pidio tiempo para pensarlo.

COMO DARLE INSTRUCCIONES EFECTIVAS:
Incluye siempre:
- Contexto del cliente (que busca, que vio)
- Tono deseado (formal/casual)
- Objetivo del email (agendar visita, cerrar, informar)
- Informacion especifica de la propiedad

EJEMPLO:
MAL: Escribe un email para mi cliente.
BIEN: Escribe un email para Maria, quien visito el apartamento en Curridabat el martes. Le gusto mucho pero le preocupo el parqueo. El edificio tiene 2 espacios a 15,000 cada uno. Tono profesional pero calido.`,
        recursos: [
          { nombre: 'Plantilla: 20 prompts listos para usar con Valeria', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que informacion es esencial para darle a Valeria al pedir un email?', opciones: ['Solo el nombre del cliente', 'Contexto, tono, objetivo e informacion de la propiedad', 'Solo la direccion de la propiedad', 'El presupuesto del cliente'], correcta: 1 },
        ]
      },
      {
        id: 2, titulo: 'Crear descripciones de propiedades que venden',
        contenido: `Una buena descripcion no lista caracteristicas, cuenta una historia.

EL PROBLEMA CON LAS DESCRIPCIONES TIPICAS:

Mala: Casa de 3 habitaciones, 2 banos, 200m2, cocina equipada, sala comedor, jardin, parqueo doble.

Buena con Valeria: Despertarse con luz natural que entra por los ventanales de la sala, tomar el cafe mirando el jardin privado, eso es lo que te espera en esta residencia contemporanea en Santa Ana.

COMO PEDIRLE LA DESCRIPCION A VALERIA:
Da los datos duros + el perfil del comprador ideal.

Ejemplo: Escribe una descripcion para una casa en Escazu: 3 hab, 2.5 banos, 280m2, jardin tropical, piscina, cuarto de servicio, doble parqueo, condominio cerrado con seguridad 24/7. El comprador ideal es una familia con hijos pequenos que valora la seguridad y el espacio.

PALABRAS QUE VENDEN EN CR:
- Residencia en lugar de casa
- Sala de estar en lugar de sala
- Jardin privado en lugar de jardin
- Vista panoramica en lugar de con vista
- Acabados de primera en lugar de bien terminada`,
        recursos: [
          { nombre: 'Guia: Vocabulario premium para descripciones inmobiliarias', tipo: 'PDF' },
          { nombre: 'Plantilla: Estructura de descripcion ganadora', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que hace una buena descripcion inmobiliaria?', opciones: ['Lista todas las caracteristicas tecnicas', 'Cuenta una historia y crea emocion', 'Menciona el precio en detalle', 'Compara con otras propiedades'], correcta: 1 },
        ]
      },
    ]
  }
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .mod-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;border:none;background:transparent;text-align:left;cursor:pointer;width:100%;transition:background 0.15s;font-family:var(--sans)}
  .mod-btn:hover{background:var(--bg-elev)}
  .mod-btn.active{background:var(--accent-tint)}
  .mod-btn.locked{opacity:0.4;cursor:not-allowed}
  .quiz-opt{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;cursor:pointer;transition:all 0.15s;font-size:14px;background:white;text-align:left;font-family:var(--sans);width:100%}
  .quiz-opt:hover{border-color:var(--accent);background:var(--accent-tint)}
  .quiz-opt.selected{border-color:var(--accent);background:var(--accent-tint)}
  .quiz-opt.correct{border-color:var(--accent);background:var(--accent-tint)}
  .quiz-opt.wrong{border-color:oklch(0.45 0.08 20);background:oklch(0.97 0.03 20)}
  .recurso-btn{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;background:white;cursor:pointer;transition:all 0.15s;font-family:var(--sans);width:100%}
  .recurso-btn:hover{border-color:var(--accent);background:var(--accent-tint)}
  @media(max-width:900px){.curso-grid{grid-template-columns:1fr!important}.sidebar-mod{display:none!important}}
`

function CursoInner() {
  const params = useSearchParams()
  const router = useRouter()
  const id = parseInt(params.get('id') || '1')
  const curso = CURSOS[id]

  const [modIdx, setModIdx] = useState(0)
  const [completados, setCompletados] = useState<number[]>([])
  const [quizActivo, setQuizActivo] = useState(false)
  const [respuestas, setRespuestas] = useState<Record<number,number>>({})
  const [enviado, setEnviado] = useState(false)
  const [aprobado, setAprobado] = useState(false)

  if (!curso) return <div style={{padding:40,fontFamily:'sans-serif'}}>Curso no encontrado. <a href="/academia" style={{color:'green'}}>Volver</a></div>

  const mod = curso.modulos[modIdx]
  const isDone = completados.includes(mod.id)

  const enviar = () => {
    const ok = mod.quiz.filter((_:any, i:number) => respuestas[i] === mod.quiz[i].correcta).length
    const pass = ok >= Math.ceil(mod.quiz.length * 0.7)
    setAprobado(pass)
    setEnviado(true)
    if (pass) setCompletados((p:number[]) => [...p, mod.id])
  }

  const reset = () => { setRespuestas({}); setEnviado(false); setAprobado(false) }

  const irModulo = (i: number) => {
    const locked = i > 0 && !completados.includes(curso.modulos[i-1].id)
    if (locked) return
    setModIdx(i); setQuizActivo(false); reset()
  }

  return (
    <main style={{fontFamily:'var(--sans)',minHeight:'100vh',background:'var(--bg)',color:'var(--ink)'}}>
      <style>{CSS}</style>
      <nav style={{borderBottom:'1px solid var(--rule)',background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 32px',maxWidth:1400,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:'var(--serif)',fontSize:22,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--ink-3)'}}>
            <a href="/academia">Academia</a><span>›</span><span style={{color:'var(--ink)'}}>{curso.titulo}</span>
          </div>
          <span style={{fontSize:12,color:'var(--ink-3)'}}>{completados.length} / {curso.modulos.length} completados</span>
        </div>
        <div style={{height:3,background:'var(--rule)',position:'relative'}}>
          <div style={{position:'absolute',top:0,left:0,height:'100%',background:'var(--accent)',width:(completados.length/curso.modulos.length*100)+'%',transition:'width 0.5s'}}/>
        </div>
      </nav>

      <div className="curso-grid" style={{display:'grid',gridTemplateColumns:'260px 1fr',maxWidth:1400,margin:'0 auto',minHeight:'calc(100vh - 57px)'}}>
        <aside className="sidebar-mod" style={{borderRight:'1px solid var(--rule)',background:'white',position:'sticky',top:57,height:'calc(100vh - 57px)',overflowY:'auto',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'16px',borderBottom:'1px solid var(--rule)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:8,background:'oklch(0.88 0.03 '+curso.hue+')',display:'grid',placeItems:'center',fontSize:18}}>{curso.icon}</div>
              <div style={{fontSize:12,fontWeight:500,color:'var(--ink)',lineHeight:1.3}}>{curso.titulo}</div>
            </div>
          </div>
          <div style={{padding:'12px 8px',flex:1}}>
            <div style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',padding:'0 8px',marginBottom:8}}>Modulos</div>
            {curso.modulos.map((m:any, i:number) => {
              const done = completados.includes(m.id)
              const active = modIdx === i
              const locked = i > 0 && !completados.includes(curso.modulos[i-1].id)
              return (
                <button key={m.id} className={'mod-btn'+(active?' active':'')+(locked?' locked':'')} onClick={() => irModulo(i)}>
                  <span style={{width:22,height:22,borderRadius:'50%',background:done?'var(--accent)':active?'var(--accent)':'var(--rule)',color:done||active?'white':'var(--ink-3)',display:'grid',placeItems:'center',fontSize:10,fontWeight:600,flexShrink:0}}>
                    {done ? '✓' : String(i+1).padStart(2,'0')}
                  </span>
                  <span style={{fontSize:12,lineHeight:1.35}}>{m.titulo}</span>
                  {locked && <span style={{marginLeft:'auto',fontSize:10}}>🔒</span>}
                </button>
              )
            })}
          </div>
          <div style={{padding:'12px 16px',borderTop:'1px solid var(--rule)'}}>
            <a href="/academia" style={{display:'block',textAlign:'center',fontSize:13,color:'var(--ink-3)',padding:'10px',borderRadius:8,border:'1px solid var(--rule)'}}>← Volver a Academia</a>
          </div>
        </aside>

        <div style={{padding:'32px 48px 80px',maxWidth:800}}>
          <div style={{marginBottom:24,animation:'fadeUp 0.4s ease'}}>
            <div style={{fontSize:11,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:8}}>Modulo {String(modIdx+1).padStart(2,'0')} de {String(curso.modulos.length).padStart(2,'0')}</div>
            <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(22px,3vw,34px)',fontWeight:400,lineHeight:1.1}}>{mod.titulo}</h1>
          </div>

          {!quizActivo ? (
            <>
              <div style={{background:'white',border:'1px solid var(--rule)',borderRadius:12,padding:'28px 32px',marginBottom:20}}>
                {mod.contenido.split('\n').map((line:string, i:number) => {
                  if (line === '') return <br key={i}/>
                  if (line === line.toUpperCase() && line.length > 3) return <h3 key={i} style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:400,margin:'20px 0 8px',color:'var(--ink)'}}>{line}</h3>
                  if (line.startsWith('- ')) return <li key={i} style={{marginLeft:20,marginBottom:6,fontSize:14,color:'var(--ink-2)',lineHeight:1.65}}>{line.slice(2)}</li>
                  return <p key={i} style={{fontSize:14,color:'var(--ink-2)',lineHeight:1.75,marginBottom:6}}>{line}</p>
                })}
              </div>

              {mod.recursos?.length > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:10}}>Recursos descargables</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {mod.recursos.map((r:any, i:number) => (
                      <button key={i} className="recurso-btn">
                        <span style={{width:36,height:36,borderRadius:8,background:r.tipo==='PDF'?'oklch(0.93 0.04 20)':'oklch(0.93 0.04 200)',display:'grid',placeItems:'center',fontSize:11,fontWeight:600,color:r.tipo==='PDF'?'oklch(0.45 0.08 20)':'oklch(0.35 0.06 200)',flexShrink:0}}>{r.tipo}</span>
                        <div style={{textAlign:'left'}}>
                          <div style={{fontSize:13,fontWeight:500,color:'var(--ink)',marginBottom:2}}>{r.nombre}</div>
                          <div style={{fontSize:11,color:'var(--ink-3)'}}>Disponible para descarga</div>
                        </div>
                        <span style={{marginLeft:'auto',fontSize:16,color:'var(--ink-3)'}}>↓</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isDone && (
                <button onClick={() => setQuizActivo(true)} style={{width:'100%',padding:'13px',borderRadius:999,background:'var(--ink)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer'}}>
                  Hacer el cuestionario para continuar →
                </button>
              )}
              {isDone && modIdx < curso.modulos.length - 1 && (
                <button onClick={() => irModulo(modIdx + 1)} style={{width:'100%',padding:'13px',borderRadius:999,background:'var(--accent)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer'}}>
                  Siguiente modulo: {curso.modulos[modIdx+1].titulo} →
                </button>
              )}
              {isDone && modIdx === curso.modulos.length - 1 && (
                <div style={{background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:12,padding:'24px',textAlign:'center'}}>
                  <div style={{fontSize:36,marginBottom:8}}>🏆</div>
                  <div style={{fontFamily:'var(--serif)',fontSize:24,marginBottom:8}}>Curso completado!</div>
                  <p style={{fontSize:14,color:'var(--ink-2)',marginBottom:16}}>Completaste todos los modulos. Tu certificado estara disponible en tu perfil.</p>
                  <a href="/academia" style={{display:'inline-block',padding:'10px 24px',borderRadius:999,background:'var(--accent)',color:'white',fontSize:14,fontWeight:500}}>Ver mas cursos →</a>
                </div>
              )}
            </>
          ) : (
            <div style={{animation:'fadeUp 0.3s ease'}}>
              <div style={{background:'white',border:'1px solid var(--rule)',borderRadius:12,padding:'28px 32px'}}>
                <div style={{fontFamily:'var(--serif)',fontSize:22,marginBottom:24}}>Cuestionario del modulo</div>
                {mod.quiz.map((q:any, qi:number) => (
                  <div key={qi} style={{marginBottom:24}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>{qi+1}. {q.pregunta}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {q.opciones.map((op:string, oi:number) => {
                        let cls = 'quiz-opt'
                        if (enviado) {
                          if (oi === q.correcta) cls += ' correct'
                          else if (respuestas[qi] === oi) cls += ' wrong'
                        } else if (respuestas[qi] === oi) cls += ' selected'
                        return (
                          <button key={oi} className={cls} onClick={() => !enviado && setRespuestas(p => ({...p,[qi]:oi}))}>
                            <span style={{width:22,height:22,borderRadius:'50%',border:'1px solid currentColor',display:'grid',placeItems:'center',fontSize:11,flexShrink:0,opacity:0.6}}>{String.fromCharCode(65+oi)}</span>
                            {op}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {!enviado ? (
                  <button onClick={enviar} disabled={Object.keys(respuestas).length < mod.quiz.length} style={{width:'100%',padding:'13px',borderRadius:999,background:'var(--ink)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',opacity:Object.keys(respuestas).length < mod.quiz.length?0.5:1}}>
                    Enviar respuestas
                  </button>
                ) : (
                  <div style={{textAlign:'center',padding:'16px 0'}}>
                    <div style={{fontSize:36,marginBottom:8}}>{aprobado?'✅':'❌'}</div>
                    <div style={{fontFamily:'var(--serif)',fontSize:20,marginBottom:8}}>{aprobado?'Aprobado!':'Intenta de nuevo'}</div>
                    <p style={{fontSize:14,color:'var(--ink-2)',marginBottom:16}}>{aprobado?'Completaste este modulo.':'Revisa el contenido y volve a intentarlo.'}</p>
                    <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                      {!aprobado && <button onClick={() => {reset();setQuizActivo(true)}} style={{padding:'10px 20px',borderRadius:999,border:'1px solid var(--rule)',fontSize:13,cursor:'pointer',background:'transparent'}}>Reintentar</button>}
                      <button onClick={() => setQuizActivo(false)} style={{padding:'10px 20px',borderRadius:999,background:aprobado?'var(--accent)':'var(--ink)',color:'white',border:'none',fontSize:13,cursor:'pointer'}}>
                        {aprobado?'Continuar →':'Volver al contenido'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CursoPage() {
  return (
    <Suspense fallback={<div style={{padding:40,fontFamily:'sans-serif',color:'#999'}}>Cargando...</div>}>
      <CursoInner/>
    </Suspense>
  )
}
