'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import Section from '@/components/app/section'
import { useUpdateUser, useUser } from '@/components/app/session'
import { collaboratorLink } from '@/components/app/colaboradores-pergunta'
import PerguntaDaSemana from '@/components/app/pergunta-da-semana'

import {
  getCollaborators,
  getContributions,
  getShares,
  removeCollaborator,
  removeCollaboratorFromQuestion,
  removeShare
} from '@/lib/lvh/api'
import { chaptersFor } from '@/lib/lvh/perguntas'
import type { Collaborator, Contribution, Share, User } from '@/lib/lvh/types'

const questionText = (user: User, id: number) =>
  chaptersFor(user.profile, user.activeBook?.recipientGender)
    .flatMap(chapter => chapter.questions)
    .find(question => question.id === id)?.text ?? `Pergunta ${id}`

const actionClassName = 'cursor-pointer underline underline-offset-4'

const Colaboradores = () => {
  const user = useUser()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = useCallback(
    () =>
      Promise.all([getCollaborators(), getContributions()]).then(([nextCollaborators, nextContributions]) => {
        setCollaborators(nextCollaborators)
        setContributions(nextContributions)
      }),
    []
  )

  useEffect(() => {
    load()
  }, [load])

  const copy = async (collaborator: Collaborator) => {
    await navigator.clipboard.writeText(collaboratorLink(collaborator)).catch(() => {})
    setCopied(collaborator.id)
    window.setTimeout(() => setCopied(current => (current === collaborator.id ? null : current)), 2000)
  }

  const confirmThen = (key: string, action: () => Promise<void>) => {
    if (confirming !== key) return setConfirming(key)
    setConfirming(null)
    action().then(load)
  }

  if (!collaborators.length) {
    return (
      <p className='text-muted-foreground text-base'>
        Ninguém foi convidado ainda. Abra uma pergunta e use “Convidar alguém para responder”.
      </p>
    )
  }

  return (
    <ul className='flex flex-col gap-4'>
      {collaborators.map(collaborator => {
        const answered = contributions.filter(item => item.collaboratorId === collaborator.id && item.text.trim())

        return (
          <li key={collaborator.id} className='border-border flex flex-col gap-4 rounded-2xl border p-5'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <div className='flex flex-col'>
                <span className='font-medium'>{collaborator.name}</span>
                <span className='text-muted-foreground text-xs'>{collaborator.email}</span>
              </div>
              <span className='text-muted-foreground text-xs'>
                {answered.length} de {collaborator.questionIds.length} respondidas
              </span>
            </div>

            {collaborator.questionIds.length > 0 ? (
              <ul className='flex flex-col'>
                {collaborator.questionIds.map(questionId => {
                  const contribution = answered.find(item => item.questionId === questionId)
                  const key = `pergunta-${collaborator.id}-${questionId}`

                  return (
                    <li
                      key={questionId}
                      className='border-border flex items-baseline justify-between gap-4 border-t py-2 text-sm'
                    >
                      <Link href={`/app/pergunta/${questionId}`} className='hover:underline'>
                        {questionText(user, questionId)}
                      </Link>
                      <span className='text-muted-foreground flex shrink-0 gap-4 text-xs'>
                        {contribution
                          ? contribution.approved
                            ? 'No livro'
                            : 'Aguardando aprovação'
                          : 'Aguardando resposta'}
                        <button
                          type='button'
                          onClick={() =>
                            confirmThen(key, () => removeCollaboratorFromQuestion(collaborator.id, questionId))
                          }
                          className={`${actionClassName} hover:text-destructive`}
                        >
                          {confirming === key ? 'Confirmar' : 'Tirar acesso'}
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className='text-muted-foreground text-sm'>Sem acesso a nenhuma pergunta no momento.</p>
            )}

            <div className='text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-xs'>
              <button type='button' onClick={() => copy(collaborator)} className={actionClassName}>
                {copied === collaborator.id ? 'Copiado!' : 'Copiar link'}
              </button>
              <button
                type='button'
                onClick={() => confirmThen(`remover-${collaborator.id}`, () => removeCollaborator(collaborator.id))}
                className={`${actionClassName} hover:text-destructive`}
              >
                {confirming === `remover-${collaborator.id}`
                  ? 'Clique de novo: remove a pessoa e as respostas dela'
                  : 'Remover colaborador'}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const Leitores = () => {
  const [shares, setShares] = useState<Share[]>([])
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    getShares().then(setShares)
  }, [])

  const revoke = async (share: Share) => {
    if (confirming !== share.id) return setConfirming(share.id)
    await removeShare(share.id)
    setShares(current => current.filter(item => item.id !== share.id))
  }

  return (
    <>
      {shares.length ? (
        <ul className='flex flex-col'>
          {shares.map(share => (
            <li key={share.id} className='border-border flex items-center justify-between gap-4 border-t py-3'>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate text-sm font-medium'>{share.name}</span>
                <span className='text-muted-foreground truncate text-xs'>{share.email}</span>
              </div>
              <button
                type='button'
                onClick={() => revoke(share)}
                className={`${actionClassName} text-muted-foreground hover:text-destructive shrink-0 text-xs`}
              >
                {confirming === share.id ? 'Confirmar' : 'Remover acesso'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-muted-foreground text-base'>Ninguém tem acesso ao seu livro ainda.</p>
      )}
      <Link href='/app/livro' className='w-fit text-sm underline underline-offset-4'>
        Convidar leitores em O livro
      </Link>
    </>
  )
}

// A exclusão acontece num fluxo próprio, com backup e confirmação
const ExcluirConta = () => (
  <Button
    render={<Link href='/app/excluir-conta' />}
    nativeButton={false}
    variant='outline'
    size='cta'
    className='border-destructive/40 text-destructive hover:bg-destructive w-fit hover:text-white'
  >
    Excluir conta
  </Button>
)

// Traz de volta o card de primeiros passos da home, para quem marcou "Não ver novamente"
const PrimeirosPassosConfig = () => {
  const user = useUser()
  const updateUser = useUpdateUser()

  const show = () => {
    try {
      sessionStorage.removeItem('lvh:checklist-dispensado')
    } catch {}
    updateUser({ checklistHidden: false })
  }

  if (!user.checklistHidden) {
    return (
      <p className='text-muted-foreground text-sm'>
        O card aparece na home até você completar os passos. Você pode dispensá-lo por lá.
      </p>
    )
  }

  return (
    <div className='flex flex-col items-start gap-3'>
      <p className='text-muted-foreground text-sm'>Você escolheu não ver o card de primeiros passos.</p>
      <Button type='button' variant='outline' className='h-10 px-5' onClick={show}>
        Mostrar de novo na home
      </Button>
    </div>
  )
}

const Configuracoes = () => (
  <div className='mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-16 lg:py-16'>
    <h1 className='text-sm font-medium uppercase'>Configurações</h1>

    <Section
      id='pergunta-da-semana'
      title='Pergunta da semana'
      description='Um e-mail com a próxima pergunta do seu livro, no dia e no horário que combinam com a sua rotina.'
    >
      <PerguntaDaSemana />
    </Section>

    <Section
      title='Colaboradores'
      description='Pessoas que respondem perguntas junto com você. Cada uma vê só as perguntas liberadas e nunca as suas respostas.'
    >
      <Colaboradores />
    </Section>

    <Section title='Leitores do livro' description='Quem pode ler o seu livro fechado, pelo link pessoal.'>
      <Leitores />
    </Section>

    <Section title='Primeiros passos' description='O guia da home com os primeiros marcos da sua história.'>
      <PrimeirosPassosConfig />
    </Section>

    <Section
      title='Excluir conta'
      description='Apaga a sua conta, o seu livro e tudo o que você e os seus convidados escreveram. Não dá para desfazer.'
    >
      <ExcluirConta />
    </Section>
  </div>
)

export default Configuracoes
