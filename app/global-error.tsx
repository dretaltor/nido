'use client'
import { useEffect } from 'react'

// Fallback para errores en el layout raiz mismo (donde app/error.tsx no aplica,
// porque el layout que lo envolveria tambien fallo). Tiene que definir su propio
// <html>/<body> porque reemplaza el layout raiz por completo mientras esta activo.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('[NIDO] Error global no capturado:', error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ margin:0, minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', padding:'0 24px' }}>
        <div style={{ textAlign:'center', maxWidth:440 }}>
          <div style={{ fontSize:28, color:'white', letterSpacing:'0.05em', marginBottom:20 }}>NIDO.</div>
          <h1 style={{ fontSize:24, fontWeight:400, color:'white', marginBottom:12 }}>Algo salió mal.</h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:28, lineHeight:1.7 }}>
            Tuvimos un error inesperado cargando la aplicación. Podés intentar de nuevo.
          </p>
          <button onClick={reset} style={{ padding:'12px 24px', borderRadius:999, fontSize:14, fontWeight:500, background:'#3a7d5c', color:'white', border:'none', cursor:'pointer' }}>
            ↻ Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
