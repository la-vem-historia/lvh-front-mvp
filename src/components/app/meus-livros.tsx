'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PartyPopperIcon, PlusIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Section from '@/components/app/section'
import { useRefreshUser, useUser } from '@/components/app/session'
import { pageTitleClassName, textLinkClassName } from '@/components/app/page-heading'
import ResgatarPresente from '@/components/app/resgatar-presente'

import {
  concludeBook,
  countAnsweredByBook,
  countCopyableAnswers,
  deleteBook,
  getBilling,
  getBooks,
  reopenBook,
  setActiveBook,
  setExtraSlots
} from '@/lib/lvh/api'
import { bookTitle, formatPrice, relationOf, bookTitleInline } from '@/lib/lvh/livros'
import { formatGiftDate } from '@/lib/lvh/presente'
import type { Billing, UserBook } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// Aviso dentro do card antes de uma ação: diz o que acontece e pede a confirmação
const Confirm = ({
  tone = 'neutral',
  children,
  action,
  onConfirm,
  onCancel,
  pending
}: {
  tone?: 'neutral' | 'danger'
  children: ReactNode
  action: string
  onConfirm: () => void
  onCancel: () => void
  pending: boolean
}) => (
  <div className='flex flex-col gap-4'>
    <div role='alert' className='bg-sand flex gap-3 rounded-2xl p-4 text-sm text-pretty'>
      {tone === 'danger' && <TriangleAlertIcon className='text-clay mt-0.5 size-4 shrink-0' aria-hidden='true' />}
      <p>{children}</p>
    </div>
    <div className='flex flex-wrap items-center gap-4'>
      <Button
        type='button'
        disabled={pending}
        onClick={onConfirm}
        variant={tone === 'danger' ? 'destructive' : 'honey'}
        size='md'
        className='w-fit'
      >
        {action}
      </Button>
      <button type='button' onClick={onCancel} className={textLinkClassName}>
        Cancelar
      </button>
    </div>
  </div>
)

