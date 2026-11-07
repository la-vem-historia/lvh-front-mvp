'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { ChevronDownIcon, LockIcon } from 'lucide-react'

import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'

import compartilharImage from '@/assets/landing/produto/compartilhar.png'
import fotosEVozImage from '@/assets/landing/produto/fotos-e-voz.png'
import responderImage from '@/assets/landing/produto/responder.png'
import jovemImage from '@/assets/landing/leitores/jovem.jpg'
import maeImage from '@/assets/landing/leitores/mae.jpg'
import paiImage from '@/assets/landing/leitores/pai.jpg'
import voImage from '@/assets/landing/leitores/vo.jpg'
import vovoImage from '@/assets/landing/leitores/vovo.jpg'

import { cn } from '@/lib/utils'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// Cada passo mostra a tela de verdade, com a conta de exemplo da Maria preenchida
const steps: { title: string; text: string; image: StaticImageData; alt: string; url: string }[] = [
  {
    title: 'Responda perguntas guiadas',
    text: 'Toda semana chega uma pergunta sobre a sua vida: a infância, os amores, o trabalho, as viradas. Você responde no seu tempo, sem precisar saber escrever bem.',
    image: responderImage,
    alt: 'A pergunta “Como era o lugar onde você morava quando era criança?” respondida no computador, com os botões Ditar, Gravar sua voz e Adicionar foto',
    url: 'lavemhistoria.com.br/app/pergunta/2'
  },
  {
    title: 'Acrescente fotos e voz',
    text: 'Junte fotos antigas às respostas e, se preferir falar a escrever, grave a sua voz. Cada lembrança fica guardada do jeito que ela merece.',
    image: fotosEVozImage,
    alt: 'Resposta com uma gravação de voz de 1 minuto e 34 segundos e uma foto antiga de uma criança num triciclo vermelho, com legenda',
    url: 'lavemhistoria.com.br/app/pergunta/4'
  },
  {
    title: 'Compartilhe com quem você ama',
    text: 'Suas histórias viram um livro digital. Só lê quem você convidar, e você pode tirar o acesso de qualquer pessoa quando quiser.',
    image: compartilharImage,
    alt: 'O livro “A vida de Maria” aberto em duas páginas, com a foto do triciclo, a voz da Maria e as respostas da infância',
    url: 'lavemhistoria.com.br/ler/a-vida-de-maria'
  }
]

// Leitores do livro que aparecem flutuando em volta da janela no passo de compartilhar.
// Posição em % do painel verde, para acompanhar qualquer largura
const readers = [
  { image: voImage, position: 'left-[2%] top-[68%]', delay: '0s' },
  { image: vovoImage, position: 'left-[9%] top-[84%]', delay: '1.2s' },
  { image: maeImage, position: 'left-[21%] top-[76%]', delay: '0.6s' },
  { image: jovemImage, position: 'right-[12%] top-[84%]', delay: '1.8s' },
  { image: paiImage, position: 'right-[3%] top-[70%]', delay: '0.9s' }
]

// O passo em que os leitores aparecem
const SHARE_STEP = 2

