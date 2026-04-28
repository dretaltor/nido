import type { Factura, PlanSuscripcion } from '@/types/propietario'
const ESTADO_COLOR: Record<string,string> = { pagado:'var(--accent)', pendiente:'var(--gold)', fallido:'#dc2626' }
export function PanelFacturacion({ plan, facturas }: { plan:PlanSuscripcion|null, facturas:Factura[] }) {
  return (
    <div style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,padding:16}}>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600,marginBottom:16}}>Facturación</h3>
      {plan && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:12,borderBottom:'1px solid rgba(0,0,0,0.06)',marginBottom:8}}>
          <div>
            <p style={{fontSize:13,fontWeight:500}}>Plan {plan.nombre}</p>
            <p style={{fontSize:11,color:'rgba(0,0,0,0.4)',marginTop:2}}>Renovación {new Date(plan.fecha_renovacion).toLocaleDateString('es-CR',{day:'numeric',month:'long',year:'numeric'})} · {plan.moneda==='CRC'?'₡':'$'}{plan.precio_mensual}/mes</p>
          </div>
          <span style={{fontSize:12,fontWeight:500,color:'var(--accent)'}}>Activo</span>
        </div>
      )}
      {!plan && <div style={{marginBottom:12,padding:12,background:'var(--accent-tint)',borderRadius:8}}><p style={{fontSize:13,color:'var(--accent)',fontWeight:500}}>Sin plan activo</p><a href="/precios" style={{fontSize:12,color:'var(--accent)'}}>Ver planes →</a></div>}
      {facturas.length===0 && <p style={{fontSize:13,color:'rgba(0,0,0,0.4)',textAlign:'center',padding:'16px 0'}}>Sin facturas aún</p>}
      {facturas.map(f => (
        <div key={f.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(0,0,0,0.04)'}}>
          <div><p style={{fontSize:13,fontWeight:500}}>{f.descripcion}</p><p style={{fontSize:11,color:'rgba(0,0,0,0.4)',marginTop:2}}>{new Date(f.fecha).toLocaleDateString('es-CR',{day:'numeric',month:'long',year:'numeric'})}</p></div>
          <div style={{textAlign:'right'}}><p style={{fontSize:13,fontWeight:500}}>{f.moneda==='CRC'?'₡':'$'}{f.monto.toLocaleString()}</p><p style={{fontSize:10,color:ESTADO_COLOR[f.estado],marginTop:2,textTransform:'capitalize'}}>{f.estado}</p></div>
        </div>
      ))}
      <a href="/precios" style={{display:'block',textAlign:'center',fontSize:12,fontWeight:500,padding:8,marginTop:12,border:'1px solid rgba(0,0,0,0.1)',borderRadius:8,color:'var(--ink)',textDecoration:'none'}}>Gestionar suscripción</a>
    </div>
  )
}