import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/api/', '/admin/'] },
    ],
    sitemap: 'https://www.nido-cr.com/sitemap.xml',
    host: 'https://www.nido-cr.com',
  }
}
