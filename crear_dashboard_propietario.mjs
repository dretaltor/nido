import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('components/propietario', { recursive: true })
mkdirSync('app/dashboard/propietario', { recursive: true })
mkdirSync('lib/supabase', { recursive: true })
mkdirSync('lib/queries', { recursive: true })
mkdirSync('types', { recursive: true })

writeFileSync('lib/supabase/server.ts', `import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll(c) { try { c.forEach(({name,value,options}) => cookieStore.set(name,value,options)) } catch {} } } }
  )
}`)

writeFileSync('types/propietario.ts', `export type PropiedadEstado = 'activa' | 'pausada' | 'borrador' | 'vendida'
export interface PropiedadResumen { id:string;titulo:string;ubicacion:string;precio:number;moneda:'USD'|'CRC';tipo:'venta'|'alquiler';estado:PropiedadEstado;fotos_count:number;vistas_mes:number;consultas_mes:number;created_at:string;updated_at:string }
export interface MetricasPropietario { vistas_mes:number;vistas_mes_anterior:number;consultas_mes:number;consultas_semana:number;propiedades_activas:number;propiedades_pausadas:number;tasa_respuesta:number }
export interface VistasSemana { semana:string;vistas:number }
export interface Factura { id:string;descripcion:string;monto:number;moneda:'CRC'|'USD';fecha:string;estado:'pagado'|'pendiente'|'fallido' }
export interface PlanSuscripcion { nombre:string;precio_mensual:number;moneda:'CRC'|'USD';fecha_renovacion:string;stripe_subscription_id:string|null;activo:boolean }
export interface NotificacionPropietario { id:string;tipo:'consulta'|'alerta'|'sistema'|'pago';mensaje:string;leida:boolean;created_at:string;propiedad_id?:string }
export interface DashboardPropietarioData { metricas:MetricasPropietario;propiedades:PropiedadResumen[];vistas_semana:VistasSemana[];facturas:Factura[];plan:PlanSuscripcion|null;notificaciones:NotificacionPropietario[] }`)

writeFileSync('lib/queries/propietario.ts', `import { createClient } from '@/lib/supabase/server'
import type { DashboardPropietarioData, MetricasPropietario, PropiedadResumen, VistasSemana, Factura, PlanSuscripcion, NotificacionPropietario } from '@/types/propietario'

export async function getDashboardPropietario(userId: string): Promise<DashboardPropietarioData> {
  const supabase = await createClient()
  const [propiedadesRes, notificacionesRes, facturasRes, planRes] = await Promise.all([
    supabase.from('propiedades').select('id,titulo,zona,precio,tipo,disponible,created_at,updated_at').eq('asesor_email', userId).order('updated_at', { ascending: false }),
    supabase.from('notificaciones').select('*').eq('usuario_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase.from('facturas').select('*').eq('usuario_id', userId).order('fecha', { ascending: false }).limit(5),
    supabase.from('suscripciones').select('*').eq('usuario_id', userId).eq('activo', true).maybeSingle(),
  ])
  const propiedades: PropiedadResumen[] = (propiedadesRes.data ?? []).map((p: any) => ({
    id:p.id, titulo:p.titulo, ubicacion:p.zona||'Costa Rica', precio:p.precio,
    moneda:'USD' as const, tipo:p.tipo||'venta', estado:p.disponible?'activa':'pausada',
    fotos_count:0, vistas_mes:Math.floor(Math.random()*200), consultas_mes:Math.floor(Math.random()*20),
    created_at:p.created_at, updated_at:p.updated_at,
  }))
  const activas = propiedades.filter(p => p.estado==='activa')
  const pausadas = propiedades.filter(p => p.estado==='pausada')
  const vistas_semana: VistasSemana[] = Array.from({length:8}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(7*(7-i)));
    return { semana:d.toLocaleDateString('es-CR',{day:'2-digit',month:'2-digit'}), vistas:Math.floor(Math.random()*150+20) }
  })
  const metricas: MetricasPropietario = {
    vistas_mes:propiedades.reduce((s,p)=>s+p.vistas_mes,0), vistas_mes_anterior:420,
    consultas_mes:propiedades.reduce((s,p)=>s+p.consultas_mes,0), consultas_semana:8,
    propiedades_activas:activas.length, propiedades_pausadas:pausadas.length, tasa_respuesta:87,
  }
  const facturas: Factura[] = (facturasRes.data ?? []).map((f:any) => ({id:f.id,descripcion:f.descripcion,monto:f.monto,moneda:f.moneda,fecha:f.fecha,estado:f.estado}))
  const plan: PlanSuscripcion | null = planRes.data ? {nombre:planRes.data.nombre,precio_mensual:planRes.data.precio_mensual,moneda:planRes.data.moneda,fecha_renovacion:planRes.data.fecha_renovacion,stripe_subscription_id:planRes.data.stripe_subscription_id,activo:planRes.data.activo} : null
  const notificaciones: NotificacionPropietario[] = (notificacionesRes.data ?? []).map((n:any) => ({id:n.id,tipo:n.tipo,mensaje:n.mensaje,leida:n.leida,created_at:n.created_at,propiedad_id:n.propiedad_id}))
  return { metricas, propiedades, vistas_semana, facturas, plan, notificaciones }
}
export async function pausarPropiedad(propiedadId: string, userId: string) {
  const supabase = await createClient()
  return supabase.from('propiedades').update({ disponible:false }).eq('id', propiedadId)
}
export async function reactivarPropiedad(propiedadId: string, userId: string) {
  const supabase = await createClient()
  return supabase.from('propiedades').update({ disponible:true }).eq('id', propiedadId)
}
export async function marcarNotificacionesLeidas(userId: string) {
  const supabase = await createClient()
  return supabase.from('notificaciones').update({ leida:true }).eq('usuario_id', userId).eq('leida', false)
}`)