// Depois de concluir: parabéns e o convite para o próximo livro, já com as respostas que dá para aproveitar
const Concluido = ({ book, onClose }: { book: UserBook; onClose: () => void }) => {
  const [copyable, setCopyable] = useState(0)

  useEffect(() => {
    countCopyableAnswers(book.id, book.role).then(setCopyable)
  }, [book])

  return (
    <div className='bg-moss text-cream flex flex-col gap-5 rounded-2xl p-6 sm:p-8'>
      <PartyPopperIcon className='size-7' aria-hidden='true' />
      <div className='flex flex-col gap-2'>
        <h2 className='font-heading text-2xl text-balance'>
          O {bookTitleInline(book)} está pronto.
        </h2>
        <p className='text-sm text-pretty opacity-85'>
          Ele continua online para quem você convidou, com as vozes e o PDF. Se quiser mudar algo, é só reabrir.
        </p>
      </div>
      <div className='flex flex-col gap-3 border-t border-current/20 pt-5'>
        <p className='font-heading text-xl'>Quer fazer um livro para outra pessoa?</p>
        {copyable > 0 && (
          <p className='text-sm opacity-85'>
            {plural(copyable, 'resposta sua já entra pronta', 'respostas suas já entram prontas')}. Faltam só as
            perguntas sobre vocês dois.
          </p>
        )}
        <div className='flex flex-wrap items-center gap-4'>
          <Button
            render={<Link href={`/app/livros/novo?de=${book.id}`} />}
            nativeButton={false}
            variant='honey'
            size='cta'
            className='w-fit'
          >
            Começar o próximo livro
          </Button>
          <button type='button' onClick={onClose} className='cursor-pointer text-sm underline underline-offset-4'>
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}

type Pending = { id: string; action: 'concluir' | 'excluir' } | null

const Livros = ({
  books,
  answered,
  billing,
  onChange
}: {
  books: UserBook[]
  answered: Record<string, number>
  billing: Billing
  onChange: () => void
}) => {
  const user = useUser()
  const refreshUser = useRefreshUser()
  const router = useRouter()
  const [confirming, setConfirming] = useState<Pending>(null)
  const [justConcluded, setJustConcluded] = useState<UserBook | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const freeSlot = billing.inProgress < billing.slots

  const run = async (task: () => Promise<unknown>) => {
    setPending(true)
    setError(null)

    try {
      await task()
      setConfirming(null)
      await refreshUser()
      onChange()
    } catch (reason) {
      setError((reason as Error).message)
    }

    setPending(false)
  }

  const open = async (id: string) => {
    await setActiveBook(id)
    await refreshUser()
    router.push('/app')
  }

  const conclude = (book: UserBook) =>
    run(async () => {
      setJustConcluded(await concludeBook(book.id))
    })

  return (
    <div className='flex flex-col gap-4'>
      {justConcluded && <Concluido book={justConcluded} onClose={() => setJustConcluded(null)} />}

      <ul className='flex flex-col gap-3'>
        {books.map(book => {
          const isActive = book.id === user.activeBookId
          const isDone = book.status === 'concluido'
          const count = answered[book.id] ?? 0
          const isConfirming = confirming?.id === book.id

          return (
            <li key={book.id} className='border-border flex flex-col gap-4 rounded-2xl border p-5 sm:p-6'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='flex flex-col gap-1'>
                  <span className='flex flex-wrap items-center gap-2'>
                    <span className='font-heading text-2xl'>{bookTitle(book)}</span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        isDone ? 'bg-honey text-foreground' : 'bg-sand text-foreground'
                      )}
                    >
                      {isDone ? 'Concluído' : 'Em andamento'}
                    </span>
                    {isActive && (
                      <span className='bg-moss text-cream rounded-full px-2.5 py-0.5 text-xs font-medium'>
                        Aberto agora
                      </span>
                    )}
                  </span>
                  <span className='text-muted-foreground text-sm'>
                    Você conta como {book.role.toLowerCase()} · {relationOf(book.role, book.recipientGender)} ·{' '}
                    {plural(count, 'resposta', 'respostas')}
                    {isDone && book.concludedAt && ` · concluído em ${formatDate(book.concludedAt)}`}
                  </span>
                </div>
                {!isConfirming && (
                  <div className='flex flex-wrap items-center gap-4'>
                    {!isActive && (
                      <Button
                        type='button'
                        variant='outline'
                        size='md'
                        onClick={() => open(book.id)}
                      >
                        {isDone ? 'Ler' : 'Abrir'}
                      </Button>
                    )}
                    {!isDone && count > 0 && (
                      <button
                        type='button'
                        onClick={() => setConfirming({ id: book.id, action: 'concluir' })}
                        className={textLinkClassName}
                      >
                        Concluir livro
                      </button>
                    )}
                    {isDone && (
                      <button
                        type='button'
                        disabled={!freeSlot || pending}
                        title={freeSlot ? undefined : 'Todas as vagas estão em uso'}
                        onClick={() => run(() => reopenBook(book.id))}
                        className={textLinkClassName}
                      >
                        Reabrir para editar
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => setConfirming({ id: book.id, action: 'excluir' })}
                      className={textLinkClassName}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              {isConfirming && confirming.action === 'concluir' && (
                <Confirm
                  action={`Concluir o ${bookTitleInline(book)}`}
                  onConfirm={() => conclude(book)}
                  onCancel={() => setConfirming(null)}
                  pending={pending}
                >
                  <strong className='font-medium'>
                    O livro fica pronto como está, com {plural(count, 'resposta', 'respostas')}.
                  </strong>{' '}
                  Ele continua online, sem custo, para quem você convidou, e libera a vaga para o próximo livro. Se
                  quiser mudar algo depois, é só reabrir.
                </Confirm>
              )}

              {isConfirming && confirming.action === 'excluir' && (
                <Confirm
                  tone='danger'
                  action={`Excluir o ${bookTitleInline(book)}`}
                  onConfirm={() => run(() => deleteBook(book.id))}
                  onCancel={() => setConfirming(null)}
                  pending={pending}
                >
                  <strong className='font-medium'>
                    {count > 0
                      ? `As ${plural(count, 'resposta', 'respostas')} deste livro serão apagadas`
                      : 'Este livro será apagado'}
                  </strong>
                  , com fotos, áudios, leitores convidados e colaboradores. Os outros livros não mudam. Isso não pode
                  ser desfeito.
                </Confirm>
              )}
            </li>
          )
        })}
      </ul>

      {error && (
        <p role='alert' className='text-destructive text-sm'>
          {error}
        </p>
      )}

      <Button
        render={<Link href='/app/livros/novo' />}
        nativeButton={false}
        variant='honey'
        size='cta'
        className='w-fit'
      >
        <PlusIcon aria-hidden='true' />
        Novo livro
      </Button>
    </div>
  )
}

const Cobranca = ({ billing, onChange }: { billing: Billing; onChange: () => void }) => {
  const [error, setError] = useState<string | null>(null)
  const freeSlots = billing.slots - billing.inProgress

  const changeSlots = async (extraSlots: number) => {
    try {
      setError(null)
      await setExtraSlots(extraSlots)
      onChange()
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-3'>
        <span className='text-sm font-medium'>Livros ao mesmo tempo</span>
        <p className='text-base'>
          {plural(billing.inProgress, 'livro em andamento', 'livros em andamento')} de{' '}
          {plural(billing.slots, 'vaga', 'vagas')}
        </p>
        <div className='flex flex-wrap items-center gap-4'>
          <Button
            type='button'
            variant='outline'
            size='md'
            onClick={() => changeSlots(billing.extraSlots + 1)}
          >
            Adicionar vaga · +{formatPrice(billing.extraPrice)}/mês
          </Button>
          {billing.extraSlots > 0 && freeSlots > 0 && (
            <button type='button' onClick={() => changeSlots(billing.extraSlots - 1)} className={textLinkClassName}>
              Tirar uma vaga livre
            </button>
          )}
        </div>
        {error && (
          <p role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}
      </div>

      <ResgatarPresente giftUntil={billing.giftUntil} onChange={onChange} />

      <div className='flex flex-col gap-3'>
        <span className='text-sm font-medium'>Sua mensalidade</span>
        <ul className='border-border flex flex-col rounded-2xl border'>
          <li className='flex items-center justify-between gap-4 px-5 py-4 text-sm'>
            <span>
              Assinatura
              <span className='text-muted-foreground'> · inclui 1 livro em andamento</span>
            </span>
            <span className='tabular-nums'>{formatPrice(billing.base)}</span>
          </li>
          {billing.extraSlots > 0 && (
            <li className='border-border flex items-center justify-between gap-4 border-t px-5 py-4 text-sm'>
              <span>
                {plural(billing.extraSlots, 'vaga a mais', 'vagas a mais')}
                <span className='text-muted-foreground'> · {formatPrice(billing.extraPrice)} cada</span>
              </span>
              <span className='tabular-nums'>{formatPrice(billing.extraSlots * billing.extraPrice)}</span>
            </li>
          )}
          {billing.giftUntil && (
            <li className='border-border flex items-center justify-between gap-4 border-t px-5 py-4 text-sm'>
              <span>
                Presente
                <span className='text-muted-foreground'> · até {formatGiftDate(billing.giftUntil)}</span>
              </span>
              <span className='tabular-nums'>−{formatPrice(billing.base)}</span>
            </li>
          )}
          <li className='border-foreground flex items-center justify-between gap-4 border-t px-5 py-4 text-base font-medium'>
            <span>Total por mês</span>
            <span className='tabular-nums'>
              {formatPrice(billing.giftUntil ? billing.total - billing.base : billing.total)}
            </span>
          </li>
        </ul>
        <p className='text-muted-foreground text-xs'>Protótipo: nenhuma cobrança é feita.</p>
      </div>
    </div>
  )
}

const MeusLivros = () => {
  const [books, setBooks] = useState<UserBook[] | null>(null)
  const [answered, setAnswered] = useState<Record<string, number>>({})
  const [billing, setBilling] = useState<Billing | null>(null)

  const load = useCallback(() => {
    Promise.all([getBooks(), countAnsweredByBook(), getBilling()]).then(([nextBooks, counts, nextBilling]) => {
      setBooks(nextBooks)
      setAnswered(counts)
      setBilling(nextBilling)
    })
  }, [])

  useEffect(load, [load])

  if (!books || !billing) return null

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-16 lg:py-16'>
      <h1 className={pageTitleClassName}>Meus livros</h1>

      <Section
        title='Livros'
        description='Cada livro é seu para uma pessoa. Escreva um por vez; ao concluir, ele fica pronto e libera a vaga para o próximo.'
      >
        <Livros books={books} answered={answered} billing={billing} onChange={load} />
      </Section>

      <Section
        title='Pagamento'
        description='A assinatura cobre o livro que você está escrevendo. Quer escrever dois ao mesmo tempo? Adicione uma vaga.'
      >
        <Cobranca billing={billing} onChange={load} />
      </Section>
    </div>
  )
}

export default MeusLivros
