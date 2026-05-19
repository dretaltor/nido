import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FUENTES = [
  {
    nombre: 'El Financiero',
    url: 'https://www.elfinancierocr.com',
    rss: 'https://www.elfinancierocr.com/arc/outboundfeeds/rss/?outputType=xml',
    categoria: 'Mercado',
  },
  {
    nombre: 'La República',
    url: 'https://www.larepublica.net',
    rss: 'https://www.larepublica.net/feed/',
    categoria: 'Inversión',
  },
  {
    nombre: 'CRHoy',
    url: 'https://www.crhoy.com',
    rss: 'https://www.crhoy.com/feed/',
    categoria: 'Mercado',
  },
  {
    nombre: 'La Nación',
    url: 'https://www.nacion.com',
    rss: 'https://www.nacion.com/arc/outboundfeeds/rss/?outputType=xml',
    categoria: 'Tendencias',
  },
  {
    nombre: 'Expansión LATAM',
    url: 'https://expansion.mx',
    rss: 'https://expansion.mx/rss',
    categoria: 'Inversión',
  },
]

const KEYWORDS = [
  'inmobiliaria', 'propiedad', 'vivienda', 'construcción', 'urbanismo',
  'inversión inmobiliaria', 'bienes raíces', 'hipoteca', 'crédito hipotecario',
  'terreno', 'condominio', 'apartamento', 'desarrollo residencial',
  'mercado inmobiliario', 'precio vivienda', 'arrendamiento', 'alquiler',
  'real estate', 'costa rica property', 'zona franca', 'plusvalía'
]

async function fetchRSS(url: string): Promise<any[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NIDO-Bot/1.0 (nido-cr.com)' },
      signal: AbortSignal.timeout(8000),
    })
    const xml = await res.text()
    
    // Parse items from RSS
    const items: any[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
    
    for (const match of itemMatches) {
      const item = match[1]
      const titulo = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                     item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const resumen = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ||
                      item.match(/<description>(.*?)<\/description>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || 
                   item.match(/<link\s+href="(.*?)"/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

      if (titulo && resumen) {
        items.push({ titulo: titulo.trim(), resumen: resumen.slice(0, 500), link, pubDate })
      }
    }
    return items.slice(0, 10)
  } catch {
    return []
  }
}

function isRelevant(titulo: string, resumen: string): boolean {
  const text = (titulo + ' ' + resumen).toLowerCase()
  return KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
}

async function redactarConValeria(titulo: string, resumen: string, fuente: string, categoria: string): Promise<{titulo: string, resumen: string, tag: string}> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Sos Valeria, la IA de NIDO — plataforma inmobiliaria premium de Costa Rica. 
Redactá un resumen periodístico breve de esta noticia para nuestro portal de noticias inmobiliarias.

Noticia original de ${fuente}:
Título: ${titulo}
Resumen: ${resumen}

Instrucciones:
- Título atractivo en español latinoamericano (máx 90 caracteres)
- Resumen informativo de 2-3 oraciones (máx 200 caracteres) enfocado en el impacto para compradores/vendedores en Costa Rica o LATAM
- Tag corto de 1-2 palabras para categorizar
- Tono profesional, neutro, informativo
- Si la noticia no es de CR, contextualizá brevemente el impacto regional

Respondé SOLO en JSON sin backticks:
{"titulo":"...","resumen":"...","tag":"..."}`
        }]
      })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return JSON.parse(text)
  } catch {
    return { titulo, resumen: resumen.slice(0, 200), tag: categoria }
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let agregadas = 0
  const errores: string[] = []

  for (const fuente of FUENTES) {
    try {
      const items = await fetchRSS(fuente.rss)
      const relevantes = items.filter(i => isRelevant(i.titulo, i.resumen))
      
      for (const item of relevantes.slice(0, 2)) {
        // Check if already exists
        const { data: existe } = await supabaseAdmin
          .from('noticias')
          .select('id')
          .eq('fuente_nombre', fuente.nombre)
          .ilike('titulo', `%${item.titulo.slice(0, 30)}%`)
          .maybeSingle()
        
        if (existe) continue

        // Redact with Valeria
        const redactado = await redactarConValeria(item.titulo, item.resumen, fuente.nombre, fuente.categoria)

        await supabaseAdmin.from('noticias').insert({
          titulo: redactado.titulo,
          resumen: redactado.resumen,
          categoria: fuente.categoria,
          fuente_nombre: fuente.nombre,
          fuente_url: fuente.url,
          fuente_rss: fuente.rss,
          redactado_por: 'Valeria IA · NIDO',
          tag: redactado.tag,
          fecha_publicacion: new Date().toISOString().split('T')[0],
          activa: true,
        })
        agregadas++
      }
    } catch (e: any) {
      errores.push(`${fuente.nombre}: ${e.message}`)
    }
  }

  return NextResponse.json({ ok: true, agregadas, errores })
}
