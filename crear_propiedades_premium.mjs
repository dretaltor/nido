import { writeFileSync } from 'fs'

const code = `'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'

const HUES = [80, 50, 200, 130, 160, 240, 100, 170]
function fmt(n) { return n.toLocaleString('en-US') }

function Icon({ name }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'bed') return <svg {...p}><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7"/><path d="M3 14h18M3 18h18"/></svg>
  if (name === 'bath') return <svg {...p}><path d="M4 12V6a2 2 0 0 1 4 0"/><path d="M3 12h18l-1 5a3 3 0 0 1-3 2H7a3 3 0 0 1-3-2l-1-5z"/></svg>
  if (name === 'ruler') return <svg {...p}><path d="M3 17 17 3l4 4L7 21z"/><path d="M7 11l2 2M10 8l2 2"/></svg>
  if (name === 'heart') return <svg {...p}><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/></svg>
  if (name === 'heart-fill') return <svg {...p} fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/></svg>
  if (name === 'x') return <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
  if (name === 'search') return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  if (name === 'send') return <svg {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>
  return null
}

function PropertyCard({ p, index, fav, onFav, onOpen }) {
  const hue = HUES[index % HUES.length]
  const priceLabel = p.operacion === 'alquiler' ? \`$\${fmt(p.precio)}/mes\` : \`$\${fmt(p.precio)}\`
  return (
    <article onClick={onOpen} style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: \`oklch(0.88 0.03 \${hue})\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: \`oklch(0.55 0.05 \${hue})\`, textTransform: 'uppercase', textAlign: 'center', padding: '0 1rem' }}>
          {p.titulo.toUpperCase()} · FOTO
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ background: p.operacion === 'alquiler' ? 'var(--ink)' : 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 999, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {p.operacion === 'alquiler' ? 'Alquiler' : 'Venta'}
          </span>
        </div>
        <button onClick={e => { e.stopPropagation(); onFav() }} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: fav ? '#e11d48' : 'var(--ink-3)' }}>
          <Icon name={fav ? 'heart-fill' : 'heart'} />
        </button>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{p.zona}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--ink)' }}>{priceLabel}</span>
        </div>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, margin: '0 0 10px', lineHeight: 1.1 }}>{p.titulo}</h3>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="bed" /> {p.habitaciones} hab</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="bath" /> {p.banos} baños</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="ruler" /> {p.metros} m²</span>
        </div>
        <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <b style={{ color: 'var(--accent)', marginRight: 6 }}>↳ Valeria IA</b>
          Propiedad verificada · Disponible para visita virtual
        </div>
      </div>
    </article>
  )
}

function Drawer({ p, fav, onFav, onClose }) {
  const hue = HUES[0]
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'oklch(0.10 0.005 80 / 0.5)', zIndex: 60, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(680px, 96vw)', background: 'var(--bg)', zIndex: 70, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'relative', height: 300, background: \`oklch(0.85 0.04 \${hue})\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: \`oklch(0.5 0.06 \${hue})\`, textTransform: 'uppercase' }}>FOTO PRINCIPAL</span>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'oklch(0.10 0.005 80 / 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', backdropFilter: 'blur(6px)' }}>
            <Icon name="x" />
          </button>
          <button onClick={onFav} style={{ position: 'absolute', top: 16, right: 62, width: 36, height: 36, borderRadius: '50%', background: 'oklch(0.10 0.005 80 / 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: fav ? '#f43f5e' : 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', backdropFilter: 'blur(6px)' }}>
            <Icon name={fav ? 'heart-fill' : 'heart'} />
          </button>
        </div>
        <div style={{ padding: '32px 32px 80px' }}>
          <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: 22, marginBottom: 22 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>{p.zona} · {p.direccion}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, lineHeight: 1.05, margin: 0 }}>{p.titulo}</h2>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18 }}>${'$'}{fmt(p.precio)}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 4 }}>{p.operacion === 'alquiler' ? 'por mes' : 'precio venta'}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', marginBottom: 28 }}>
            {[{ num: p.habitaciones, label: 'Habitaciones' }, { num: p.banos, label: 'Baños' }, { num: p.metros + ' m²', label: 'Área' }, { num: p.operacion === 'venta' ? 'Venta' : 'Alquiler', label: 'Operación' }].map((s, i) => (
              <div key={i} style={{ padding: '16px 0', paddingLeft: i > 0 ? 16 : 0, borderRight: i < 3 ? '1px solid var(--rule-soft)' : 'none' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{s.num}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 12px', fontWeight: 500 }}>Descripción</h4>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)' }}>{p.descripcion || 'Propiedad en excelentes condiciones. Contacta a nuestro equipo para más información.'}</p>
          </div>
          <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 8, padding: '16px 18px', marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>Valeria · Asesora IA de NIDO</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>Esta propiedad cumple con los criterios más solicitados en {p.zona}. Recomiendo agendar una visita virtual esta semana.</p>
          </div>
          <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 22 }}>
            <h4 style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 14px', fontWeight: 500 }}>Asesor a cargo</h4>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-elev)', border: '1px solid var(--rule)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontSize: 20 }}>{(p.asesor_nombre || 'N')[0]}</div>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{p.asesor_nombre || 'Asesor NIDO'}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.asesor_email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <a href="/contacto" style={{ display: 'block', padding: '11px 16px', borderRadius: 6, fontSize: 13, border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)', textAlign: 'center', textDecoration: 'none' }}>Contactar asesor</a>
              <a href="/chat" style={{ display: 'block', padding: '11px 16px', borderRadius: 6, fontSize: 13, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', textAlign: 'center', textDecoration: 'none' }}>Preguntar a Valeria IA</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AiAdvisor() {
  const [open, setOpen] = useState(false)
  const [thread, setThread] = useState([{ who: 'bot', text: 'Hola, soy Valeria — tu asesora inteligente de NIDO. Puedo ayudarte a filtrar propiedades, comparar zonas o estimar tu pre-aprobación bancaria. ¿Por dónde empezamos?' }])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (text) => {
    if (!text.trim() || busy) return
    const next = [...thread, { who: 'user', text }]
    setThread(next); setDraft(''); setBusy(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.map(m => ({ role: m.who === 'user' ? 'user' : 'assistant', content: m.text })) }) })
      const data = await res.json()
      setThread(t => [...t, { who: 'bot', text: data.message }])
    } catch { setThread(t => [...t, { who: 'bot', text: 'Tuve un problema. Reformulá tu pregunta.' }]) }
    setBusy(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, padding: '12px 20px', fontSize: 13, fontFamily: 'var(--sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)', zIndex: 50, letterSpacing: '0.02em' }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--accent-2)' }}>V</span>
      Valeria · Asesora IA
    </button>
  )

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, width: 360, background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 50, display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 400, margin: 0 }}>Valeria</h3>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Asesora IA · NIDO</div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}><Icon name="x" /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {thread.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.who === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.who === 'bot' && <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Valeria</div>}
            <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: m.who === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: m.who === 'user' ? 'var(--ink)' : 'var(--bg-elev)', color: m.who === 'user' ? 'var(--bg)' : 'var(--ink)', fontSize: 13, lineHeight: 1.6 }}>{m.text}</div>
          </div>
        ))}
        {busy && <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: 'var(--bg-elev)', fontSize: 13, color: 'var(--ink-3)' }}>Escribiendo...</div>}
      </div>
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--rule)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Quiero algo cerca del mar bajo $1M', 'Comparame Escazú y Santa Ana', '¿Cuánto necesito de prima?'].map(s => (
          <button key={s} onClick={() => send(s)} disabled={busy} style={{ background: 'var(--bg-elev)', border: '1px solid var(--rule)', borderRadius: 999, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sans)', color: 'var(--ink-2)' }}>{s}</button>
        ))}
      </div>
      <div style={{ padding: '8px 12px 14px', display: 'flex', gap: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(draft)} placeholder="Escribí tu pregunta…" style={{ flex: 1, background: 'var(--bg-elev)', border: '1px solid var(--rule)', borderRadius: 999, padding: '8px 14px', fontSize: 13, outline: 'none', fontFamily: 'var(--sans)', color: 'var(--ink)' }} />
        <button onClick={() => send(draft)} disabled={!draft.trim() || busy} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)', border: 'none', color: 'var(--bg)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="send" /></button>
      </div>
    </div>
  )
}

const ZONES = [
  { num: '01', name: 'Valle Central', meta: 'Escazú · Santa Ana · Curridabat', price: '$2,450 / m²', delta: '+6.2% YoY' },
  { num: '02', name: 'Pacífico Central', meta: 'Santa Teresa · Manuel Antonio · Jacó', price: '$3,180 / m²', delta: '+11.8% YoY' },
  { num: '03', name: 'Guanacaste', meta: 'Tamarindo · Nosara · Papagayo', price: '$3,920 / m²', delta: '+9.4% YoY' },
]

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ location: '', op: 'todo', budget: 'any' })
  const [sort, setSort] = useState('featured')
  const [favs, setFavs] = useState(new Set())
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    supabase.from('propiedades').select('*').eq('disponible', true).then(({ data }) => {
      setPropiedades(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let out = propiedades
    if (query.op !== 'todo') out = out.filter(p => p.operacion === query.op)
    if (query.location) out = out.filter(p => p.zona.toLowerCase().includes(query.location.toLowerCase()) || p.titulo.toLowerCase().includes(query.location.toLowerCase()))
    if (sort === 'price-asc') out = [...out].sort((a, b) => a.precio - b.precio)
    if (sort === 'price-desc') out = [...out].sort((a, b) => b.precio - a.precio)
    return out
  }, [propiedades, query, sort])

  const open = openId ? propiedades.find(p => p.id === openId) : null
  const toggleFav = (id) => setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <main style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', background: 'var(--bg)', minHeight: '100vh' }}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: oklch(0.97 0.005 80); --bg-elev: oklch(0.985 0.004 80); --bg-card: oklch(0.99 0.003 80);
          --ink: oklch(0.20 0.005 80); --ink-2: oklch(0.42 0.005 80); --ink-3: oklch(0.60 0.005 80);
          --rule: oklch(0.88 0.006 80); --rule-soft: oklch(0.93 0.005 80);
          --accent: oklch(0.42 0.06 150); --accent-2: oklch(0.55 0.07 150); --accent-tint: oklch(0.95 0.02 150);
          --shadow-sm: 0 1px 2px oklch(0.20 0.02 80 / 0.06); --shadow-md: 0 8px 30px oklch(0.20 0.02 80 / 0.10); --shadow-lg: 0 30px 60px oklch(0.20 0.02 80 / 0.16);
          --serif: "Cormorant Garamond", serif; --sans: "DM Sans", system-ui, sans-serif; --mono: "JetBrains Mono", monospace;
        }
        a { color: inherit; text-decoration: none; } button { font: inherit; color: inherit; cursor: pointer; }
        .chip { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--rule); background: transparent; font-size: 13px; color: var(--ink-2); transition: all 0.15s; cursor: pointer; }
        .chip:hover { border-color: var(--ink); color: var(--ink); }
        .chip.active { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding-top: 20px; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 4px oklch(0.42 0.06 150 / 0.18); } 50% { box-shadow: 0 0 0 8px oklch(0.42 0.06 150 / 0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 999px; }
      \`}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'oklch(0.97 0.005 80 / 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px', maxWidth: 1600, margin: '0 auto' }}>
          <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '0.02em' }}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></a>
          <nav style={{ display: 'flex', gap: 28, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
            <a href="/propiedades" style={{ borderBottom: '1px solid var(--ink)', color: 'var(--ink)', paddingBottom: 2 }}>Comprar</a>
            <a href="/propiedades">Alquilar</a>
            <a href="/asesores">Asesores</a>
            <a href="/academia">Academia</a>
          </nav>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/login" style={{ border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink)', padding: '9px 18px', borderRadius: 999, fontSize: 13 }}>Ingresar</a>
            <a href="/registro" style={{ border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)', padding: '9px 18px', borderRadius: 999, fontSize: 13 }}>Crear cuenta</a>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1600, margin: '0 auto', padding: '56px 40px 28px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'end' }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2.4s ease-in-out infinite', display: 'inline-block' }} />
            Portal de propiedades · Costa Rica
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(48px, 6vw, 84px)', fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.015em' }}>
            El próximo lugar<br/>al que llamarás <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>casa.</em>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 420, marginTop: 22 }}>
            Propiedades seleccionadas en todo Costa Rica, con asesoría de Valeria, tu copiloto inteligente.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 12 }}>
          {[{ num: propiedades.length || '·', label: 'Propiedades activas hoy' }, { num: '38', label: 'Cantones cubiertos' }, { num: '24/7', label: 'Valeria IA disponible' }].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderTop: '1px solid var(--rule)', paddingTop: 14 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 36 }}>{s.num}</div>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1600, margin: '28px auto 0', padding: '0 40px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--rule)', borderRadius: 999, padding: 6, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '12px 22px', borderRight: '1px solid var(--rule-soft)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Ubicación</div>
            <input value={query.location} onChange={e => setQuery({ ...query, location: e.target.value })} placeholder="¿A dónde te gustaría vivir?" style={{ background: 'transparent', border: 0, outline: 'none', width: '100%', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }} />
          </div>
          <div style={{ padding: '12px 22px', borderRight: '1px solid var(--rule-soft)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Operación</div>
            <select value={query.op} onChange={e => setQuery({ ...query, op: e.target.value })} style={{ background: 'transparent', border: 0, outline: 'none', width: '100%', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', appearance: 'none', cursor: 'pointer' }}>
              <option value="todo">Comprar o alquilar</option>
              <option value="venta">Comprar</option>
              <option value="alquiler">Alquilar</option>
            </select>
          </div>
          <div style={{ padding: '12px 22px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Presupuesto</div>
            <select value={query.budget} onChange={e => setQuery({ ...query, budget: e.target.value })} style={{ background: 'transparent', border: 0, outline: 'none', width: '100%', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', appearance: 'none', cursor: 'pointer' }}>
              <option value="any">Sin límite</option>
              <option value="500">Hasta $500K</option>
              <option value="1000">Hasta $1M</option>
            </select>
          </div>
          <button style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--ink)', color: 'var(--bg)', border: 0, display: 'grid', placeItems: 'center', margin: '0 4px' }}>
            <Icon name="search" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '22px auto 0', padding: '0 40px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {['Casa', 'Apartamento', 'Villa', 'Lote'].map(t => <button key={t} className="chip">{t}</button>)}
        <span style={{ width: 1, height: 18, background: 'var(--rule)', margin: '0 4px' }} />
        {['Tour 360°', 'Piscina', 'Vista al mar'].map(f => <button key={f} className="chip">{f}</button>)}
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 18 }}>
          <span>{filtered.length} resultados</span>
          <span>Ordenar: <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: 'transparent', border: 0, borderBottom: '1px solid var(--ink)', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', outline: 'none', cursor: 'pointer', padding: '2px 0' }}>
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: menor</option>
            <option value="price-desc">Precio: mayor</option>
          </select></span>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '24px auto 0', padding: '0 40px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)', paddingBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 500 }}>Selección de la semana</h2>
          <span style={{ fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> Ordenado por relevancia · Valeria IA
          </span>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-3)' }}>Cargando propiedades...</div> : (
          <div className="cards">
            {filtered.map((p, i) => <PropertyCard key={p.id} p={p} index={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => setOpenId(p.id)} />)}
          </div>
        )}
      </div>

      <section style={{ maxWidth: 1600, margin: '0 auto', padding: '60px 40px', borderTop: '1px solid var(--rule)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>Mercado · Costa Rica</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.01em', margin: '0 0 22px' }}>Zonas con mayor revalorización</h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)' }}>El mercado inmobiliario costarricense registra crecimiento sostenido en zonas costeras y periféricas del Valle Central.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--rule)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
          {ZONES.map(z => (
            <div key={z.num} style={{ background: 'var(--bg)', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>{z.num}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{z.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{z.meta}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{z.price}</span>
                <span style={{ fontSize: 11, color: 'var(--accent)' }}>{z.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ maxWidth: 1600, margin: '0 auto', padding: 40, fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.06em', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between' }}>
        <span>© 2026 NIDO — Plataforma inmobiliaria · Costa Rica</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="/precios">Precios</a><a href="/academia">Academia</a><a href="/contacto">Contacto</a>
        </div>
      </footer>

      {open && <Drawer p={open} fav={favs.has(open.id)} onFav={() => toggleFav(open.id)} onClose={() => setOpenId(null)} />}
      <AiAdvisor />
    </main>
  )
}`

writeFileSync('app/propiedades/page.tsx', code)
console.log('Propiedades premium creada exitosamente')
