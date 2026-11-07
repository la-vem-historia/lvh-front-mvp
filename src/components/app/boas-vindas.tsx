'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AvisePapeis from '@/components/app/avise-papeis'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useRefreshUser, useUser } from '@/components/app/session'

import { countCopyableAnswers, createBook, getBilling, getBooks, setExtraSlots } from '@/lib/lvh/api'
import { bookTitle, formatPrice } from '@/lib/lvh/livros'
import type { Billing, RecipientGender, Role, UserBook } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

type Relation = 'filho' | 'filha' | 'neto' | 'neta'

const relations: {
  value: Relation
  label: string
  gender: RecipientGender
  grand: boolean
}[] = [
  { value: 'filho', label: 'Filho', gender: 'menino', grand: false },
  { value: 'filha', label: 'Filha', gender: 'menina', grand: false },
  { value: 'neto', label: 'Neto', gender: 'menino', grand: true },
  { value: 'neta', label: 'Neta', gender: 'menina', grand: true }
]

// Cada papel ganha uma cor dos cards de planos da landing quando é escolhido
const roleStyles: Record<Role, string> = {
  Pai: 'bg-olive text-cream border-olive',
  Mãe: 'bg-lilac text-ink border-lilac',
  Avô: 'bg-moss text-cream border-moss',
  Avó: 'bg-clay text-cream border-clay'
}

const isFeminine = (role: Role) => role === 'Mãe' || role === 'Avó'

// Botão de escolha única, no mesmo desenho dos cards do onboarding, em tamanho de pílula
const Choice = ({
  name,
  checked,
  onChange,
  selectedClassName = 'bg-moss text-cream border-moss',
  children
}: {
  name: string
  checked: boolean
  onChange: () => void
  selectedClassName?: string
  children: ReactNode
}) => (
  <label
    className={cn(
      'has-focus-visible:ring-ring/50 flex cursor-pointer items-center gap-3 rounded-full border px-5 py-3 text-base transition-colors duration-200 has-focus-visible:ring-3',
      checked ? selectedClassName : 'border-border hover:border-foreground/40'
    )}
  >
    <input type='radio' name={name} checked={checked} onChange={onChange} required className='peer sr-only' />
    <span className='border-border size-4 rounded-full border peer-checked:hidden' aria-hidden='true' />
    <CircleCheckIcon aria-hidden='true' className='hidden size-4 peer-checked:block' />
    {children}
  </label>
)

const Step = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <fieldset className='flex flex-col gap-4'>
    <legend className='flex flex-col gap-1'>
      <span className='font-heading text-2xl'>{title}</span>
      {hint && <span className='text-muted-foreground text-sm'>{hint}</span>}
    </legend>
    {children}
  </fieldset>
)

