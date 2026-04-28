'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PlanSuscripcion } from '@/types/propietario'
const NAV = [
  { section:'General', items:[{ href:'/dashboard/propietario', label:'Resumen', icon:'▦' },{ href:'/dashboard/nueva-propiedad', label:'Nueva propiedad', icon:'+' },{ href:'/dashboard/crm', label:'Consultas', icon:'◎' }]},
  { section:'Cuenta', items:[{ href:'/precios', label:'Facturación', icon:'▤' },{ href:'/dashboard', label:'Dashboard', icon:'◈' }]},
]
export function SidebarPropietario({ plan, nombreUsuario }: { plan:PlanSuscripcion|null, nombreUsuario:string }) {
  const pathname = usePathname()
  return (
    <aside style={{width:200,background:'white',borderRight:'1px solid rgba(0,0,0,0.08)',display:'flex',flexDirection:'column'}}>
      <nav style={{flex:1,paddingTop:8}}>
        {NAV.map(g => (
          <div key={g.section}>
            <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.15em',color:'rgba(0,0,0,0.35)',padding:'16px 20px 6px',fontWeight:500}}>{g.section}</p>
            {g.items.map(item => {
              const active = pathname===item.href
              return <Link key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 20px',fontSize:13,textDecoration:'none',borderLeft:'2px solid '+(active?'var(--accent)':'transparent'),background:active?'var(--accent-tint)':'transparent',color:active?'var(--accent)':'rgba(0,0,0,0.5)',fontWeight:active?500:400,transition:'all 0.15s'}}><span style={{fontSize:14}}>{item.icon}</span>{item.label}</Link>
            })}
          </div>
        ))}
      </nav>
      {plan && <div style={{margin:12,background:'rgba(200,169,110,0.1)',border:'1px solid rgba(200,169,110,0.4)',borderRadius:10,padding:12}}><p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(200,169,110,0.8)',fontWeight:500}}>Plan activo</p><p style={{fontSize:14,fontWeight:500,marginTop:2}}>{plan.nombre}</p></div>}
    </aside>
  )
}