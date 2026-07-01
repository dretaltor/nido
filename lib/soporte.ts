import { supabase } from './supabase'

export interface MensajeSoporte { role: 'user' | 'assistant'; content: string }

interface CrearTicketParams {
  usuario_email: string
  usuario_nombre?: string
  usuario_telefono?: string
  usuario_tipo: 'propietario' | 'asesor' | 'comprador'
  asunto: string
  mensajes: MensajeSoporte[]
}

// Crea un ticket de soporte con la transcripcion del chat, y notifica al equipo NIDO por email.
// Usado desde los distintos chats de Valeria (propietario, asesor, comprador) cuando el usuario
// pide hablar con una persona o la IA no puede resolver la consulta.
export async function crearTicketSoporte(params: CrearTicketParams): Promise<{ ok: boolean; ticketId?: string; error?: string }> {
  const { usuario_email, usuario_nombre, usuario_telefono, usuario_tipo, asunto, mensajes } = params

  // Generamos el id en el cliente en vez de usar `.select()` tras el insert: el rol `anon`
  // (compradores sin cuenta) solo tiene permiso de INSERT sobre soporte_tickets, no de SELECT,
  // y un INSERT ... RETURNING queda sujeto a las politicas de SELECT bajo RLS.
  const ticketId = crypto.randomUUID()

  const { error: ticketError } = await supabase
    .from('soporte_tickets')
    .insert({
      id: ticketId,
      usuario_email,
      usuario_nombre: usuario_nombre || null,
      usuario_telefono: usuario_telefono || null,
      usuario_tipo,
      canal: 'web',
      asunto,
      estado: 'abierto',
    })

  if (ticketError) {
    return { ok: false, error: ticketError.message }
  }

  if (mensajes.length > 0) {
    const filas = mensajes.map(m => ({
      ticket_id: ticketId,
      remitente: m.role === 'user' ? 'usuario' : 'valeria',
      contenido: m.content,
    }))
    await supabase.from('soporte_mensajes').insert(filas)
  }

  const resumen = mensajes.slice(-8).map(m => (m.role === 'user' ? 'Usuario: ' : 'Valeria: ') + m.content).join('\n\n')

  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'hola@nido-cr.com',
        tipo: 'nuevo_ticket_soporte',
        data: { usuario_nombre, usuario_email, usuario_telefono, usuario_tipo, asunto, resumen },
      }),
    })
  } catch {
    // El ticket ya quedo guardado en Supabase aunque falle el email de notificacion.
  }

  return { ok: true, ticketId }
}
