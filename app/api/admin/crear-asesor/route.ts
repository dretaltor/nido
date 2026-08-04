import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit'

// Usa service role — necesario para crear usuarios de auth directamente
// (supabase.auth.admin.createUser) desde el panel de admin.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generarPasswordTemporal(): string {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })

    const { data: esAdmin } = await supabaseAdmin.from('admins').select('correo').eq('correo', user.email).maybeSingle()
    if (!esAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const permitido = await checkRateLimit('crear-asesor:' + getClientIp(req), 20, 10)
    if (!permitido) return NextResponse.json({ error: 'Demasiadas solicitudes, esperá unos minutos' }, { status: 429 })

    const body = await req.json()
    const nombre = String(body?.nombre || '').trim()
    const correo = String(body?.correo || '').trim().toLowerCase()
    const telefono = body?.telefono ? String(body.telefono).trim() : null
    const plan = ['gratis', 'pro', 'enterprise'].includes(body?.plan) ? body.plan : 'gratis'
    const activarTrial = !!body?.activarTrial
    // Programa "asesor fundador" (lanzamiento cerrado): trial de 21 días en
    // vez de 7, y 20% de descuento permanente cuando pase a un plan pago.
    const esFundador = !!body?.esFundador

    if (!nombre) return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return NextResponse.json({ error: 'Correo inválido' }, { status: 400 })

    const { data: perfilExistente } = await supabaseAdmin.from('perfiles').select('id').eq('correo', correo).maybeSingle()
    if (perfilExistente) return NextResponse.json({ error: 'Ya existe un asesor con ese correo' }, { status: 409 })

    const tempPassword = generarPasswordTemporal()
    const { data: nuevoUsuario, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nombre, plan, creado_por_admin: true },
    })
    if (createError || !nuevoUsuario?.user) {
      return NextResponse.json({ error: 'Error creando la cuenta: ' + (createError?.message || 'desconocido') }, { status: 500 })
    }

    const { error: perfilError } = await supabaseAdmin.from('perfiles').insert({
      id: nuevoUsuario.user.id,
      nombre,
      correo,
      telefono,
      plan,
      valeria_onboarding_completo: false,
      created_at: new Date().toISOString(),
    })
    if (perfilError) {
      // Revertir la creación del usuario de auth para no dejar una cuenta huérfana
      await supabaseAdmin.auth.admin.deleteUser(nuevoUsuario.user.id)
      return NextResponse.json({ error: 'Error creando el perfil: ' + perfilError.message }, { status: 500 })
    }

    if (activarTrial) {
      const trialFin = new Date()
      trialFin.setDate(trialFin.getDate() + (esFundador ? 21 : 7))
      await supabaseAdmin.from('suscripciones').upsert({
        correo,
        plan: 'enterprise',
        activo: true,
        es_trial: true,
        trial_fin: trialFin.toISOString(),
        es_fundador: esFundador,
        descuento_pct: esFundador ? 20 : 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'correo' })
    } else {
      await supabaseAdmin.from('suscripciones').upsert({
        correo,
        plan,
        activo: false,
        es_trial: false,
        es_fundador: esFundador,
        descuento_pct: esFundador ? 20 : 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'correo' })
    }

    // Link de recuperación para que el asesor defina su propia contraseña —
    // evita transmitir la contraseña temporal en texto plano.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: correo,
    })

    return NextResponse.json({
      success: true,
      id: nuevoUsuario.user.id,
      linkClave: linkError ? null : linkData?.properties?.action_link,
    })
  } catch (err) {
    console.error('Crear asesor error:', err)
    return NextResponse.json({ error: 'Error inesperado creando el asesor' }, { status: 500 })
  }
}
