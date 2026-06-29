import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'
import { getPlanConfig } from '../../../lib/planes'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Servicio de IA no configurado' }, { status: 503 })
  }

  // Verificar sesion real — solo asesores logueados
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 })
  }

  // Verificar que el plan incluya Valeria IA
  const { data: sus } = await supabaseAdmin.from('suscripciones').select('plan,activo,es_trial,trial_fin').eq('correo', user.email).maybeSingle()
  const trialVencido = sus?.es_trial && sus?.trial_fin && new Date(sus.trial_fin) < new Date()
  const tienePlanPagoActivo = sus?.activo && !sus?.es_trial
  const planBloqueado = trialVencido && !tienePlanPagoActivo
  if (planBloqueado || !getPlanConfig(sus?.plan).valeriaIA) {
    return NextResponse.json({ error: 'Valeria IA requiere un plan Elite o Black' }, { status: 403 })
  }

  const permitido = await checkRateLimit('valeria-crm:' + user.email, 30, 10)
  if (!permitido) {
    return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
  }

  const { prompt } = await req.json()
  if (!prompt || prompt.length > 4000) {
    return NextResponse.json({ error: 'Prompt invalido' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await res.json()
    return NextResponse.json({ text: data.content?.[0]?.text || '' })
  } catch (err: any) {
    console.error('Valeria CRM error:', err)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
