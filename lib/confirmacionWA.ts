// Clasifica una respuesta corta del asesor como confirmación o rechazo de un borrador
// pendiente en el mecanismo de aprobación de Valeria (ver app/api/whatsapp/route.ts).
// Separado en su propio módulo (sin dependencias de Supabase/Next) para poder testearlo
// aislado — de esto depende que el mecanismo no envíe (ni cancele) algo por error.

const AFIRMATIVOS = ['dale', 'si', 'confirmo', 'confirmar', 'envialo', 'enviala', 'hazlo', 'ok', 'okay', 'va', 'adelante', 'correcto', 'asi es', 'yes', 'send it', 'confirm']
const NEGATIVOS = ['no', 'cancelar', 'cancela', 'detente', 'para', 'stop', 'olvidalo', 'mejor no', 'todavia no', 'aun no']

export function clasificarConfirmacion(textoUsuario: string): 'si' | 'no' | null {
  const comando = textoUsuario
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (é -> e, í -> i, etc.)

  if (AFIRMATIVOS.includes(comando)) return 'si'
  if (NEGATIVOS.includes(comando)) return 'no'
  return null
}
