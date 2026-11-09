// O livro em EPUB 3, para ler no Apple Livros, no Google Play Livros, no Kobo e no Kindle
// (o Kindle recebe EPUB pelo "Enviar para o Kindle"). Um capítulo por arquivo, sumário,
// dedicatória, fotos com legenda e, no lugar do áudio, um link para ouvir a voz.
// O texto não leva fonte embutida: cada leitor usa a sua, no tamanho que a pessoa escolher

import { coverColors } from '@/components/livro/book-cover'

import type { Book, UserBook } from './types'

const escapeXml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const paragraphs = (text: string) =>
  text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeXml(line)}</p>`)
    .join('\n')

// Nome do arquivo: "A minha história, de Moreno para Lara.epub". Alguns envios para o Kindle mostram o nome
// do arquivo no lugar do título, e quem escreve mais de um livro precisa de um nome diferente para cada um.
// Mantém acento e espaço; tira só o que algum sistema não aceita. Longo demais, corta pelo fim (o título fica)
const MAX_FILENAME = 100

const clean = (text: string) =>
  text
    .normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const epubFilename = (title: string, author: string, recipient: string) => {
  const parts = [clean(title) || 'Livro']
  const by = clean(author)
  const to = clean(recipient)

  if (by) parts.push(`, de ${by}`)
  if (to) parts.push(`${by ? '' : ','} para ${to}`)

  let name = parts.join('')

  if (name.length > MAX_FILENAME) name = name.slice(0, MAX_FILENAME).replace(/[\s,]+\S*$/, '')

  return `${name.replace(/^\.+|\.+$/g, '')}.epub`
}

// Lado maior das fotos: nítido numa tela de tablet, sem deixar o arquivo pesado
const PHOTO_MAX = 1600

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const canvasToJpeg = (canvas: HTMLCanvasElement, quality = 0.85) =>
  new Promise<Uint8Array>((resolve, reject) =>
    canvas.toBlob(
      blob => (blob ? blob.arrayBuffer().then(buffer => resolve(new Uint8Array(buffer))) : reject(new Error('jpeg'))),
      'image/jpeg',
      quality
    )
  )

// Toda foto vira JPEG: é o formato que todo leitor abre (WebP e HEIC não passam no Kindle)
async function photoToJpeg(src: string) {
  const image = await loadImage(src)
  const scale = Math.min(1, PHOTO_MAX / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')

  canvas.width = Math.round(image.naturalWidth * scale)
  canvas.height = Math.round(image.naturalHeight * scale)

  const context = canvas.getContext('2d')!

  // Fundo branco para PNG com transparência, que ficaria preto no JPEG
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return {
    bytes: await canvasToJpeg(canvas),
    width: canvas.width,
    height: canvas.height
  }
}

// Nome da fonte dos títulos do site (Fraunces), já carregada pela página
const headingFont = () => {
  const value = getComputedStyle(document.body).getPropertyValue('--font-fraunces').trim()

  return value ? `${value}, Georgia, serif` : 'Georgia, serif'
}

// A mesma capa do site, em imagem: tecido, douração, nome de quem escreve e o ano
async function drawCover(book: Book) {
  const width = 1600
  const height = Math.round((width * 622) / 440)
  const canvas = document.createElement('canvas')
  const { cloth, foil } = coverColors[book.coverColor]

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')!
  const cqw = width / 100
  const font = headingFont()

  await document.fonts.ready

  context.fillStyle = cloth
  context.fillRect(0, 0, width, height)

  // Luz suave de cima e a dobradiça da lombada, como na capa da tela
  const light = context.createRadialGradient(width * 0.7, 0, 0, width * 0.7, 0, height * 0.8)

  light.addColorStop(0, 'rgb(255 255 255 / 0.10)')
  light.addColorStop(1, 'rgb(255 255 255 / 0)')
  context.fillStyle = light
  context.fillRect(0, 0, width, height)

  const hinge = context.createLinearGradient(0, 0, 5 * cqw, 0)

  hinge.addColorStop(0, 'rgb(0 0 0 / 0.38)')
  hinge.addColorStop(0.55, 'rgb(255 255 255 / 0.07)')
  hinge.addColorStop(1, 'rgb(0 0 0 / 0.18)')
  context.fillStyle = hinge
  context.fillRect(0, 0, 5 * cqw, height)
  context.fillStyle = 'rgb(0 0 0 / 0.25)'
  context.fillRect(6 * cqw, 0, 2, height)

  const centerX = (15 * cqw + (width - 9 * cqw)) / 2
  const textWidth = width - 24 * cqw

  context.fillStyle = foil
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  const spaced = (text: string, size: number, y: number, tracking: number) => {
    context.font = `500 ${size}px system-ui, sans-serif`
    context.letterSpacing = `${size * tracking}px`
    context.fillText(text, centerX, y)
    context.letterSpacing = '0px'
  }

  spaced('LÁ VEM HISTÓRIA', 2.4 * cqw, 10.5 * cqw, 0.32)

  // Com foto, o nome fica menor e a foto entra acima dele, levemente inclinada, numa moldura de papel
  const photo = book.coverPhoto ? await loadImage(book.coverPhoto).catch(() => null) : null

  // Nome em até três linhas, diminuindo até caber
  let size = (photo ? 8 : 10.5) * cqw
  let lines: string[] = []

  for (; size > 5 * cqw; size -= 0.5 * cqw) {
    context.font = `${size}px ${font}`
    lines = []

    for (const word of book.title.split(/\s+/)) {
      const last = lines[lines.length - 1]

      if (last && context.measureText(`${last} ${word}`).width <= textWidth) lines[lines.length - 1] = `${last} ${word}`
      else lines.push(word)
    }

    if (lines.length <= 3 && lines.every(line => context.measureText(line).width <= textWidth)) break
  }

  // Foto, título, fio e o nome de quem escreveu formam um bloco centralizado entre a marca e o ano
  const lineHeight = size * 1.05
  const subtitleSize = 4.2 * cqw
  const nameBlock = lines.length * lineHeight + 3 * cqw + subtitleSize * 2.2
  const inner = 46 * cqw - 3.2 * cqw
  const innerHeight = (inner * 5) / 4
  const frameHeight = 1.6 * cqw + innerHeight + 5 * cqw
  const gap = 5 * cqw
  const blockTop = height / 2 - ((photo ? frameHeight + gap : 0) + nameBlock) / 2

  if (photo) {
    const frameWidth = 46 * cqw
    // object-cover: corta o que sobra para caber em 4 por 5
    const scale = Math.max(inner / photo.naturalWidth, innerHeight / photo.naturalHeight)
    const cropWidth = inner / scale
    const cropHeight = innerHeight / scale

    context.save()
    context.translate(centerX, blockTop + frameHeight / 2)
    context.rotate((-2 * Math.PI) / 180)
    context.shadowColor = 'rgb(0 0 0 / 0.35)'
    context.shadowBlur = 2 * cqw
    context.shadowOffsetY = 0.8 * cqw
    context.fillStyle = '#fbf7ee'
    context.fillRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
    context.shadowColor = 'transparent'
    context.drawImage(
      photo,
      (photo.naturalWidth - cropWidth) / 2,
      (photo.naturalHeight - cropHeight) / 2,
      cropWidth,
      cropHeight,
      -frameWidth / 2 + 1.6 * cqw,
      -frameHeight / 2 + 1.6 * cqw,
      inner,
      innerHeight
    )
    context.restore()
    context.fillStyle = foil
  }

  const nameTop = blockTop + (photo ? frameHeight + gap : 0)

  context.font = `${size}px ${font}`
  lines.forEach((line, index) => context.fillText(line, centerX, nameTop + lineHeight * (index + 0.5)))

  const ruleY = nameTop + lines.length * lineHeight + 3 * cqw

  context.globalAlpha = 0.6
  context.fillRect(centerX - 5 * cqw, ruleY, 10 * cqw, 2)
  context.globalAlpha = 1
  context.font = `italic ${subtitleSize}px ${font}`
  context.fillText(book.author, centerX, ruleY + subtitleSize * 1.4)

  spaced(String(book.year), 2.6 * cqw, height - 10.5 * cqw, 0.25)

  return canvasToJpeg(canvas, 0.9)
}

const page = (title: string, body: string, bodyClass = '') => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>${escapeXml(title)}</title>
<link rel="stylesheet" type="text/css" href="estilo.css"/>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${body}
</body>
</html>
`

// Pouco estilo de propósito: o leitor manda na fonte, no tamanho e no tema (claro, sépia, escuro).
// A pergunta se separa da resposta por negrito, tamanho e espaço, que sobrevivem a qualquer troca de fonte
const STYLE = `body { margin: 0 5%; line-height: 1.5; }
h1, h2, h3 { font-weight: normal; line-height: 1.2; page-break-after: avoid; break-after: avoid; }
h1 { font-size: 1.9em; margin: 2em 0 0.3em; text-align: center; }
h2 { font-size: 1.2em; font-weight: bold; line-height: 1.3; text-align: left; hyphens: none; -webkit-hyphens: none; margin: 2.6em 0 0.9em; }
.number { display: block; font-size: 0.75em; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.6em; opacity: 0.6; }
.chapter h1 { margin-bottom: 1.8em; }
p { margin: 0 0 0.8em; text-indent: 0; }
figure { margin: 1.4em 0; text-align: center; page-break-inside: avoid; break-inside: avoid; }
figure img { max-width: 100%; max-height: 90vh; }
figcaption { font-size: 0.85em; font-style: italic; margin-top: 0.4em; opacity: 0.75; }
.voice { margin: 1.2em 0; font-size: 0.9em; }
.memory { margin: 1.4em 0 1.4em 1em; padding-left: 1em; border-left: 1px solid; }
.memory .who { font-size: 0.75em; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.6; margin-bottom: 0.5em; }
.cover { margin: 0; padding: 0; text-align: center; }
.cover img { height: 100vh; max-width: 100%; }
.title-page { text-align: center; }
.title-page .by { margin-top: 1em; font-style: italic; }
.title-page .brand { margin-top: 4em; font-size: 0.75em; letter-spacing: 0.25em; text-transform: uppercase; opacity: 0.6; }
.dedication { margin-top: 30%; text-align: center; font-style: italic; }
.colophon { margin-top: 20%; text-align: center; font-size: 0.9em; }
nav ol { list-style: none; padding: 0; }
nav li { margin: 0.5em 0; }
`

