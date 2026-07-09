import { createClient } from '@supabase/supabase-js'

const PHONE_ID = process.env.WHATSAPP_PHONE_ID || '1156099824249418'
const WA_TOKEN = process.env.WHATSAPP_TOKEN

// Cliente propio (no depende de que quien llame ya tenga uno a mano) — solo se usa
// para consultar/gestionar la lista de opt-out de mensajes proactivos de WhatsApp.
function supabaseInterno() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function normalizarTelefono(to: string): string {
  const phone = to.replace(/[^0-9]/g, '')
  return phone.startsWith('506') ? phone : '506' + phone
}

// Consentimiento: cualquier mensaje que NIDO inicia (recordatorios, notificaciones Black,
// briefing diario) es "proactivo" y debe respetar el opt-out. Los mensajes reactivos
// (respuesta directa de Valeria cuando el usuario le escribe) NO pasan por esta funcion —
// esos usan su propio envio en app/api/whatsapp/route.ts y siempre se permiten.
export async function estaEnOptOut(telefono: string): Promise<boolean> {
  try {
    const { data } = await supabaseInterno()
      .from('whatsapp_optout')
      .select('id')
      .eq('telefono', normalizarTelefono(telefono))
      .is('reactivado_at', null)
      .maybeSingle()
    return !!data
  } catch {
    return false // si falla la consulta, no bloqueamos el envio por un error tecnico
  }
}

export async function registrarOptOut(telefono: string, motivo?: string): Promise<void> {
  const tel = normalizarTelefono(telefono)
  await supabaseInterno().from('whatsapp_optout').upsert(
    { telefono: tel, motivo: motivo || 'Solicitado por el usuario via WhatsApp', reactivado_at: null, created_at: new Date().toISOString() },
    { onConflict: 'telefono' }
  )
}

export async function quitarOptOut(telefono: string): Promise<void> {
  const tel = normalizarTelefono(telefono)
  await supabaseInterno().from('whatsapp_optout').update({ reactivado_at: new Date().toISOString() }).eq('telefono', tel)
}

async function postWhatsApp(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string; errorCode?: number }> {
  if (!WA_TOKEN) { console.error('WHATSAPP_TOKEN no configurado en Vercel'); return { ok: false, error: 'WHATSAPP_TOKEN no configurado' } }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WA_TOKEN}` },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const errBody = await res.text()
      let errorCode: number | undefined
      try { errorCode = JSON.parse(errBody)?.error?.code } catch {}
      console.error('WhatsApp send error:', res.status, errBody)
      return { ok: false, error: errBody.slice(0, 500), errorCode }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('WhatsApp send exception:', msg)
    return { ok: false, error: msg }
  }
}

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  if (await estaEnOptOut(to)) return false
  const r = await postWhatsApp({ messaging_product: 'whatsapp', to: normalizarTelefono(to), type: 'text', text: { body: message } })
  return r.ok
}

// Codigos de error de Meta cuando se intenta mandar texto libre fuera de la ventana
// de 24h desde el ultimo mensaje del usuario ("re-engagement message").
const CODIGOS_FUERA_DE_VENTANA = [131047, 131026]

// Envio "inteligente": intenta primero texto libre (gratis, funciona si el usuario le
// escribio a Valeria en las ultimas 24h). Si Meta lo rechaza por estar fuera de esa
// ventana, reintenta con una plantilla pre-aprobada (unica forma de que un mensaje
// iniciado por NIDO -no una respuesta- le llegue igual). Si la plantilla no existe
// todavia en Meta (pendiente de aprobacion), devuelve el error para poder loguearlo.
export async function sendWhatsAppSmart(
  to: string,
  mensajeLibre: string,
  nombrePlantilla: string,
  parametros: string[] = []
): Promise<{ ok: boolean; via: 'texto' | 'plantilla' | 'ninguno'; error?: string }> {
  const telefono = normalizarTelefono(to)
  if (await estaEnOptOut(telefono)) return { ok: false, via: 'ninguno', error: 'Usuario dado de baja de mensajes proactivos' }
  const resultadoTexto = await postWhatsApp({ messaging_product: 'whatsapp', to: telefono, type: 'text', text: { body: mensajeLibre } })
  if (resultadoTexto.ok) return { ok: true, via: 'texto' }

  if (resultadoTexto.errorCode && CODIGOS_FUERA_DE_VENTANA.includes(resultadoTexto.errorCode)) {
    const resultadoPlantilla = await postWhatsApp({
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'template',
      template: {
        name: nombrePlantilla,
        language: { code: 'es' },
        components: parametros.length > 0 ? [{ type: 'body', parameters: parametros.map(p => ({ type: 'text', text: p })) }] : [],
      },
    })
    return { ok: resultadoPlantilla.ok, via: 'plantilla', error: resultadoPlantilla.error }
  }

  return { ok: false, via: 'ninguno', error: resultadoTexto.error }
}
