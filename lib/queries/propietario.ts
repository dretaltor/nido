import { createClient } from '@/lib/supabase/server'
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
}