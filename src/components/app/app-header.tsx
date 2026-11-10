'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import {
  BookIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  HouseIcon,
  LibraryIcon,
  LogOutIcon,
  MessageCircleIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Logo from '@/components/shadcn-studio/logo'
import Avatar from '@/components/app/avatar'
import { useRefreshUser, useUser } from '@/components/app/session'

import { getAnswers, getBooks, getChapters, isAnswered, setActiveBook, signOut } from '@/lib/lvh/api'
import { bookTitle } from '@/lib/lvh/livros'
import type { UserBook } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const menuClassName = 'min-w-56 rounded-2xl p-1.5'
const itemClassName = 'gap-2.5 rounded-xl px-3 py-2.5 text-sm'

// Seletor do livro aberto: mostra onde a pessoa está e troca de livro sem passar pela lista
const BookSelector = ({ active }: { active: boolean }) => {
  const user = useUser()
  const refreshUser = useRefreshUser()
  const router = useRouter()
  const [books, setBooks] = useState<UserBook[]>([])

  useEffect(() => {
    getBooks().then(setBooks)
  }, [user])

  if (!user.activeBook) return null

  const open = async (id: string) => {
    if (id !== user.activeBook?.id) {
      await setActiveBook(id)
      await refreshUser()
    }

    router.push('/app')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex h-10 min-w-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200',
          active ? 'bg-moss text-cream' : 'bg-sand hover:bg-stone data-popup-open:bg-stone'
        )}
      >
        <BookIcon className='size-4 shrink-0' strokeWidth={1.75} aria-hidden='true' />
        <span className='truncate'>{bookTitle(user.activeBook)}</span>
        <ChevronDownIcon className='size-4 shrink-0 opacity-70' aria-hidden='true' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className={menuClassName}>
        {books.map(book => (
          <DropdownMenuItem key={book.id} onClick={() => open(book.id)} className={itemClassName}>
            <CheckIcon className={cn('size-4', book.id !== user.activeBook?.id && 'invisible')} aria-hidden='true' />
            {bookTitle(book)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className='mx-1.5' />
        <DropdownMenuItem onClick={() => router.push('/app/livros/novo')} className={itemClassName}>
          <PlusIcon className='size-4' aria-hidden='true' />
          Criar outro livro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/app/livros')} className={itemClassName}>
          <LibraryIcon className='size-4' aria-hidden='true' />
          Ver todos os livros
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Foto da pessoa: abre a conta, as configurações e o sair. O perfil (Pai, Mãe…) fica aqui, discreto
const AccountMenu = ({ active }: { active: boolean }) => {
  const user = useUser()
  const router = useRouter()

  const leave = async () => {
    await signOut()
    router.replace('/entrar')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu da conta, ${user.name}`}
        className={cn(
          'flex size-10 cursor-pointer items-center justify-center rounded-full transition-[box-shadow] duration-200',
          active
            ? 'ring-moss ring-2 ring-offset-2 ring-offset-[var(--background)]'
            : 'hover:ring-stone data-popup-open:ring-stone hover:ring-4 data-popup-open:ring-4'
        )}
      >
        <Avatar user={user} className='bg-stone size-10' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className={menuClassName}>
        <div className='flex flex-col px-3 py-2'>
          <span className='text-sm font-medium'>{user.name}</span>
          {user.profile && <span className='text-muted-foreground text-xs'>Perfil: {user.profile}</span>}
        </div>
        <DropdownMenuSeparator className='mx-1.5' />
        <DropdownMenuItem onClick={() => router.push('/app/conta')} className={itemClassName}>
          <UserIcon className='size-4' aria-hidden='true' />
          Minha conta
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/app/configuracoes')} className={itemClassName}>
          <SettingsIcon className='size-4' aria-hidden='true' />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator className='mx-1.5' />
        <DropdownMenuItem onClick={leave} className={itemClassName}>
          <LogOutIcon className='size-4' aria-hidden='true' />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Os três lugares do livro, numa pill só: o painel, onde se escreve e o que está sendo construído.
// Perguntas leva direto à próxima pergunta sem resposta, para continuar de onde parou
const Views = ({ pathname, className }: { pathname: string; className?: string }) => {
  const user = useUser()
  const [nextQuestionId, setNextQuestionId] = useState<number | null>(null)

  // Recalcula a cada troca de página: depois de responder, a próxima já é outra
  useEffect(() => {
    Promise.all([getChapters(user), getAnswers()]).then(([chapters, answers]) => {
      const next = chapters.flatMap(chapter => chapter.questions).find(question => !isAnswered(answers[question.id]))

      setNextQuestionId(next?.id ?? null)
    })
  }, [user, pathname])

  const views = [
    { label: 'Início', href: '/app', Icon: HouseIcon, active: pathname === '/app' },
    {
      label: 'Perguntas',
      href: nextQuestionId ? `/app/pergunta/${nextQuestionId}` : '/app',
      Icon: MessageCircleIcon,
      active: pathname.startsWith('/app/pergunta')
    },
    {
      label: 'Livro',
      href: '/app/livro',
      Icon: BookOpenIcon,
      active: pathname === '/app/livro' || pathname.startsWith('/app/livro/')
    }
  ]

  return (
    <nav aria-label='Principal' className={cn('bg-sand flex rounded-full p-1', className)}>
      {views.map(({ label, href, Icon, active }) => (
        <Link
          key={label}
          href={href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex h-9 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200',
            active ? 'bg-moss text-cream' : 'text-foreground/75 hover:text-foreground hover:bg-stone'
          )}
        >
          <Icon className='size-4' strokeWidth={1.75} aria-hidden='true' />
          {label}
        </Link>
      ))}
    </nav>
  )
}

const AppHeader = () => {
  const pathname = usePathname()

  // Escrevendo, o cabeçalho vira modo foco: só as duas visões, sem logo, livro nem conta
  const focus = pathname.startsWith('/app/pergunta')
  const account = pathname === '/app/conta' || pathname === '/app/configuracoes'

  // No onboarding (conta nova e novo livro) não há cabeçalho: nada ali é clicável ainda, e o foco fica nos passos
  if (pathname === '/app/boas-vindas' || pathname === '/app/livros/novo') return null

  return (
    // Mesma barra da landing: creme translúcido com desfoque e logo grande.
    // No celular, as duas visões descem para uma segunda linha, de ponta a ponta
    <header className='bg-background/85 sticky top-0 z-50 backdrop-blur print:hidden'>
      <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:grid sm:h-20 sm:grid-cols-[1fr_auto_1fr] sm:py-0 sm:px-6 lg:px-8'>
        {focus ? (
          <span className='max-sm:hidden' />
        ) : (
          <Link href='/app' className='w-fit shrink-0 max-sm:flex-1'>
            <Logo className='[&_svg]:h-7 sm:[&_svg]:h-[2.125rem]' />
          </Link>
        )}

        <Views pathname={pathname} className={cn('max-sm:order-last max-sm:w-full', focus && 'max-sm:order-none')} />

        {focus ? (
          <span className='max-sm:hidden' />
        ) : (
          // O livro aberto fica junto da foto: os dois dizem "de quem" e "o quê" é o que está na tela
          <div className='flex min-w-0 items-center justify-end gap-2'>
            <BookSelector active={pathname.startsWith('/app/livros')} />
            <AccountMenu active={account} />
          </div>
        )}
      </div>
    </header>
  )
}

export default AppHeader
