import { supabase } from './supabase'

// Convierte un nombre en un slug URL-friendly: minusculas, sin acentos, solo
// letras/numeros separados por guiones. Ej: "María Rodríguez" -> "maria-rodriguez"
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (marcas diacriticas tras normalizar NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// Genera un slug unico para el perfil publico de un asesor, agregando un
// sufijo numerico si el slug base ya esta en uso por otro asesor.
export async function generarSlugUnico(nombre: string, propioId: string): Promise<string> {
  const base = slugify(nombre) || 'asesor'
  let candidato = base
  let intento = 1
  while (intento < 50) {
    const { data } = await supabase.from('perfiles').select('id').eq('slug', candidato).maybeSingle()
    if (!data || data.id === propioId) return candidato
    intento++
    candidato = base + '-' + intento
  }
  return base + '-' + Date.now()
}
