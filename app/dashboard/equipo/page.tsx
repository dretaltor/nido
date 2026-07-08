'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { exportToCSV } from '../../../lib/csvExport'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Equipo, EquipoMiembro, Comision } from '../../../lib/database.types'

type MiembroConEquipo = EquipoMiembro & { equipos?: { nombre: string, admin_email?: string } | null }

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .card{background:white;border:1px solid var(--rule);border-radius:14px;padding:24px}
  .field{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:14px;font-family:var(--sans);outline:none;transition:border-color 0.2s}
  .field:focus{border-color:var(--accent)}
  .btn{padding:10px 20px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.2s;font-family:var(--sans)}
  .btn-primary{background:var(--ink);color:white}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
  .btn-accent{background:var(--accent);color:white}
  .btn-outline{background:transparent;border:1px solid var(--rule);color:var(--ink-2)}
  .btn-danger{background:transparent;border:1px solid oklch(0.85 0.06 20);color:oklch(0.45 0.08 20)}
  .row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--rule-soft)}
  .row:last-child{border-bottom:none}
  .badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:500}
  @media(max-width:768px){.nav-pad{padding:14px 16px!important}.page-pad{padding:24px 16px!important}.grid2{grid-template-columns:1fr!important}}
`

const PLAN_INFO: Record<string, { nombre:string, max_agentes:number, max_propiedades:number, precio:string }> = {
  inmobiliaria_junior: { nombre:'Inmobiliaria Junior', max_agentes:5, max_propiedades:100, precio:'$249/mes' },
  inmobiliaria_senior: { nombre:'Inmobiliaria Senior', max_agentes:15, max_propiedades:250, precio:'$480/mes' },
  inmobiliaria_top: { nombre:'Inmobiliaria Top', max_agentes:999, max_propiedades:500, precio:'A medida' },
}

const ESTADO_BADGE: Record<string,{bg:string,color:string,label:string}> = {
  invitado: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Invitado' },
  activo: { bg:'var(--accent-tint)', color:'var(--accent)', label:'Activo' },
  removido: { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Removido' },
}

const fmt = (n: number) => '$' + n.toLocaleString('es-CR', { minimumFractionDigits:0, maximumFractionDigits:0 })

export default function EquipoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [equipo, setEquipo] = useState<Equipo | null>(null) // equipo que administro
  const [miembros, setMiembros] = useState<EquipoMiembro[]>([])
  const [miembroDe, setMiembroDe] = useState<MiembroConEquipo | null>(null) // fila de equipo_miembros donde soy miembro activo de otro equipo
  const [equipoAjeno, setEquipoAjeno] = useState<{ nombre: string, admin_email?: string } | null>(null)
  const [companerosAjenos, setCompanerosAjenos] = useState<EquipoMiembro[]>([])
  const [invitacionPendiente, setInvitacionPendiente] = useState<MiembroConEquipo | null>(null)
  const [comisionesEquipo, setComisionesEquipo] = useState<Comision[]>([])

  const [creando, setCreando] = useState(false)
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [planEquipo, setPlanEquipo] = useState('inmobiliaria_junior')
  const [guardandoEquipo, setGuardandoEquipo] = useState(false)

  const [invitando, setInvitando] = useState(false)
  const [invNombre, setInvNombre] = useState('')
  const [invCorreo, setInvCorreo] = useState('')

  const cargarTodo = async (u: User) => {
    const [{ data: eq }, { data: miembroActivo }, { data: invitacion }] = await Promise.all([
      supabase.from('equipos').select('*').eq('admin_user_id', u.id).maybeSingle(),
      supabase.from('equipo_miembros').select('*, equipos(nombre, admin_email)').eq('user_id', u.id).eq('estado', 'activo').maybeSingle(),
      supabase.from('equipo_miembros').select('*, equipos(nombre)').eq('correo', u.email).eq('estado', 'invitado').maybeSingle(),
    ])

    setInvitacionPendiente(invitacion)

    if (eq) {
      setEquipo(eq)
      const { data: ms } = await supabase.from('equipo_miembros').select('*').eq('equipo_id', eq.id).order('created_at', { ascending: true })
      setMiembros(ms || [])
      const correos = (ms || []).filter(m => m.estado === 'activo').map(m => m.correo)
      if (correos.length > 0) {
        const { data: coms } = await supabase.from('comisiones').select('*').in('asesor_email', correos).order('created_at', { ascending: false })
        setComisionesEquipo(coms || [])
      } else {
        setComisionesEquipo([])
      }
    } else if (miembroActivo) {
      setMiembroDe(miembroActivo)
      setEquipoAjeno(miembroActivo.equipos)
      const { data: companeros } = await supabase.from('equipo_miembros').select('*').eq('equipo_id', miembroActivo.equipo_id).eq('estado', 'activo').order('created_at', { ascending: true })
      setCompanerosAjenos(companeros || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      await cargarTodo(user)
    })
  }, [])

  const crearEquipo = async () => {
    if (!nombreEquipo.trim() || !user) return
    setGuardandoEquipo(true)
    const info = PLAN_INFO[planEquipo]
    const { data: nuevoEquipo, error } = await supabase.from('equipos').insert({
      nombre: nombreEquipo.trim(),
      admin_user_id: user.id,
      admin_email: user.email,
      plan: planEquipo,
      max_agentes: info.max_agentes,
      max_propiedades: info.max_propiedades,
    }).select().single()

    if (!error && nuevoEquipo) {
      await supabase.from('equipo_miembros').insert({
        equipo_id: nuevoEquipo.id,
        user_id: user.id,
        correo: user.email,
        nombre: user.user_metadata?.nombre || user.email,
        rol: 'admin',
        estado: 'activo',
        aceptado_at: new Date().toISOString(),
      })
      await cargarTodo(user)
    }
    setGuardandoEquipo(false)
    setCreando(false)
  }

  const invitar = async () => {
    if (!invNombre.trim() || !invCorreo.trim() || !equipo) return
    await supabase.from('equipo_miembros').insert({
      equipo_id: equipo.id,
      correo: invCorreo.trim().toLowerCase(),
      nombre: invNombre.trim(),
      rol: 'agente',
      estado: 'invitado',
    })
    setInvNombre('')
    setInvCorreo('')
    setInvitando(false)
    if (user) await cargarTodo(user)
  }

  const removerMiembro = async (id: string) => {
    await supabase.from('equipo_miembros').update({ estado: 'removido' }).eq('id', id)
    if (user) await cargarTodo(user)
  }

  const cambiarRol = async (id: string, rol: string) => {
    await supabase.from('equipo_miembros').update({ rol }).eq('id', id)
    if (user) await cargarTodo(user)
  }

  const aceptarInvitacion = async () => {
    if (!invitacionPendiente || !user) return
    await supabase.from('equipo_miembros').update({ user_id: user.id, estado: 'activo', aceptado_at: new Date().toISOString() }).eq('id', invitacionPendiente.id)
    await cargarTodo(user)
  }

  const rechazarInvitacion = async () => {
    if (!invitacionPendiente) return
    await supabase.from('equipo_miembros').update({ estado: 'removido' }).eq('id', invitacionPendiente.id)
    setInvitacionPendiente(null)
  }

  if (loading) return <div style={{ padding:40, fontFamily:'sans-serif', color:'#999' }}>Cargando...</div>

  const activos = miembros.filter(m => m.estado === 'activo')
  const invitados = miembros.filter(m => m.estado === 'invitado')
  const totalCobrado = comisionesEquipo.filter(c => c.estado === 'cobrada').reduce((a, c) => a + (c.monto_comision || 0), 0)
  const totalPipeline = comisionesEquipo.filter(c => c.estado !== 'cancelada').reduce((a, c) => a + (c.monto_comision || 0), 0)

  const porAgente = activos.map(m => {
    const propias = comisionesEquipo.filter(c => c.asesor_email === m.correo)
    return {
      ...m,
      cerradas: propias.filter(c => c.estado === 'cobrada').length,
      cobrado: propias.filter(c => c.estado === 'cobrada').reduce((a, c) => a + (c.monto_comision || 0), 0),
      pipeline: propias.filter(c => c.estado !== 'cancelada' && c.estado !== 'cobrada').reduce((a, c) => a + (c.monto_comision || 0), 0),
    }
  })

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div className="nav-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', maxWidth:1200, margin:'0 auto' }}>
          <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22 }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
          <div style={{ display:'flex', gap:20, fontSize:13, color:'var(--ink-3)' }}>
            <a href="/dashboard">Dashboard</a>
            <a href="/dashboard/crm">CRM</a>
            <a href="/dashboard/comisiones">Comisiones</a>
            <a href="/dashboard/equipo" style={{ color:'var(--accent)', fontWeight:500 }}>Equipo</a>
          </div>
        </div>
      </nav>

      <div className="page-pad" style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 80px' }}>
        <div style={{ marginBottom:28, animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Plan Inmobiliaria</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,42px)', fontWeight:400, lineHeight:1.1 }}>
            Tu <em style={{ fontStyle:'italic', color:'var(--accent)' }}>equipo.</em>
          </h1>
        </div>

        {/* Invitación pendiente */}
        {invitacionPendiente && (
          <div className="card" style={{ background:'var(--accent-tint)', borderColor:'oklch(0.85 0.04 150)', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>Te invitaron al equipo {invitacionPendiente.equipos?.nombre}</div>
              <div style={{ fontSize:13, color:'var(--ink-2)' }}>Si aceptás, vas a compartir reporte de comisiones y aparecer en el panel del equipo.</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={aceptarInvitacion} className="btn btn-accent">Aceptar</button>
              <button onClick={rechazarInvitacion} className="btn btn-outline">Rechazar</button>
            </div>
          </div>
        )}

        {/* Caso 1: administro un equipo */}
        {equipo && (
          <>
            <div className="card" style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
              <div>
                <div style={{ fontFamily:'var(--serif)', fontSize:22, marginBottom:4 }}>{equipo.nombre}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>{PLAN_INFO[equipo.plan]?.nombre} · {activos.length}/{equipo.max_agentes} agentes · {PLAN_INFO[equipo.plan]?.precio}</div>
              </div>
              <button onClick={() => setInvitando(true)} disabled={activos.length >= equipo.max_agentes} className="btn btn-primary">+ Invitar agente</button>
            </div>

            {invitando && (
              <div className="card" style={{ marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>Invitar agente al equipo</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }} className="grid2">
                  <input className="field" placeholder="Nombre" value={invNombre} onChange={e => setInvNombre(e.target.value)} />
                  <input className="field" type="email" placeholder="correo@ejemplo.com" value={invCorreo} onChange={e => setInvCorreo(e.target.value)} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={invitar} disabled={!invNombre.trim() || !invCorreo.trim()} className="btn btn-primary">Enviar invitación</button>
                  <button onClick={() => setInvitando(false)} className="btn btn-outline">Cancelar</button>
                </div>
                <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:10 }}>La persona invitada verá la invitación al entrar a /dashboard/equipo con la cuenta de ese correo.</p>
              </div>
            )}

            {/* Reporte de comisiones del equipo */}
            <div className="card" style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>Reporte de comisiones del equipo</div>
                <button onClick={() => exportToCSV('nido-equipo-comisiones-' + new Date().toISOString().split('T')[0], porAgente.map(a => ({
                  agente: a.nombre, correo: a.correo, negocios_cerrados: a.cerradas, cobrado: a.cobrado, pipeline: a.pipeline,
                })))} disabled={porAgente.length === 0} className="btn btn-outline" style={{ fontSize:12 }}>⬇ Exportar CSV</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
                {[
                  { l:'Cobrado (equipo)', v:fmt(totalCobrado), c:'var(--accent)' },
                  { l:'Pipeline total', v:fmt(totalPipeline), c:'var(--ink)' },
                  { l:'Negocios registrados', v:String(comisionesEquipo.length), c:'oklch(0.42 0.06 230)' },
                ].map(s => (
                  <div key={s.l} style={{ background:'var(--bg)', borderRadius:10, padding:'14px 16px' }}>
                    <div style={{ fontSize:11, color:'var(--ink-3)', marginBottom:6 }}>{s.l}</div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:600, color:s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
              {porAgente.length === 0 ? (
                <div style={{ padding:'20px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>Todavía no hay negocios registrados por el equipo.</div>
              ) : porAgente.map(a => (
                <div key={a.id} className="row">
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500 }}>{a.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} · {a.cerradas} cerrados</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--accent)' }}>{fmt(a.cobrado)}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>+{fmt(a.pipeline)} en pipeline</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Miembros */}
            <div className="card">
              <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>Miembros del equipo</div>
              {activos.map(m => (
                <div key={m.id} className="row">
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500 }}>{m.nombre} {m.user_id === user?.id && <span style={{ fontSize:11, color:'var(--ink-3)' }}>(vos)</span>}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.correo}</div>
                  </div>
                  <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)', marginRight:10 }}>{m.rol === 'admin' ? 'Admin' : 'Agente'}</span>
                  {m.user_id !== user?.id && (
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => cambiarRol(m.id, m.rol === 'admin' ? 'agente' : 'admin')} className="btn btn-outline" style={{ fontSize:11, padding:'6px 12px' }}>
                        {m.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                      <button onClick={() => removerMiembro(m.id)} className="btn btn-danger" style={{ fontSize:11, padding:'6px 12px' }}>Remover</button>
                    </div>
                  )}
                </div>
              ))}
              {invitados.length > 0 && (
                <>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', margin:'16px 0 4px' }}>Invitaciones pendientes</div>
                  {invitados.map(m => (
                    <div key={m.id} className="row">
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500 }}>{m.nombre}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.correo}</div>
                      </div>
                      <span className="badge" style={{ background:ESTADO_BADGE.invitado.bg, color:ESTADO_BADGE.invitado.color, marginRight:10 }}>Invitado</span>
                      <button onClick={() => removerMiembro(m.id)} className="btn btn-danger" style={{ fontSize:11, padding:'6px 12px' }}>Cancelar</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {/* Caso 2: soy miembro de un equipo ajeno */}
        {!equipo && equipoAjeno && (
          <div className="card">
            <div style={{ fontFamily:'var(--serif)', fontSize:22, marginBottom:4 }}>{equipoAjeno.nombre}</div>
            <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:20 }}>Administrado por {equipoAjeno.admin_email}</div>
            <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Tu equipo</div>
            {companerosAjenos.map(m => (
              <div key={m.id} className="row">
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{m.nombre} {m.correo === user?.email && <span style={{ fontSize:11, color:'var(--ink-3)' }}>(vos)</span>}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.correo}</div>
                </div>
                <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>{m.rol === 'admin' ? 'Admin' : 'Agente'}</span>
              </div>
            ))}
            <p style={{ fontSize:12, color:'var(--ink-3)', marginTop:16 }}>Tus propios negocios y comisiones se gestionan desde <a href="/dashboard/comisiones" style={{ color:'var(--accent)' }}>Comisiones</a>. El admin del equipo ve el reporte agregado.</p>
          </div>
        )}

        {/* Caso 3: no tengo equipo */}
        {!equipo && !equipoAjeno && !invitacionPendiente && (
          <div className="card" style={{ textAlign:'center', padding:'48px 32px' }}>
            {!creando ? (
              <>
                <div style={{ fontSize:36, marginBottom:14 }}>👥</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:24, marginBottom:8 }}>Todavía no tenés un equipo</div>
                <p style={{ fontSize:14, color:'var(--ink-2)', maxWidth:440, margin:'0 auto 24px', lineHeight:1.7 }}>
                  Creá tu equipo para invitar agentes, asignar roles y ver el reporte de comisiones de todos en un solo lugar.
                </p>
                <button onClick={() => setCreando(true)} className="btn btn-primary">Crear mi equipo</button>
              </>
            ) : (
              <div style={{ textAlign:'left', maxWidth:420, margin:'0 auto' }}>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:16 }}>Datos del equipo</div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Nombre del equipo / inmobiliaria</label>
                  <input className="field" placeholder="Ej. Grupo Quirós Bienes Raíces" value={nombreEquipo} onChange={e => setNombreEquipo(e.target.value)} />
                </div>
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Plan</label>
                  <select className="field" value={planEquipo} onChange={e => setPlanEquipo(e.target.value)}>
                    {Object.entries(PLAN_INFO).map(([k, v]) => (
                      <option key={k} value={k}>{v.nombre} — {v.precio} — hasta {v.max_agentes >= 999 ? 'agentes ilimitados' : v.max_agentes + ' agentes'}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={crearEquipo} disabled={!nombreEquipo.trim() || guardandoEquipo} className="btn btn-primary">{guardandoEquipo ? 'Creando...' : 'Crear equipo'}</button>
                  <button onClick={() => setCreando(false)} className="btn btn-outline">Cancelar</button>
                </div>
                <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:14 }}>La activación del plan de pago se confirma igual que el resto de planes NIDO (SINPE/transferencia) — escribinos por WhatsApp después de crear el equipo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
