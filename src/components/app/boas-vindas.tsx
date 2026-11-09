'use client'

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, BookCopyIcon, CircleCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
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
  { value: 'filho', label: 'Meu filho', gender: 'menino', grand: false },
  { value: 'filha', label: 'Minha filha', gender: 'menina', grand: false },
  { value: 'neto', label: 'Meu neto', gender: 'menino', grand: true },
  { value: 'neta', label: 'Minha neta', gender: 'menina', grand: true }
]

const isFeminine = (role: Role) => role === 'Mãe' || role === 'Avó'

// Botão de escolha única em forma de pílula. Escolhido, fica sempre no verde-musgo, em todas as perguntas.
// Escolher não avança: a pessoa confere e clica em Continuar
const Choice = ({
  name,
  checked,
  onChange,
  children
}: {
  name: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}) => (
  <label
    className={cn(
      'has-focus-visible:ring-ring/50 flex cursor-pointer items-center gap-3 rounded-full border px-5 py-3 text-base transition-colors duration-200 has-focus-visible:ring-3',
      checked ? 'bg-moss text-cream border-moss' : 'bg-field border-input hover:border-foreground/60'
    )}
  >
    <input type='radio' name={name} checked={checked} onChange={onChange} className='peer sr-only' />
    <span className='border-input size-4 rounded-full border peer-checked:hidden' aria-hidden='true' />
    <CircleCheckIcon aria-hidden='true' className='hidden size-4 peer-checked:block' />
    {children}
  </label>
)

type StepId = 'nome' | 'relacao' | 'papel' | 'pai' | 'aproveitar'

