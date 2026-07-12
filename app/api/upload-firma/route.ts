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
    const userId = user.id // SIEMPRE el id real de la sesion, nunca el del body

    const permitido = await checkRateLimit('upload-firma:' + userId, 20, 10)
    if (!permitido) {
      return NextResponse.json({ error: 'Demasiadas solicitudes, espera unos minutos' }, { status: 429 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as string // 'gaudi' | 'fisica' | 'perfil' | 'perfil_propietario' | 'cedula_frente' | 'cedula_reverso' | 'selfie' | 'cedula_frente_prop' | 'cedula_reverso_prop' | 'selfie_prop'

    if (!file) {
      return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar 10MB' }, { status: 400 })
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usá JPG, PNG, WEBP o PDF.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const tiposKYC = ['cedula_frente', 'cedula_reverso', 'selfie']
    const tiposKYCPropietario = ['cedula_frente_prop', 'cedula_reverso_prop', 'selfie_prop']
    const esPrivado = tipo === 'gaudi' || tipo === 'fisica' || tiposKYC.includes(tipo) || tiposKYCPropietario.includes(tipo)
    const bucket = esPrivado ? 'kyc-privado' : 'Propiedades'
    const path = tipo === 'gaudi'
      ? `contratos/${userId}_gaudi_${Date.now()}.${ext}`
      : tipo === 'perfil'
      ? `perfiles/${userId}.${ext}`
      : tipo === 'perfil_propietario'
      ? `perfiles/${userId}_propietario.${ext}`
      : tiposKYC.includes(tipo)
      ? `kyc/${userId}_${tipo}.${ext}`
      : tiposKYCPropietario.includes(tipo)
      ? `kyc-propietarios/${userId}_${tipo.replace('_prop','')}.${ext}`
      : `contratos/${userId}_firma.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    if (esPrivado) {
      return NextResponse.json({ success: true, path })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('Propiedades')
      .getPublicUrl(path)

    return NextResponse.json({ success: true, publicUrl })
  } catch (err) {
    console.error('Upload firma error:', err)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}
