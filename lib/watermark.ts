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

        // Marca de agua única, centrada, muy tenue — solo "NIDO".
        const label = 'NIDO'
        const fontSize = Math.round(canvas.width / 7)
        ctx.font = `700 ${fontSize}px Arial, sans-serif`
        ctx.fillStyle = 'rgba(255,255,255,0.14)'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText(label, canvas.width / 2, canvas.height / 2)

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
