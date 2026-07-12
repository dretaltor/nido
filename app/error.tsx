'use client'
import { useEffect } from 'react'
import Link from 'next/link'

// Error boundary de Next.js para cualquier segmento bajo app/ (todo el sitio
// excepto errores en el layout raiz, que caen en global-error.tsx). Sin esto,
// un error no capturado mostraba la pantalla generica de Next y el equipo no
// se enteraba de nada — no hay Sentry ni logging estructurado todavia, asi que
// por ahora al menos queda en la consola del navegador con contexto.
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('[NIDO] Error no capturado:', error)
  }, [error])

  return (
    <main style={{ minHeight:'100vh', background:'#060D08', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif", padding:'0 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .link-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;transition:all 0.2s;font-family:"DM Sans",sans-serif;cursor:pointer;border:none}
        .link-btn:hover{transform:translateY(-2px)}
      `}</style>
      <div style={{ textAlign:'center', maxWidth:440 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:'white', letterSpacing:'0.05em', marginBottom:20 }}>
          NIDO<span style={{ color:'oklch(0.85 0.06 80)' }}>.</span>
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(26px,4vw,36px)', fontWeight:400, color:'white', marginBottom:12, lineHeight:1.15 }}>
          Algo salió <em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>mal.</em>
        </h1>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:32, lineHeight:1.7 }}>
          Tuvimos un error inesperado. Podés intentar de nuevo o volver al inicio. Si el problema persiste, escribinos.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={reset} className="link-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white' }}>
            ↻ Intentar de nuevo
          </button>
          <Link href="/" className="link-btn" style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
            ← Inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
