import { describe, it, expect } from 'vitest'
import { clasificarConfirmacion } from '../lib/confirmacionWA'

describe('clasificarConfirmacion', () => {
  it('reconoce confirmaciones cortas en español', () => {
    expect(clasificarConfirmacion('dale')).toBe('si')
    expect(clasificarConfirmacion('si')).toBe('si')
    expect(clasificarConfirmacion('confirmo')).toBe('si')
    expect(clasificarConfirmacion('adelante')).toBe('si')
    expect(clasificarConfirmacion('ok')).toBe('si')
  })

  it('reconoce confirmaciones en inglés', () => {
    expect(clasificarConfirmacion('yes')).toBe('si')
    expect(clasificarConfirmacion('confirm')).toBe('si')
  })

  it('ignora mayúsculas, espacios y acentos', () => {
    expect(clasificarConfirmacion('  DALE  ')).toBe('si')
    expect(clasificarConfirmacion('Sí')).toBe('si')
    expect(clasificarConfirmacion('Así Es')).toBe('si')
  })

  it('reconoce rechazos', () => {
    expect(clasificarConfirmacion('no')).toBe('no')
    expect(clasificarConfirmacion('cancelar')).toBe('no')
    expect(clasificarConfirmacion('mejor no')).toBe('no')
    expect(clasificarConfirmacion('todavia no')).toBe('no')
    expect(clasificarConfirmacion('stop')).toBe('no')
  })

  it('devuelve null para mensajes que no son ni sí ni no', () => {
    expect(clasificarConfirmacion('hola, tengo una pregunta')).toBeNull()
    expect(clasificarConfirmacion('agendame otra visita para el jueves')).toBeNull()
    expect(clasificarConfirmacion('')).toBeNull()
    expect(clasificarConfirmacion('nope')).toBeNull() // no es un match exacto de la lista
  })

  it('no confunde una palabra suelta dentro de una frase más larga con una confirmación', () => {
    // "no se si puedo" contiene "no" y "si" pero no es un comando corto -- no debe matchear
    expect(clasificarConfirmacion('no se si puedo ir a esa hora')).toBeNull()
  })
})
