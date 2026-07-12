import { describe, it, expect, vi, beforeEach } from 'vitest'
import { slugify, generarSlugUnico } from '../lib/slug'

// generarSlugUnico consulta Supabase para chequear colisiones de slug -- se
// mockea el cliente en vez de pegarle a una base real. vi.mock se hoistea por
// encima de los imports, asi que lib/slug.ts (que importa '../lib/supabase')
// recibe este mock tambien, sin importar el orden en que se escriba aca.
const maybeSingle = vi.fn()
vi.mock('../lib/supabase', () => {
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return { supabase: { from } }
})

describe('slugify', () => {
  it('quita acentos y ñ, pasa a minusculas, separa por guiones', () => {
    expect(slugify('María José Rodríguez Ñúñez')).toBe('maria-jose-rodriguez-nunez')
  })

  it('colapsa espacios y caracteres no alfanumericos en un solo guion', () => {
    expect(slugify('  Juan   Pérez  ')).toBe('juan-perez')
    expect(slugify("O'Brien & Asociados S.A.")).toBe('o-brien-asociados-s-a')
  })

  it('quita guiones al inicio/final', () => {
    expect(slugify('-- Hola Mundo --')).toBe('hola-mundo')
  })

  it('trunca a 60 caracteres', () => {
    const nombreLargo = 'a'.repeat(100)
    expect(slugify(nombreLargo).length).toBeLessThanOrEqual(60)
  })

  it('string vacio o solo simbolos da string vacio (el caller decide el fallback)', () => {
    expect(slugify('')).toBe('')
    expect(slugify('!!!')).toBe('')
  })
})

describe('generarSlugUnico', () => {
  beforeEach(() => { maybeSingle.mockReset() })

  it('devuelve el slug base si no hay colision', async () => {
    maybeSingle.mockResolvedValue({ data: null })
    const slug = await generarSlugUnico('Ana Vargas', 'user-1')
    expect(slug).toBe('ana-vargas')
  })

  it('si el slug ya lo tiene el mismo usuario (propioId), lo reutiliza sin sufijo', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'user-1' } })
    const slug = await generarSlugUnico('Ana Vargas', 'user-1')
    expect(slug).toBe('ana-vargas')
  })

  it('si el slug lo tiene OTRO usuario, agrega sufijo numerico hasta encontrar uno libre', async () => {
    maybeSingle
      .mockResolvedValueOnce({ data: { id: 'otro-usuario' } }) // ana-vargas: ocupado
      .mockResolvedValueOnce({ data: { id: 'otro-usuario' } }) // ana-vargas-2: ocupado
      .mockResolvedValueOnce({ data: null }) // ana-vargas-3: libre
    const slug = await generarSlugUnico('Ana Vargas', 'user-1')
    expect(slug).toBe('ana-vargas-3')
  })

  it('nombre vacio cae al slug base "asesor"', async () => {
    maybeSingle.mockResolvedValue({ data: null })
    const slug = await generarSlugUnico('', 'user-1')
    expect(slug).toBe('asesor')
  })
})
