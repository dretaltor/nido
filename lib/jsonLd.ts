// JSON.stringify no escapa "<", asi que un titulo/descripcion de propiedad (texto
// libre del asesor, aprobado por un admin que lee el texto pero no necesariamente
// revisa el HTML fuente) con algo como `</script><script>...` podia romper el tag
// <script type="application/ld+json"> e inyectar JS arbitrario en la pagina publica
// de la propiedad/zona (stored XSS). Escapar "<" a su secuencia unicode neutraliza
// esto sin alterar el JSON-LD resultante (los parsers de JSON-LD lo interpretan igual).
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
