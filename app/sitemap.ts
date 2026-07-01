import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'
import { ZONAS } from '../lib/zonas'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.nido-cr.com'
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('propiedades')
    .select('zona')
    .eq('disponible', true)
    .eq('verificacion_estado', 'aprobada')
  const zonasConListado = new Set((data || []).map((p: any) => p.zona))

  const zonaUrls: MetadataRoute.Sitemap = ZONAS.map(z => ({
    url: `${base}/propiedades/zona/${z.slug}`,
    lastModified: now,
    changeFrequency: zonasConListado.has(z.nombre) ? 'daily' : 'weekly',
    priority: zonasConListado.has(z.nombre) ? 0.8 : 0.5,
  }))

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: base+'/propiedades', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: base+'/propiedades/zona', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: base+'/comprador', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: base+'/alquiler', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: base+'/asesores', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: base+'/ideas', lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: base+'/precios', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: base+'/unirse', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: base+'/academia', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...zonaUrls,
  ]
}
