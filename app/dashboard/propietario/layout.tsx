import { SidebarPropietario } from '@/components/propietario/SidebarPropietario'
import Link from 'next/link'

export default async function LayoutPropietario({ children }: { children: React.ReactNode }) {
  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'oklch(0.97 0.005 80)',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--accent-mid:oklch(0.65 0.08 150);--gold:oklch(0.62 0.10 75);--gold-light:oklch(0.97 0.03 75);--ink:oklch(0.20 0.005 80);--surface:oklch(0.97 0.005 80)}
        a{text-decoration:none;color:inherit}
      `}</style>
      <header style={{background:'white',borderBottom:'1px solid rgba(0,0,0,0.08)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <Link href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:'oklch(0.20 0.005 80)'}}>NIDO<span style={{color:'oklch(0.42 0.06 150)'}}>.</span></Link>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          
          <a href="/login" style={{fontSize:13,color:'rgba(0,0,0,0.4)'}}>Salir</a>
        </div>
      </header>
      <div style={{display:'flex',flex:1}}>
        <SidebarPropietario plan={null} nombreUsuario="Propietario"/>
        <main style={{flex:1,overflow:'auto',padding:24}}>{children}</main>
      </div>
    </div>
  )
}