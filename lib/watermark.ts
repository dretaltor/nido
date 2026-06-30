// Aplica una marca de agua semitransparente con el nombre de NIDO sobre una imagen
// antes de subirla al storage. Corre 100% en el navegador (canvas), sin dependencias
// de servidor. Protege las fotos contra el uso no autorizado por terceros (mismo
// problema que resuelve Global Reals con su watermark automático).

export function addWatermark(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(url); resolve(file); return }

        ctx.drawImage(img, 0, 0)

        // Marca de agua diagonal repetida, tenue, para no afectar la lectura de la foto.
        const label = 'NIDO · nido-cr.com'
        const fontSize = Math.max(16, Math.round(canvas.width / 28))
        ctx.font = `600 ${fontSize}px Arial, sans-serif`
        ctx.fillStyle = 'rgba(255,255,255,0.38)'
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'
        ctx.lineWidth = 1
        ctx.textBaseline = 'middle'

        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-Math.PI / 8)

        const textWidth = ctx.measureText(label).width
        const stepX = textWidth + fontSize * 3
        const stepY = fontSize * 5
        const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)

        for (let y = -diag; y < diag; y += stepY) {
          for (let x = -diag; x < diag; x += stepX) {
            ctx.strokeText(label, x, y)
            ctx.fillText(label, x, y)
          }
        }
        ctx.restore()

        // Marca legible en la esquina inferior (más sólida, identifica la fuente claramente).
        const cornerText = 'NIDO.CR'
        const cornerSize = Math.max(14, Math.round(canvas.width / 32))
        ctx.font = `700 ${cornerSize}px Arial, sans-serif`
        ctx.textBaseline = 'bottom'
        ctx.textAlign = 'right'
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(canvas.width - cornerSize * 6.5, canvas.height - cornerSize * 2, cornerSize * 6.5, cornerSize * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.fillText(cornerText, canvas.width - 12, canvas.height - 10)

        URL.revokeObjectURL(url)
        canvas.toBlob(
          (blob) => { blob ? resolve(blob) : resolve(file) },
          'image/jpeg',
          0.9
        )
      } catch (e) {
        URL.revokeObjectURL(url)
        resolve(file) // si algo falla, subimos la foto original en vez de bloquear al usuario
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}
