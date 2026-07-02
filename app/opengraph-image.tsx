import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const alt = 'NIDO · Propiedades en Costa Rica'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Image() {
  const { count } = await supabase
    .from('propiedades')
    .select('id', { count: 'exact', head: true })
    .eq('disponible', true)
    .eq('verificacion_estado', 'aprobada')

  const stats: [string, string][] = [
    [count && count > 0 ? `${count}+` : 'Nuevas', 'Propiedades'],
    ['24/7', 'Valeria IA'],
  ]

  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0D1F15', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(27,94,59,0.4) 0%, transparent 60%)' }}/>
        <div style={{ fontSize:72, color:'white', letterSpacing:2, marginBottom:16, display:'flex', alignItems:'baseline', gap:4 }}>
          NIDO<span style={{ color:'#C8A96E' }}>.</span>
        </div>
        <div style={{ fontSize:28, color:'rgba(255,255,255,0.7)', marginBottom:40, display:'flex' }}>
          Propiedades en Costa Rica con IA
        </div>
        <div style={{ display:'flex', gap:64, marginBottom:40 }}>
          {stats.map(([val,label]) => (
            <div key={label} style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ fontSize:36, color:'white', display:'flex' }}>{val}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', letterSpacing:2, display:'flex' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:18, color:'rgba(255,255,255,0.3)', letterSpacing:2, display:'flex' }}>www.nido-cr.com</div>
      </div>
    ),
    { ...size }
  )
}
