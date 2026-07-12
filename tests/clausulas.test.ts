import { describe, it, expect } from 'vitest'
import { clavesClausulas, numerarClausulas } from '../lib/clausulas'

describe('clavesClausulas', () => {
  it('venta con exclusividad: no incluye administracion, si incluye exclusividad/renovacion', () => {
    const claves = clavesClausulas('exclusividad', false)
    expect(claves).toEqual(['OBJETO', 'SERVICIOS', 'COMISION', 'EXCLUSIVIDAD', 'RENOVACION', 'OBLIGACIONES', 'DATOS', 'DISPUTAS', 'DESTINO'])
  })

  it('venta sin exclusividad ("push de venta"): sin exclusividad/renovacion', () => {
    const claves = clavesClausulas('no_exclusivo', false)
    expect(claves).toEqual(['OBJETO', 'SERVICIOS', 'COMISION', 'OBLIGACIONES', 'DATOS', 'DISPUTAS', 'DESTINO'])
  })

  it('alquiler sin administracion', () => {
    const claves = clavesClausulas('alquiler', false)
    expect(claves).toEqual(['OBJETO', 'SERVICIOS', 'COMISION', 'EXCLUSIVIDAD', 'RENOVACION', 'OBLIGACIONES', 'DATOS', 'DISPUTAS', 'DESTINO'])
  })

  it('alquiler con administracion: agrega ADMINISTRACION antes de exclusividad', () => {
    const claves = clavesClausulas('alquiler', true)
    expect(claves).toEqual(['OBJETO', 'SERVICIOS', 'COMISION', 'ADMINISTRACION', 'EXCLUSIVIDAD', 'RENOVACION', 'OBLIGACIONES', 'DATOS', 'DISPUTAS', 'DESTINO'])
  })

  it('incluyeAdministracion=true se ignora fuera de modo alquiler (no aplica a venta)', () => {
    const claves = clavesClausulas('exclusividad', true)
    expect(claves).not.toContain('ADMINISTRACION')
  })

  it('DESTINO siempre esta presente como ultima clausula, en todos los modos', () => {
    for (const tipo of ['exclusividad', 'no_exclusivo', 'alquiler'] as const) {
      for (const admin of [true, false]) {
        const claves = clavesClausulas(tipo, admin)
        expect(claves[claves.length - 1]).toBe('DESTINO')
      }
    }
  })
})

describe('numerarClausulas', () => {
  it('asigna ordinales en Title Case, en orden', () => {
    const n = numerarClausulas(['OBJETO', 'SERVICIOS', 'COMISION'])
    expect(n).toEqual({ OBJETO: 'Primera', SERVICIOS: 'Segunda', COMISION: 'Tercera' })
  })

  it('caso completo de alquiler con administracion: Destino queda en Décima', () => {
    const claves = clavesClausulas('alquiler', true)
    const n = numerarClausulas(claves)
    // OBJETO, SERVICIOS, COMISION, ADMINISTRACION, EXCLUSIVIDAD, RENOVACION,
    // OBLIGACIONES, DATOS, DISPUTAS, DESTINO -> 10 clausulas, Destino = Decima
    expect(n.DESTINO).toBe('Décima')
    expect(n.ADMINISTRACION).toBe('Cuarta')
    expect(n.EXCLUSIVIDAD).toBe('Quinta')
    expect(n.RENOVACION).toBe('Sexta')
  })

  it('caso venta sin exclusividad: Destino queda en Séptima (7 clausulas)', () => {
    const claves = clavesClausulas('no_exclusivo', false)
    const n = numerarClausulas(claves)
    expect(claves.length).toBe(7)
    expect(n.DESTINO).toBe('Sétima')
  })

  it('nunca deja una clave sin ordinal asignado', () => {
    for (const tipo of ['exclusividad', 'no_exclusivo', 'alquiler'] as const) {
      for (const admin of [true, false]) {
        const claves = clavesClausulas(tipo, admin)
        const n = numerarClausulas(claves)
        for (const clave of claves) {
          expect(n[clave]).toBeTruthy()
        }
      }
    }
  })
})
