// Paginação real do livro: mede cada bloco no DOM, numa página de tamanho fixo,
// e quebra parágrafos entre páginas palavra por palavra quando não cabem.

import type { AudioRecording, Book } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'
import { mediaCode } from '@/lib/lvh/livros'

// Página lógica; na tela ela é escalada para caber. No celular usamos um formato de
// bolso, mais estreito, para o texto continuar legível sem precisar de zoom
export type PageFormat = { width: number; height: number; marginX: number; marginY: number }

export const PAGE_FORMATS = {
  book: { width: 440, height: 622, marginX: 50, marginY: 64 },
  pocket: { width: 330, height: 540, marginX: 26, marginY: 50 },
  // Impressão em A5 (148 × 210 mm): mesma largura do livro na tela, altura na proporção exata da folha
  print: { width: 440, height: (440 * 210) / 148, marginX: 50, marginY: 64 }
} satisfies Record<string, PageFormat>

export const contentSize = (format: PageFormat) => ({
  width: format.width - format.marginX * 2,
  height: format.height - format.marginY * 2
})

const PHOTO_HEIGHT = 262
const AUDIO_HEIGHT = 70


export type FlowBlock =
  | { type: 'question'; text: string }
  | { type: 'contributor'; name: string }
  | { type: 'paragraph'; text: string; lead?: boolean; continued?: boolean }
  | { type: 'photo'; src: string; caption: string; alt: string; tilt: number; code: string }
  | { type: 'audio'; audio: AudioRecording; questionId: number; code: string }

export type Page =
  | { type: 'cover' }
  | { type: 'endpaper' }
  | { type: 'dedication'; text: string }
  | { type: 'title' }
  | { type: 'contents' }
  | { type: 'blank' }
  | { type: 'chapter'; chapterId: string; number: number; title: string }
  | { type: 'content'; chapterTitle: string; blocks: FlowBlock[] }
  | { type: 'colophon' }
  | { type: 'back' }

// Classes usadas tanto na medição quanto na renderização, para as duas baterem
export const blockClassName = (block: FlowBlock) => {
  switch (block.type) {
    case 'question':
      // Mesma hierarquia do app: pergunta maior e mais pesada que a resposta, sem itálico.
      // O espaço acima é fixo: uma resposta curta e uma longa terminam à mesma distância da próxima pergunta
      return 'book-ink font-heading mt-10 mb-1.5 text-[17px] leading-[1.3] font-medium first:mt-0'
    case 'contributor':
      return 'book-ink text-earth mt-6 mb-2 text-[8.5px] font-medium tracking-[0.2em] uppercase first:mt-0'
    case 'paragraph':
      return cn(
        'book-ink font-heading text-[13px] leading-[21px] text-justify text-pretty hyphens-auto',
        block.lead || block.continued ? 'indent-0' : 'indent-[1.5em]'
      )
    case 'photo':
      return 'mt-5 mb-5 flex items-center justify-center first:mt-0'
    case 'audio':
      return 'mt-4 mb-4 first:mt-0'
  }
}

export const blockHeight = (block: FlowBlock) =>
  block.type === 'photo' ? PHOTO_HEIGHT : block.type === 'audio' ? AUDIO_HEIGHT : undefined

export const contributorLabel = (name: string) => `Como ${name} lembra`

const createMeasureNode = (block: FlowBlock) => {
  const node = document.createElement(block.type === 'photo' || block.type === 'audio' ? 'div' : 'p')
  const height = blockHeight(block)

  node.className = blockClassName(block)
  if (block.type === 'question' || block.type === 'paragraph') node.textContent = block.text
  if (block.type === 'contributor') node.textContent = contributorLabel(block.name)
  if (height) node.style.height = `${height}px`

  return node
}

