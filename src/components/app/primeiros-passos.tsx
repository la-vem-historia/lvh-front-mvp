'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { ArrowRightIcon, CheckIcon } from 'lucide-react'

import { useUpdateUser, useUser } from '@/components/app/session'

import { getCollaborators, isAnswered } from '@/lib/lvh/api'
import type { Answer } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

type Step = {
  id: string
  title: string
  description: string
  done: boolean
  href?: string
  action?: string
  soon?: boolean
}

// Dispensar sem marcar a caixa esconde só nesta visita (sessão do navegador)
const DISMISSED_KEY = 'lvh:checklist-dispensado'

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

// Onboarding guiado em marcos: some sozinho quando os passos disponíveis estão feitos.
// A pessoa pode dispensar antes: só por agora, ou de vez (e reativar em Configurações)
const PrimeirosPassos = ({ answers, nextQuestionId }: { answers: Record<number, Answer>; nextQuestionId?: number }) => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const [hasCollaborator, setHasCollaborator] = useState<boolean | null>(null)
  const [dismissed, setDismissed] = useState(readDismissed)
  const [forever, setForever] = useState(false)

  useEffect(() => {
    getCollaborators().then(collaborators => setHasCollaborator(collaborators.length > 0))
  }, [])

  if (user.checklistHidden || dismissed || hasCollaborator === null) return null

  const answered = Object.values(answers).filter(answer => isAnswered(answer))
  const question = nextQuestionId ? `/app/pergunta/${nextQuestionId}` : '/app'
  // Convite e voz acontecem na tela de uma pergunta: leva para a última respondida, ou para a próxima
  const lastAnswered = answered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const workingQuestion = lastAnswered ? `/app/pergunta/${lastAnswered.questionId}` : question

  const steps: Step[] = [
    {
      id: 'responder',
      title: 'Responda à primeira pergunta',
      description: 'Escreva do seu jeito. Não precisa ser perfeito.',
      done: answered.length > 0,
      href: question,
      action: 'Responder'
    },
    {
      id: 'voz',
      title: 'Grave a sua voz',
      description: 'Conte uma lembrança falando. A família vai ouvir você no livro.',
      done: answered.some(answer => answer.audio),
      href: `${workingQuestion}#ferramentas`,
      action: 'Gravar'
    },
    {
      id: 'convidar',
      title: 'Convide alguém',
      description: 'Peça a um familiar ou amigo a versão dele de uma lembrança.',
      done: hasCollaborator,
      href: `${workingQuestion}#convidar`,
      action: 'Convidar'
    },
    {
      id: 'lembretes',
      title: 'Receba perguntas por e-mail',
      description: 'Escolha o dia e o horário, e a próxima pergunta chega até você.',
      done: Boolean(user.emailReminder?.enabled),
      href: '/app/configuracoes#pergunta-da-semana',
      action: 'Escolher'
    }
  ]

  const available = steps.filter(step => !step.soon)
  const completed = available.filter(step => step.done).length

  if (completed === available.length) return null

  const dismiss = () => {
    if (forever) {
      updateUser({ checklistHidden: true })

      return
    }

    try {
      sessionStorage.setItem(DISMISSED_KEY, '1')
    } catch {}
    setDismissed(true)
  }

  return (
    <section aria-labelledby='primeiros-passos' className='bg-sand flex flex-col gap-6 rounded-[1.5rem] p-6 sm:p-8'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium uppercase'>Primeiros passos</p>
          <h2 id='primeiros-passos' className='font-heading text-2xl'>
            Comece a sua história
          </h2>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex flex-col items-end gap-2'>
            <span className='text-muted-foreground text-sm tabular-nums'>
              {completed} de {available.length} feitos
            </span>
            <div className='flex gap-1' aria-hidden='true'>
              {available.map(step => (
                <span key={step.id} className={cn('h-1.5 w-8 rounded-full', step.done ? 'bg-moss' : 'bg-stone')} />
              ))}
            </div>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <button
              type='button'
              onClick={dismiss}
              className='text-muted-foreground hover:text-foreground cursor-pointer text-sm underline underline-offset-4'
            >
              Dispensar
            </button>
            <label className='text-muted-foreground flex cursor-pointer items-center gap-2 text-xs'>
              <input
                type='checkbox'
                checked={forever}
                onChange={event => setForever(event.target.checked)}
                className='accent-foreground size-3.5'
              />
              Não ver novamente
            </label>
          </div>
        </div>
      </div>

      <ol className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'bg-background flex flex-col gap-4 rounded-2xl p-5 transition-opacity',
              (step.done || step.soon) && 'opacity-65'
            )}
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-xs font-bold',
                step.done ? 'bg-moss text-cream' : 'border-border text-clay border'
              )}
            >
              {step.done ? <CheckIcon className='size-4' aria-label='Feito' /> : index + 1}
            </span>
            <div className='flex flex-1 flex-col gap-1'>
              <span className={cn('text-base font-medium', step.done && 'line-through decoration-1')}>
                {step.title}
              </span>
              <span className='text-muted-foreground text-sm text-pretty'>{step.description}</span>
            </div>
            {step.soon ? (
              <span className='border-border w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium'>
                Em breve
              </span>
            ) : step.done ? (
              <span className='text-muted-foreground text-sm'>Feito</span>
            ) : (
              <Link
                href={step.href ?? '/app'}
                className='flex w-fit items-center gap-1.5 text-sm font-medium underline underline-offset-4'
              >
                {step.action}
                <ArrowRightIcon className='size-4' />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default PrimeirosPassos
