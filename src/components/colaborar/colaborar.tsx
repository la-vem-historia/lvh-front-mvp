'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'

import Logo from '@/components/shadcn-studio/logo'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'

import { getCollaboratorView, saveContribution } from '@/lib/lvh/api'
import type { CollaboratorView, Question } from '@/lib/lvh/types'

const SAVE_DELAY = 700

type Status = 'idle' | 'saving' | 'saved' | 'error'

const statusLabel: Record<Status, string> = {
  idle: '',
  saving: 'Salvando…',
  saved: 'Salvo',
  error: 'Não foi possível salvar'
}

// Uma pergunta para o convidado, com salvamento automático
const ContributionField = ({ token, question, initial }: { token: string; question: Question; initial: string }) => {
  const [text, setText] = useState(initial)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const update = (value: string) => {
    setText(value)
    setStatus('saving')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      saveContribution(token, question.id, value)
        .then(() => {
          setStatus('saved')
          setError(null)
        })
        .catch((reason: Error) => {
          setStatus('error')
          setError(reason.message)
        })
    }, SAVE_DELAY)
  }

  return (
    <article className='border-border flex flex-col gap-4 border-t pt-8'>
      <div className='flex items-start justify-between gap-6'>
        <h2 className='font-heading text-display text-balance'>{question.text}</h2>
        <span role='status' className='text-muted-foreground shrink-0 pt-3 text-xs'>
          {statusLabel[status]}
        </span>
      </div>
      <textarea
        value={text}
        onChange={event => update(event.target.value)}
        aria-label={`Sua resposta para: ${question.text}`}
        placeholder='Escreva aqui o que você lembra. Não precisa ser perfeito.'
        className='placeholder:text-muted-foreground/70 field-sizing-content min-h-40 w-full resize-none bg-transparent text-lg leading-relaxed outline-none'
      />
      {error && <p className='text-destructive text-sm'>{error}</p>}
    </article>
  )
}

// Página de quem foi convidado a responder: vê só as perguntas liberadas e as próprias respostas
const Colaborar = ({ token }: { token: string }) => {
  const [view, setView] = useState<CollaboratorView | null | undefined>(undefined)

  useEffect(() => {
    getCollaboratorView(token).then(setView)
  }, [token])

  return (
    <div className='flex min-h-svh flex-col'>
      <header>
        <div className='mx-auto flex h-20 max-w-3xl items-center justify-between px-4 sm:px-6'>
          <Link href='/'>
            <Logo className='[&_svg]:h-[2.125rem]' />
          </Link>
          {view && <span className='text-muted-foreground text-sm'>Respondendo como {view.collaborator.name}</span>}
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 lg:py-16'>
        {view === null && (
          <div className='flex flex-col gap-4'>
            <h1 className={pageTitleClassName}>Este convite não está disponível.</h1>
            <p className='text-muted-foreground text-base'>
              O link pode estar errado, ou quem convidou você removeu o seu acesso.
            </p>
          </div>
        )}

        {view && (
          <>
            <div className='flex flex-col gap-4'>
              <p className={eyebrowClassName}>Um convite de {view.ownerName}</p>
              <h1 className={pageTitleClassName}>Conte o que você lembra, do seu jeito.</h1>
              <p className='text-muted-foreground max-w-xl text-base text-pretty'>
                {view.ownerName} está escrevendo um livro de histórias da família e quer a sua versão destas lembranças.{' '}
                {view.ownerName} lê primeiro e escolhe o que entra no livro. Você não vê as respostas de{' '}
                {view.ownerName}. Tudo é salvo sozinho.
              </p>
            </div>

            {view.collaborator.message && (
              <figure className='bg-sand flex flex-col gap-3 rounded-2xl p-6'>
                <figcaption className='text-sm font-medium'>Mensagem de {view.ownerName}</figcaption>
                <blockquote className='font-heading text-lg leading-relaxed whitespace-pre-line'>
                  {view.collaborator.message}
                </blockquote>
              </figure>
            )}

            {view.questions.length ? (
              view.questions.map(question => (
                <ContributionField
                  key={question.id}
                  token={token}
                  question={question}
                  initial={view.contributions[question.id]?.text ?? ''}
                />
              ))
            ) : (
              <p className='text-muted-foreground border-border border-t pt-8 text-base'>
                Não há perguntas liberadas para você no momento.
              </p>
            )}

            {/* Convite simulado: o link só abre no mesmo navegador de quem convidou */}
            <p className='text-muted-foreground border-border border-t pt-4 text-xs'>
              Protótipo: o link só abre no mesmo navegador de quem convidou.
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default Colaborar
