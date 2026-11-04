// Fotos e áudios ficam na pasta de documentos do app. Guardamos só o caminho relativo
// (ex.: "audio/abc.m4a") porque no iOS o caminho absoluto da pasta muda a cada atualização
import * as Crypto from 'expo-crypto'
import { Directory, File, Paths } from 'expo-file-system'

export async function keepFile(uri: string, folder: 'audio' | 'fotos'): Promise<string> {
  const directory = new Directory(Paths.document, folder)

  if (!directory.exists) directory.create({ intermediates: true })

  const extension = uri.split('?')[0].split('.').pop() ?? 'bin'
  const name = `${Crypto.randomUUID()}.${extension}`

  await new File(uri).copy(new File(directory, name))

  return `${folder}/${name}`
}

export const fileUri = (path: string) =>
  /^(file|https?|data|content):/.test(path) ? path : new File(Paths.document, path).uri

export function deleteFile(path: string) {
  if (/^(https?|data):/.test(path)) return

  try {
    const file = new File(fileUri(path))

    if (file.exists) file.delete()
  } catch {}
}

export { formatSeconds } from '@lvh/media'

// Na exclusão da conta: apaga as pastas de fotos e áudios
export function deleteAllMedia() {
  for (const folder of ['audio', 'fotos']) {
    try {
      const directory = new Directory(Paths.document, folder)

      if (directory.exists) directory.delete()
    } catch {}
  }
}
