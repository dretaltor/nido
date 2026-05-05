content = """import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.nido-cr.com'
  const now = new Date().toISOString()
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: base+'/propiedades', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: base+'/comprador', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: base+'/alquiler', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: base+'/asesores', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: base+'/ideas', lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: base+'/precios', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: base+'/unirse', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: base+'/academia', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]
}
"""
with open('app/sitemap.ts', 'w') as f:
    f.write(content)
print('ok')
