'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { ValeriaBitacora } from '../../../lib/database.types'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .card{background:white;border:1px solid var(--rule);border-radius:12px;overflow:hidden}
  .row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--rule-soft);cursor:pointer;transition:background 0.15s}
  .row:last-child{border-bottom:none}
  .row:hover{background:var(--bg)}
  .drawer{position:fixed;top:0;right:0;bottom:0;width:440px;background:white;border-left:1px solid var(--rule);z-index:100;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,0.08)}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:99}
  @media(max-width:768px){.drawer{width:100%}}
`

const TIPOS: Record<string, { icon: string; label: string; color: string }> = {
  buscar_propiedades: { icon: '🔍', label: 'Búsqueda de propiedades', color: 'oklch(0.42 0.06 230)' },
  consulta_mercado: { icon: '📊', label: 'Consulta de mercado', color: 'oklch(0.45 0.08 80)' },
  cma_propiedad: { icon: '📐', label: 'CMA', color: 'oklch(0.45 0.08 80)' },
  escalar_soporte: { icon: '🆘', label: 'Soporte escalado', color: 'oklch(0.55 0.08 20)' },
  consulta_legal: { icon: '⚖️', label: 'Consulta legal', color: 'oklch(0.55 0.08 20)' },
  conectar_asesor: { icon: '🤝', label: 'Lead conectado', color: 'var(--accent)' },
  mis_propiedades_propietario: { icon: '🏠', label: 'Propietario consultó su propiedad', color: 'var(--ink-2)' },
  redirigir_asesor_propietario: { icon: '↪️', label: 'Propietario redirigido', color: 'var(--ink-2)' },
  mis_propiedades: { icon: '📋', label: 'Consultó su catálogo', color: 'var(--ink-2)' },
  completar_visita: { icon: '📝', label: 'Visita registrada', color: 'var(--accent)' },
  agendar_visita: { icon: '📅', label: 'Visita agendada', color: 'var(--accent)' },
  notificar_visita_comprador: { icon: '📣', label: 'Aviso de visita a comprador', color: 'oklch(0.45 0.08 80)' },
  armar_propuesta: { icon: '📄', label: 'Propuesta redactada', color: 'oklch(0.42 0.06 230)' },
  enviar_mensaje_lead: { icon: '✉️', label: 'Mensaje a lead', color: 'oklch(0.45 0.08 80)' },
  actualizar_perfil_lead: { icon: '📇', label: 'Perfil de lead actualizado', color: 'var(--ink-2)' },
}

const tipoInfo = (t: string) => TIPOS[t] || { icon: '✦', label: t, color: 'var(--ink-2)' }

const fmtFecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-CR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function ActividadValeria() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [entradas, setEntradas] = useState<ValeriaBitacora[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [sel, setSel] = useState<ValeriaBitacora | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('valeria_bitacora')
        .select('*')
        .eq('asesor_email', user.email)
        .order('created_at', { ascending: false })
        .limit(200)
      setEntradas((data || []) as unknown as ValeriaBitacora[])
      setLoading(false)
    })
  }, [])

  const hoy = new Date().toISOString().split('T')[0]
  const deHoy = entradas.filter(e => e.created_at?.startsWith(hoy)).length
  const tiposPresentes = Array.from(new Set(entradas.map(e => e.tipo_accion)))
  const filtradas = filtro === 'todos' ? entradas : entradas.filter(e => e.tipo_accion === filtro)

  if (loading) return <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#999' }}>Cargando...</div>

  return (
    <main style={{ fontFamily: 'var(--sans)', minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <style>{CSS}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'oklch(0.97 0.005 80/0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></Link>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--ink-3)' }}>
            <a href="/dashboard">Dashboard</a>
            <a href="/dashboard/crm">CRM</a>
            <a href="/dashboard/comisiones">Comisiones</a>
            <a href="/dashboard/actividad" style={{ color: 'var(--accent)', fontWeight: 500 }}>Actividad de Nido</a>
          </div>
          <div />
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>Transparencia de IA</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 6 }}>
            Actividad de <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Valeria.</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Todo lo que Valeria hizo en tu nombre queda registrado acá — sin cajas negras.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'white', border: '1px solid var(--rule)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>Acciones registradas</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--accent)', lineHeight: 1 }}>{entradas.length}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--rule)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>Hoy</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)', lineHeight: 1 }}>{deHoy}</div>
          </div>
        </div>

        {tiposPresentes.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => setFiltro('todos')} style={{ padding: '7px 16px', borderRadius: 999, border: '1px solid var(--rule)', fontSize: 12, cursor: 'pointer', background: filtro === 'todos' ? 'var(--ink)' : 'transparent', color: filtro === 'todos' ? 'white' : 'var(--ink-2)' }}>
              Todos ({entradas.length})
            </button>
            {tiposPresentes.map(t => (
              <button key={t} onClick={() => setFiltro(t)} style={{ padding: '7px 16px', borderRadius: 999, border: '1px solid var(--rule)', fontSize: 12, cursor: 'pointer', background: filtro === t ? 'var(--ink)' : 'transparent', color: filtro === t ? 'white' : 'var(--ink-2)' }}>
                {tipoInfo(t).icon} {tipoInfo(t).label} ({entradas.filter(e => e.tipo_accion === t).length})
              </button>
            ))}
          </div>
        )}

        <div className="card">
          {filtradas.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Todavía no hay actividad registrada</div>
              <p style={{ fontSize: 13 }}>En cuanto Valeria haga algo por vos en WhatsApp — buscar propiedades, conectar un lead, escalar soporte — va a aparecer acá.</p>
            </div>
          )}
          {filtradas.map(e => {
            const info = tipoInfo(e.tipo_accion)
            return (
              <div key={e.id} className="row" onClick={() => setSel(e)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--rule)', display: 'grid', placeItems: 'center', fontSize: 17, flexShrink: 0 }}>{info.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.resumen}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{info.label} · {fmtFecha(e.created_at)}</div>
                </div>
                {e.requiere_aprobacion && (() => {
                  const estado = e.aprobado === true ? { label: 'Enviado', bg: 'var(--accent-tint)', color: 'var(--accent)' }
                    : e.aprobado === false ? { label: 'Rechazado', bg: 'oklch(0.93 0.005 80)', color: 'var(--ink-3)' }
                    : { label: 'Pendiente de aprobación', bg: 'oklch(0.93 0.05 80)', color: 'oklch(0.45 0.08 80)' }
                  return (
                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 500, background: estado.bg, color: estado.color, flexShrink: 0 }}>
                      {estado.label}
                    </span>
                  )
                })()}
                <span style={{ color: 'var(--ink-3)', fontSize: 18, flexShrink: 0 }}>›</span>
              </div>
            )
          })}
        </div>
      </div>

      {sel && (
        <>
          <div className="overlay" onClick={() => setSel(null)} />
          <div className="drawer">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400 }}>Detalle de la acción</h2>
              <button onClick={() => setSel(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--rule)', background: 'transparent', fontSize: 16, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--rule)', display: 'grid', placeItems: 'center', fontSize: 20 }}>{tipoInfo(sel.tipo_accion).icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{tipoInfo(sel.tipo_accion).label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{fmtFecha(sel.created_at)}</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                {sel.resumen}
              </div>

              {sel.detalle != null && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Detalle técnico</div>
                  <pre style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', fontSize: 11, fontFamily: 'var(--mono)', overflowX: 'auto', color: 'var(--ink-2)' }}>{JSON.stringify(sel.detalle, null, 2)}</pre>
                </div>
              )}

              <div>
                {[
                  { l: 'Origen', v: sel.origen },
                  { l: 'Lead relacionado', v: sel.lead_id || '—' },
                  { l: 'Propiedad relacionada', v: sel.propiedad_id || '—' },
                  { l: 'Visita relacionada', v: sel.visita_id || '—' },
                ].map(f => (
                  <div key={f.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--rule-soft)', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-3)' }}>{f.l}</span>
                    <span style={{ fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
