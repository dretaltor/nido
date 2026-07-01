'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .section-card{background:white;border:1px solid var(--rule);border-radius:12px;padding:28px 32px;margin-bottom:20px}
  .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:500}
  .nav-link{font-size:13px;color:var(--ink-2);text-decoration:none}
  .nav-link.active{color:var(--ink);font-weight:500}
`

export default function Referidos() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [perfil, setPerfil] = useState<any>(null)
  const [referidos, setReferidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setNombre(user.user_metadata?.nombre || user.email?.split('@')[0] || 'asesor')
      const { data } = await supabase.from('perfiles').select('id,nombre,correo,codigo_referido').eq('id', user.id).maybeSingle()
      setPerfil(data)
      if (user.email) {
        const { data: refs } = await supabase.from('referidos').select('*').eq('referidor_email', user.email).order('created_at', { ascending: false })
        setReferidos(refs || [])
      }
      setLoading(false)
    })
  }, [])

  const handleLogout = () => supabase.auth.signOut().then(() => router.push('/login'))

  const copiarLink = () => {
    if (!perfil?.codigo_referido) return
    navigator.clipboard.writeText('https://www.nido-cr.com/registro?ref=' + perfil.codigo_referido)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const estadoLabel: Record<string,string> = { pendiente:'Pendiente de revisión', aprobado:'Aprobado', rechazado:'Rechazado', pagado:'Recompensa pagada' }
  const estadoStyle = (estado: string) =>
    estado==='pagado' ? { background:'var(--accent-tint)', color:'var(--accent)' }
    : estado==='aprobado' ? { background:'oklch(0.93 0.05 150)', color:'oklch(0.40 0.08 150)' }
    : estado==='rechazado' ? { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }
    : { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--sans)', color:'var(--ink-3)', fontSize:14 }}>
      <style>{CSS}</style>
      Cargando...
    </div>
  )

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1400, margin:'0 auto' }}>
          <a href="/" style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></a>
          <div style={{ display:'flex', gap:28, alignItems:'center' }}>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/dashboard/crm" className="nav-link">CRM</a>
            <a href="/propiedades" className="nav-link">Portal</a>
            <a href="/dashboard/nueva-propiedad" className="nav-link">Nueva propiedad</a>
            <a href="/dashboard/referidos" className="nav-link active">Referidos</a>
            <a href="/dashboard/perfil" className="nav-link">Mi perfil</a>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{nombre}</div>
              <div style={{ fontSize:11, color:'var(--ink-3)' }}>Asesor NIDO</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', color:'white', fontSize:13, fontWeight:500 }}>
              {nombre.slice(0,2).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ fontSize:12, color:'var(--ink-3)', border:'1px solid var(--rule)', borderRadius:999, padding:'6px 14px', background:'transparent' }}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 40px 80px' }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Crecé con NIDO</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Programa de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>referidos.</em></h1>
          <p style={{ fontSize:14, color:'var(--ink-3)', lineHeight:1.6, marginTop:8 }}>
            Invitá a otros asesores o propietarios a NIDO. Cuando se registren con tu código, el equipo NIDO revisa y aprueba tu recompensa.
          </p>
        </div>

        <div className="section-card" style={{ animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Tu código de referido</div>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--accent)', letterSpacing:'0.04em' }}>{perfil?.codigo_referido || '—'}</div>
            <button className="save-btn" onClick={copiarLink} style={{ padding:'8px 18px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, fontWeight:500 }}>
              {copiado ? '✓ Copiado' : 'Copiar link para compartir'}
            </button>
          </div>
          <p style={{ fontSize:12, color:'var(--ink-3)', marginTop:10 }}>
            https://www.nido-cr.com/registro?ref={perfil?.codigo_referido || '...'}
          </p>
        </div>

        <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:400, marginBottom:14 }}>Tus referidos</h3>
        {referidos.length === 0 ? (
          <div className="section-card" style={{ textAlign:'center', padding:'40px 20px', color:'var(--ink-3)', fontSize:14 }}>
            Todavía no referiste a nadie. Compartí tu link para empezar a ganar recompensas.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {referidos.map(r => (
              <div key={r.id} className="section-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 24px', marginBottom:0 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(r.referido_nombre||r.referido_email)[0].toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{r.referido_nombre || r.referido_email}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{r.referido_tipo === 'asesor' ? 'Asesor' : 'Propietario'} · {new Date(r.created_at).toLocaleDateString('es-CR')}</div>
                </div>
                {r.recompensa_monto ? <div style={{ fontSize:13, color:'var(--ink-2)', fontWeight:500 }}>${r.recompensa_monto}</div> : null}
                <span className="badge" style={estadoStyle(r.estado)}>{estadoLabel[r.estado] || r.estado}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
