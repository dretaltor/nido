import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Feed de productos para el Catalogo de WhatsApp (Meta Commerce Manager).
// Formato CSV segun especificacion de Meta: https://www.facebook.com/business/help/120325381656392
// Una vez conectado en Commerce Manager, este feed permite que Valeria y el negocio
// compartan fichas de propiedades como "productos" nativos de WhatsApp (con imagen,
// precio y boton de "ver detalle") en vez de solo texto/imagen suelta.
// Ver docs/catalogo-whatsapp.md para los pasos manuales de configuracion en Meta.
function csvEscape(valor: string): string {
  const v = (valor || '').replace(/"/g, '""')
  return `"${v}"`
}

export async function GET() {
  const { data: propiedades, error } = await supabaseAdmin
    .from('propiedades')
    .select('id, titulo, descripcion, precio, tipo, operacion, zona, imagen_url, fotos, disponible, verificacion_estado, ref_id')
    .eq('disponible', true)
    .eq('verificacion_estado', 'aprobada')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const filas = (propiedades || [])
    // imagen_url es una columna legacy que el wizard de publicacion ya no llena —
    // las fotos reales viven en `fotos` (jsonb, array de URLs). Usamos imagen_url
    // si existe (datos viejos) y si no, la primera foto de `fotos`.
    .map(p => ({ ...p, foto: p.imagen_url || (Array.isArray(p.fotos) ? p.fotos[0] : null) as string | null }))
    .filter(p => p.foto) // Meta exige image_link valido en cada fila
    .map(p => {
      const descripcionCorta = (p.descripcion || `${p.titulo} en ${p.zona}`).replace(/\s+/g, ' ').slice(0, 5000)
      const link = `https://www.nido-cr.com/propiedades/${p.id}`
      const precio = `${Number(p.precio || 0).toFixed(2)} USD`
      return [
        csvEscape(p.ref_id || p.id),
        csvEscape(`${p.titulo} — ${p.zona}`),
        csvEscape(descripcionCorta),
        csvEscape('in stock'),
        csvEscape('new'),
        csvEscape(precio),
        csvEscape(link),
        csvEscape(p.foto || ''),
        csvEscape('NIDO'),
      ].join(',')
    })

  const encabezado = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'].join(',')
  const csv = [encabezado, ...filas].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