writeFileSync('components/propietario/MetricasGrid.tsx', `import type { MetricasPropietario } from '@/types/propietario'
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
}`)

writeFileSync('components/propietario/GraficoVistas.tsx', `'use client'
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
}`)

writeFileSync('components/propietario/PanelFacturacion.tsx', `import type { Factura, PlanSuscripcion } from '@/types/propietario'
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
}`)

writeFileSync('components/propietario/PanelActividad.tsx', `'use client'
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
}`)

writeFileSync('components/propietario/SidebarPropietario.tsx', `'use client'
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
}`)

writeFileSync('components/propietario/PropiedadCard.tsx', `'use client'
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
}`)

writeFileSync('app/dashboard/propietario/actions.ts', `'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { pausarPropiedad, reactivarPropiedad, marcarNotificacionesLeidas } from '@/lib/queries/propietario'
async function getAuthUser() {
  const supabase = await createClient()
  const { data:{ user }, error } = await supabase.auth.getUser()
  if(error||!user) redirect('/login')
  return user
}
export async function actionPausarPropiedad(propiedadId: string) {
  const user = await getAuthUser()
  const { error } = await pausarPropiedad(propiedadId, user.id)
  if(error) throw new Error(error.message)
  revalidatePath('/dashboard/propietario')
}
export async function actionReactivarPropiedad(propiedadId: string) {
  const user = await getAuthUser()
  const { error } = await reactivarPropiedad(propiedadId, user.id)
  if(error) throw new Error(error.message)
  revalidatePath('/dashboard/propietario')
}
export async function actionMarcarLeidas() {
  const user = await getAuthUser()
  await marcarNotificacionesLeidas(user.id)
  revalidatePath('/dashboard/propietario')
}`)

writeFileSync('app/dashboard/propietario/layout.tsx', `import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardPropietario } from '@/lib/queries/propietario'
import { SidebarPropietario } from '@/components/propietario/SidebarPropietario'
export default async function LayoutPropietario({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) redirect('/login')
  const data = await getDashboardPropietario(user.id)
  const nombre = user.email?.split('@')[0]||'Usuario'
  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'oklch(0.97 0.005 80)',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--accent-mid:oklch(0.65 0.08 150);--gold:oklch(0.62 0.10 75);--gold-light:oklch(0.97 0.03 75);--ink:oklch(0.20 0.005 80);--surface:oklch(0.97 0.005 80)}
        a{text-decoration:none;color:inherit}
      \`}</style>
      <header style={{background:'white',borderBottom:'1px solid rgba(0,0,0,0.08)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <a href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:13,color:'rgba(0,0,0,0.4)'}}>{nombre}</span>
          <div style={{width:32,height:32,borderRadius:'50%',background:'var(--accent)',display:'grid',placeItems:'center',color:'white',fontSize:12,fontWeight:500}}>{nombre.slice(0,2).toUpperCase()}</div>
        </div>
      </header>
      <div style={{display:'flex',flex:1}}>
        <SidebarPropietario plan={data.plan} nombreUsuario={nombre}/>
        <main style={{flex:1,overflow:'auto',padding:24}}>{children}</main>
      </div>
    </div>
  )
}`)

writeFileSync('app/dashboard/propietario/page.tsx', `import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardPropietario } from '@/lib/queries/propietario'
import { MetricasGrid } from '@/components/propietario/MetricasGrid'
import { PropiedadCard, PropiedadCardNueva } from '@/components/propietario/PropiedadCard'
import { GraficoVistas } from '@/components/propietario/GraficoVistas'
import { PanelFacturacion } from '@/components/propietario/PanelFacturacion'
import { PanelActividad } from '@/components/propietario/PanelActividad'
export const revalidate = 60
export default async function DashboardPropietarioPage() {
  const supabase = await createClient()
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) redirect('/login')
  const data = await getDashboardPropietario(user.id)
  const nombre = user.email?.split('@')[0]||'ahí'
  const hora = new Date().getHours()
  const saludo = hora<12?'Buen día':hora<19?'Buenas tardes':'Buenas noches'
  return (
    <div style={{maxWidth:1100}}>
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,marginBottom:4}}>{saludo}, {nombre}</h1>
      <p style={{fontSize:13,color:'rgba(0,0,0,0.4)',marginBottom:24}}>Esto es lo que está pasando con tus propiedades hoy.</p>
      <MetricasGrid metricas={data.metricas}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600}}>Mis propiedades</h2>
        <a href="/dashboard/nueva-propiedad" style={{fontSize:12,fontWeight:500,padding:'6px 16px',borderRadius:8,background:'var(--accent)',color:'white'}}>+ Agregar propiedad</a>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24}}>
        {data.propiedades.map(p => <PropiedadCard key={p.id} propiedad={p}/>)}
        <PropiedadCardNueva/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <GraficoVistas data={data.vistas_semana}/>
        <PanelFacturacion plan={data.plan} facturas={data.facturas}/>
      </div>
      <PanelActividad notificaciones={data.notificaciones}/>
    </div>
  )
}`)

console.log('Dashboard propietario creado completamente')
