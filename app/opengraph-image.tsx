import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NIDO · Propiedades en Costa Rica'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0D1F15', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(27,94,59,0.4) 0%, transparent 60%)' }}/>
        <div style={{ fontFamily:'Georgia,serif', fontSize:72, color:'white', letterSpacing:'0.08em', marginBottom:16, display:'flex', alignItems:'baseline', gap:4 }}>
          NIDO<span style={{ color:'#C8A96E' }}>.</span>
        </div>
        <div style={{ fontSize:28, color:'rgba(255,255,255,0.7)', fontFamily:'Georgia,serif', fontStyle:'italic', marginBottom:40 }}>
          Propiedades en Costa Rica con IA
        </div>
        <div style={{ display:'flex', gap:48, marginBottom:40 }}>
          {[['412+','Propiedades'],['2.4x','Mas cierres'],['24/7','Valeria IA']].map(([val,label]) => (
            <div key={label} style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ fontSize:36, color:'white', fontFamily:'Georgia,serif' }}>{val}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:18, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em' }}>www.nido-cr.com</div>
      </div>
    ),
    { ...size }
  )
}
