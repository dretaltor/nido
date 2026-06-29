/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.40.202'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Previene clickjacking — nadie puede embeber NIDO en un iframe para phishing
          { key: 'X-Frame-Options', value: 'DENY' },
          // Previene MIME sniffing — archivos subidos no se ejecutan como codigo
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Evita filtrar la URL de la pagina actual a sitios externos via Referer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restringe APIs de browser que la app no necesita
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          // Fuerza HTTPS — ningun elemento de la pagina puede cargarse por HTTP
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // XSS Protection basico para browsers viejos
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        // Para las rutas de API, agregar CORS restrictivo
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
