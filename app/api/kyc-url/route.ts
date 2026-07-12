import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '../../../lib/rateLimit'

// Usa service role — bypassa RLS para storage
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Verificar sesion real — nunca confiar en un userId que manda el cliente sin validar
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 })
    }

    const permitido = await checkRateLimit('kyc-url:' + user.id, 30, 10)
    if (!permitido) {
      return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
    }

    const { path } = await req.json()
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Falta path' }, { status: 400 })
    }

    // Autorizacion: dueño del documento (asesor o propietario, por su propio user.id
    // real de la sesion) o un admin. Nunca se confia en nada del body para esto.
    const esDuenoAsesor = path.startsWith(`kyc/${user.id}_`) || path.startsWith(`contratos/${user.id}_`)
    const esDuenoPropietario = path.startsWith(`kyc-propietarios/${user.id}_`)
    let autorizado = esDuenoAsesor || esDuenoPropietario

    if (!autorizado) {
      const { data: esAdmin } = await supabaseAdmin.from('admins').select('correo').eq('correo', user.email).maybeSingle()
      autorizado = !!esAdmin
    }

    if (!autorizado) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin.storage.from('kyc-privado').createSignedUrl(path, 300)
    if (error || !data) {
      console.error('Signed URL error:', error)
      return NextResponse.json({ error: 'Error al generar la URL' }, { status: 500 })
    }

    return NextResponse.json({ success: true, signedUrl: data.signedUrl })
  } catch (err) {
    console.error('Kyc url error:', err)
    return NextResponse.json({ error: 'Error al generar la URL' }, { status: 500 })
  }
}
