import type { MetricasPropietario } from '@/types/propietario'
function delta(a: number, b: number) { if(b===0) return null; return Math.round(((a-b)/b)*100) }
export function MetricasGrid({ metricas }: { metricas: MetricasPropietario }) {
  const pct = delta(metricas.vistas_mes, metricas.vistas_mes_anterior)
  const cards = [
    { label:'Vistas este mes', valor:metricas.vistas_mes.toLocaleString('es-CR'), delta:pct?'↑ '+pct+'% vs mes anterior':undefined, color:'var(--accent)' },
    { label:'Consultas recibidas', valor:metricas.consultas_mes.toString(), delta:'↑ '+metricas.consultas_semana+' nuevas esta semana', color:'var(--accent)' },
    { label:'Propiedades activas', valor:metricas.propiedades_activas.toString(), delta:metricas.propiedades_pausadas+' en pausa', color:'var(--ink)' },
    { label:'Tasa de respuesta', valor:metricas.tasa_respuesta+'%', delta:metricas.tasa_respuesta>=80?'↑ Excelente':'Mejorable', color:metricas.tasa_respuesta>=80?'var(--accent)':'var(--gold)' },
  ]
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
      {cards.map((m,i) => (
        <div key={i} style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'14px 16px'}}>
          <p style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(0,0,0,0.4)',marginBottom:6}}>{m.label}</p>
          <p style={{fontSize:24,fontWeight:500,color:m.color,lineHeight:1}}>{m.valor}</p>
          {m.delta && <p style={{fontSize:11,marginTop:6,color:'rgba(0,0,0,0.4)'}}>{m.delta}</p>}
        </div>
      ))}
    </div>
  )
}