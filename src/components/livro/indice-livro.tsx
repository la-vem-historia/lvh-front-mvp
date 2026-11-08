'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { SearchIcon, XIcon } from 'lucide-react'

import type { Page } from '@/components/livro/paginate'
import { cn } from '@/lib/utils'

// Busca sem acento e sem maiúsculas: "joao" acha "João". Troca letra por letra, sem mudar o tamanho
// do texto, para a posição achada no texto normalizado valer também no original
export const fold = (text: string) =>
  Array.from(text, char => {
    const base = char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

    // Só troca quando o tamanho não muda (acentos); emoji e símbolos ficam como estão
    return base.length === char.length ? base : char
  }).join('')

type Entry = { page: number; question: string; text: string }

// Tudo o que dá para achar no livro, com a página onde caiu: perguntas e trechos das respostas
const buildIndex = (pages: Page[]) => {
  const entries: Entry[] = []
  let question = ''

  pages.forEach((page, index) => {
    if (page.type === 'chapter') entries.push({ page: index, question: page.title, text: page.title })
    if (page.type !== 'content') return

    page.blocks.forEach(block => {
      if (block.type === 'question') {
        question = block.text
        entries.push({ page: index, question, text: block.text })
      }
      if (block.type === 'paragraph') entries.push({ page: index, question, text: block.text })
    })
  })

  return entries
}

const SNIPPET = 48

// Trecho em volta da palavra achada, com ela em destaque
const Snippet = ({ text, at, length }: { text: string; at: number; length: number }) => {
  const start = Math.max(0, at - SNIPPET)
  const end = Math.min(text.length, at + length + SNIPPET)

  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, at)}
      <mark className='bg-honey/80 rounded-[3px] px-0.5 text-[#2a2420]'>{text.slice(at, at + length)}</mark>
      {text.slice(at + length, end)}
      {end < text.length && '…'}
    </>
  )
}

type IndiceLivroProps = {
  pages: Page[]
  // Página aberta agora, para marcar o capítulo em que a pessoa está
  current: number
  onJump: (page: number, term?: string) => void
  onClose: () => void
}

// Índice do modo de leitura: os capítulos para pular direto e uma busca nas perguntas e respostas
const IndiceLivro = ({ pages, current, onJump, onClose }: IndiceLivroProps) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const index = useMemo(() => buildIndex(pages), [pages])

  const chapters = pages.flatMap((page, at) =>
    page.type === 'chapter' ? [{ at, number: page.number, title: page.title }] : []
  )
  const currentChapter = chapters.filter(chapter => chapter.at <= current).at(-1)

  const term = fold(query.trim())
  const results = useMemo(() => {
    if (term.length < 2) return []

    const seen = new Set<string>()

    return index.flatMap(entry => {
      const at = fold(entry.text).indexOf(term)
      const key = `${entry.page}:${entry.question}`

      if (at < 0 || seen.has(key)) return []
      seen.add(key)

      return [{ ...entry, at }]
    })
  }, [index, term])

  // No computador o cursor já entra na busca; no celular, o teclado só abre quando a pessoa tocar
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
  }, [])

  return (
    <div
      role='dialog'
      aria-label='Índice do livro'
      className='pointer-events-auto absolute top-16 left-3 z-20 flex max-h-[calc(100%-5rem)] w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl bg-[#2a2420]/92 text-white shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl sm:top-20 sm:left-5 sm:max-h-[calc(100%-6.5rem)]'
      onKeyDown={event => {
        // Esc fecha só o índice, sem fechar o livro
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <div className='flex items-center gap-2 p-3'>
        <label className='flex h-11 flex-1 items-center gap-2 rounded-full bg-white/10 px-4 focus-within:bg-white/15'>
          <SearchIcon className='size-4 shrink-0 text-white/60' />
          <input
            ref={inputRef}
            type='search'
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder='Buscar no livro'
            aria-label='Buscar no livro'
            className='min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/50 [&::-webkit-search-cancel-button]:hidden'
          />
        </label>
        <button
          type='button'
          onClick={onClose}
          aria-label='Fechar o índice'
          className='flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/15'
        >
          <XIcon className='size-[1.125rem]' />
        </button>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin]'>
        {term.length >= 2 ? (
          results.length > 0 ? (
            <>
              <p className='px-3 pt-1 pb-2 text-xs text-white/60' aria-live='polite'>
                {results.length === 1 ? '1 resultado' : `${results.length} resultados`}
              </p>
              <ul className='flex flex-col'>
                {results.map(result => (
                  <li key={`${result.page}:${result.question}`}>
                    <button
                      type='button'
                      onClick={() => onJump(result.page, query.trim())}
                      className='flex w-full cursor-pointer flex-col gap-1 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/10'
                    >
                      <span className='flex items-baseline justify-between gap-3'>
                        <span className='text-sm font-medium text-pretty'>{result.question}</span>
                        <span className='shrink-0 text-xs text-white/50 tabular-nums'>p. {result.page + 1}</span>
                      </span>
                      {result.text !== result.question && (
                        <span className='text-sm leading-relaxed text-pretty text-white/70'>
                          <Snippet text={result.text} at={result.at} length={term.length} />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className='px-3 py-6 text-sm text-pretty text-white/60' aria-live='polite'>
              Nada encontrado para “{query.trim()}”. Tente outra palavra.
            </p>
          )
        ) : (
          <nav aria-label='Capítulos'>
            <p className='px-3 pt-1 pb-2 text-[0.6875rem] font-medium tracking-[0.12em] text-white/60 uppercase'>
              Capítulos
            </p>
            <ul className='flex flex-col'>
              {chapters.map(chapter => (
                <li key={chapter.at}>
                  <button
                    type='button'
                    onClick={() => onJump(chapter.at)}
                    aria-current={currentChapter?.at === chapter.at ? 'true' : undefined}
                    className={cn(
                      'flex w-full cursor-pointer items-baseline gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/10',
                      currentChapter?.at === chapter.at && 'bg-white/10'
                    )}
                  >
                    <span className='w-6 shrink-0 text-xs text-white/50 tabular-nums'>
                      {String(chapter.number).padStart(2, '0')}
                    </span>
                    <span className='flex-1 text-sm text-pretty'>{chapter.title}</span>
                    <span className='shrink-0 text-xs text-white/50 tabular-nums'>p. {chapter.at + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}

export default IndiceLivro
