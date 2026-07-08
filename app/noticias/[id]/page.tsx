'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import type { Noticia } from '../../../lib/database.types'
import Link from 'next/link'

const CAT_COLORS: Record<string, string> = {
  Mercado: 'oklch(0.93 0.03 240)',
  Inversión: 'var(--accent-tint)',
  Legal: 'oklch(0.93 0.03 280)',
  Financiamiento: 'oklch(0.93 0.05 80)',
  Tendencias: 'oklch(0.93 0.04 150)',
}
const CAT_TEXT: Record<string, string> = {
  Mercado: 'oklch(0.35 0.08 240)',
  Inversión: 'var(--accent)',
  Legal: 'oklch(0.35 0.08 280)',
  Financiamiento: 'oklch(0.45 0.08 80)',
  Tendencias: 'oklch(0.35 0.06 150)',
}

export default function NoticiaDetalle() {
  const params = useParams()
  const router = useRouter()
  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [contenido, setContenido] = useState('')
  const [generando, setGenerando] = useState(false)
  const [relacionadas, setRelacionadas] = useState<Partial<Noticia>[]>([])

  useEffect(() => {
    if (!params.id) return
    supabase.from('noticias').select('*').eq('id', params.id).maybeSingle()
      .then(async ({ data }) => {
        if (!data) { router.push('/noticias'); return }
        setNoticia(data)

        // Load related
        supabase.from('noticias').select('id,titulo,categoria,fecha_publicacion,fuente_nombre')
          .eq('activa', true)
          .eq('categoria', data.categoria)
          .neq('id', data.id)
          .limit(3)
          .then(({ data: rel }) => setRelacionadas(rel || []))

        // Generate full content if not exists
        if (data.contenido) {
          setContenido(data.contenido)
        } else {
          setGenerando(true)
          try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                  role: 'user',
                  content: `Sos Valeria, la IA de NIDO — plataforma inmobiliaria premium de Costa Rica.

Redactá un artículo periodístico completo sobre esta noticia inmobiliaria para nuestro portal.

Título: ${data.titulo}
Resumen: ${data.resumen}
Fuente: ${data.fuente_nombre}
Categoría: ${data.categoria}

Instrucciones:
- Artículo de 4-6 párrafos en español latinoamericano
- Tono profesional, informativo y neutro
- Contextualizá el impacto para el mercado inmobiliario costarricense y/o latinoamericano
- Incluí datos, tendencias o implicaciones prácticas para compradores, vendedores e inversores
- NO inventés cifras específicas que no estén en el resumen original
- Cerrá con una perspectiva de mercado o recomendación general

Solo el texto del artículo, sin título, sin encabezados markdown.`
                }]
              })
            })
            const d = await res.json()
            const texto = d.content?.[0]?.text || ''
            setContenido(texto)

            // Save to DB
            await supabase.from('noticias').update({ contenido: texto }).eq('id', data.id)
          } catch {
            setContenido(data.resumen)
          }
          setGenerando(false)
        }
      })
  }, [params.id])

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif; }
    a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .article-body p{font-size:16px;color:var(--ink-2);line-height:1.85;margin-bottom:20px}
    .rel-card{background:white;border:1px solid var(--rule);border-radius:10px;padding:16px;cursor:pointer;transition:all 0.2s}
    .rel-card:hover{border-color:var(--accent);transform:translateY(-2px)}
  `

  if (!noticia) return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{CSS}</style>
      <div style={{ fontSize:14, color:'var(--ink-3)' }}>Cargando noticia...</div>
    </main>
  )

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)' }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'oklch(0.97 0.005 80/0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', maxWidth:1100, margin:'0 auto' }}>
          <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
          <div style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-3)' }}>
            <Link href="/propiedades">Portal</Link>
            <Link href="/noticias" style={{ color:'var(--accent)', fontWeight:500 }}>← Noticias</Link>
          </div>
          <Link href="/propiedades" style={{ background:'var(--ink)', color:'white', padding:'8px 18px', borderRadius:999, fontSize:13 }}>Ver propiedades →</Link>
        </div>
      </nav>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'48px 24px 80px', animation:'fadeUp 0.4s ease' }}>

        {/* Categoría y fecha */}
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:20 }}>
          <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500, background:CAT_COLORS[noticia.categoria||'']||'var(--bg)', color:CAT_TEXT[noticia.categoria||'']||'var(--ink-3)' }}>
            {noticia.categoria}
          </span>
          {noticia.tag && (
            <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, background:'var(--bg)', border:'1px solid var(--rule)', color:'var(--ink-3)' }}>
              {noticia.tag}
            </span>
          )}
          <span style={{ fontSize:12, color:'var(--ink-3)', marginLeft:'auto' }}>
            {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CR', { year:'numeric', month:'long', day:'numeric' }) : ''}
          </span>
        </div>

        {/* Título */}
        <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,4vw,44px)', fontWeight:400, lineHeight:1.1, marginBottom:20 }}>
          {noticia.titulo}
        </h1>

        {/* Resumen destacado */}
        <p style={{ fontSize:17, color:'var(--ink-2)', lineHeight:1.7, borderLeft:'3px solid var(--accent)', paddingLeft:20, marginBottom:32, fontStyle:'italic' }}>
          {noticia.resumen}
        </p>

        {/* Atribución */}
        <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'16px 20px', marginBottom:32, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'#C8A96E', flexShrink:0 }}>V</div>
            <div>
              <div style={{ fontSize:12, fontWeight:500, color:'var(--ink)' }}>Redactado por Valeria IA · NIDO</div>
              <div style={{ fontSize:11, color:'var(--ink-3)' }}>Contenido generado con inteligencia artificial a partir de fuentes verificadas</div>
            </div>
          </div>
          {noticia.fuente_nombre && (
            <div style={{ marginLeft:'auto', textAlign:'right' }}>
              <div style={{ fontSize:11, color:'var(--ink-3)', marginBottom:2 }}>Fuente original</div>
              <a href={noticia.fuente_url||''} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, fontWeight:500, color:'var(--accent)' }}>
                {noticia.fuente_nombre} →
              </a>
            </div>
          )}
        </div>

        {/* Contenido del artículo */}
        <div className="article-body" style={{ marginBottom:40 }}>
          {generando ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'pulse 1.2s ease infinite' }}/>
                Valeria está redactando el artículo completo...
              </div>
              {[80, 95, 70, 88, 60].map((w, i) => (
                <div key={i} style={{ height:16, borderRadius:4, background:'var(--rule)', width:w+'%', animation:`pulse 1.5s ease ${i*0.15}s infinite` }}/>
              ))}
            </div>
          ) : (
            contenido.split('\n').filter(p => p.trim()).map((p, i) => (
              <p key={i}>{p}</p>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <div style={{ background:'oklch(0.93 0.005 80)', border:'1px solid var(--rule)', borderRadius:10, padding:'14px 18px', marginBottom:40, fontSize:12, color:'var(--ink-3)', lineHeight:1.6 }}>
          ⚠️ Este artículo fue redactado por Valeria IA de NIDO a partir de información de fuentes periodísticas verificadas. El contenido tiene fines informativos y no constituye asesoramiento legal, financiero ni inmobiliario. Consultá siempre con un profesional certificado.
          {noticia.fuente_nombre && <> Fuente original: <a href={noticia.fuente_url||''} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)' }}>{noticia.fuente_nombre}</a>.</>}
        </div>

        {/* CTA */}
        <div style={{ background:'var(--ink)', borderRadius:14, padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:20, flexWrap:'wrap', marginBottom:48 }}>
          <div>
            <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', marginBottom:6 }}>¿Buscás una propiedad en Costa Rica?</div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>Encontrá propiedades verificadas con asesor certificado NIDO.</p>
          </div>
          <Link href="/propiedades" style={{ padding:'12px 24px', borderRadius:999, background:'var(--accent)', color:'white', fontSize:14, fontWeight:500, flexShrink:0 }}>
            Ver propiedades →
          </Link>
        </div>

        {/* Relacionadas */}
        {relacionadas.length > 0 && (
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:16 }}>Noticias relacionadas</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {relacionadas.map(r => (
                <div key={r.id} className="rel-card" onClick={() => router.push('/noticias/'+r.id)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, lineHeight:1.3, marginBottom:4 }}>{r.titulo}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>
                        {r.fuente_nombre && <span>{r.fuente_nombre} · </span>}
                        {r.fecha_publicacion && new Date(r.fecha_publicacion).toLocaleDateString('es-CR')}
                      </div>
                    </div>
                    <span style={{ color:'var(--accent)', fontSize:16, flexShrink:0 }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop:'1px solid var(--rule)', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white' }}>
        <Link href="/" style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--ink)' }}>NIDO<span style={{ color:'var(--accent)' }}>.</span></Link>
        <p style={{ fontSize:12, color:'var(--ink-3)' }}>© 2026 NIDO · Costa Rica</p>
        <Link href="/noticias" style={{ fontSize:13, color:'var(--ink-3)' }}>← Más noticias</Link>
      </footer>
    </main>
  )
}
