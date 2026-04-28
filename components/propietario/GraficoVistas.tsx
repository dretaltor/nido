'use client'
import type { VistasSemana } from '@/types/propietario'
export function GraficoVistas({ data }: { data: VistasSemana[] }) {
  const max = Math.max(...data.map(d => d.vistas), 1)
  return (
    <div style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,padding:16}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600}}>Vistas por semana</h3>
        <span style={{fontSize:11,color:'rgba(0,0,0,0.4)'}}>últimas {data.length} semanas</span>
      </div>
      <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
        {data.map((d,i) => (
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',height:'100%',justifyContent:'flex-end'}}>
            <div title={d.semana+': '+d.vistas} style={{width:'100%',borderRadius:'2px 2px 0 0',background:'var(--accent-tint)',borderBottom:'2px solid var(--accent)',height:Math.max(Math.round((d.vistas/max)*100),4)+'%'}}/>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:6,marginTop:6}}>
        {data.map((d,i) => <div key={i} style={{flex:1,textAlign:'center',fontSize:9,color:'rgba(0,0,0,0.3)'}}>{d.semana}</div>)}
      </div>
    </div>
  )
}