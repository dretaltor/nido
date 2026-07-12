import { describe, it, expect, vi, beforeEach } from 'vitest'

// checkRateLimit lee/escribe la tabla rate_limits via @supabase/supabase-js --
// se mockea el modulo entero (createClient) para probar la logica de ventana
// deslizante sin pegarle a una base real. vi.mock() se hoistea por encima de
// todo el archivo, asi que las funciones mock tienen que declararse dentro de
// vi.hoisted() para no caer en un "Cannot access before initialization".
const { maybeSingle, insert, update, from } = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const insert = vi.fn(() => Promise.resolve({}))
  const update = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({})) }))
  const eqSelect = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq: eqSelect }))
  const from = vi.fn(() => ({ select, insert, update }))
  return { maybeSingle, insert, update, from }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from }),
}))

import { checkRateLimit, getClientIp } from '../lib/rateLimit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('primera solicitud para una clave nueva: permite e inserta contador en 1', async () => {
    maybeSingle.mockResolvedValue({ data: null })
    const permitido = await checkRateLimit('test:a', 5, 10)
    expect(permitido).toBe(true)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ clave: 'test:a', contador: 1 }))
  })

  it('dentro de la ventana y por debajo del limite: permite e incrementa', async () => {
    maybeSingle.mockResolvedValue({ data: { contador: 2, ventana_inicio: new Date().toISOString() } })
    const permitido = await checkRateLimit('test:b', 5, 10)
    expect(permitido).toBe(true)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ contador: 3 }))
  })

  it('dentro de la ventana y al limite: deniega sin incrementar', async () => {
    maybeSingle.mockResolvedValue({ data: { contador: 5, ventana_inicio: new Date().toISOString() } })
    const permitido = await checkRateLimit('test:c', 5, 10)
    expect(permitido).toBe(false)
    expect(update).not.toHaveBeenCalled()
  })

  it('ventana vencida: reinicia el contador en 1 y permite, aunque estuviera al limite', async () => {
    const hace20min = new Date(Date.now() - 20 * 60000).toISOString()
    maybeSingle.mockResolvedValue({ data: { contador: 5, ventana_inicio: hace20min } })
    const permitido = await checkRateLimit('test:d', 5, 10)
    expect(permitido).toBe(true)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ contador: 1 }))
  })

  it('si la consulta a la base falla, falla abierto (no bloquea al usuario legitimo)', async () => {
    maybeSingle.mockRejectedValue(new Error('conexion caida'))
    const permitido = await checkRateLimit('test:e', 5, 10)
    expect(permitido).toBe(true)
  })
})

describe('getClientIp', () => {
  it('toma la primera IP de x-forwarded-for', () => {
    const req = new Request('https://x.test', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('devuelve "unknown" si no hay header', () => {
    const req = new Request('https://x.test')
    expect(getClientIp(req)).toBe('unknown')
  })
})