// Cria um livro: para quem é, a relação e, se já houver outro livro, de onde aproveitar respostas.
// É o onboarding da conta nova e também a página de novo livro
const BoasVindas = ({ newBook = false, copyFromId }: { newBook?: boolean; copyFromId?: string }) => {
  const user = useUser()
  const refreshUser = useRefreshUser()
  const router = useRouter()
  const [books, setBooks] = useState<UserBook[]>([])
  const [name, setName] = useState('')
  const [relation, setRelation] = useState<Relation | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [childOf, setChildOf] = useState<'filho' | 'filha' | null>(null)
  const [copyFrom, setCopyFrom] = useState<string>(copyFromId ?? '')
  const [copyable, setCopyable] = useState<Record<string, number>>({})
  const [billing, setBilling] = useState<Billing | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chosen = relations.find(item => item.value === relation)
  const grand = chosen?.grand ?? false
  const roleOptions: Role[] = grand ? ['Avó', 'Avô'] : ['Mãe', 'Pai']
  const firstName = name.trim().split(/\s+/)[0]
  const who = firstName || 'Essa pessoa'

  useEffect(() => {
    getBooks().then(setBooks)
    getBilling().then(setBilling)
  }, [])

  // Quem já tem um livro não precisa dizer de novo se é mulher ou homem: o papel vem pronto
  const suggestedRole = (grandparent: boolean): Role | null => {
    if (!books.length) return null

    const feminine = isFeminine(books[books.length - 1].role)

    return grandparent ? (feminine ? 'Avó' : 'Avô') : feminine ? 'Mãe' : 'Pai'
  }

  useEffect(() => {
    if (!role || !books.length) return

    Promise.all(books.map(book => countCopyableAnswers(book.id, role))).then(counts =>
      setCopyable(Object.fromEntries(books.map((book, index) => [book.id, counts[index]])))
    )
  }, [role, books])

  const ready = Boolean(name.trim() && chosen && role && (!grand || childOf))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!ready || !chosen || !role) return

    setPending(true)

    try {
      await createBook({
        role,
        recipientName: name,
        recipientGender: chosen.gender,
        childOf: grand ? (childOf ?? undefined) : undefined,
        copyFrom: copyFrom || undefined
      })
      await refreshUser()
      // Vai para a home, com os capítulos fechados, para a pessoa ver o todo antes de responder
      router.replace('/app')
    } catch (reason) {
      setError((reason as Error).message)
      setPending(false)
    }
  }

  const inProgress = books.filter(book => book.status !== 'concluido')

  const addSlot = async () => {
    if (!billing) return

    await setExtraSlots(billing.extraSlots + 1)
    setBilling(await getBilling())
  }

  // Sem vaga livre: antes do formulário, as duas saídas. Concluir o livro atual ou pagar uma vaga a mais
  if (newBook && billing && billing.inProgress >= billing.slots) {
    const current = inProgress.map(book => bookTitle(book).replace(/^Para/, 'para')).join(' e ')

    return (
      <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:py-16'>
        <div className='flex flex-col gap-3'>
          <span className={eyebrowClassName}>Novo livro</span>
          <h1 className={pageTitleClassName}>Você já está escrevendo o livro {current}.</h1>
          <p className='text-muted-foreground text-base text-pretty'>
            A assinatura inclui um livro em andamento por vez. Para começar outro agora, escolha um caminho.
          </p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='border-border flex flex-col justify-between gap-6 rounded-[1.5rem] border p-6'>
            <div className='flex flex-col gap-2'>
              <span className='font-heading text-2xl'>Concluir o atual</span>
              <span className='text-muted-foreground text-sm text-pretty'>
                O livro fica pronto, continua online sem custo e as respostas sobre a sua vida passam para o próximo.
              </span>
            </div>
            <Button
              render={<Link href='/app/livros' />}
              nativeButton={false}
              variant='honey'
              size='cta'
              className='w-fit'
            >
              Ir para Meus livros
            </Button>
          </div>
          <div className='border-border flex flex-col justify-between gap-6 rounded-[1.5rem] border p-6'>
            <div className='flex flex-col gap-2'>
              <span className='font-heading text-2xl'>Escrever dois ao mesmo tempo</span>
              <span className='text-muted-foreground text-sm text-pretty'>
                Adicione uma vaga por {formatPrice(billing.extraPrice)} por mês. Dá para tirar depois, quando um dos
                livros for concluído.
              </span>
            </div>
            <Button type='button' variant='outline' size='cta' className='w-fit' onClick={addSlot}>
              Adicionar vaga
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:py-16'>
      <div className='flex flex-col gap-3'>
        <span className={eyebrowClassName}>{newBook ? 'Novo livro' : `Boas-vindas, ${user.name}`}</span>
        <h1 className={pageTitleClassName}>Para quem é este livro?</h1>
        <p className='text-muted-foreground text-base'>
          Cada livro é seu para uma pessoa. As perguntas chegam como se ela estivesse perguntando.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='livro-nome' className='text-sm font-medium'>
            Nome de quem vai receber
          </label>
          <Input
            id='livro-nome'
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder='Ex.: Tom'
            autoComplete='off'
            required
            className='bg-background h-12 max-w-sm px-5 text-base'
          />
        </div>

        <Step title={`Quem é ${firstName || 'essa pessoa'} para você?`}>
          <div className='flex flex-wrap gap-3'>
            {relations.map(option => (
              <Choice
                key={option.value}
                name='relation'
                checked={relation === option.value}
                onChange={() => {
                  setRelation(option.value)
                  setChildOf(null)
                  setRole(suggestedRole(option.grand))
                }}
              >
                {option.label}
              </Choice>
            ))}
          </div>
        </Step>

        {chosen && (
          <Step title='E você é…' hint='As perguntas se adaptam a quem está contando.'>
            <div className='flex flex-wrap gap-3'>
              {roleOptions.map(option => (
                <Choice
                  key={option}
                  name='role'
                  checked={role === option}
                  onChange={() => setRole(option)}
                  selectedClassName={roleStyles[option]}
                >
                  {option}
                </Choice>
              ))}
            </div>
          </Step>
        )}

        {/* Avós: as perguntas falam de "meu pai" ou "minha mãe" e precisam saber qual dos dois é seu filho */}
        {grand && (
          <Step
            title={`${who} é ${chosen?.gender === 'menina' ? 'filha' : 'filho'} do seu…`}
            hint='Assim as perguntas sabem se falam do pai ou da mãe.'
          >
            <div className='flex flex-wrap gap-3'>
              <Choice name='child-of' checked={childOf === 'filho'} onChange={() => setChildOf('filho')}>
                Filho
              </Choice>
              <Choice name='child-of' checked={childOf === 'filha'} onChange={() => setChildOf('filha')}>
                Filha
              </Choice>
            </div>
          </Step>
        )}

        {books.length > 0 && role && (
          <Step
            title='Aproveitar respostas de outro livro?'
            hint='Copiamos as respostas sobre a sua vida, com fotos e áudios. As perguntas sobre vocês dois ficam em branco.'
          >
            <div className='flex flex-col gap-3'>
              <Choice name='copy-from' checked={copyFrom === ''} onChange={() => setCopyFrom('')}>
                Começar em branco
              </Choice>
              {books.map(book => (
                <Choice
                  key={book.id}
                  name='copy-from'
                  checked={copyFrom === book.id}
                  onChange={() => setCopyFrom(book.id)}
                >
                  Aproveitar do livro {bookTitle(book).replace(/^Para/, 'para')}
                  <span className='opacity-70'>
                    · {copyable[book.id] ?? 0} {copyable[book.id] === 1 ? 'resposta' : 'respostas'}
                  </span>
                </Choice>
              ))}
            </div>
          </Step>
        )}

        {!newBook && <AvisePapeis />}

        {error && (
          <p role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}

        <div className='flex flex-wrap items-center gap-4'>
          <Button type='submit' variant='honey' size='cta' disabled={pending || !ready} className='w-fit'>
            {firstName ? `Começar o livro para ${firstName}` : 'Começar o livro'}
          </Button>
          {newBook && (
            <Button type='button' variant='outline' size='cta' className='w-fit' onClick={() => router.back()}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default BoasVindas
