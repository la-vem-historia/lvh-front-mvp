'use client'

import { useState, type ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCardIcon, GiftIcon, HourglassIcon, LockIcon, SparklesIcon, XIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAccess } from '@/components/app/assinatura/acesso'

import { canEdit, formatDay, type Access } from '@/lib/lvh/assinatura'
import { cn } from '@/lib/utils'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

type Tone = 'calmo' | 'urgente' | 'travado' | 'alerta'

type Banner = {
  tone: Tone
  Icon: LucideIcon
  text: ReactNode
  cta: { label: string; href: string }
  // Só o teste pode ser fechado: o resto pede uma ação para não perder o livro
  dismissible?: boolean
}

// Um aviso por estado. Ativa sem pendência não tem aviso: quem paga em dia não vê cobrança no topo
export const bannerOf = (access: Access): Banner | null => {
  switch (access.kind) {
    case 'trial':
      return {
        tone: 'calmo',
        Icon: SparklesIcon,
        text: (
          <>
            Teste grátis: faltam <strong className='font-medium'>{plural(access.daysLeft, 'dia', 'dias')}</strong> ou{' '}
            <strong className='font-medium'>{plural(access.answersLeft, 'resposta', 'respostas')}</strong>, o que vier
            primeiro.
          </>
        ),
        cta: { label: 'Ver planos', href: '/app/assinatura' },
        dismissible: true
      }

    case 'trial-acabando':
      return {
        tone: 'urgente',
        Icon: HourglassIcon,
        text:
          access.reason === 'dias' ? (
            <>
              Seu teste grátis acaba{' '}
              <strong className='font-medium'>
                {access.daysLeft === 1 ? 'amanhã' : `em ${access.daysLeft} dias`}
              </strong>
              . Assine para não parar no meio da história.
            </>
          ) : (
            <>
              {access.answersLeft === 1 ? 'Falta' : 'Faltam'}{' '}
              <strong className='font-medium'>{plural(access.answersLeft, 'resposta', 'respostas')}</strong> no teste
              grátis. Assine para continuar escrevendo depois delas.
            </>
          ),
        cta: { label: 'Escolher plano', href: '/app/assinatura' }
      }

    case 'trial-encerrado':
      return {
        tone: 'travado',
        Icon: LockIcon,
        text: (
          <>
            O teste grátis acabou. Suas {plural(access.answered, 'resposta está guardada', 'respostas estão guardadas')}
            : assine para continuar de onde parou.
          </>
        ),
        cta: { label: 'Assinar', href: '/app/assinatura' }
      }

    case 'presente':
      if (!access.ending) return null

      return {
        tone: 'urgente',
        Icon: GiftIcon,
        text: (
          <>
            Seu presente acaba em <strong className='font-medium'>{formatDay(access.until)}</strong>. Assine para
            continuar escrevendo depois.
          </>
        ),
        cta: { label: 'Escolher plano', href: '/app/assinatura' }
      }

    case 'ativa':
      return null

    case 'cancelamento-agendado':
      return {
        tone: 'calmo',
        Icon: HourglassIcon,
        text: (
          <>
            Sua assinatura termina em <strong className='font-medium'>{formatDay(access.endsAt)}</strong>. Depois disso,
            o livro fica fechado para edição.
          </>
        ),
        cta: { label: 'Manter assinatura', href: '/app/assinatura' }
      }

    case 'pagamento-recusado':
      return {
        tone: 'alerta',
        Icon: CreditCardIcon,
        text: (
          <>
            Não conseguimos cobrar no cartão{access.card ? ` final ${access.card.last4}` : ''}. Atualize o pagamento
            até <strong className='font-medium'>{formatDay(access.graceUntil)}</strong> para continuar escrevendo.
          </>
        ),
        cta: { label: 'Atualizar pagamento', href: '/app/assinatura' }
      }

    case 'expirada':
      return {
        tone: 'travado',
        Icon: LockIcon,
        text: <>Sua assinatura terminou. O livro está fechado para edição, mas tudo o que você escreveu continua aqui.</>,
        cta: { label: 'Voltar a assinar', href: '/app/assinatura' }
      }
  }
}

const toneClassName: Record<Tone, string> = {
  calmo: 'bg-sand text-foreground',
  urgente: 'bg-honey/35 text-foreground',
  travado: 'bg-moss text-cream',
  alerta: 'bg-clay text-cream'
}

const ctaVariant: Record<Tone, 'outline' | 'honey' | 'inverse'> = {
  calmo: 'outline',
  urgente: 'honey',
  travado: 'honey',
  alerta: 'inverse'
}

// A faixa em si, sem estado: a página de estados usa esta para mostrar todas lado a lado
export const AvisoAssinaturaView = ({
  banner,
  onDismiss,
  className
}: {
  banner: Banner
  onDismiss?: () => void
  className?: string
}) => {
  const { tone, Icon, text, cta, dismissible } = banner

  return (
    <div
      role={tone === 'alerta' ? 'alert' : 'status'}
      className={cn('flex items-center gap-4 rounded-2xl px-5 py-3 text-sm max-sm:flex-col max-sm:items-start', toneClassName[tone], className)}
    >
      <p className='flex flex-1 items-start gap-3 text-pretty'>
        <Icon aria-hidden='true' className='mt-0.5 size-4 shrink-0' strokeWidth={1.75} />
        <span>{text}</span>
      </p>
      <div className='flex shrink-0 items-center gap-2 max-sm:w-full max-sm:pl-7'>
        <Button render={<Link href={cta.href} />} nativeButton={false} variant={ctaVariant[tone]} size='md'>
          {cta.label}
        </Button>
        {dismissible && onDismiss && (
          <Button type='button' variant='ghost' size='icon-lg' onClick={onDismiss} aria-label='Fechar aviso'>
            <XIcon />
          </Button>
        )}
      </div>
    </div>
  )
}

const DISMISS_KEY = 'lvh:aviso-assinatura-fechado'

// O aviso no topo do app. Some na própria página da assinatura, que já diz tudo, e no primeiro livro (boas-vindas)
const AvisoAssinatura = () => {
  const { access } = useAccess()
  const pathname = usePathname()
  // No servidor não há sessionStorage; lá o aviso nem aparece, porque a assinatura só carrega no navegador
  const [dismissed, setDismissed] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.sessionStorage.getItem(DISMISS_KEY)
  )

  if (!access || pathname.startsWith('/app/assinatura') || pathname === '/app/boas-vindas') return null

  // Na tela de responder travada o paywall já ocupa a página: o aviso só repetiria
  if (!canEdit(access) && pathname.startsWith('/app/pergunta')) return null

  const banner = bannerOf(access)

  // Fechar vale para o estado em que foi fechado: se o teste passa a estar acabando, o aviso volta
  if (!banner || dismissed === access.kind) return null

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, access.kind)
    setDismissed(access.kind)
  }

  return (
    <div className='mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-16'>
      <AvisoAssinaturaView banner={banner} onDismiss={dismiss} />
    </div>
  )
}

export default AvisoAssinatura
