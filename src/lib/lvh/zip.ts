// O livro inteiro numa pasta: uma página que abre sem internet, as fotos e os áudios com o mesmo
// código impresso no livro (P047-F1, P047-A) e todas as respostas em texto puro

import { bookTitle, mediaCode } from './livros'
import type { Book, UserBook } from './types'

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav'
}

const extensionOf = (mime: string) => {
  const base = mime.split(';')[0].trim()

  return extensions[base] ?? base.split('/')[1] ?? 'bin'
}

// Fotos e áudios ainda são data URLs (sem backend); fetch lê os dois tipos, data URL ou endereço
const download = async (url: string) => {
  const blob = await (await fetch(url)).blob()

  return { bytes: new Uint8Array(await blob.arrayBuffer()), extension: extensionOf(blob.type) }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}|\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('\n')

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type Media = { path: string; code: string }

export async function buildBookZip(book: Book, info: UserBook): Promise<{ blob: Blob; filename: string }> {
  const { zipSync, strToU8 } = await import('fflate')
  const title = `Livro ${bookTitle(info).replace(/^Para/, 'para')}`
  const files: Record<string, Uint8Array> = {}
  const photos: Record<string, Media[]> = {}
  const audios: Record<number, Media> = {}

  for (const chapter of book.chapters) {
    for (const { question, answer } of chapter.entries) {
      if (!answer) continue

      photos[question.id] = []

      for (const [index, src] of answer.photos.entries()) {
        const code = mediaCode(question.id, 'foto', index)
        const { bytes, extension } = await download(src)
        const path = `fotos/${code}.${extension}`

        files[path] = bytes
        photos[question.id].push({ path, code })
      }

      if (answer.audio) {
        const code = mediaCode(question.id, 'audio')
        const { bytes, extension } = await download(answer.audio.url)
        const path = `audios/${code}.${extension}`

        files[path] = bytes
        audios[question.id] = { path, code }
      }
    }
  }

  // Texto puro: dura mais que qualquer formato e abre em qualquer aparelho
  const text = [
    title.toUpperCase(),
    `Escrito por ${book.author}, ${book.year}`,
    book.dedication ? `\n${book.dedication}` : '',
    ...book.chapters.flatMap(chapter => [
      `\n\n${chapter.number}. ${chapter.title.toUpperCase()}`,
      ...chapter.entries.flatMap(({ question, answer, contributions }) => [
        `\n${question.text}`,
        answer?.text.trim() ?? '',
        ...(photos[question.id] ?? []).map(media => {
          const caption = answer?.photoCaptions?.[Number(media.code.split('-F')[1]) - 1]?.trim()

          return `[Foto ${media.code}${caption ? `: ${caption}` : ''}]`
        }),
        audios[question.id] ? `[Áudio ${audios[question.id].code}]` : '',
        ...contributions.map(item => `\nComo ${item.name} lembra:\n${item.text}`)
      ])
    ])
  ]
    .filter(line => line !== '')
    .join('\n')

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; background: #f6f1e7; color: #2a231c; font: 18px/1.65 Georgia, 'Times New Roman', serif; }
  main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.25rem 6rem; }
  h1 { font-size: 2.4rem; line-height: 1.15; margin: 0 0 .5rem; }
  .author { color: #8a7f72; margin: 0 0 3rem; }
  .dedication { font-style: italic; margin: 0 0 4rem; white-space: pre-line; }
  h2 { font-size: 1.6rem; margin: 4rem 0 1.5rem; padding-top: 2rem; border-top: 1px solid #d9cdb8; }
  h3 { font-size: 1.15rem; margin: 2.5rem 0 .5rem; }
  p { margin: 0 0 .9rem; }
  figure { margin: 1.5rem 0; }
  img { max-width: 100%; height: auto; border-radius: 4px; }
  figcaption, .code { color: #8a7f72; font: 13px/1.4 system-ui, sans-serif; margin-top: .4rem; }
  audio { width: 100%; margin-top: .5rem; }
  .voice { margin: 1.5rem 0; }
  .memory { margin: 1.5rem 0 0 1rem; padding-left: 1rem; border-left: 2px solid #d9cdb8; }
  .memory strong { display: block; font: 12px/1.4 system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a7f72; margin-bottom: .4rem; }
</style>
</head>
<body>
<main>
<h1>${escapeHtml(title)}</h1>
<p class="author">Escrito por ${escapeHtml(book.author)}, ${book.year}</p>
${book.dedication ? `<p class="dedication">${escapeHtml(book.dedication)}</p>` : ''}
${book.chapters
  .map(
    chapter => `<h2>${chapter.number}. ${escapeHtml(chapter.title)}</h2>
${chapter.entries
  .map(({ question, answer, contributions }) => {
    const figures = (photos[question.id] ?? [])
      .map((media, index) => {
        const caption = answer?.photoCaptions?.[index]?.trim()

        return `<figure><img src="${media.path}" alt="${escapeHtml(caption || question.text)}"><figcaption>${media.code}${caption ? ` · ${escapeHtml(caption)}` : ''}</figcaption></figure>`
      })
      .join('\n')
    const voice = audios[question.id]
      ? `<div class="voice"><audio controls preload="none" src="${audios[question.id].path}"></audio><div class="code">A voz de ${escapeHtml(book.author)} · ${audios[question.id].code}</div></div>`
      : ''
    const memories = contributions
      .map(
        item =>
          `<div class="memory"><strong>Como ${escapeHtml(item.name)} lembra</strong>${paragraphs(item.text)}</div>`
      )
      .join('\n')

    return `<h3>${escapeHtml(question.text)}</h3>\n${paragraphs(answer?.text ?? '')}\n${figures}\n${voice}\n${memories}`
  })
  .join('\n')}`
  )
  .join('\n')}
</main>
</body>
</html>
`

  const readme = `${title}

Como abrir
- "Abrir o livro.html": o livro inteiro, com fotos e vozes. Abre em qualquer navegador, sem internet.
- "respostas.txt": todas as perguntas e respostas em texto puro.

Os códigos
Cada foto e cada áudio tem um código, o mesmo que aparece impresso no livro:
- P047-F1 é a foto 1 da pergunta 47 (pasta "fotos").
- P047-A é a voz da pergunta 47 (pasta "audios").
Com o livro impresso na mão, procure o código ao lado do QR code ou embaixo da foto e abra o arquivo com o mesmo nome.

Para imprimir, use "Baixar PDF" na página do livro em lavemhistoria.com.br, ou imprima o "Abrir o livro.html" pelo navegador.
`

  const root = title
  const entries: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    [`${root}/Abrir o livro.html`]: strToU8(html),
    [`${root}/respostas.txt`]: strToU8(text),
    [`${root}/LEIA-ME.txt`]: strToU8(readme)
  }

  // Fotos e áudios já vêm comprimidos: guardar sem recomprimir deixa o ZIP rápido de gerar
  for (const [path, bytes] of Object.entries(files)) entries[`${root}/${path}`] = [bytes, { level: 0 }]

  const zipped = zipSync(entries, { level: 6, mtime: new Date() })

  return { blob: new Blob([zipped as BlobPart], { type: 'application/zip' }), filename: `${slug(title)}.zip` }
}