const ComoFunciona = () => {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const section = useRef<HTMLElement>(null)
  // Os passos avançam sozinhos só com a seção na tela. O mouse em cima pausa a contagem; depois de um clique,
  // quem manda é a pessoa e eles param de avançar
  const [inView, setInView] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [chosen, setChosen] = useState(false)

  useEffect(() => {
    const element = section.current

    if (!element) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const choose = (index: number) => {
    setActive(index)
    setChosen(true)
  }

  // Setas mudam de passo, como numa lista de abas
  const handleKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    const move = moves[event.key]

    if (!move) return

    event.preventDefault()
    const next = (active + move + steps.length) % steps.length

    choose(next)
    tabs.current[next]?.focus()
  }

  return (
    <section ref={section} id='como-funciona' className='scroll-mt-24'>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-12 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col gap-4 lg:col-span-5'>
          <p className='text-sm font-medium uppercase'>Como funciona</p>
          <WordsReveal
            as='h2'
            text='Da primeira pergunta ao livro nas mãos.'
            className='font-heading text-display text-balance'
          />
          <p className='text-muted-foreground text-base text-pretty'>
            Três passos simples. Você só precisa de alguns minutos por semana e de vontade de lembrar.
          </p>
        </MotionPreset>

        {/* Janela do navegador com a tela do passo escolhido. Cada tela é um recorte aproximado
            do que importa no passo; as três ficam empilhadas e trocam com um fade */}
        <MotionPreset
          {...reveal}
          delay={0.15}
          className='lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center'
        >
          <div className='bg-moss relative rounded-[1.5rem] p-5 sm:p-10 lg:p-12 [perspective:2000px]'>
            <div className='bg-cream overflow-hidden rounded-xl shadow-[0_40px_70px_-30px_rgb(0_0_0/0.55)] ring-1 ring-black/10 transition-transform duration-700 ease-out lg:[transform:rotateY(-6deg)] lg:hover:[transform:rotateY(0deg)]'>
              {/* Barra do navegador, de enfeite, para a imagem ler como uma tela e não como botões */}
              <div aria-hidden='true' className='bg-stone/70 flex items-center gap-4 px-4 py-2.5'>
                <span className='flex gap-1.5'>
                  <span className='bg-ink/20 size-2.5 rounded-full' />
                  <span className='bg-ink/20 size-2.5 rounded-full' />
                  <span className='bg-ink/20 size-2.5 rounded-full' />
                </span>
                <span className='bg-cream/80 text-muted-foreground mx-auto flex max-w-xs min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem]'>
                  <LockIcon className='size-2.5 shrink-0' />
                  <span className='truncate'>{steps[active].url}</span>
                </span>
                <span className='w-[2.625rem]' />
              </div>
              <div
                id='como-funciona-tela'
                role='tabpanel'
                aria-labelledby={`como-funciona-passo-${active}`}
                className='relative aspect-[4/3]'
              >
                {steps.map((step, index) => (
                  <Image
                    key={step.title}
                    src={step.image}
                    alt={index === active ? step.alt : ''}
                    aria-hidden={index !== active}
                    sizes='(min-width: 1024px) 40vw, 90vw'
                    placeholder='blur'
                    className={cn(
                      'pointer-events-none absolute inset-0 size-full object-cover transition-[opacity,scale] duration-500 ease-out select-none',
                      index === active ? 'scale-100 opacity-100' : 'scale-[1.015] opacity-0'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Quem lê o livro: entram um a um quando o passo de compartilhar está aberto e ficam flutuando */}
            {readers.map((reader, index) => (
              <span
                key={reader.position}
                aria-hidden='true'
                style={{ transitionDelay: active === SHARE_STEP ? `${index * 90}ms` : '0ms' }}
                className={cn(
                  'pointer-events-none absolute z-10 transition-[opacity,scale] duration-500 ease-out',
                  reader.position,
                  active === SHARE_STEP ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                )}
              >
                <span
                  style={{ animationDelay: reader.delay }}
                  className='animate-float block motion-reduce:animate-none'
                >
                  <Image
                    src={reader.image}
                    alt=''
                    sizes='72px'
                    className='border-cream size-12 rounded-full border-[1.5px] object-cover shadow-[0_14px_28px_-12px_rgb(0_0_0/0.6)] sm:size-16 lg:size-[4.5rem]'
                  />
                </span>
              </span>
            ))}
          </div>
        </MotionPreset>

        {/* Os passos são abas em forma de cartão: o escolhido abre o texto e mostra a tela na janela ao lado.
            Os outros ficam fechados, com seta, e ganham fundo no hover, para ficar claro que dá para clicar */}
        <div
          role='tablist'
          aria-label='Passos do Lá Vem História'
          aria-orientation='vertical'
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className='flex flex-col gap-2 lg:col-span-5'
        >
          {steps.map((step, index) => {
            const selected = index === active

            return (
              <MotionPreset key={step.title} {...reveal} delay={0.1 * (index + 1)}>
                <button
                  ref={element => {
                    tabs.current[index] = element
                  }}
                  type='button'
                  role='tab'
                  id={`como-funciona-passo-${index}`}
                  aria-selected={selected}
                  aria-controls='como-funciona-tela'
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(index)}
                  className={cn(
                    'group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300',
                    selected
                      ? 'bg-paper border-border shadow-[0_18px_40px_-28px_rgb(60_45_30/0.45)]'
                      : 'hover:bg-sand border-transparent'
                  )}
                >
                  <span className='flex items-center gap-4'>
                    <span
                      aria-hidden='true'
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors',
                        selected ? 'bg-moss text-cream' : 'border-border text-muted-foreground border'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        'font-heading flex-1 text-xl transition-colors',
                        selected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                    <ChevronDownIcon
                      aria-hidden='true'
                      className={cn(
                        'text-muted-foreground size-5 shrink-0 transition-transform duration-300',
                        selected && 'rotate-180 opacity-0'
                      )}
                    />
                  </span>

                  {/* Texto abre e fecha animando a altura */}
                  <span
                    className={cn(
                      'grid transition-[grid-template-rows] duration-500 ease-out',
                      selected ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <span className='overflow-hidden'>
                      <span className='text-muted-foreground block pt-3 pl-12 text-base leading-relaxed'>
                        {step.text}
                      </span>
                    </span>
                  </span>

                  {/* Contagem até o próximo passo; some para quem prefere menos movimento */}
                  {selected && !chosen && (
                    <span
                      aria-hidden='true'
                      className='bg-border/50 absolute inset-x-5 bottom-0 h-0.5 motion-reduce:hidden'
                    >
                      <span
                        key={active}
                        onAnimationEnd={() => setActive(current => (current + 1) % steps.length)}
                        className={cn(
                          'bg-moss animate-step-progress block h-full origin-left',
                          (!inView || hovering) && '[animation-play-state:paused]'
                        )}
                      />
                    </span>
                  )}
                </button>
              </MotionPreset>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ComoFunciona
