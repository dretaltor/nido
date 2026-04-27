import { readFileSync, writeFileSync } from 'fs'
let code = readFileSync('app/propiedades/page.tsx', 'utf8')

// Add loading skeleton while propiedades load
code = code.replace(
  `{loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Cargando propiedades...</div>`,
  `{loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, paddingTop:20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--rule)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ aspectRatio:'4/3', background:'linear-gradient(90deg, var(--bg-elev) 25%, var(--rule-soft) 50%, var(--bg-elev) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ height:12, background:'var(--bg-elev)', borderRadius:4, marginBottom:8, width:'60%' }}/>
                  <div style={{ height:20, background:'var(--bg-elev)', borderRadius:4, marginBottom:12, width:'80%' }}/>
                  <div style={{ height:12, background:'var(--bg-elev)', borderRadius:4, width:'40%' }}/>
                </div>
              </div>
            ))}
          </div>`
)

// Add shimmer animation to CSS
code = code.replace(
  '::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:var(--rule);border-radius:999px}',
  '::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:var(--rule);border-radius:999px} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
)

writeFileSync('app/propiedades/page.tsx', code)
console.log('Loading skeleton agregado')
