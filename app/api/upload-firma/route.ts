import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as string // 'gaudi' | 'fisica' | 'perfil'

    if (!file) {
      return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const path = tipo === 'gaudi'
      ? `contratos/${userId}_gaudi_${Date.now()}.${ext}`
      : tipo === 'perfil'
      ? `perfiles/${userId}.${ext}`
      : `contratos/${userId}_firma.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('Propiedades')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('Propiedades')
      .getPublicUrl(path)

    return NextResponse.json({ success: true, publicUrl })
  } catch (err: any) {
    console.error('Upload firma error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
