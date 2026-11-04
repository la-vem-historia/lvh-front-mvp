'use client'

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/components/app/session'
import { EASE } from '@/components/landing/motion'

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

const fieldClassName = 'bg-background h-12 px-5 text-base'

export const collaboratorLink = (collaborator: Collaborator) =>
  `${window.location.origin}/colaborar/${collaborator.token}`

const actionClassName = 'cursor-pointer underline underline-offset-4'

// Abre e fecha com a mesma animação (altura e opacidade). A margem negativa compensa o espaço
// (gap) do container, para nada pular quando o bloco entra ou sai
const Collapse = ({ gap, onOpened, children }: { gap: number; onOpened?: () => void; children: ReactNode }) => (
  <motion.div
    initial={{ height: 0, opacity: 0, marginTop: -gap }}
    animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
    exit={{ height: 0, opacity: 0, marginTop: -gap }}
    transition={{ duration: 0.45, ease: EASE }}
    onAnimationComplete={definition => {
      if ((definition as { height?: unknown }).height === 'auto') onOpened?.()
    }}
    className='overflow-hidden'
  >
    {children}
  </motion.div>
)

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

// Depois de abrir, rola só o necessário para o botão Enviar convite aparecer acima da barra de navegação
const revealSubmit = () =>
  document.getElementById('convite-enviar')?.scrollIntoView({ behavior: 'smooth', block: 'end' })

const defaultMessage = (guest: string, owner: string, question: string) =>
  `Oi, ${guest.trim() || '[nome]'}! Estou escrevendo a minha história no Lá Vem História e queria muito a sua versão de uma lembrança: “${question}”

É só abrir o link e responder do seu jeito, sem pressa. Você não vê a minha resposta, então pode contar tudo como você lembra.

Um abraço,
${owner}`

type ColaboradoresPerguntaProps = {
  questionId: number
  questionText: string
  // O convite abre pelo botão "Convidar para responder", na linha de ferramentas da pergunta
  inviting: boolean
  onInvitingChange: (inviting: boolean) => void
}

// Respostas de convidados para uma pergunta, vistas por quem escreve o livro.
// Só aparece quando há convidados ou um convite em andamento
const ColaboradoresPergunta = ({
  questionId,
  questionText,
  inviting,
  onInvitingChange: setInviting
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
  }

  const invite = async () => {
    try {
      const collaborator = await inviteCollaborator({ name: guestName, email: guestEmail, questionId, message })

      await load()
      closeInvite()
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

  // Antes de carregar não anima: quem já tem convidados vê a seção aberta, sem efeito na entrada
  if (!loaded) return null

  const visible = people.length > 0 || inviting || Boolean(sent)

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <Collapse key='colaboradores' gap={40} onOpened={revealSubmit}>
          <section id='colaboradores' className='border-border flex scroll-mt-28 flex-col gap-6 border-t pt-8'>
            <div className='flex flex-col gap-2'>
              <h2 className='text-base font-medium'>Outras lembranças</h2>
              <p className='text-muted-foreground text-sm text-pretty'>
                Convide alguém para contar a versão dele ou dela desta história. A pessoa responde pelo próprio link e
                nunca vê a sua resposta.
              </p>
            </div>

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
                            className='h-9 px-4 text-xs'
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

            <AnimatePresence initial={false}>
              {inviting && (
                <Collapse key='convite' gap={24} onOpened={revealSubmit}>
                  <div className='border-border flex flex-col gap-5 rounded-2xl border p-5'>
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

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                      {others.length > 0 && <span className='text-sm font-medium'>Ou convide uma pessoa nova</span>}
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor={`colaborador-nome-${questionId}`}>Nome</Label>
                          <Input
                            id={`colaborador-nome-${questionId}`}
                            value={guestName}
                            onChange={event => setGuestName(event.target.value)}
                            required
                            className={fieldClassName}
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
                            className={fieldClassName}
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
                              className='text-muted-foreground cursor-pointer text-xs underline underline-offset-4'
                            >
                              Voltar à mensagem padrão
                            </button>
                          )}
                        </div>
                        <textarea
                          id={`colaborador-mensagem-${questionId}`}
                          value={message}
                          onChange={event => setCustomMessage(event.target.value)}
                          required
                          className='border-border bg-background focus-visible:border-ring field-sizing-content min-h-40 w-full resize-none rounded-2xl border p-4 text-base leading-relaxed outline-none'
                        />
                        <p className='text-muted-foreground text-xs'>
                          Já escrevemos uma mensagem para você. Mude o que quiser.
                        </p>
                      </div>
                      {error && <p className='text-destructive text-sm'>{error}</p>}
                      <div className='flex items-center gap-4'>
                        <Button
                          id='convite-enviar'
                          type='submit'
                          variant='honey'
                          disabled={!guestName.trim() || !isValidEmail(guestEmail)}
                          className='h-10 scroll-mb-28 px-5'
                        >
                          Enviar convite
                        </Button>
                        <button
                          type='button'
                          onClick={closeInvite}
                          className='text-muted-foreground cursor-pointer text-sm underline underline-offset-4'
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                    {/* Convite simulado: o e-mail não é enviado e o link só abre neste navegador */}
                    <p className='text-muted-foreground text-xs'>
                      Protótipo: nenhum e-mail é enviado, e o link só abre neste navegador.
                    </p>
                  </div>
                </Collapse>
              )}
            </AnimatePresence>

            {!inviting && sent && (
              <p role='status' className='text-muted-foreground text-sm'>
                Convite enviado para {sent.name}.{' '}
                {sent.copied
                  ? 'O link também foi copiado, caso queira mandar por mensagem.'
                  : 'Se quiser mandar por mensagem, copie o link no card acima.'}
              </p>
            )}
          </section>
        </Collapse>
      )}
    </AnimatePresence>
  )
}

export default ColaboradoresPergunta
