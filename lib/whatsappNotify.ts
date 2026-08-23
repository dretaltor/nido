import { SupabaseClient } from '@supabase/supabase-js'
import { sendWhatsAppSmart } from './whatsapp'

// Notificaciones por WhatsApp — beneficio exclusivo del plan Black (enterprise).
// Si el destinatario no es Black o no tiene telefono registrado, no se envia nada
// (silencioso: el resto de los planes sigue recibiendo solo email/dashboard como antes).
//
// Cada tipo tiene un mensaje de texto libre (funciona si el asesor le escribio a Valeria
// en las ultimas 24h) y una plantilla equivalente como respaldo (funciona siempre, pero
// necesita existir y estar aprobada en Meta Business Manager -> WhatsApp Manager -> Plantillas).
// Ver docs/plantillas-whatsapp.md para el texto exacto a registrar en Meta.

export type TipoNotificacionWA = 'nuevo_lead' | 'kyc_aprobado' | 'kyc_rechazado' | 'nueva_comision' | 'ticket_respondido' | 'lead_sin_seguimiento' | 'escalamiento_confirmado' | 'tarea_vencida' | 'match_propiedad'

interface DatosNotificacion {
  nombre?: string
  telefono?: string
  email?: string
  zona_interes?: string
  mensaje?: string
  notas?: string
  propiedad_titulo?: string
  monto?: number
  estado?: string
  dias?: number
  cantidad?: number
}

const mensajes: Record<TipoNotificacionWA, (d: DatosNotificacion) => string> = {
  nuevo_lead: (d) => `🔔 *Nuevo lead — NIDO Black*\n\n👤 ${d.nombre || 'Sin nombre'}\n📞 ${d.telefono || 'No indicado'}${d.email ? '\n📧 ' + d.email : ''}${d.zona_interes ? '\n📍 ' + d.zona_interes : ''}${d.mensaje ? '\n💬 "' + d.mensaje.slice(0, 300) + '"' : ''}\n\nEs un lead premium — respondele cuanto antes.`,
  kyc_aprobado: () => `✅ *KYC aprobado*\n\nTu verificación de identidad en NIDO fue aprobada. Ya podés publicar propiedades sin restricciones. 🏠`,
  kyc_rechazado: (d) => `⚠️ *KYC rechazado*\n\n${d.notas ? 'Motivo: ' + d.notas : 'Revisá tu correo para más detalles.'}\n\nPodés volver a subir tus documentos desde tu perfil en NIDO.`,
  nueva_comision: (d) => `💰 *Comisión registrada*\n\n${d.propiedad_titulo || 'Propiedad'}\n💵 $${Number(d.monto || 0).toLocaleString()}\nEstado: ${d.estado || 'proyectada'}`,
  ticket_respondido: (d) => `💬 *Respuesta de NIDO a tu ticket*\n\n"${(d.mensaje || '').slice(0, 300)}"\n\nRevisá la conversación completa en nido-cr.com/soporte`,
  lead_sin_seguimiento: (d) => `⏰ *Lead sin contactar hace ${d.dias || 2} días*\n\n👤 ${d.nombre || 'Sin nombre'}${d.zona_interes ? '\n📍 ' + d.zona_interes : ''}\n\nDale seguimiento antes de que se enfríe — escribile o llamalo hoy.`,
  escalamiento_confirmado: () => `🆘 *Ticket urgente creado*\n\nEl equipo NIDO ya recibió tu consulta con prioridad alta y te va a responder pronto — por acá o por correo.`,
  tarea_vencida: (d) => `⏰ *Tarea vence hoy — NIDO*\n\n${d.nombre || 'Sin título'}${d.notas ? '\n' + d.notas.slice(0, 200) : ''}\n\nRevisala en tu dashboard antes de que se te pase.`,
  match_propiedad: (d) => `🎯 *Valeria encontró coincidencias*\n\nPara tu lead *${d.nombre || 'sin nombre'}*${d.zona_interes ? ' (' + d.zona_interes + ')' : ''} hay ${d.cantidad || 1} propiedad${(d.cantidad || 1) === 1 ? '' : 'es'} nueva${(d.cantidad || 1) === 1 ? '' : 's'} en el catálogo de NIDO que podrían encajar con su presupuesto y zona.\n\nRevisalas en tu CRM y decidí si le avisás.`,
}

