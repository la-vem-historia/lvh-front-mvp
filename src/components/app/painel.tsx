'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { BookmarkIcon, ChevronDownIcon, CircleCheckIcon, ImageIcon, MicIcon, UserPlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import PageHeading from '@/components/app/page-heading'
import PrimeirosPassos from '@/components/app/primeiros-passos'
import { useUser } from '@/components/app/session'

import { getAnswers, getBookmarks, getChapters, getCollaborators, isAnswered } from '@/lib/lvh/api'
import { getSaudacao, type Saudacao } from '@/lib/lvh/saudacao'
import type { Answer, Chapter, Question } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const Painel = () => {
  const user = useUser()
  const [chapters, setChapters] = useState<Chapter[] | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [hideAnswered, setHideAnswered] = useState(false)
  // Perguntas com convidado, para o ícone de convite na lista
  const [invitedQuestions, setInvitedQuestions] = useState<Set<number>>(new Set())
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [saudacao, setSaudacao] = useState<Saudacao | null>(null)

  useEffect(() => {
    Promise.all([getChapters(user), getAnswers(), getCollaborators(), getBookmarks()]).then(
      ([nextChapters, nextAnswers, collaborators, nextBookmarks]) => {
        setChapters(nextChapters)
        setAnswers(nextAnswers)
        setBookmarks(nextBookmarks)
        setInvitedQuestions(new Set(collaborators.flatMap(collaborator => collaborator.questionIds)))
        // Sorteada uma vez, quando os dados chegam, para não trocar a cada nova renderização
        const answeredCount = nextChapters
          .flatMap(chapter => chapter.questions)
          .filter(question => isAnswered(nextAnswers[question.id])).length

        setSaudacao(getSaudacao(user.name, answeredCount))
      }
    )
  }, [user])

  if (!chapters || !saudacao) return null

  const questions = chapters.flatMap(chapter => chapter.questions)
  const answered = questions.filter(question => isAnswered(answers[question.id])).length
  const progress = Math.round((answered / questions.length) * 100)
  const next = questions.find(question => !isAnswered(answers[question.id]))
  // Marcadas para depois, com o capítulo de cada uma; some quem saiu do roteiro ao trocar de perfil
  const marked = bookmarks.flatMap(id => {
    const chapter = chapters.find(item => item.questions.some(question => question.id === id))
    const question = chapter?.questions.find(item => item.id === id)

    return chapter && question ? [{ chapter, question }] : []
  })
  // Quem ainda não respondeu nada vê todos os capítulos fechados; depois, abre o capítulo em andamento
  const openChapter = answered
    ? chapters.find(chapter => chapter.questions.some(question => !isAnswered(answers[question.id])))?.id
    : undefined

  // Linha de pergunta, igual nos capítulos e nas marcadas; nas marcadas, diz de que capítulo ela vem
  const renderQuestion = (question: Question, chapterTitle?: string) => {
    const answer = answers[question.id]
    const isDone = isAnswered(answer)
    // O que já foi usado nesta pergunta: foto, voz ou convite
    const extras = [
      bookmarks.includes(question.id)
        ? { label: 'Marcada', Icon: BookmarkIcon, className: 'fill-poppy text-poppy' }
        : null,
      answer?.photos.length ? { label: 'Com foto', Icon: ImageIcon } : null,
      answer?.audio ? { label: 'Com gravação de voz', Icon: MicIcon } : null,
      invitedQuestions.has(question.id) ? { label: 'Com convidado', Icon: UserPlusIcon } : null
    ].filter(item => item !== null) as { label: string; Icon: typeof BookmarkIcon; className?: string }[]

    return (
      <li key={question.id} className='border-border border-t first:border-t-0'>
        <Link
          href={`/app/pergunta/${question.id}`}
          className='hover:bg-sand flex items-baseline justify-between gap-6 rounded-xl py-3 transition-colors sm:px-3'
        >
          <span className='flex flex-col gap-0.5'>
            <span className={cn('text-base', isDone && 'text-muted-foreground')}>{question.text}</span>
            {chapterTitle && <span className='text-muted-foreground text-xs'>{chapterTitle}</span>}
          </span>
          <span className='text-muted-foreground flex shrink-0 items-center gap-2 text-xs'>
            {extras.length > 0 && (
              <span className='mr-1 flex items-center gap-1.5'>
                {extras.map(({ label, Icon, className }) => (
                  <span key={label} title={label} className='flex'>
                    <Icon aria-label={label} className={cn('size-3.5', className)} strokeWidth={1.75} />
                  </span>
                ))}
              </span>
            )}
            {isDone ? 'Respondida' : 'Responder'}
            {/* Check sólido: círculo preenchido com o traço na cor do fundo */}
            <CircleCheckIcon
              aria-hidden='true'
              className={cn('fill-foreground text-background size-4', !isDone && 'invisible')}
            />
          </span>
        </Link>
      </li>
    )
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pt-8 pb-16 sm:px-6 lg:px-16 lg:pb-24'>
      <div className='grid gap-10 lg:grid-cols-12 lg:gap-8'>
        <PageHeading eyebrow='O seu livro' title={saudacao.title} className='lg:col-span-6'>
          {saudacao.line}
        </PageHeading>

        <div className='flex flex-col justify-end gap-6 lg:col-span-5 lg:col-start-8'>
          <div className='flex flex-col gap-3'>
            <div className='flex items-baseline justify-between text-sm'>
              <span className='font-medium'>
                {answered} de {questions.length} perguntas respondidas
              </span>
              <span className='text-muted-foreground'>{progress}%</span>
            </div>
            <div
              role='progressbar'
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label='Progresso da sua história'
              className='bg-border h-0.5 w-full'
            >
              <div className='bg-foreground h-full transition-all' style={{ width: `${progress}%` }} />
            </div>
          </div>
          {next && (
            <Button
              render={<Link href={`/app/pergunta/${next.id}`} />}
              nativeButton={false}
              variant='honey'
              size='cta'
              className='w-fit'
            >
              {answered ? 'Continuar de onde parei' : 'Responder a primeira pergunta'}
            </Button>
          )}
        </div>
      </div>

      <PrimeirosPassos answers={answers} nextQuestionId={next?.id} />

      {/* Marcadas: mesmo visual de um capítulo, mas fora da lista deles. Começa sempre fechada */}
      <Collapsible className='border-foreground border-y'>
        <CollapsibleTrigger className='group hover:bg-sand grid w-full cursor-pointer rounded-xl grid-cols-[2.5rem_1fr_auto_1rem] items-center gap-4 py-5 text-left transition-colors sm:grid-cols-[4rem_1fr_auto_1rem]'>
          <BookmarkIcon aria-hidden='true' className='fill-poppy text-poppy size-4' />
          <span className='font-heading text-xl sm:text-2xl'>Marcadas</span>
          <span className='text-muted-foreground text-sm tabular-nums'>{marked.length}</span>
          <ChevronDownIcon className='size-4 transition-transform group-data-[panel-open]:rotate-180' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol className='flex flex-col pb-6 sm:pl-20'>
            {marked.map(({ chapter, question }) => renderQuestion(question, chapter.title))}
            {marked.length === 0 && (
              <li className='text-muted-foreground py-3 text-sm sm:px-3'>
                Nenhuma pergunta marcada. Toque no{' '}
                <BookmarkIcon aria-label='marcador' className='inline size-4 -translate-y-px align-middle' /> em uma
                pergunta para guardá-la aqui e voltar quando tiver a foto ou a lembrança.
              </li>
            )}
          </ol>
        </CollapsibleContent>
      </Collapsible>

      <section className='flex flex-col'>
        <div className='flex items-center justify-between pb-4'>
          <h2 className='text-sm font-medium uppercase'>Capítulos</h2>
          <label className='text-muted-foreground flex cursor-pointer items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={hideAnswered}
              onChange={event => setHideAnswered(event.target.checked)}
              className='accent-foreground size-4'
            />
            Ocultar respondidas
          </label>
        </div>

        {chapters.map((chapter, index) => {
          const done = chapter.questions.filter(question => isAnswered(answers[question.id])).length
          const visible = chapter.questions.filter(question => !hideAnswered || !isAnswered(answers[question.id]))

          return (
            <Collapsible
              key={chapter.id}
              defaultOpen={chapter.id === openChapter}
              className='border-foreground border-t'
            >
              <CollapsibleTrigger className='group hover:bg-sand grid w-full cursor-pointer rounded-xl grid-cols-[2.5rem_1fr_auto_1rem] items-center gap-4 py-5 text-left transition-colors sm:grid-cols-[4rem_1fr_auto_1rem]'>
                <span className='text-clay text-sm font-bold'>{String(index + 1).padStart(2, '0')}</span>
                <span className='font-heading text-xl sm:text-2xl'>{chapter.title}</span>
                <span className='text-muted-foreground text-sm tabular-nums'>
                  {done}/{chapter.questions.length}
                </span>
                <ChevronDownIcon className='size-4 transition-transform group-data-[panel-open]:rotate-180' />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <ol className='flex flex-col pb-6 sm:pl-20'>
                  {visible.map(question => renderQuestion(question))}
                  {visible.length === 0 && (
                    <li className='text-muted-foreground py-3 text-sm sm:px-3'>Todas as perguntas respondidas.</li>
                  )}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </section>
    </div>
  )
}

export default Painel