// Cria um livro: para quem é, a relação e, se já houver outro livro, de onde aproveitar respostas.
// É o onboarding da conta nova e também a página de novo livro
// Sem o cabeçalho do app nessas telas, o respiro de cima soma os 80px que ele ocupava
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
  const [aboutMore, setAboutMore] = useState(false)
  const [copyable, setCopyable] = useState<Record<string, number>>({})
  const [billing, setBilling] = useState<Billing | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)

  const chosen = relations.find(item => item.value === relation)
  const grand = chosen?.grand ?? false
  const roleOptions: Role[] = grand ? ['Avó', 'Avô'] : ['Mãe', 'Pai']
  const firstName = name.trim().split(/\s+/)[0]
  const feminine = chosen?.gender === 'menina'
  const who = firstName || 'Essa pessoa'

  useEffect(() => {
    getBooks().then(list => {
      // O onboarding é só para a primeira vez. Quem já tem livro e cai aqui vai para Novo livro,
      // que mostra as vagas da assinatura antes de qualquer pergunta
      if (!newBook && list.length > 0) router.replace('/app/livros/novo')
      else setBooks(list)
    })
    getBilling().then(setBilling)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Livros de onde dá para aproveitar alguma resposta. Os que não têm nada para copiar nem aparecem
  const copySources = books.filter(book => (copyable[book.id] ?? 0) > 0)

  // Uma pergunta por tela. Avós ganham a pergunta do pai ou da mãe do neto. O onboarding só configura o primeiro
  // livro; em Novo livro, a pergunta de aproveitar respostas aparece só quando há o que aproveitar
  const steps: StepId[] = [
    'relacao',
    'nome',
    'papel',
    ...(grand ? (['pai'] as const) : []),
    ...(newBook && copySources.length > 0 ? (['aproveitar'] as const) : [])
  ]
  const index = Math.min(stepIndex, steps.length - 1)
  const step = steps[index]
  const isLast = index === steps.length - 1
  const answered = {
    nome: Boolean(name.trim()),
    relacao: Boolean(chosen),
    papel: Boolean(role),
    pai: Boolean(childOf),
    aproveitar: true
  }[step]

  // A cada passo, o foco vai para a pergunta, para quem usa leitor de tela ouvir o que mudou
  useEffect(() => {
    // No passo do nome, o foco fica no campo (autoFocus), para já digitar
    if (stepIndex > 0 && steps[Math.min(stepIndex, steps.length - 1)] !== 'nome') heading.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex])

  const next = () => setStepIndex(Math.min(index + 1, steps.length - 1))

  const startLabel = firstName ? `Começar o livro para ${firstName}` : 'Começar o livro'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!answered) return

    if (!isLast) {
      next()

      return
    }

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
      <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 pt-30 pb-10 sm:px-6 lg:pt-36 lg:pb-16'>
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

  const questions: Record<StepId, { title: string; hint?: string; content: ReactNode }> = {
    nome: {
      title: `Qual é o nome ${feminine ? 'dela' : 'dele'}?`,
      hint: `Vai na capa e nas perguntas, como se ${feminine ? 'ela' : 'ele'} estivesse perguntando.`,
      content: (
        <div className='flex flex-col gap-2'>
          <label htmlFor='livro-nome' className='text-sm font-medium'>
            Nome
          </label>
          <Input
            id='livro-nome'
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder={feminine ? 'Ex.: Ana' : 'Ex.: Tom'}
            autoComplete='off'
            autoFocus
            className='bg-field h-12 max-w-sm px-5 text-base'
          />
        </div>
      )
    },
    relacao: {
      title: 'Para quem você está contando a sua história?',
      hint: 'Pense em quem vai ler. Como se a pessoa estivesse te perguntando.',
      content: (
        <div className='flex flex-col gap-10'>
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
          {!newBook && <AvisePapeis />}
          {/* Quem tem mais filhos ou netos costuma perguntar isso aqui: a resposta abre num modal, sem tirar do passo */}
          {!newBook && (
            <button
              type='button'
              onClick={() => setAboutMore(true)}
              className='group bg-sand hover:bg-stone flex w-fit cursor-pointer items-center gap-3 rounded-full py-2.5 pr-4 pl-3 text-left text-sm transition-colors'
            >
              <BookCopyIcon aria-hidden='true' className='text-moss size-4 shrink-0' />
              E se eu quiser escrever para mais de uma pessoa?
              <ArrowRightIcon
                aria-hidden='true'
                className='size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5'
              />
            </button>
          )}
        </div>
      )
    },
    papel: {
      // "O que você é da Lara?", como se fala em casa; sem nome, "dela" ou "dele"
      title: `O que você é ${firstName ? `${feminine ? 'da' : 'do'} ${firstName}` : feminine ? 'dela' : 'dele'}?`,
      hint: 'As perguntas se adaptam a quem está contando.',
      content: (
        <div className='flex flex-wrap gap-3'>
          {roleOptions.map(option => (
            <Choice key={option} name='role' checked={role === option} onChange={() => setRole(option)}>
              {option}
            </Choice>
          ))}
        </div>
      )
    },
    // Avós: as perguntas falam de "meu pai" ou "minha mãe" e precisam saber qual dos dois é seu filho
    pai: {
      title: `${who} é ${chosen?.gender === 'menina' ? 'filha' : 'filho'} do seu…`,
      hint: 'Assim as perguntas sabem se falam do pai ou da mãe.',
      content: (
        <div className='flex flex-wrap gap-3'>
          <Choice name='child-of' checked={childOf === 'filho'} onChange={() => setChildOf('filho')}>
            Filho
          </Choice>
          <Choice name='child-of' checked={childOf === 'filha'} onChange={() => setChildOf('filha')}>
            Filha
          </Choice>
        </div>
      )
    },
    aproveitar: {
      title: 'Aproveitar respostas de outro livro?',
      hint: 'Copiamos as respostas sobre a sua vida, com fotos e áudios. As perguntas sobre vocês dois ficam em branco.',
      content: (
        <div className='flex flex-col items-start gap-3'>
          <Choice name='copy-from' checked={copyFrom === ''} onChange={() => setCopyFrom('')}>
            Começar em branco
          </Choice>
          {copySources.map(book => (
            <Choice key={book.id} name='copy-from' checked={copyFrom === book.id} onChange={() => setCopyFrom(book.id)}>
              Aproveitar do livro {bookTitle(book).replace(/^Para/, 'para')}
              <span className='opacity-70'>
                · {copyable[book.id] ?? 0} {copyable[book.id] === 1 ? 'resposta' : 'respostas'}
              </span>
            </Choice>
          ))}
        </div>
      )
    }
  }

  const question = questions[step]

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 pt-16 pb-40 sm:px-6 sm:pt-30 lg:pt-36'>
      {/* Onde a pessoa está: o nome da etapa e uma barra com um traço por pergunta */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-baseline justify-between gap-4'>
          <span className={eyebrowClassName}>{newBook ? 'Novo livro' : `Boas-vindas, ${user.name}`}</span>
          <span className='text-muted-foreground text-sm tabular-nums'>
            Passo {index + 1} de {steps.length}
          </span>
        </div>
        <div aria-hidden='true' className='flex gap-1.5'>
          {steps.map((id, position) => (
            <span
              key={id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                position <= index ? 'bg-moss' : 'bg-stone'
              )}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className='mt-16 flex flex-col gap-10 lg:mt-24'>
        <fieldset
          key={step}
          aria-labelledby='passo-titulo'
          className='animate-in fade-in flex flex-col gap-10 duration-300 lg:gap-14'
        >
          <div className='flex flex-col gap-4'>
            <h1 id='passo-titulo' ref={heading} tabIndex={-1} className={cn(pageTitleClassName, 'outline-none')}>
              {question.title}
            </h1>
            {question.hint && <p className='text-muted-foreground text-base text-pretty'>{question.hint}</p>}
          </div>
          {question.content}
        </fieldset>

        {error && (
          <p role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}

        {/* Rodapé fixo: Continuar fica no mesmo lugar nos três passos, não importa a altura do conteúdo.
            O botão principal vem primeiro; Voltar fica ao lado, discreto, e não empilha por cima no celular */}
        <div className='bg-background/90 fixed inset-x-0 bottom-0 z-40 backdrop-blur'>
          <div className='mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-6 gap-y-4 px-4 py-6 sm:px-6 lg:py-10'>
            <Button type='submit' variant='honey' size='cta' disabled={pending || !answered} className='w-fit'>
              {isLast ? startLabel : 'Continuar'}
            </Button>
            {index > 0 && (
              <button
                type='button'
                onClick={() => setStepIndex(index - 1)}
                className='text-muted-foreground hover:text-foreground cursor-pointer text-base underline underline-offset-4 transition-colors'
              >
                Voltar
              </button>
            )}
            {newBook && index === 0 && (
              <Button type='button' variant='outline' size='cta' className='w-fit' onClick={() => router.back()}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </form>

      <Dialog open={aboutMore} onOpenChange={setAboutMore}>
        <DialogContent className='bg-cream flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-y-auto rounded-[1.5rem] p-6 sm:max-w-lg sm:p-8'>
          <div className='flex flex-col gap-2 pr-8'>
            <DialogTitle className='font-heading text-2xl'>Um livro para cada pessoa</DialogTitle>
            <DialogDescription className='text-muted-foreground text-base text-pretty'>
              Depois de começar este primeiro livro, você pode criar quantos quiser: um para cada filho ou neto, com
              respostas pensadas para cada um.
            </DialogDescription>
          </div>
          <ol className='flex flex-col gap-5'>
            {[
              {
                title: 'Comece por uma pessoa',
                text: 'Agora você escolhe para quem é o primeiro livro. Os próximos você cria depois, em Meus livros.'
              },
              {
                title: 'O que é sobre você vai junto',
                text: 'No livro seguinte, as respostas sobre a sua vida, como a infância, os amores e o trabalho, já chegam preenchidas, com fotos e áudios. Só as perguntas sobre vocês dois começam em branco.'
              },
              {
                title: 'Um livro em andamento por vez',
                text: `A assinatura inclui um livro em andamento. Quando ele fica pronto, continua online sem custo e você começa o próximo. Para escrever dois ao mesmo tempo, adicione uma vaga${billing ? ` por ${formatPrice(billing.extraPrice)} por mês` : ''}.`
              }
            ].map((item, position) => (
              <li key={item.title} className='flex gap-4'>
                <span
                  aria-hidden='true'
                  className='bg-moss text-cream flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums'
                >
                  {position + 1}
                </span>
                <div className='flex flex-col gap-1'>
                  <span className='font-heading text-lg'>{item.title}</span>
                  <span className='text-muted-foreground text-sm text-pretty'>{item.text}</span>
                </div>
              </li>
            ))}
          </ol>
          <Button
            type='button'
            variant='honey'
            size='cta'
            className='w-full sm:w-fit'
            onClick={() => setAboutMore(false)}
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BoasVindas
