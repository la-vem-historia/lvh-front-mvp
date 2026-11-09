'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/components/app/session'
import { overlayDescriptionClassName, overlayTitleClassName, textLinkClassName } from '@/components/app/page-heading'

import {
  deleteContribution,
  getCollaborators,
  getContributions,
  inviteCollaborator,
  removeCollaboratorFromQuestion,
  setContributionApproval
} from '@/lib/lvh/api'
import type { Collaborator, Contribution } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

export const collaboratorLink = (collaborator: Collaborator) =>
  `${window.location.origin}/colaborar/${collaborator.token}`

const actionClassName = 'cursor-pointer underline underline-offset-4'

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

const defaultMessage = (guest: string, owner: string, question: string) =>
  `Oi, ${guest.trim() || '[nome]'}! Estou escrevendo um livro de histórias da família no Lá Vem História e queria muito a sua versão de uma lembrança: “${question}”

É só abrir o link e responder do seu jeito, sem pressa. Você não vê a minha resposta, então pode contar tudo como você lembra.

Um abraço,
${owner}`

type ColaboradoresPerguntaProps = {
  questionId: number
  questionText: string
  // O convite abre num modal pelo botão de convidar, na barra de ferramentas da pergunta
  inviting: boolean
  onInvitingChange: (inviting: boolean) => void
  // Quantas pessoas têm algo nesta pergunta, para o botão de convidar mostrar
  onPeopleChange?: (count: number) => void
}

