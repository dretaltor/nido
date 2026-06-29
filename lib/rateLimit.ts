import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Limite simple por ventana de tiempo, respaldado en una tabla de Supabase.
 * Devuelve true si la solicitud esta permitida, false si se excedio el limite.
 *
 * @param key identificador unico (ej: 'email:' + ip, 'chat:' + email)
 * @param maxRequests cantidad maxima permitida dentro de la ventana
 * @param windowMinutes duracion de la ventana en minutos
 */
export async function checkRateLimit(key: string, maxRequests: number, windowMinutes: number): Promise<boolean> {
  try {
    const { data: existing } = await supabaseAdmin.from('rate_limits').select('contador,ventana_inicio').eq('clave', key).maybeSingle()

    const ahora = new Date()

    if (!existing) {
      await supabaseAdmin.from('rate_limits').insert({ clave: key, contador: 1, ventana_inicio: ahora.toISOString() })
      return true
    }

    const ventanaInicio = new Date(existing.ventana_inicio)
    const minutosTranscurridos = (ahora.getTime() - ventanaInicio.getTime()) / 60000

    if (minutosTranscurridos > windowMinutes) {
      // Ventana vencida, reiniciar contador
      await supabaseAdmin.from('rate_limits').update({ contador: 1, ventana_inicio: ahora.toISOString() }).eq('clave', key)
      return true
    }

    if (existing.contador >= maxRequests) {
      return false // Limite excedido
    }

    await supabaseAdmin.from('rate_limits').update({ contador: existing.contador + 1 }).eq('clave', key)
    return true
  } catch (err) {
    console.error('Rate limit check error:', err)
    return true // Si falla el chequeo, no bloqueamos la solicitud legitima
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}