// nombre de la plantilla en Meta + funcion que arma los parametros {{1}}, {{2}}... en orden
const plantillas: Record<TipoNotificacionWA, { nombre: string; parametros: (d: DatosNotificacion) => string[] }> = {
  nuevo_lead: { nombre: 'nido_nuevo_lead', parametros: (d) => [d.nombre || 'Sin nombre', d.telefono || 'No indicado', d.zona_interes || 'Sin zona especificada'] },
  kyc_aprobado: { nombre: 'nido_kyc_aprobado', parametros: () => [] },
  kyc_rechazado: { nombre: 'nido_kyc_rechazado', parametros: (d) => [d.notas || 'Revisá tu correo para más detalles'] },
  nueva_comision: { nombre: 'nido_nueva_comision', parametros: (d) => [d.propiedad_titulo || 'Propiedad', String(Math.round(Number(d.monto || 0))), d.estado || 'proyectada'] },
  ticket_respondido: { nombre: 'nido_ticket_respondido', parametros: (d) => [(d.mensaje || '').slice(0, 200)] },
  lead_sin_seguimiento: { nombre: 'nido_lead_sin_seguimiento', parametros: (d) => [String(d.dias || 2), d.nombre || 'Sin nombre', d.zona_interes || 'Sin zona especificada'] },
  escalamiento_confirmado: { nombre: 'nido_escalamiento_confirmado', parametros: () => [] },
  tarea_vencida: { nombre: 'nido_tarea_vencida', parametros: (d) => [d.nombre || 'Sin título'] },
  match_propiedad: { nombre: 'nido_match_propiedad', parametros: (d) => [d.nombre || 'Sin nombre', String(d.cantidad || 1)] },
}

// Implementación compartida — `requierePlanBlack` distingue las notificaciones que son
// beneficio exclusivo de NIDO Black (mentor de mercado, leads premium) de las operativas
// (tareas vencidas, matches de inventario) que le sirven a cualquier asesor, tenga el plan
// que tenga, porque tareas/leads/CRM ya son parte de todos los planes.
async function enviarNotificacion(
  supabaseAdmin: SupabaseClient,
  correo: string,
  tipo: TipoNotificacionWA,
  data: DatosNotificacion,
  requierePlanBlack: boolean
): Promise<{ sent: boolean; via?: string }> {
  if (!correo || !mensajes[tipo]) return { sent: false }

  const { data: perfil } = await supabaseAdmin.from('perfiles').select('plan, telefono').eq('correo', correo).maybeSingle()
  if (!perfil || !perfil.telefono) return { sent: false }
  if (requierePlanBlack && perfil.plan !== 'enterprise') return { sent: false }

  const plantilla = plantillas[tipo]
  const r = await sendWhatsAppSmart(perfil.telefono, mensajes[tipo](data), plantilla.nombre, plantilla.parametros(data))
  return { sent: r.ok, via: r.via }
}

export async function notificarAsesorBlack(
  supabaseAdmin: SupabaseClient,
  correo: string,
  tipo: TipoNotificacionWA,
  data: DatosNotificacion = {}
): Promise<{ sent: boolean; via?: string }> {
  return enviarNotificacion(supabaseAdmin, correo, tipo, data, true)
}

// Notificaciones operativas disponibles para cualquier asesor (no exclusivas de Black) —
// tareas vencidas, matches de inventario, y cualquier otro aviso que dependa de una
// funcionalidad de CRM que ya está disponible en todos los planes.
export async function notificarAsesor(
  supabaseAdmin: SupabaseClient,
  correo: string,
  tipo: TipoNotificacionWA,
  data: DatosNotificacion = {}
): Promise<{ sent: boolean; via?: string }> {
  return enviarNotificacion(supabaseAdmin, correo, tipo, data, false)
}
