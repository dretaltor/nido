import { defineConfig } from 'vitest/config'
import path from 'path'

// Solo cubre lib/ (logica de negocio pura) por ahora, no app/ (componentes React
// con dependencias de Supabase/Next runtime que necesitarian mocks mas elaborados
// para probarse de forma aislada). Ver tests/README.md para el criterio de que
// se prueba aca.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // lib/supabase.ts crea el cliente al importarse (createClient(url, key)) y
    // lanza si url/key faltan -- estos valores dummy alcanzan para que el modulo
    // cargue en tests que no hacen llamadas de red reales (o que mockean
    // @supabase/supabase-js directamente).
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
