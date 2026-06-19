const MAX_WIDTH = 2400
const MAX_SIZE_BYTES = 1.5 * 1024 * 1024 // 1.5 MB
const QUALITY = 0.82

export function compressImage(file) {
  // Solo comprimir imágenes; pasar otros tipos sin cambios
  if (!file.type.startsWith('image/')) return Promise.resolve(file)
  // Si ya es pequeña, no comprimir
  if (file.size <= MAX_SIZE_BYTES) return Promise.resolve(file)

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width)
        width = MAX_WIDTH
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
        'image/jpeg',
        QUALITY,
      )
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}