export async function buildBookEpub(
  book: Book,
  info: UserBook,
  audioLinks: Record<number, string> = {}
): Promise<{ blob: Blob; filename: string }> {
  const { zipSync, strToU8 } = await import('fflate')
  const title = book.title
  const id = `urn:lavemhistoria:${info.id}`
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z')

  const files: Record<string, Uint8Array> = {}
  const manifest: string[] = []
  const spine: string[] = []
  const toc: { href: string; label: string }[] = []

  const addPage = (fileId: string, name: string, html: string, inSpine = true, properties = '') => {
    files[`OEBPS/${name}`] = strToU8(html)
    manifest.push(
      `<item id="${fileId}" href="${name}" media-type="application/xhtml+xml"${properties ? ` properties="${properties}"` : ''}/>`
    )
    if (inSpine) spine.push(`<itemref idref="${fileId}"/>`)
  }

  files['OEBPS/estilo.css'] = strToU8(STYLE)
  manifest.push('<item id="estilo" href="estilo.css" media-type="text/css"/>')

  // Capa
  files['OEBPS/imagens/capa.jpg'] = await drawCover(book)
  manifest.push('<item id="capa-img" href="imagens/capa.jpg" media-type="image/jpeg" properties="cover-image"/>')
  addPage(
    'capa',
    'capa.xhtml',
    page(title, `<div class="cover"><img src="imagens/capa.jpg" alt="${escapeXml(title)}"/></div>`, 'cover')
  )

  // Folha de rosto e dedicatória
  addPage(
    'rosto',
    'rosto.xhtml',
    page(
      title,
      `<div class="title-page">
<h1>${escapeXml(book.title)}</h1>
<p class="by">${escapeXml(book.author)}</p>
<p class="brand">Lá Vem História · ${book.year}</p>
</div>`
    )
  )

  if (book.dedication?.trim()) {
    addPage(
      'dedicatoria',
      'dedicatoria.xhtml',
      page('Dedicatória', `<div class="dedication">${paragraphs(book.dedication)}</div>`)
    )
  }

  // Capítulos
  for (const chapter of book.chapters) {
    const name = `capitulo-${chapter.number}.xhtml`
    const sections: string[] = []

    for (const { question, answer, contributions } of chapter.entries) {
      const figures: string[] = []

      for (const [index, src] of (answer?.photos ?? []).entries()) {
        try {
          const photo = await photoToJpeg(src)
          const path = `imagens/p${question.id}-${index + 1}.jpg`
          const caption = answer?.photoCaptions?.[index]?.trim()

          files[`OEBPS/${path}`] = photo.bytes
          manifest.push(`<item id="p${question.id}-${index + 1}" href="${path}" media-type="image/jpeg"/>`)
          figures.push(
            `<figure><img src="${path}" alt="${escapeXml(caption || question.text)}"/>${caption ? `<figcaption>${escapeXml(caption)}</figcaption>` : ''}</figure>`
          )
        } catch {
          // Foto que não abre fica de fora, sem impedir o resto do livro
        }
      }

      const link = answer?.audio && audioLinks[question.id]
      const voice = link
        ? `<p class="voice"><a href="${escapeXml(link)}">Ouvir a voz de ${escapeXml(book.author)} contando esta história</a></p>`
        : ''
      const memories = contributions
        .map(
          item =>
            `<div class="memory"><p class="who">Como ${escapeXml(item.name)} lembra</p>${paragraphs(item.text)}</div>`
        )
        .join('\n')

      sections.push(
        `<section>\n<h2>${escapeXml(question.text)}</h2>\n${paragraphs(answer?.text ?? '')}\n${figures.join('\n')}\n${voice}\n${memories}\n</section>`
      )
    }

    addPage(
      `capitulo-${chapter.number}`,
      name,
      page(
        chapter.title,
        `<section class="chapter" epub:type="chapter">
<h1><span class="number">Capítulo ${chapter.number}</span>${escapeXml(chapter.title)}</h1>
${sections.join('\n')}
</section>`
      )
    )
    toc.push({ href: name, label: `${chapter.number}. ${chapter.title}` })
  }

  // Colofão: quem ajudou a lembrar
  const contributors = book.contributors.length
    ? `<p>Com lembranças de ${escapeXml(new Intl.ListFormat('pt-BR').format(book.contributors))}.</p>`
    : ''

  addPage(
    'colofao',
    'colofao.xhtml',
    page(
      'Colofão',
      `<div class="colophon">
<p>${escapeXml(title)}</p>
${contributors}
<p>Feito com Lá Vem História, ${book.year}.</p>
</div>`
    )
  )

  // Sumário: nav do EPUB 3 e toc.ncx para leitores antigos
  const navItems = toc.map(item => `<li><a href="${item.href}">${escapeXml(item.label)}</a></li>`).join('\n')

  addPage(
    'sumario',
    'sumario.xhtml',
    page(
      'Sumário',
      `<nav epub:type="toc" id="toc">
<h1>Sumário</h1>
<ol>
${navItems}
</ol>
</nav>
<nav epub:type="landmarks" hidden="">
<ol>
<li><a epub:type="cover" href="capa.xhtml">Capa</a></li>
<li><a epub:type="bodymatter" href="${toc[0]?.href ?? 'rosto.xhtml'}">Início</a></li>
</ol>
</nav>`
    ),
    false,
    'nav'
  )
  // O sumário entra logo depois da folha de rosto (e da dedicatória)
  spine.splice(book.dedication?.trim() ? 3 : 2, 0, '<itemref idref="sumario"/>')

  files['OEBPS/toc.ncx'] = strToU8(`<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="pt-BR">
<head><meta name="dtb:uid" content="${id}"/></head>
<docTitle><text>${escapeXml(title)}</text></docTitle>
<navMap>
${toc
  .map(
    (item, index) =>
      `<navPoint id="n${index + 1}" playOrder="${index + 1}"><navLabel><text>${escapeXml(item.label)}</text></navLabel><content src="${item.href}"/></navPoint>`
  )
  .join('\n')}
</navMap>
</ncx>
`)
  manifest.push('<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>')

  files['OEBPS/livro.opf'] = strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="pt-BR">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="uid">${id}</dc:identifier>
<dc:title>${escapeXml(title)}</dc:title>
<dc:creator>${escapeXml(book.author)}</dc:creator>
<dc:language>pt-BR</dc:language>
<dc:publisher>Lá Vem História</dc:publisher>
<dc:date>${book.year}</dc:date>
<meta property="dcterms:modified">${modified}</meta>
<meta name="cover" content="capa-img"/>
</metadata>
<manifest>
${manifest.join('\n')}
</manifest>
<spine toc="ncx">
${spine.join('\n')}
</spine>
</package>
`)

  // O mimetype vem primeiro e sem compressão: é assim que o leitor reconhece o arquivo
  const entries: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/livro.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
`)
  }

  for (const [path, bytes] of Object.entries(files)) {
    entries[path] = path.endsWith('.jpg') ? [bytes, { level: 0 }] : bytes
  }

  const zipped = zipSync(entries, { level: 9 })

  return {
    blob: new Blob([zipped as BlobPart], { type: 'application/epub+zip' }),
    filename: epubFilename(title, book.author, info.recipientName)
  }
}
