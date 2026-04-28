'use client'
import { useState } from 'react'
import type { PropiedadResumen } from '@/types/propietario'
import { actionPausarPropiedad, actionReactivarPropiedad } from '@/app/dashboard/propietario/actions'
const BADGE: Record<string,{bg:string,color:string}> = { activa:{bg:'var(--accent-tint)',color:'var(--accent)'}, pausada:{bg:'rgba(200,169,110,0.1)',color:'rgba(200,169,110,0.9)'}, borrador:{bg:'rgba(0,0,0,0.05)',color:'rgba(0,0,0,0.4)'} }
export function PropiedadCard({ propiedad }: { propiedad:PropiedadResumen }) {
  const [loading, setLoading] = useState(false)
  const badge = BADGE[propiedad.estado]||BADGE.borrador
  const precio = (propiedad.moneda==='USD'?'$':'₡')+propiedad.precio.toLocaleString()
  async function toggle() { setLoading(true); try { if(propiedad.estado==='activa') await actionPausarPropiedad(propiedad.id); else await actionReactivarPropiedad(propiedad.id) } finally { setLoading(false) } }
  return (
    <div style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column',opacity:propiedad.estado==='pausada'?0.75:1}}>
      <div style={{position:'relative',height:112,background:'linear-gradient(135deg,var(--accent-tint),oklch(0.88 0.03 150))',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:28,opacity:0.4}}>🏠</span>
        <span style={{position:'absolute',top:8,right:8,fontSize:10,fontWeight:500,padding:'2px 8px',borderRadius:999,textTransform:'uppercase',letterSpacing:'0.05em',background:badge.bg,color:badge.color}}>{propiedad.estado}</span>
        <span style={{position:'absolute',bottom:8,left:8,fontSize:10,background:'rgba(0,0,0,0.5)',color:'white',padding:'2px 8px',borderRadius:999}}>{propiedad.fotos_count} fotos{propiedad.fotos_count<4?' · agrega más':''}</span>
      </div>
      <div style={{padding:'10px 12px',flex:1}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,marginBottom:2}}>{propiedad.titulo}</h3>
        <p style={{fontSize:11,color:'rgba(0,0,0,0.4)',marginBottom:8}}>{propiedad.ubicacion}</p>
        <div style={{display:'flex',gap:12,fontSize:11,color:'rgba(0,0,0,0.5)'}}>
          <span><strong style={{color:'var(--ink)',fontWeight:500}}>{precio}</strong>{propiedad.tipo==='alquiler'?'/mes':''}</span>
          <span><strong style={{color:'var(--ink)',fontWeight:500}}>{propiedad.vistas_mes}</strong> vistas</span>
          <span><strong style={{color:'var(--ink)',fontWeight:500}}>{propiedad.consultas_mes}</strong> consultas</span>
        </div>
      </div>
      <div style={{display:'flex',gap:8,padding:'8px 12px',borderTop:'1px solid rgba(0,0,0,0.05)',background:'rgba(0,0,0,0.02)'}}>
        <a href={'/propiedades/'+propiedad.id} style={{fontSize:12,padding:'6px 12px',borderRadius:6,border:'1px solid rgba(0,0,0,0.1)',background:'white',color:'var(--ink)',textDecoration:'none',fontWeight:500}}>Ver</a>
        <button onClick={toggle} disabled={loading} style={{fontSize:12,padding:'6px 12px',borderRadius:6,border:'1px solid '+(propiedad.estado==='activa'?'rgba(220,38,38,0.2)':'var(--accent)'),color:propiedad.estado==='activa'?'#dc2626':'var(--accent)',background:'transparent',fontWeight:500,cursor:'pointer',opacity:loading?0.5:1}}>{loading?'...':propiedad.estado==='activa'?'Pausar':'Reactivar'}</button>
      </div>
    </div>
  )
}
export function PropiedadCardNueva() {
  return <a href="/dashboard/nueva-propiedad" style={{border:'1.5px dashed rgba(0,0,0,0.15)',borderRadius:12,background:'rgba(0,0,0,0.02)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200,textDecoration:'none'}}><div style={{width:40,height:40,borderRadius:'50%',background:'var(--accent-tint)',display:'grid',placeItems:'center',marginBottom:8,fontSize:20,color:'var(--accent)'}}>+</div><span style={{fontSize:13,fontWeight:500,color:'var(--accent)'}}>Publicar nueva propiedad</span><span style={{fontSize:11,color:'rgba(0,0,0,0.35)',marginTop:4}}>Wizard de 8 pasos</span></a>
}