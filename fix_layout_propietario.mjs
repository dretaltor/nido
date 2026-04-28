import { writeFileSync } from 'fs'

writeFileSync('app/dashboard/propietario/layout.tsx', `import { SidebarPropietario } from '@/components/propietario/SidebarPropietario'

export default async function LayoutPropietario({ children }: { children: React.ReactNode }) {
  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'oklch(0.97 0.005 80)',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--accent-mid:oklch(0.65 0.08 150);--gold:oklch(0.62 0.10 75);--gold-light:oklch(0.97 0.03 75);--ink:oklch(0.20 0.005 80);--surface:oklch(0.97 0.005 80)}
        a{text-decoration:none;color:inherit}
      \`}</style>
      <header style={{background:'white',borderBottom:'1px solid rgba(0,0,0,0.08)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <a href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:'oklch(0.20 0.005 80)'}}>NIDO<span style={{color:'oklch(0.42 0.06 150)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <a href="/dashboard" style={{fontSize:13,color:'rgba(0,0,0,0.4)'}}>Dashboard asesor</a>
          <a href="/login" style={{fontSize:13,color:'rgba(0,0,0,0.4)'}}>Salir</a>
        </div>
      </header>
      <div style={{display:'flex',flex:1}}>
        <SidebarPropietario plan={null} nombreUsuario="Propietario"/>
        <main style={{flex:1,overflow:'auto',padding:24}}>{children}</main>
      </div>
    </div>
  )
}`)

writeFileSync('app/dashboard/propietario/page.tsx', `import { DashboardPropietarioClient } from './client'
export default function DashboardPropietarioPage() {
  return <DashboardPropietarioClient/>
}`)

writeFileSync('app/dashboard/propietario/client.tsx', `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { MetricasGrid } from '@/components/propietario/MetricasGrid'
import { GraficoVistas } from '@/components/propietario/GraficoVistas'
import { PanelFacturacion } from '@/components/propietario/PanelFacturacion'
import { PanelActividad } from '@/components/propietario/PanelActividad'
import type { DashboardPropietarioData } from '@/types/propietario'

const MOCK_DATA: DashboardPropietarioData = {
  metricas: { vistas_mes:1240, vistas_mes_anterior:980, consultas_mes:34, consultas_semana:8, propiedades_activas:3, propiedades_pausadas:1, tasa_respuesta:87 },
  propiedades: [],
  vistas_semana: Array.from({length:8}, (_,i) => { const d = new Date(); d.setDate(d.getDate()-(7*(7-i))); return { semana:d.toLocaleDateString('es-CR',{day:'2-digit',month:'2-digit'}), vistas:Math.floor(Math.random()*150+20) } }),
  facturas: [],
  plan: null,
  notificaciones: [],
}

export function DashboardPropietarioClient() {
  const [data, setData] = useState<DashboardPropietarioData>(MOCK_DATA)
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('ahí')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      setNombre(user.email?.split('@')[0] || 'ahí')
      supabase.from('propiedades').select('id,titulo,zona,precio,tipo,disponible,created_at,updated_at')
        .eq('asesor_email', user.email!)
        .order('updated_at', { ascending: false })
        .then(({ data: props }) => {
          const propiedades = (props || []).map((p: any) => ({
            id:p.id, titulo:p.titulo, ubicacion:p.zona||'Costa Rica', precio:p.precio,
            moneda:'USD' as const, tipo:p.tipo||'venta', estado:p.disponible?'activa':'pausada',
            fotos_count:0, vistas_mes:Math.floor(Math.random()*200), consultas_mes:Math.floor(Math.random()*20),
            created_at:p.created_at, updated_at:p.updated_at,
          }))
          const activas = propiedades.filter((p:any) => p.estado==='activa')
          const pausadas = propiedades.filter((p:any) => p.estado==='pausada')
          setData(d => ({
            ...d,
            propiedades,
            metricas: { ...d.metricas, propiedades_activas:activas.length, propiedades_pausadas:pausadas.length }
          }))
          setLoading(false)
        })
    })
  }, [])

  const hora = new Date().getHours()
  const saludo = hora<12?'Buen día':hora<19?'Buenas tardes':'Buenas noches'

  if (loading) return <div style={{padding:24,color:'rgba(0,0,0,0.4)',fontSize:14}}>Cargando tu dashboard...</div>

  return (
    <div style={{maxWidth:1100}}>
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,marginBottom:4}}>{saludo}, {nombre}</h1>
      <p style={{fontSize:13,color:'rgba(0,0,0,0.4)',marginBottom:24}}>Esto es lo que está pasando con tus propiedades hoy.</p>
      <MetricasGrid metricas={data.metricas}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600}}>Mis propiedades</h2>
        <a href="/dashboard/nueva-propiedad" style={{fontSize:12,fontWeight:500,padding:'6px 16px',borderRadius:8,background:'oklch(0.42 0.06 150)',color:'white'}}>+ Agregar propiedad</a>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24}}>
        {data.propiedades.map((p:any) => (
          <div key={p.id} style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,overflow:'hidden'}}>
            <div style={{height:100,background:'linear-gradient(135deg,oklch(0.95 0.02 150),oklch(0.88 0.03 150))',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <span style={{fontSize:24,opacity:0.4}}>🏠</span>
              <span style={{position:'absolute',top:8,right:8,fontSize:10,padding:'2px 8px',borderRadius:999,background:p.estado==='activa'?'oklch(0.95 0.02 150)':'rgba(200,169,110,0.15)',color:p.estado==='activa'?'oklch(0.42 0.06 150)':'rgba(200,169,110,0.9)',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.05em'}}>{p.estado}</span>
            </div>
            <div style={{padding:'10px 12px'}}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,marginBottom:2}}>{p.titulo}</h3>
              <p style={{fontSize:11,color:'rgba(0,0,0,0.4)',marginBottom:8}}>{p.ubicacion}</p>
              <div style={{display:'flex',gap:12,fontSize:11,color:'rgba(0,0,0,0.5)'}}>
                <span><strong style={{color:'oklch(0.20 0.005 80)',fontWeight:500}}>${p.precio.toLocaleString()}</strong>{p.tipo==='alquiler'?'/mes':''}</span>
                <span><strong style={{color:'oklch(0.20 0.005 80)',fontWeight:500}}>{p.vistas_mes}</strong> vistas</span>
              </div>
            </div>
            <div style={{display:'flex',gap:8,padding:'8px 12px',borderTop:'1px solid rgba(0,0,0,0.05)',background:'rgba(0,0,0,0.02)'}}>
              <a href={'/propiedades/'+p.id} style={{fontSize:12,padding:'6px 12px',borderRadius:6,border:'1px solid rgba(0,0,0,0.1)',background:'white',color:'oklch(0.20 0.005 80)',fontWeight:500}}>Ver</a>
            </div>
          </div>
        ))}
        <a href="/dashboard/nueva-propiedad" style={{border:'1.5px dashed rgba(0,0,0,0.15)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:180,textDecoration:'none'}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'oklch(0.95 0.02 150)',display:'grid',placeItems:'center',marginBottom:8,fontSize:20,color:'oklch(0.42 0.06 150)'}}>+</div>
          <span style={{fontSize:13,fontWeight:500,color:'oklch(0.42 0.06 150)'}}>Publicar nueva propiedad</span>
        </a>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <GraficoVistas data={data.vistas_semana}/>
        <PanelFacturacion plan={data.plan} facturas={data.facturas}/>
      </div>
      <PanelActividad notificaciones={data.notificaciones}/>
    </div>
  )
}`)

console.log('Dashboard propietario client-side creado')
