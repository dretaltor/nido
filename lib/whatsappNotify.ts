import { SupabaseClient } from '@supabase/supabase-js'
import { sendWhatsApp } from './whatsapp'

// Notificaciones por WhatsApp — beneficio exclusivo del plan Black (enterprise).
// Si el destinatario no es Black o no tiene telefono registrado, no se envia nada
// (silencioso: el resto de los planes sigue recibiendo solo email/dashboard como antes).

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

export async function notificarAsesorBlack(
  supabaseAdmin: SupabaseClient,
  correo: string,
  tipo: TipoNotificacionWA,
  data: DatosNotificacion = {}
): Promise<{ sent: boolean }> {
  if (!correo || !mensajes[tipo]) return { sent: false }

  const { data: perfil } = await supabaseAdmin.from('perfiles').select('plan, telefono').eq('correo', correo).maybeSingle()
  if (!perfil || perfil.plan !== 'enterprise' || !perfil.telefono) return { sent: false }

  const ok = await sendWhatsApp(perfil.telefono, mensajes[tipo](data))
  return { sent: ok }
}
