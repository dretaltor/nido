// Numeracion dinamica de clausulas para el contrato de corretaje (venta o
// alquiler). Se comparte entre el contrato en pantalla
// (app/dashboard/propietario/contrato/page.tsx) y el PDF descargable con firma
// GAUDI (app/api/contrato-pdf/route.ts) porque ambos deben mostrar exactamente
// las mismas clausulas, en el mismo orden, con el mismo numero de clausula --
// un desfase aca significaria que el documento que la persona firma no es el
// mismo que vio en pantalla antes de firmar (ya paso una vez: el PDF no incluia
// la clausula de Destino de la Publicacion que si aparecia en pantalla).

export type TipoContrato = 'exclusividad' | 'no_exclusivo' | 'alquiler'

const ORDINALES = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Sétima', 'Octava', 'Novena', 'Décima', 'Undécima', 'Duodécima']

/**
 * Lista ordenada de claves de clausula activas segun el tipo de contrato y si
 * incluye administracion (solo aplica a alquiler). El orden de este arreglo ES
 * el orden en que las clausulas aparecen en el documento.
 */
export function clavesClausulas(tipoContrato: TipoContrato, incluyeAdministracion: boolean): string[] {
  const claves = ['OBJETO', 'SERVICIOS', 'COMISION']
  if (tipoContrato === 'alquiler' && incluyeAdministracion) claves.push('ADMINISTRACION')
  if (tipoContrato !== 'no_exclusivo') claves.push('EXCLUSIVIDAD', 'RENOVACION')
  claves.push('OBLIGACIONES', 'DATOS', 'DISPUTAS', 'DESTINO')
  return claves
}

/**
 * Mapea cada clave de clausula activa a su ordinal en español, Title Case
 * (ej. "Cuarta"). Quien necesite mayusculas (ej. "CLÁUSULA CUARTA") debe hacer
 * .toUpperCase() sobre el valor.
 */
export function numerarClausulas(clavesActivas: string[]): Record<string, string> {
  const n: Record<string, string> = {}
  clavesActivas.forEach((clave, i) => {
    n[clave] = ORDINALES[i] || String(i + 1) + 'ª'
  })
  return n
}
