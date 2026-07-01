'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DejarResena() {
  const params = useParams()
  const visitaId = params?.visitaId as string
  const [visita, setVisita] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [calificacion, setCalificacion] = useState(0)
  const [hover, setHover] = useState(0)
  const [nombre, setNombre] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (!visitaId) return
    supabase.rpc('get_visita_para_resena', { p_visita_id: visitaId }).then(({ data, error: err }) => {
      if (err || !data || data.length === 0) { setError('No encontramos esa visita, o el enlace ya expiró.'); setLoading(false); return }
      const v = data[0]
      if (v.ya_calificada) { setError('Ya se registró una reseña para esta visita. ¡Gracias!'); setLoading(false); return }
      setVisita(v)
      setLoading(false)
    })
  }, [visitaId])

  const enviar = async () => {
    if (!calificacion || enviando) return
    setEnviando(true)
    const { error: err } = await supabase.from('calificaciones').insert({
      visita_id: visitaId,
      asesor_email: visita.asesor_email,
      propiedad_id: visita.propiedad_id,
      calificador_nombre: nombre.trim() || null,
      calificacion,
      comentario: comentario.trim() || null,
    })
    if (err) { setError('No pudimos guardar tu reseña. Intentá de nuevo en unos minutos.') }
    else { setEnviado(true) }
    setEnviando(false)
  }

  return (
    <main style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'oklch(0.97 0.005 80)', color:'oklch(0.20 0.005 80)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
      `}</style>

      <div style={{ maxWidth:480, width:'100%', background:'white', border:'1px solid oklch(0.88 0.006 80)', borderRadius:20, padding:'36px 32px', textAlign:'center' }}>
        <a href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'oklch(0.20 0.005 80)', display:'block', marginBottom:24 }}>NIDO<span style={{ color:'oklch(0.42 0.06 150)' }}>.</span></a>

        {loading ? (
          <p style={{ fontSize:14, color:'oklch(0.60 0.005 80)' }}>Cargando...</p>
        ) : enviado ? (
          <>
            <div style={{ fontSize:40, marginBottom:16 }}>✓</div>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:400, marginBottom:10 }}>¡Gracias por tu reseña!</h1>
            <p style={{ fontSize:14, color:'oklch(0.60 0.005 80)', lineHeight:1.6 }}>Tu opinión ayuda a otros compradores y al equipo de NIDO a mejorar.</p>
          </>
        ) : error ? (
          <>
            <div style={{ fontSize:40, marginBottom:16 }}>—</div>
            <p style={{ fontSize:14, color:'oklch(0.60 0.005 80)', lineHeight:1.6 }}>{error}</p>
          </>
        ) : visita ? (
          <>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:400, marginBottom:6 }}>¿Cómo te fue?</h1>
            <p style={{ fontSize:13, color:'oklch(0.60 0.005 80)', marginBottom:24, lineHeight:1.6 }}>
              Tu visita a <strong>{visita.propiedad_titulo || 'la propiedad'}</strong> con <strong>{visita.asesor_nombre}</strong>
            </p>

            <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:20 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setCalificacion(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} style={{ background:'none', border:'none', fontSize:32, lineHeight:1, color: n <= (hover||calificacion) ? 'oklch(0.62 0.10 75)' : 'oklch(0.88 0.006 80)' }}>★</button>
              ))}
            </div>

            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre (opcional)" style={{ width:'100%', padding:'11px 14px', border:'1px solid oklch(0.88 0.006 80)', borderRadius:10, fontSize:14, marginBottom:12, fontFamily:'DM Sans,sans-serif', outline:'none' }}/>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Contanos tu experiencia (opcional)" rows={4} style={{ width:'100%', padding:'11px 14px', border:'1px solid oklch(0.88 0.006 80)', borderRadius:10, fontSize:14, marginBottom:20, fontFamily:'DM Sans,sans-serif', outline:'none', resize:'vertical' }}/>

            <button onClick={enviar} disabled={!calificacion || enviando} style={{ width:'100%', padding:'13px', borderRadius:999, background:'oklch(0.20 0.005 80)', color:'white', border:'none', fontSize:14, fontWeight:500, opacity:(!calificacion||enviando)?0.5:1 }}>
              {enviando ? 'Enviando...' : 'Enviar reseña →'}
            </button>
          </>
        ) : null}
      </div>
    </main>
  )
}
