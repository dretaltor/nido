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

export type TipoNotificacionWA = 'nuevo_lead' | 'kyc_aprobado' | 'kyc_rechazado' | 'nueva_comision' | 'ticket_respondido' | 'lead_sin_seguimiento' | 'escalamiento_confirmado'

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
}

const mensajes: Record<TipoNotificacionWA, (d: DatosNotificacion) => string> = {
  nuevo_lead: (d) => `🔔 *Nuevo lead — NIDO Black*\n\n👤 ${d.nombre || 'Sin nombre'}\n📞 ${d.telefono || 'No indicado'}${d.email ? '\n📧 ' + d.email : ''}${d.zona_interes ? '\n📍 ' + d.zona_interes : ''}${d.mensaje ? '\n💬 "' + d.mensaje.slice(0, 300) + '"' : ''}\n\nEs un lead premium — respondele cuanto antes.`,
  kyc_aprobado: () => `✅ *KYC aprobado*\n\nTu verificación de identidad en NIDO fue aprobada. Ya podés publicar propiedades sin restricciones. 🏠`,
  kyc_rechazado: (d) => `⚠️ *KYC rechazado*\n\n${d.notas ? 'Motivo: ' + d.notas : 'Revisá tu correo para más detalles.'}\n\nPodés volver a subir tus documentos desde tu perfil en NIDO.`,
  nueva_comision: (d) => `💰 *Comisión registrada*\n\n${d.propiedad_titulo || 'Propiedad'}\n💵 $${Number(d.monto || 0).toLocaleString()}\nEstado: ${d.estado || 'proyectada'}`,
  ticket_respondido: (d) => `💬 *Respuesta de NIDO a tu ticket*\n\n"${(d.mensaje || '').slice(0, 300)}"\n\nRevisá la conversación completa en nido-cr.com/soporte`,
  lead_sin_seguimiento: (d) => `⏰ *Lead sin contactar hace ${d.dias || 2} días*\n\n👤 ${d.nombre || 'Sin nombre'}${d.zona_interes ? '\n📍 ' + d.zona_interes : ''}\n\nDale seguimiento antes de que se enfríe — escribile o llamalo hoy.`,
  escalamiento_confirmado: () => `🆘 *Ticket urgente creado*\n\nEl equipo NIDO ya recibió tu consulta con prioridad alta y te va a responder pronto — por acá o por correo.`,
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
}

export async function notificarAsesorBlack(
  supabaseAdmin: SupabaseClient,
  correo: string,
  tipo: TipoNotificacionWA,
  data: DatosNotificacion = {}
): Promise<{ sent: boolean; via?: string }> {
  if (!correo || !mensajes[tipo]) return { sent: false }

  const { data: perfil } = await supabaseAdmin.from('perfiles').select('plan, telefono').eq('correo', correo).maybeSingle()
  if (!perfil || perfil.plan !== 'enterprise' || !perfil.telefono) return { sent: false }

  const plantilla = plantillas[tipo]
  const r = await sendWhatsAppSmart(perfil.telefono, mensajes[tipo](data), plantilla.nombre, plantilla.parametros(data))
  return { sent: r.ok, via: r.via }
}
