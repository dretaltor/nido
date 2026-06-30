'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { usePlan } from '../../../lib/hooks/usePlan'
import { MetricasGrid } from '@/components/propietario/MetricasGrid'
import { GraficoVistas } from '@/components/propietario/GraficoVistas'
import { PanelFacturacion } from '@/components/propietario/PanelFacturacion'
import { PanelActividad } from '@/components/propietario/PanelActividad'
import type { PropiedadResumen } from '@/types/propietario'

const VISTAS_MOCK = Array.from({length:8}, (_,i) => {
  const d = new Date()
  d.setDate(d.getDate()-(7*(7-i)))
  return { semana:d.toLocaleDateString('es-CR',{day:'2-digit',month:'2-digit'}), vistas:Math.floor(Math.random()*150+20) }
})

function PlanBadge({ plan }: { plan: string }) {
  const estilos: Record<string, {bg:string,color:string,label:string}> = {
    gratis:     { bg:'var(--bg-elev)', color:'var(--ink-3)', label:'Plan Gratis' },
    pro:        { bg:'var(--accent-tint)', color:'var(--accent)', label:'Plan Pro' },
    enterprise: { bg:'oklch(0.93 0.03 240)', color:'oklch(0.35 0.08 240)', label:'Plan Enterprise' },
  }
  const e = estilos[plan] || estilos.gratis
  return (
    <span style={{padding:'3px 12px',borderRadius:999,fontSize:11,fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase',background:e.bg,color:e.color}}>
      {e.label}
    </span>
  )
}

function BloqueadoPro({ feature }: { feature: string }) {
  return (
    <div style={{background:'var(--bg-elev)',border:'1px dashed var(--rule)',borderRadius:12,padding:'32px',textAlign:'center',marginBottom:24}}>
      <div style={{fontSize:28,marginBottom:12}}>🔒</div>
      <div style={{fontFamily:'var(--serif)',fontSize:20,marginBottom:8}}>{feature}</div>
      <p style={{fontSize:13,color:'var(--ink-3)',marginBottom:16,lineHeight:1.6}}>Esta función está disponible en el plan Pro y Enterprise.</p>
      <a href="/precios" style={{display:'inline-block',background:'var(--accent)',color:'white',padding:'10px 24px',borderRadius:999,fontSize:13,fontWeight:500,textDecoration:'none'}}>Ver planes →</a>
    </div>
  )
}

export function DashboardPropietarioClient() {
  const [propiedades, setPropiedades] = useState<PropiedadResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('ahi')
  const { plan, esPro, esEnterprise, limites, loading: planLoading } = usePlan()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      setNombre(user.email?.split('@')[0] || 'ahi')
      supabase.from('propiedades')
        .select('id,titulo,zona,precio,tipo,disponible,created_at,updated_at')
        .eq('asesor_email', user.email!)
        .order('updated_at', { ascending: false })
        .then(({ data: props }) => {
          setPropiedades((props || []).map((p: any) => ({
            id:p.id, titulo:p.titulo, ubicacion:p.zona||'Costa Rica', precio:p.precio,
            moneda:'USD' as const, tipo:p.tipo||'venta', estado:p.disponible?'activa':'pausada',
            fotos_count:0, vistas_mes:Math.floor(Math.random()*200), consultas_mes:Math.floor(Math.random()*20),
            created_at:p.created_at, updated_at:p.updated_at,
          })))
          setLoading(false)
        })
    })
  }, [])

  const hora = new Date().getHours()
  const saludo = hora<12?'Buen dia':hora<19?'Buenas tardes':'Buenas noches'
  const activas = propiedades.filter(p => p.estado==='activa').length
  const pausadas = propiedades.filter(p => p.estado==='pausada').length
  const propiedadesPermitidas = propiedades.slice(0, limites.propiedades)
  const propiedadesBloqueadas = propiedades.length > limites.propiedades

  const metricas = {
    vistas_mes:1240, vistas_mes_anterior:980, consultas_mes:34,
    consultas_semana:8, propiedades_activas:activas, propiedades_pausadas:pausadas, tasa_respuesta:87
  }

  if (loading || planLoading) return (
    <div style={{padding:24,color:'rgba(0,0,0,0.4)',fontSize:14}}>Cargando tu dashboard...</div>
  )

  return (
    <div style={{maxWidth:1100}}>
      {/* Header con plan */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,marginBottom:4}}>{saludo}, {nombre}</h1>
          <p style={{fontSize:13,color:'rgba(0,0,0,0.4)'}}>Esto es lo que esta pasando con tus propiedades hoy.</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <PlanBadge plan={plan}/>
          {!esPro && (
            <a href="/precios" style={{fontSize:12,background:'var(--accent)',color:'white',padding:'6px 14px',borderRadius:999,textDecoration:'none',fontWeight:500}}>
              Mejorar plan →
            </a>
          )}
        </div>
      </div>

      {/* Banner upgrade si es gratis */}
      {!esPro && (
        <div style={{background:'var(--ink)',borderRadius:12,padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:'italic',color:'oklch(0.85 0.06 80)',flexShrink:0}}>V</div>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:'white',marginBottom:2}}>Valeria te recomienda</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>Con Plan Pro podes publicar hasta 15 propiedades, usar el CRM completo y recibir leads ilimitados.</div>
            </div>
          </div>
          <a href="/precios" style={{background:'var(--accent)',color:'white',padding:'10px 20px',borderRadius:999,fontSize:13,fontWeight:500,textDecoration:'none',whiteSpace:'nowrap'}}>
            Ver Plan Pro →
          </a>
        </div>
      )}

      <MetricasGrid metricas={metricas}/>

      {/* Propiedades */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600}}>Mis propiedades</h2>
          <p style={{fontSize:12,color:'var(--ink-3)',marginTop:2}}>
            {propiedades.length} de {limites.propiedades === 999 ? 'ilimitadas' : limites.propiedades} permitidas en tu plan
          </p>
        </div>
        {propiedades.length < limites.propiedades ? (
          <a href="/dashboard/nueva-propiedad" style={{fontSize:12,fontWeight:500,padding:'6px 16px',borderRadius:8,background:'var(--accent)',color:'white',textDecoration:'none'}}>+ Agregar propiedad</a>
        ) : (
          <a href="/precios" style={{fontSize:12,fontWeight:500,padding:'6px 16px',borderRadius:8,background:'var(--ink)',color:'white',textDecoration:'none'}}>Mejorar plan para agregar más →</a>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24}}>
        {propiedadesPermitidas.map(p => (
          <div key={p.id} style={{background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,overflow:'hidden'}}>
            <div style={{height:100,background:'linear-gradient(135deg,oklch(0.95 0.02 150),oklch(0.88 0.03 150))',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <span style={{fontSize:24,opacity:0.4}}>🏠</span>
              <span style={{position:'absolute',top:8,right:8,fontSize:10,padding:'2px 8px',borderRadius:999,background:p.estado==='activa'?'oklch(0.95 0.02 150)':'rgba(200,169,110,0.15)',color:p.estado==='activa'?'oklch(0.42 0.06 150)':'rgba(200,169,110,0.9)',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.05em'}}>{p.estado}</span>
            </div>
            <div style={{padding:'10px 12px'}}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,marginBottom:2}}>{p.titulo}</h3>
              <p style={{fontSize:11,color:'rgba(0,0,0,0.4)',marginBottom:8}}>{p.ubicacion}</p>
              <div style={{display:'flex',gap:12,fontSize:11,color:'rgba(0,0,0,0.5)'}}>
                <span><strong style={{fontWeight:500}}>{p.precio.toLocaleString()} USD</strong>{p.tipo==='alquiler'?'/mes':''}</span>
                <span>{p.vistas_mes} vistas</span>
                <span>{p.consultas_mes} consultas</span>
              </div>
            </div>
            <div style={{display:'flex',gap:8,padding:'8px 12px',borderTop:'1px solid rgba(0,0,0,0.05)'}}>
              <a href={'/propiedades/'+p.id} style={{fontSize:12,padding:'6px 12px',borderRadius:6,border:'1px solid rgba(0,0,0,0.1)',background:'white',fontWeight:500,textDecoration:'none',color:'oklch(0.20 0.005 80)'}}>Ver</a>
            </div>
          </div>
        ))}

        {/* Card propiedades bloqueadas */}
        {propiedadesBloqueadas && (
          <div style={{border:'1.5px dashed var(--rule)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:180,padding:20,textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:8}}>🔒</div>
            <div style={{fontSize:13,fontWeight:500,color:'var(--ink)',marginBottom:4}}>{propiedades.length - limites.propiedades} propiedades bloqueadas</div>
            <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:12,lineHeight:1.5}}>Mejorá tu plan para mostrarlas todas</div>
            <a href="/precios" style={{fontSize:12,background:'var(--accent)',color:'white',padding:'6px 16px',borderRadius:999,textDecoration:'none',fontWeight:500}}>Ver planes →</a>
          </div>
        )}

        {/* Card nueva propiedad */}
        {propiedades.length < limites.propiedades && (
          <a href="/dashboard/nueva-propiedad" style={{border:'1.5px dashed rgba(0,0,0,0.15)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:180,textDecoration:'none'}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'oklch(0.95 0.02 150)',display:'grid',placeItems:'center',marginBottom:8,fontSize:20,color:'oklch(0.42 0.06 150)'}}>+</div>
            <span style={{fontSize:13,fontWeight:500,color:'oklch(0.42 0.06 150)'}}>Publicar nueva propiedad</span>
          </a>
        )}
      </div>

      {/* CRM — solo Pro+ */}
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,marginBottom:12}}>CRM de leads</h2>
        {limites.crm ? (
          <a href="/dashboard/crm" style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'16px 20px',textDecoration:'none',color:'var(--ink)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>◎</span>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>Ver todos mis leads</div>
                <div style={{fontSize:12,color:'rgba(0,0,0,0.4)'}}>Gestioná tu pipeline completo</div>
              </div>
            </div>
            <span style={{fontSize:18,color:'var(--ink-3)'}}>→</span>
          </a>
        ) : (
          <BloqueadoPro feature="CRM de leads completo"/>
        )}
      </div>

      {/* Graficos y facturacion */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <GraficoVistas data={VISTAS_MOCK}/>
        <PanelFacturacion plan={null} facturas={[]}/>
      </div>

      {/* Academia — solo Pro+ */}
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,marginBottom:12}}>Academia NIDO</h2>
        {limites.academia ? (
          <a href="/academia" style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'white',border:'1px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'16px 20px',textDecoration:'none',color:'var(--ink)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>📚</span>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>Continuar mi formacion</div>
                <div style={{fontSize:12,color:'rgba(0,0,0,0.4)'}}>Cursos, certificaciones y estrategias</div>
              </div>
            </div>
            <span style={{fontSize:18,color:'var(--ink-3)'}}>→</span>
          </a>
        ) : (
          <BloqueadoPro feature="Academia NIDO completa"/>
        )}
      </div>

      <PanelActividad notificaciones={[]}/>
    </div>
  )
}