export function paginate(
  book: Book,
  measure: HTMLElement,
  format: PageFormat
): { pages: Page[]; chapterPages: Record<string, number> } {
  const content = contentSize(format)

  // Abertura: capa, guarda (ou dedicatória), folha de rosto e sumário.
  // Índice par = página da direita (recto), ímpar = da esquerda (verso)
  const pages: Page[] = [
    { type: 'cover' },
    book.dedication ? { type: 'dedication', text: book.dedication } : { type: 'endpaper' },
    { type: 'title' },
    { type: 'contents' }
  ]
  const chapterPages: Record<string, number> = {}

  let current: FlowBlock[] = []
  let chapterTitle = ''
  let tilt = 1

  const fits = () => measure.scrollHeight <= content.height

  const flush = () => {
    if (current.length) pages.push({ type: 'content', chapterTitle, blocks: current })
    current = []
    measure.replaceChildren()
  }

  // Adiciona um bloco inteiro; se não couber, começa página nova
  const place = (block: FlowBlock) => {
    const node = createMeasureNode(block)

    measure.append(node)
    if (fits()) return current.push(block)

    node.remove()
    flush()
    measure.append(createMeasureNode(block))
    current.push(block)
  }

  // Parágrafo: o que couber fica nesta página, o resto continua na próxima
  const placeParagraph = (block: Extract<FlowBlock, { type: 'paragraph' }>) => {
    const node = createMeasureNode(block)

    measure.append(node)
    if (fits()) return current.push(block)

    const words = block.text.split(' ')
    let low = 0
    let high = words.length

    while (low < high) {
      const middle = Math.ceil((low + high) / 2)

      node.textContent = words.slice(0, middle).join(' ')
      if (fits()) low = middle
      else high = middle - 1
    }

    node.remove()

    if (low > 0) current.push({ ...block, text: words.slice(0, low).join(' ') })
    flush()
    placeParagraph({ type: 'paragraph', text: words.slice(low).join(' '), continued: low > 0 || block.continued })
  }

  const placeText = (text: string, lead: boolean) =>
    text
      .split(/\n+/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean)
      .forEach((paragraph, index) => placeParagraph({ type: 'paragraph', text: paragraph, lead: lead && index === 0 }))

  // Bloco que nunca fica sozinho no pé da página: só entra se couber junto com duas linhas
  const keepWithNext = (block: FlowBlock) => {
    measure.append(createMeasureNode(block))
    measure.append(
      createMeasureNode({ type: 'paragraph', text: 'Linha de reserva para manter o título junto do texto.' })
    )
    const together = fits()

    measure.lastChild?.remove()
    measure.lastChild?.remove()
    if (!together) flush()
    place(block)
  }

  for (const chapter of book.chapters) {
    flush()
    // Todo capítulo abre numa página da direita, como nos livros impressos
    if (pages.length % 2 === 1) pages.push({ type: 'blank' })
    chapterPages[chapter.id] = pages.length
    chapterTitle = chapter.title
    pages.push({ type: 'chapter', chapterId: chapter.id, number: chapter.number, title: chapter.title })

    for (const { question, answer, contributions } of chapter.entries) {
      keepWithNext({ type: 'question', text: question.text })

      if (answer) {
        placeText(answer.text, true)
        answer.photos.forEach((src, photoIndex) => {
          tilt = -tilt
          // Sem legenda, a foto entra no livro sem texto embaixo; a pergunta fica só como texto alternativo
          const caption = answer.photoCaptions?.[photoIndex]?.trim() ?? ''

          place({
            type: 'photo',
            src,
            caption,
            alt: caption || question.text,
            tilt,
            code: mediaCode(question.id, 'foto', photoIndex)
          })
        })
        if (answer.audio) {
          place({ type: 'audio', audio: answer.audio, questionId: question.id, code: mediaCode(question.id, 'audio') })
        }
      }

      // Lembranças de quem foi convidado a responder junto
      for (const contribution of contributions) {
        keepWithNext({ type: 'contributor', name: contribution.name })
        placeText(contribution.text, false)
      }
    }
  }

  flush()
  pages.push({ type: 'colophon' })
  // Miolo com número par de páginas, para a contracapa fechar o livro sozinha
  if ((pages.length - 1) % 2 === 1) pages.push({ type: 'blank' })
  pages.push({ type: 'back' })

  return { pages, chapterPages }
}
