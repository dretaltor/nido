'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const RELACIONES = [
  { id:'dueno', label:'Dueño directo', desc:'Soy el propietario registrado' },
  { id:'apoderado', label:'Apoderado legal', desc:'Tengo poder notarial' },
  { id:'empresa', label:'Empresa o sociedad', desc:'Propiedad a nombre de persona jurídica' },
]

export default function RegistroPropietario() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre:'', cedula:'', telefono:'', correo:'', contrasena:'', relacion:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: string) => setForm(f => ({...f, [k]:v}))

  const handleSubmit = async () => {
    if (!form.nombre || !form.cedula || !form.telefono || !form.correo || !form.contrasena || !form.relacion) {
      setError('Por favor completá todos los campos.')
      return
    }
    setError('')
    setLoading(true)
    // Verificar duplicados por cédula y correo
    const { data: existente } = await supabase.from('propietarios')
      .select('id,cedula,correo')
      .or(`cedula.eq.${form.cedula},correo.eq.${form.correo}`)
      .maybeSingle()
    if (existente) {
      if (existente.cedula === form.cedula) {
        setError('Esta cédula ya está registrada. Si ya tenés cuenta, ingresá en el portal de propietarios.')
      } else {
        setError('Este correo ya está registrado. Intentá iniciar sesión.')
      }
      setLoading(false)
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      // Crear cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo,
        password: form.contrasena,
        options: { data: { nombre: form.nombre, tipo: 'propietario' } }
      })
      if (authError) { setError(authError.message.includes('already') || authError.message.includes('registered') ? 'Este correo ya está registrado. Intentá iniciar sesión.' : authError.message); setLoading(false); return }
      
      // Forzar login inmediato para que el metadata quede activo
      await supabase.auth.signInWithPassword({ email: form.correo, password: form.contrasena })
      // Guardar tipo en localStorage para el wizard
      if (typeof window !== 'undefined') localStorage.setItem('nido_user_tipo', 'propietario')

      // Emails — no bloquean el flujo
      Promise.all([
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.correo,
            tipo: 'nuevo_propietario_bienvenida',
            data: { nombre: form.nombre, correo: form.correo }
          })
        }),
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'davidretanaalvarez@gmail.com',
            tipo: 'nuevo_propietario',
            data: { nombre: form.nombre, correo: form.correo, telefono: form.telefono, cedula: form.cedula, relacion: form.relacion }
          })
        })
      ]).catch(console.error)
      await supabase.from('propietarios').upsert({
        user_id: user?.id,
        nombre: form.nombre,
        cedula: form.cedula,
        telefono: form.telefono,
        correo: form.correo,
        relacion: form.relacion,
        created_at: new Date().toISOString(),
      })
      router.push('/dashboard/nueva-propiedad?tipo=propietario')
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes slow-zoom { 0%{transform:scale(1)} 100%{transform:scale(1.06)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .field-input { width:100%; padding:12px 16px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
        .field-input:focus { border-color:oklch(0.55 0.07 150); }
        .field-input::placeholder { color:rgba(255,255,255,0.25); }
        .rel-card { border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:14px 16px; cursor:pointer; transition:all 0.2s; background:rgba(255,255,255,0.03); }
        .rel-card:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.06); }
        .rel-card.active { border-color:oklch(0.55 0.07 150); background:oklch(0.42 0.06 150/0.1); }
        .submit-btn { width:100%; padding:14px; background:oklch(0.42 0.06 150); border:none; border-radius:999px; color:white; font-size:15px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .submit-btn:hover:not(:disabled) { background:oklch(0.5 0.07 150); transform:translateY(-1px); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      {/* Fondo */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.15, animation:'slow-zoom 20s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.6) 0%, rgba(6,13,8,0.85) 100%)' }}/>
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.42 0.06 150/0.08) 0%, transparent 70%)' }}/>
      </div>

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.2rem 2rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', color:'white' }}>NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span></div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <a href="/login-propietario" style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)', padding:'6px 14px', borderRadius:999, transition:'all 0.2s' }}>Ya tengo cuenta →</a>
          <button onClick={() => router.push('/bienvenida')} style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', background:'none', border:'none', cursor:'pointer' }}>← VOLVER</button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={{ position:'relative', zIndex:10, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
        <div style={{ width:'100%', maxWidth:520, animation:'fadeUp 0.5s ease' }}>

          {/* Header */}
          <div style={{ marginBottom:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'0.62rem', letterSpacing:'0.2em', color:'oklch(0.85 0.06 80)', marginBottom:'0.8rem', textTransform:'uppercase' }}>Paso previo · Registro</div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:400, color:'white', lineHeight:1.1, marginBottom:'0.8rem' }}>
              Antes de publicar,<br/>necesitamos <em style={{ fontStyle:'italic', color:'oklch(0.55 0.07 150)' }}>conocerte.</em>
            </h1>
            <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.4)', lineHeight:1.65 }}>
              Tus datos son confidenciales y solo se usan para verificar la propiedad y contactarte.
            </p>
          </div>

          {/* Formulario */}
          <div style={{ background:'rgba(6,13,8,0.8)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'2rem', backdropFilter:'blur(24px)' }}>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:8 }}>Nombre completo</label>
                <input className="field-input" placeholder="María Rodríguez" value={form.nombre} onChange={e => set('nombre', e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:8 }}>Cédula</label>
                <input className="field-input" placeholder="1-2345-6789" value={form.cedula} onChange={e => set('cedula', e.target.value)}/>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <div>
                <label style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:8 }}>Teléfono</label>
                <input className="field-input" placeholder="+506 8888-8888" value={form.telefono} onChange={e => set('telefono', e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:8 }}>Correo electrónico</label>
                <input className="field-input" type="email" placeholder="tu@correo.com" value={form.correo} onChange={e => set('correo', e.target.value)}/>
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:8 }}>Contraseña</label>
              <input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={form.contrasena} onChange={e => set('contrasena', e.target.value)}/>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:6 }}>Usarás esta contraseña para ingresar a tu panel de propietario.</p>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:12 }}>Relación con la propiedad</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {RELACIONES.map(r => (
                  <div key={r.id} className={'rel-card'+(form.relacion===r.id?' active':'')} onClick={() => set('relacion', r.id)}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:'14px', fontWeight:500, color:'white', marginBottom:2 }}>{r.label}</div>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{r.desc}</div>
                      </div>
                      <div style={{ width:18, height:18, borderRadius:'50%', border:'1px solid '+(form.relacion===r.id?'oklch(0.55 0.07 150)':'rgba(255,255,255,0.2)'), background:form.relacion===r.id?'oklch(0.42 0.06 150)':'transparent', display:'grid', placeItems:'center', flexShrink:0 }}>
                        {form.relacion===r.id && <span style={{ width:8, height:8, borderRadius:'50%', background:'white', display:'block' }}/>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p style={{ fontSize:'13px', color:'#f87171', marginBottom:16, textAlign:'center' }}>{error}</p>}

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Continuar al wizard →'}
            </button>

            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:14, lineHeight:1.6 }}>
              Tus datos están protegidos bajo la Ley 8968 de Protección de Datos de Costa Rica.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
