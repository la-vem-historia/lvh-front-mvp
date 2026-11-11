'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, LightbulbIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUpdateUser, useUser } from '@/components/app/session'

import { getCollaborators, isAnswered } from '@/lib/lvh/api'
import type { Answer } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

type Dica = { id: string; title: string; text: string; action: string; href: string }

// Troca sozinha de tempos em tempos, como as dicas de tela de carregamento de jogo.
// Para enquanto a pessoa está com o mouse ou o foco nela, e não troca para quem pediu menos movimento
const INTERVALO = 12_000

// Dicas da home: uma por vez, numa faixa baixa, com setas para passear entre elas.
// Começa numa dica sorteada, então cada volta à home mostra outra, mesmo na mesma sessão.
// Some o que a pessoa já fez (quem já gravou a voz não recebe a dica de gravar)
const Dicas = ({ answers, nextQuestionId }: { answers: Record<number, Answer>; nextQuestionId?: number }) => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const [hasCollaborator, setHasCollaborator] = useState<boolean | null>(null)
  // Sorteio da dica inicial (0 a 1) e quantas a pessoa já passou a partir dela
  const [seed, setSeed] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)
  // Direção da última troca, para a dica nova entrar pelo lado certo
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    getCollaborators().then(collaborators => {
      setHasCollaborator(collaborators.length > 0)
      setSeed(Math.random())
    })
  }, [])

  const dicas = useMemo(() => {
    const answered = Object.values(answers).filter(answer => isAnswered(answer))
    const question = nextQuestionId ? `/app/pergunta/${nextQuestionId}` : '/app'
    // Voz, foto e convite ficam na tela de uma pergunta: leva para a última respondida, ou para a próxima
    const lastAnswered = [...answered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    const working = lastAnswered ? `/app/pergunta/${lastAnswered.questionId}` : question

    const all: (Dica & { done?: boolean })[] = [
      {
        id: 'responder',
        title: 'Não precisa ser perfeito',
        text: 'Escreva do seu jeito, como se estivesse contando. Dá para voltar e mudar quando quiser.',
        action: answered.length ? 'Responder a próxima' : 'Responder a primeira',
        href: question
      },
      {
        id: 'voz',
        title: 'Grave a sua voz',
        text: 'Conte uma lembrança falando. No livro, um QR code leva a família direto para a sua voz.',
        action: 'Gravar',
        href: `${working}#ferramentas`,
        done: answered.some(answer => answer.audio)
      },
      {
        id: 'fotos',
        title: 'Junte fotos às respostas',
        text: 'A foto entra no livro ao lado do que você escreveu. Vale foto antiga fotografada com o celular.',
        action: 'Adicionar foto',
        href: `${working}#ferramentas`,
        done: answered.some(answer => answer.photos.length > 0)
      },
      {
        id: 'convidar',
        title: 'Convide alguém para contar junto',
        text: 'Peça a um familiar a versão dele de uma lembrança. Você lê primeiro e escolhe o que entra.',
        action: 'Convidar',
        href: `${working}#convidar`,
        done: Boolean(hasCollaborator)
      },
      {
        id: 'email',
        title: 'Receba uma pergunta por e-mail',
        text: 'Escolha o dia e o horário, e a próxima pergunta chega até você. É o jeito mais fácil de não parar.',
        action: 'Escolher o horário',
        href: '/app/configuracoes#pergunta-da-semana',
        done: Boolean(user.emailReminder?.enabled)
      },
      {
        id: 'livro',
        title: 'Veja o livro tomando forma',
        text: 'Cada resposta já vira página. Abra o livro para ver como está ficando.',
        action: 'Abrir o livro',
        href: '/app/livro'
      },
      {
        id: 'personalizar',
        title: 'Deixe a capa com a sua cara',
        text: 'Troque o nome na capa, a cor e a foto, e escreva uma dedicatória.',
        action: 'Personalizar',
        href: '/app/livro'
      },
      {
        id: 'compartilhar',
        title: 'A família pode ler agora',
        text: 'Mande o link do livro para quem você quiser, sem limite de leitores. Não precisa esperar terminar.',
        action: 'Compartilhar',
        href: '/app/livro'
      },
      {
        id: 'livros',
        title: 'Um livro para cada pessoa',
        text: 'Escrevendo para um filho? Crie também um para o outro. O que é sobre você já vai junto.',
        action: 'Ver meus livros',
        href: '/app/livros'
      }
    ]

    return all.filter(dica => !dica.done)
  }, [answers, nextQuestionId, hasCollaborator, user.emailReminder?.enabled])

  const index =
    seed === null || !dicas.length
      ? null
      : (((Math.floor(seed * dicas.length) + offset) % dicas.length) + dicas.length) % dicas.length

  const go = (step: 1 | -1) => {
    setDirection(step)
    setOffset(current => current + step)
  }

  useEffect(() => {
    if (paused || index === null || dicas.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      setDirection(1)
      setOffset(current => current + 1)
    }, INTERVALO)

    return () => window.clearTimeout(timer)
  }, [paused, index, dicas.length])

  if (user.checklistHidden || index === null) return null

  const dica = dicas[index]

  return (
    <section
      aria-roledescription='carrossel'
      aria-label='Dicas'
      className='bg-sand flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-6 sm:py-4 sm:pr-4 sm:pl-6'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') go(1)
        if (event.key === 'ArrowLeft') go(-1)
      }}
    >
      <div className='flex min-w-0 flex-1 items-start gap-4 sm:items-center'>
        <span className='bg-background text-clay flex size-10 shrink-0 items-center justify-center rounded-full'>
          <LightbulbIcon className='size-[1.125rem]' aria-hidden='true' />
        </span>
        {/* key: a dica nova entra deslizando do lado para onde a pessoa foi */}
        <div
          key={dica.id}
          aria-live={paused ? 'polite' : 'off'}
          className={cn(
            'animate-in fade-in flex min-w-0 flex-col gap-0.5 duration-300',
            direction === 1 ? 'slide-in-from-right-3' : 'slide-in-from-left-3'
          )}
        >
          <p className='text-base font-medium text-pretty'>{dica.title}</p>
          <p className='text-muted-foreground text-sm text-pretty'>{dica.text}</p>
        </div>
      </div>

      <div className='flex shrink-0 items-center justify-between gap-2 sm:justify-end'>
        <Button
          render={<Link href={dica.href} />}
          nativeButton={false}
          variant='outline'
          size='md'
        >
          {dica.action}
        </Button>

        <div className='flex items-center gap-1'>
          {dicas.length > 1 && (
            <>
              <button
                type='button'
                onClick={() => go(-1)}
                aria-label='Dica anterior'
                className='hover:bg-background flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors'
              >
                <ChevronLeftIcon className='size-4' />
              </button>
              <span className='text-muted-foreground w-10 text-center text-xs tabular-nums' aria-hidden='true'>
                {index + 1}/{dicas.length}
              </span>
              <button
                type='button'
                onClick={() => go(1)}
                aria-label='Próxima dica'
                className='hover:bg-background flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors'
              >
                <ChevronRightIcon className='size-4' />
              </button>
            </>
          )}
          {/* Esconde de vez; volta em Configurações */}
          <button
            type='button'
            onClick={() => updateUser({ checklistHidden: true })}
            aria-label='Esconder as dicas'
            title='Esconder as dicas'
            className='text-muted-foreground hover:bg-background hover:text-foreground flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors'
          >
            <XIcon className='size-4' />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Dicas
