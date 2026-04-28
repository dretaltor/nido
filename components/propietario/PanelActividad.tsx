'use client'
import type { NotificacionPropietario } from '@/types/propietario'
const TIPO_DOT: Record<string,string> = { consulta:'var(--accent)', alerta:'var(--gold)', pago:'#dc2626', sistema:'rgba(0,0,0,0.2)' }
function timeAgo(s: string) {
  const d = Date.now()-new Date(s).getTime(), m = Math.floor(d/60000)
  if(m<60) return 'Hace '+m+' min'
  const h = Math.floor(m/60); if(h<24) return 'Hace '+h+(h===1?' hora':' horas')
  const dy = Math.floor(h/24); return 'Hace '+dy+(dy===1?' día':' días')
}
export function PanelActividad({ notificaciones }: { notificaciones: NotificacionPropietario[] }) {
  const sinLeer = notificaciones.filter(n => !n.leida).length
  return (
    <div style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,padding:16,marginTop:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600}}>
          Actividad reciente
          {sinLeer>0 && <span style={{marginLeft:8,fontSize:11,background:'var(--accent)',color:'white',borderRadius:999,padding:'2px 7px'}}>{sinLeer}</span>}
        </h3>
      </div>
      {notificaciones.length===0 && <p style={{fontSize:13,color:'rgba(0,0,0,0.4)',textAlign:'center',padding:'16px 0'}}>Sin actividad reciente</p>}
      {notificaciones.map(n => (
        <div key={n.id} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(0,0,0,0.04)',opacity:n.leida?0.6:1}}>
          <span style={{marginTop:6,width:8,height:8,borderRadius:'50%',background:TIPO_DOT[n.tipo]||'rgba(0,0,0,0.2)',flexShrink:0}}/>
          <div><p style={{fontSize:12,lineHeight:1.5}}>{n.mensaje}</p><p style={{fontSize:10,color:'rgba(0,0,0,0.4)',marginTop:2}}>{timeAgo(n.created_at)}</p></div>
        </div>
      ))}
    </div>
  )
}