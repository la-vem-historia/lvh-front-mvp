// Utilitários de mídia no navegador. Fotos são reduzidas antes de salvar porque,
// sem backend, tudo cabe nos poucos MB do localStorage.

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

export async function resizeImage(file: File, maxSize = 1280, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')

  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', quality)
}

export const formatSeconds = (total: number) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
