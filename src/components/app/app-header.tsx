'use client'

import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

import Link from 'next/link'
import { BookOpenIcon, HouseIcon, PenLineIcon, SettingsIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Logo from '@/components/shadcn-studio/logo'
import Avatar from '@/components/app/avatar'
import { useUser } from '@/components/app/session'

import { getAnswers, getChapters, isAnswered } from '@/lib/lvh/api'
import { cn } from '@/lib/utils'

// Cor da etiqueta do papel: a mesma do card escolhido no onboarding
const roleTagClassName: Record<string, string> = {
  Pai: 'bg-olive text-cream',
  Mãe: 'bg-lilac text-ink'
}

const iconButtonClassName =
  'flex size-10 items-center justify-center rounded-full transition-[background-color,color,translate] duration-200 ease-out [&_svg]:size-5 [&_svg]:stroke-[1.75]'

// Botão redondo com o nome aparecendo num balão logo abaixo, no hover e no foco
const IconButton = ({
  label,
  active,
  disabled,
  render,
  className,
  children
}: {
  label: string
  className?: string
  active?: boolean
  disabled?: boolean
  render: ReactElement
  children: ReactNode
}) => (
  <Tooltip>
    <TooltipTrigger
      render={render}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        iconButtonClassName,
        active ? 'bg-ink text-cream' : 'bg-sand text-foreground hover:bg-stone',
        disabled && 'text-muted-foreground hover:bg-sand cursor-default',
        className
      )}
    >
      {children}
    </TooltipTrigger>
    <TooltipContent side='bottom' sideOffset={8} className='rounded-lg px-3 py-1.5 text-sm font-medium'>
      {label}
    </TooltipContent>
  </Tooltip>
)

const AppHeader = () => {
  const user = useUser()
  const pathname = usePathname()
  const [nextQuestionId, setNextQuestionId] = useState<number | null>(null)

  // Escrever leva direto à próxima pergunta sem resposta; recalcula a cada troca de página
  useEffect(() => {
    Promise.all([getChapters(user), getAnswers()]).then(([chapters, answers]) => {
      const next = chapters.flatMap(chapter => chapter.questions).find(question => !isAnswered(answers[question.id]))

      setNextQuestionId(next?.id ?? null)
    })
  }, [user, pathname])

  const firstName = user.name.trim().split(/\s+/)[0]
  const isAccount = pathname === '/app/conta'

  return (
    // Mesma barra da landing: 80px, creme translúcido com desfoque e logo grande
    <header className='bg-background/85 sticky top-0 z-50 backdrop-blur print:hidden'>
      <div className='mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8'>
        <Link href='/app' className='w-fit'>
          <Logo className='[&_svg]:h-7 sm:[&_svg]:h-[2.125rem]' />
        </Link>

        <nav aria-label='Principal' className='flex items-center gap-2'>
          <IconButton label='Início' active={pathname === '/app'} render={<Link href='/app' />}>
            <HouseIcon />
          </IconButton>
          <IconButton
            label='Escrever'
            active={pathname.startsWith('/app/pergunta')}
            render={<Link href={nextQuestionId ? `/app/pergunta/${nextQuestionId}` : '/app'} />}
          >
            <PenLineIcon />
          </IconButton>
          <IconButton label='O livro' active={pathname === '/app/livro'} render={<Link href='/app/livro' />}>
            <BookOpenIcon />
          </IconButton>
        </nav>

        <div className='flex items-center justify-end gap-2'>
          <IconButton
            label='Configurações'
            active={pathname === '/app/configuracoes'}
            render={<Link href='/app/configuracoes' />}
          >
            <SettingsIcon />
          </IconButton>

          {/* Avatar com o primeiro nome e o papel escolhido; leva à conta */}
          <Link
            href='/app/conta'
            aria-label={`Minha conta, ${user.name}`}
            aria-current={isAccount ? 'page' : undefined}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full p-1 transition-colors duration-200 sm:pr-3',
              isAccount ? 'bg-ink text-cream' : 'bg-sand hover:bg-stone'
            )}
          >
            <Avatar user={user} className='bg-stone size-8' />
            <span className='text-sm font-medium max-sm:hidden'>{firstName}</span>
            {user.profile && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium max-sm:hidden',
                  roleTagClassName[user.profile] ?? 'bg-stone text-foreground'
                )}
              >
                {user.profile}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