// Modal de outras lembranças: quem foi convidado para esta pergunta, as respostas para aprovar e o convite.
// Fica tudo no modal para a tela de escrever não precisar rolar
const ColaboradoresPergunta = ({
  questionId,
  questionText,
  inviting,
  onInvitingChange: setInviting,
  onPeopleChange
}: ColaboradoresPerguntaProps) => {
  const user = useUser()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [visibleLink, setVisibleLink] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  // null: segue a mensagem padrão, que acompanha o nome digitado
  const [customMessage, setCustomMessage] = useState<string | null>(null)
  const [sent, setSent] = useState<{ name: string; copied: boolean } | null>(null)
  const message = customMessage ?? defaultMessage(guestName, user.name, questionText)

  const load = useCallback(
    () =>
      Promise.all([getCollaborators(), getContributions(questionId)]).then(([nextCollaborators, nextContributions]) => {
        setCollaborators(nextCollaborators)
        setContributions(nextContributions)
        setLoaded(true)
      }),
    [questionId]
  )

  useEffect(() => {
    load()
  }, [load])

  const invited = collaborators.filter(collaborator => collaborator.questionIds.includes(questionId))
  const others = collaborators.filter(collaborator => !collaborator.questionIds.includes(questionId))
  // Quem perdeu o acesso mas deixou resposta continua aparecendo, até você apagar
  const formerIds = contributions
    .map(item => item.collaboratorId)
    .filter(id => !invited.some(collaborator => collaborator.id === id))
  const people = [...invited, ...collaborators.filter(collaborator => formerIds.includes(collaborator.id))]

  useEffect(() => {
    if (loaded) onPeopleChange?.(people.length)
  }, [loaded, people.length, onPeopleChange])

  const copy = async (collaborator: Collaborator) => {
    try {
      await navigator.clipboard.writeText(collaboratorLink(collaborator))
      setCopied(collaborator.id)
      window.setTimeout(() => setCopied(current => (current === collaborator.id ? null : current)), 2000)

      return true
    } catch {
      setVisibleLink(collaborator.id)

      return false
    }
  }

  const closeInvite = () => {
    setInviting(false)
    setGuestName('')
    setGuestEmail('')
    setCustomMessage(null)
    setError(null)
    setSent(null)
  }

  const invite = async () => {
    try {
      const collaborator = await inviteCollaborator({ name: guestName, email: guestEmail, questionId, message })

      // O modal continua aberto: a pessoa aparece na lista e o formulário fica pronto para mais um convite
      await load()
      setGuestName('')
      setGuestEmail('')
      setCustomMessage(null)
      setError(null)
      setSent({ name: collaborator.name, copied: await copy(collaborator) })
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    invite()
  }

  // Ações que apagam pedem um segundo clique para confirmar
  const confirmThen = (key: string, action: () => Promise<void>) => {
    if (confirming !== key) return setConfirming(key)
    setConfirming(null)
    action().then(load)
  }

  if (!loaded) return null

  return (
    <>
      <Dialog open={inviting} onOpenChange={open => !open && closeInvite()}>
        {/* Título e botões ficam parados; só o meio rola, com uma barra fina que não encosta nos cantos */}
        <DialogContent className='bg-cream flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden rounded-[1.5rem] p-0 sm:max-w-xl'>
          <div className='flex flex-col gap-2 px-6 pt-6 pr-14 pb-2 sm:px-8 sm:pt-8 sm:pr-14'>
            <DialogTitle className={overlayTitleClassName}>
              {people.length > 0 ? 'Outras lembranças' : 'Convidar para responder'}
            </DialogTitle>
            <DialogDescription className={overlayDescriptionClassName}>
              Convide alguém para contar a versão dele ou dela desta lembrança. A pessoa responde pelo próprio link e
              nunca vê a sua resposta.
            </DialogDescription>
          </div>

          <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-4 [scrollbar-color:var(--color-stone)_transparent] [scrollbar-width:thin] sm:px-8'>
            {people.length > 0 && (
              <ul className='flex flex-col gap-4'>
                {people.map(collaborator => {
                  const contribution = contributions.find(item => item.collaboratorId === collaborator.id)
                  const hasAccess = collaborator.questionIds.includes(questionId)
                  const hasText = Boolean(contribution?.text.trim())
                  const status = !hasAccess
                    ? 'Sem acesso a esta pergunta'
                    : !hasText
                      ? 'Aguardando resposta'
                      : contribution?.approved
                        ? 'No livro'
                        : 'Aguardando a sua aprovação'

                  return (
                    <li key={collaborator.id} className='border-border flex flex-col gap-3 rounded-2xl border p-5'>
                      <div className='flex flex-wrap items-baseline justify-between gap-2'>
                        <span className='font-medium'>{collaborator.name}</span>
                        <span
                          className={cn(
                            'text-xs',
                            contribution?.approved && hasText ? 'font-medium' : 'text-muted-foreground'
                          )}
                        >
                          {status}
                        </span>
                      </div>

                      {hasText && (
                        <p className='font-heading bg-sand rounded-xl p-4 text-base leading-relaxed whitespace-pre-line'>
                          {contribution?.text}
                        </p>
                      )}

                      <div className='text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-xs'>
                        {contribution && hasText && !contribution.approved && (
                          <Button
                            type='button'
                            variant='honey'
                            size='md'
                            onClick={() => setContributionApproval(contribution.id, true).then(load)}
                          >
                            Aprovar e incluir no livro
                          </Button>
                        )}
                        {contribution?.approved && hasText && (
                          <button
                            type='button'
                            onClick={() => setContributionApproval(contribution.id, false).then(load)}
                            className={actionClassName}
                          >
                            Tirar do livro
                          </button>
                        )}
                        {hasAccess && (
                          <button type='button' onClick={() => copy(collaborator)} className={actionClassName}>
                            {copied === collaborator.id ? 'Copiado!' : 'Copiar link'}
                          </button>
                        )}
                        {contribution && (
                          <button
                            type='button'
                            onClick={() =>
                              confirmThen(`apagar-${contribution.id}`, () => deleteContribution(contribution.id))
                            }
                            className={`${actionClassName} hover:text-destructive`}
                          >
                            {confirming === `apagar-${contribution.id}`
                              ? 'Clique de novo para apagar'
                              : 'Apagar resposta'}
                          </button>
                        )}
                        {hasAccess && (
                          <button
                            type='button'
                            onClick={() =>
                              confirmThen(`remover-${collaborator.id}`, () =>
                                removeCollaboratorFromQuestion(collaborator.id, questionId)
                              )
                            }
                            className={`${actionClassName} hover:text-destructive`}
                          >
                            {confirming === `remover-${collaborator.id}`
                              ? 'Clique de novo para remover'
                              : 'Remover desta pergunta'}
                          </button>
                        )}
                      </div>

                      {visibleLink === collaborator.id && (
                        <input
                          readOnly
                          value={collaboratorLink(collaborator)}
                          aria-label={`Link de ${collaborator.name}`}
                          onFocus={event => event.currentTarget.select()}
                          className='border-border bg-sand h-9 w-full rounded-full border px-4 text-xs'
                        />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {sent && (
              <p role='status' className='text-muted-foreground text-sm'>
                Convite enviado para {sent.name}.{' '}
                {sent.copied
                  ? 'O link também foi copiado, caso queira mandar por mensagem.'
                  : 'Se quiser mandar por mensagem, copie o link no card acima.'}
              </p>
            )}

            {people.length > 0 && (
              <h3 className='border-border border-t pt-6 text-base font-medium'>Convidar mais alguém</h3>
            )}
            {others.length > 0 && (
              <div className='flex flex-col gap-2'>
                <span className='text-sm font-medium'>Quem já colabora com você</span>
                <div className='flex flex-wrap gap-2'>
                  {others.map(collaborator => (
                    <button
                      key={collaborator.id}
                      type='button'
                      onClick={() => {
                        setGuestName(collaborator.name)
                        setGuestEmail(collaborator.email)
                      }}
                      className='border-border hover:border-foreground/40 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors'
                    >
                      + {collaborator.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form id={`convite-${questionId}`} onSubmit={handleSubmit} className='flex flex-col gap-4'>
              {others.length > 0 && <span className='text-sm font-medium'>Ou convide uma pessoa nova</span>}
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor={`colaborador-nome-${questionId}`}>Nome</Label>
                  <Input
                    id={`colaborador-nome-${questionId}`}
                    value={guestName}
                    onChange={event => setGuestName(event.target.value)}
                    required
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor={`colaborador-email-${questionId}`}>E-mail</Label>
                  <Input
                    id={`colaborador-email-${questionId}`}
                    type='email'
                    value={guestEmail}
                    onChange={event => setGuestEmail(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline justify-between gap-4'>
                  <Label htmlFor={`colaborador-mensagem-${questionId}`}>Mensagem</Label>
                  {customMessage !== null && (
                    <button
                      type='button'
                      onClick={() => setCustomMessage(null)}
                      className={textLinkClassName}
                    >
                      Voltar à mensagem padrão
                    </button>
                  )}
                </div>
                <Textarea
                  id={`colaborador-mensagem-${questionId}`}
                  value={message}
                  onChange={event => setCustomMessage(event.target.value)}
                  required
                  className='field-sizing-content min-h-40'
                />
                <p className='text-muted-foreground text-xs'>
                  Já escrevemos uma mensagem para você. Mude o que quiser.
                </p>
              </div>
              {error && <p className='text-destructive text-sm'>{error}</p>}
            </form>
            {/* Convite simulado: o e-mail não é enviado e o link só abre neste navegador */}
            <p className='text-muted-foreground text-xs'>
              Protótipo: nenhum e-mail é enviado, e o link só abre neste navegador.
            </p>
          </div>

          <div className='border-border/60 flex items-center gap-4 border-t px-6 py-4 sm:px-8'>
            <Button
              type='submit'
              form={`convite-${questionId}`}
              variant='honey'
              disabled={!guestName.trim() || !isValidEmail(guestEmail)}
              size='md'
            >
              Enviar convite
            </Button>
            <button
              type='button'
              onClick={closeInvite}
              className={textLinkClassName}
            >
              {people.length > 0 ? 'Fechar' : 'Cancelar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ColaboradoresPergunta
