'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const PLANES_INFO: Record<string, { nombre: string, precio: string, color: string }> = {
  gratis: { nombre: 'Despega', precio: '$0 · 7 días de Black gratis', color: 'var(--ink)' },
  pro: { nombre: 'Elite', precio: '$59/mes', color: 'var(--accent)' },
  enterprise: { nombre: 'Black', precio: '$99/mes · 7 días gratis', color: 'oklch(0.20 0.005 80)' },
}

const PLANES_CARDS = [
  { id: 'gratis', nombre: 'Despega', precio: '$0', sub: '7 días de Black gratis, luego se bloquea hasta suscribirte', color: 'var(--ink-2)' },
  { id: 'pro', nombre: 'Elite', precio: '$59/mes', sub: 'Valeria IA, CRM completo, Academia', color: 'var(--accent)' },
  { id: 'enterprise', nombre: 'Black', precio: '$99/mes', sub: 'Todo ilimitado + soporte prioritario · 7 días gratis por lanzamiento', color: 'oklch(0.20 0.005 80)' },
]

function RegistroInner() {
  const params = useSearchParams()
  const planInicial = params.get('plan') || 'gratis'
  const refCode = params.get('ref') || ''

  const [plan, setPlan] = useState(planInicial)
  const [tipoTrabajo, setTipoTrabajo] = useState<'independiente' | 'compania' | 'equipo_nido'>('independiente')
  const [companiaNombre, setCompaniaNombre] = useState('')
  const [cedula, setCedula] = useState('')

  const planInfo = PLANES_INFO[plan]

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleRegistro = async () => {
    if (!nombre || !email || !password) { setError('Por favor completa todos los campos.'); return }
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return }
    if (tipoTrabajo === 'compania' && !companiaNombre.trim()) { setError('Ingresá el nombre de tu compañía.'); return }
    const cedulaLimpia = cedula.replace(/\D/g, '')
    if (cedulaLimpia.length < 9) { setError('Ingresá un número de cédula válido (9 dígitos).'); return }
    setLoading(true); setError('')

    const { data: cedulaYaUsada } = await supabase.rpc('cedula_ya_uso_trial', { p_cedula: cedulaLimpia })
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, plan } }
    })
    if (error) { setError(error.message.includes('already') || error.message.includes('registered') ? 'Este correo ya está registrado. Intentá iniciar sesión.' : 'Error al registrarse: ' + error.message) }
    else {
      // Auto login after registration
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (!loginData?.user) {
        // Antes esto se ignoraba y se redirigía igual al onboarding sin sesión
        // ni perfil creado (pasaba, por ejemplo, si el correo aún no estaba
        // confirmado). Ahora se avisa y no se avanza.
        setError(
          loginError?.message?.includes('confirm')
            ? 'Tu cuenta fue creada. Confirmá tu correo (revisá tu bandeja de entrada) y luego ingresá desde /login.'
            : 'Tu cuenta fue creada pero no pudimos iniciar sesión automáticamente. Intentá ingresar desde /login.'
        )
        setLoading(false)
        return
      }

      // Crear fila en perfiles INMEDIATAMENTE — no esperar al onboarding
      const { error: perfilError } = await supabase.from('perfiles').upsert({
        id: loginData.user.id,
        nombre,
        correo: email,
        cedula: cedulaLimpia,
        plan,
        compania: tipoTrabajo === 'compania' ? companiaNombre.trim() : null,
        solicita_equipo_nido: tipoTrabajo === 'equipo_nido',
        equipo_nido_estado: tipoTrabajo === 'equipo_nido' ? 'pendiente' : null,
        valeria_onboarding_completo: false,
        created_at: new Date().toISOString(),
      })
      if (perfilError) {
        // Antes este error se ignoraba por completo: la cuenta de auth y la
        // suscripción se creaban igual, pero la fila de perfiles (de la que
        // depende TODO lo demás — verlo en el admin, Valeria, el contrato)
        // simplemente no existía, en silencio.
        setError('Tu cuenta se creó pero hubo un error guardando tu perfil. Escribinos a soporte con este detalle: ' + perfilError.message)
        setLoading(false)
        return
      }

      // Programa de referidos: si vino con un ?ref=CODIGO, registrar la referencia
      if (refCode) {
        try {
          await supabase.rpc('registrar_referido', {
            p_codigo: refCode,
            p_referido_email: email,
            p_referido_tipo: 'asesor',
            p_referido_nombre: nombre,
          })
        } catch {}
      }

      // Crear suscripcion inicial
      // Promo de lanzamiento: el trial de 7 dias con Black aplica tanto si eligen
      // el plan gratis Despega como si eligen Black directamente — antes Black
      // directo quedaba pendiente de activacion manual sin trial.
      if ((plan === 'gratis' || plan === 'enterprise') && !cedulaYaUsada) {
        // Trial de 7 dias con TODO el plan Black activo
        const trialFin = new Date()
        trialFin.setDate(trialFin.getDate() + 7)
        await supabase.from('suscripciones').upsert({
          correo: email,
          plan: 'enterprise',
          activo: true,
          es_trial: true,
          trial_fin: trialFin.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'correo' })
      } else {
        // Plan pago elegido, o cedula ya uso un trial antes — queda pendiente de activacion por NIDO
        await supabase.from('suscripciones').upsert({
          correo: email,
          plan: plan === 'gratis' ? 'gratis' : plan,
          activo: false,
          es_trial: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'correo' })
      }

      if (typeof window !== 'undefined') localStorage.setItem('nido_user_tipo', 'asesor')
      window.location.href = '/dashboard/valeria-onboarding'
    }
    setLoading(false)
  }

  if (exito) return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:460, textAlign:'center', padding:'0 24px', animation:'fadeUp 0.5s ease' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', margin:'0 auto 24px', fontSize:28 }}>✓</div>
        <h1 style={{ fontFamily:'var(--serif)', fontSize:36, fontWeight:400, marginBottom:12 }}>Cuenta <em style={{ fontStyle:'italic', color:'var(--accent)' }}>creada.</em></h1>
        <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.65, marginBottom:28 }}>
          Revisas tu correo para confirmar tu cuenta. Luego podes ingresar y empezar a usar NIDO.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <a href="/login" style={{ background:'var(--ink)', color:'white', padding:'12px 24px', borderRadius:999, fontSize:14, fontWeight:500, textDecoration:'none' }}>Ingresar al dashboard →</a>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <style>{CSS}</style>

      {/* Panel izquierdo */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 64px', maxWidth:600, animation:'fadeUp 0.5s ease', overflowY:'auto' }}>

        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:26, color:'var(--ink)', textDecoration:'none', marginBottom:32, display:'block' }}>
          NIDO<span style={{ color:'var(--accent)' }}>.</span>
        </Link>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>
            Crear cuenta · Asesor
          </div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(26px,4vw,38px)', fontWeight:400, lineHeight:1.1, marginBottom:8 }}>
            Tu carrera empieza <em style={{ fontStyle:'italic', color:'var(--accent)' }}>hoy.</em>
          </h1>
          <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6 }}>
            Elegí tu plan, contanos cómo trabajás, y empezá a publicar con Valeria IA de tu lado.
          </p>
        </div>

        {error && (
          <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'oklch(0.45 0.08 20)', fontSize:13 }}>
            {error}
          </div>
        )}

        {/* SELECTOR DE PLAN */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:10 }}>Elegí tu plan</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {PLANES_CARDS.map(p => (
              <button key={p.id} onClick={() => setPlan(p.id)} style={{ textAlign:'left', padding:'12px 12px', borderRadius:10, border:'2px solid '+(plan===p.id?p.color:'var(--rule)'), background:plan===p.id?'var(--accent-tint)':'white', cursor:'pointer', fontFamily:'inherit' }}>
                <div style={{ fontSize:13, fontWeight:600, color:plan===p.id?p.color:'var(--ink)', marginBottom:2 }}>NIDO {p.nombre}</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:4 }}>{p.precio}</div>
                <div style={{ fontSize:10, color:'var(--ink-3)', lineHeight:1.4 }}>{p.sub}</div>
              </button>
            ))}
          </div>
          {plan === 'gratis' && (
            <div style={{ marginTop:8, fontSize:12, color:'var(--accent)', background:'var(--accent-tint)', padding:'8px 12px', borderRadius:8 }}>
              ✦ Empezás con el plan Black completo gratis por 7 días. Después necesitás elegir un plan pago para seguir publicando.
            </div>
          )}
          {plan === 'enterprise' && (
            <div style={{ marginTop:8, fontSize:12, color:'var(--accent)', background:'var(--accent-tint)', padding:'8px 12px', borderRadius:8 }}>
              ✦ Promo de lanzamiento: tu cuenta arranca de inmediato con Black gratis por 7 días, sin pago por adelantado. Después de los 7 días, el plan queda en $99/mes.
            </div>
          )}
        </div>

        {/* TIPO DE TRABAJO */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:10 }}>¿Cómo trabajás?</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { id:'independiente', label:'Asesor independiente', desc:'Trabajo por mi cuenta' },
              { id:'compania', label:'Trabajo para una compañía', desc:'Indicá el nombre de tu agencia o empresa' },
              { id:'equipo_nido', label:'Quiero aplicar al Equipo NIDO', desc:'Solicitar incorporación — sujeto a aprobación' },
            ].map(o => (
              <button key={o.id} onClick={() => setTipoTrabajo(o.id as 'independiente' | 'compania' | 'equipo_nido')} style={{ display:'flex', alignItems:'center', gap:10, textAlign:'left', padding:'10px 14px', borderRadius:10, border:'1px solid '+(tipoTrabajo===o.id?'var(--accent)':'var(--rule)'), background:tipoTrabajo===o.id?'var(--accent-tint)':'white', cursor:'pointer', fontFamily:'inherit' }}>
                <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid '+(tipoTrabajo===o.id?'var(--accent)':'var(--rule)'), display:'grid', placeItems:'center', flexShrink:0 }}>
                  {tipoTrabajo===o.id && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)' }}/>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{o.label}</div>
                  <div style={{ fontSize:11, color:'var(--ink-3)' }}>{o.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {tipoTrabajo === 'compania' && (
            <input className="field-input" style={{ marginTop:10 }} type="text" placeholder="Nombre de tu compañía" value={companiaNombre} onChange={e => setCompaniaNombre(e.target.value)}/>
          )}
          {tipoTrabajo === 'equipo_nido' && (
            <div style={{ marginTop:10, fontSize:12, color:'var(--ink-2)', background:'var(--bg-elev)', padding:'10px 14px', borderRadius:8 }}>
              Tu solicitud queda pendiente de revisión por el equipo NIDO. Te contactaremos para coordinar la incorporación.
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Nombre completo</label>
            <input className="field-input" type="text" placeholder="María Rodríguez" value={nombre} onChange={e => setNombre(e.target.value)}/>
          </div>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Número de cédula</label>
            <input className="field-input" type="text" placeholder="1-2345-6789" value={cedula} onChange={e => setCedula(e.target.value)}/>
            <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:6 }}>Solo una cuenta por cédula — necesario para verificar tu identidad.</p>
          </div>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Correo electrónico</label>
            <input className="field-input" type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div>
            <label style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Contraseña</label>
            <input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleRegistro()}/>
          </div>
        </div>

        <button className="login-btn" onClick={handleRegistro} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
        </button>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--ink-3)' }}>
          Ya tenes cuenta? <a href="/login" style={{ color:'var(--accent)', fontWeight:500, textDecoration:'none' }}>Ingresá aquí</a>
        </p>

        <p style={{ textAlign:'center', marginTop:16, fontSize:11, color:'var(--ink-3)', lineHeight:1.6 }}>
          Al crear una cuenta aceptás los <a href="/terminos" style={{ color:'var(--accent)' }}>Términos de uso</a> y la <a href="/privacidad" style={{ color:'var(--accent)' }}>Política de privacidad</a> de NIDO.
        </p>

        <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid var(--rule)', display:'flex', gap:20, flexWrap:'wrap' }}>
          {[{icon:'✦', label:'Valeria IA incluida'},{icon:'◎', label:'CRM de leads'},{icon:'🏠', label:'Portal premium'}].map(l => (
            <div key={l.label} style={{ fontSize:12, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:'var(--accent)' }}>{l.icon}</span> {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', background:'#060D08', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:48 }} className="panel-derecho">
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2, animation:'slow-zoom 20s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.3) 0%, rgba(6,13,8,0.8) 100%)' }}/>
        <div style={{ position:'absolute', top:'25%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.42 0.06 150/0.1) 0%, transparent 70%)' }}/>

        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
            {[
              { val:'87', label:'asesores activos en NIDO', suffix:'%' },
              { val:'412', label:'propiedades publicadas', suffix:'+' },
              { val:'2.4', label:'veces mas cierres con Elite', suffix:'×' },
              { val:'4.9', label:'calificacion promedio asesores', suffix:'★' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 16px', backdropFilter:'blur(12px)' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:26, color:'white', lineHeight:1 }}>{s.val}{s.suffix}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4, lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 22px', backdropFilter:'blur(16px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'oklch(0.85 0.06 80)' }}>V</div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'white' }}>Valeria</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
                  Mentora IA de NIDO
                </div>
              </div>
            </div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.65, fontStyle:'italic' }}>
              &quot;Bienvenido a NIDO. Desde tu primer dia, voy a ayudarte a encontrar leads, redactar descripciones y cerrar mas rapido. Empecemos.&quot;
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Registro() {
  return (
    <Suspense fallback={<div style={{padding:40,fontFamily:'sans-serif',color:'#999'}}>Cargando...</div>}>
      <RegistroInner/>
    </Suspense>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
  @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.06)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .field-input{width:100%;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;font-size:14px;font-family:var(--sans);color:var(--ink);background:white;outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .field-input:focus{border-color:var(--accent)}
  .field-input::placeholder{color:var(--ink-3)}
  .login-btn{width:100%;padding:13px;border-radius:999px;border:none;background:var(--ink);color:white;font-size:15px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
  .login-btn:hover:not(:disabled){background:oklch(0.28 0.006 80);transform:translateY(-1px)}
  .login-btn:disabled{opacity:0.6;cursor:not-allowed}
  @media(max-width:768px){.panel-derecho{display:none!important}main>div:first-child{padding:32px 24px!important;max-width:100%!important}}
`
