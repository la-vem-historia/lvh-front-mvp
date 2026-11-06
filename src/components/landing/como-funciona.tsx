'use client'

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { LockIcon } from 'lucide-react'

import { MotionPreset } from '@/components/ui/motion-preset'
import { DrawLine, WordsReveal } from '@/components/landing/motion'

import compartilharImage from '@/assets/landing/produto/compartilhar.png'
import fotosEVozImage from '@/assets/landing/produto/fotos-e-voz.png'
import responderImage from '@/assets/landing/produto/responder.png'

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

const ComoFunciona = () => {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  // Setas mudam de passo, como numa lista de abas
  const handleKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    const move = moves[event.key]

    if (!move) return

    event.preventDefault()
    const next = (active + move + steps.length) % steps.length

    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id='como-funciona' className='scroll-mt-24'>
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
          <div className='bg-blush rounded-[1.5rem] p-5 sm:p-10 lg:p-12 [perspective:2000px]'>
            <div className='bg-cream overflow-hidden rounded-xl shadow-[0_40px_70px_-35px_rgb(50_38_24/0.55)] ring-1 ring-black/5 transition-transform duration-700 ease-out lg:[transform:rotateY(-6deg)] lg:hover:[transform:rotateY(0deg)]'>
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
          </div>
        </MotionPreset>

        {/* Os passos são abas: clicar mostra a tela correspondente no celular */}
        <div
          role='tablist'
          aria-label='Passos do Lá Vem História'
          aria-orientation='vertical'
          onKeyDown={handleKeyDown}
          className='flex flex-col lg:col-span-5'
        >
          {steps.map((step, index) => {
            const selected = index === active

            return (
              <MotionPreset key={step.title} {...reveal} delay={0.1 * (index + 1)} className='relative'>
                <DrawLine className='bg-foreground absolute inset-x-0 top-0' delay={0.12 * index} />
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
                  onClick={() => setActive(index)}
                  className={cn(
                    'group flex w-full cursor-pointer flex-col gap-3 py-7 text-left transition-opacity duration-300',
                    selected ? 'opacity-100' : 'opacity-45 hover:opacity-80'
                  )}
                >
                  <span className='flex items-baseline gap-4'>
                    <span className='text-clay text-sm font-bold tabular-nums' aria-hidden='true'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className='text-sm font-bold uppercase'>{step.title}</span>
                  </span>
                  <span className='text-muted-foreground pl-9 text-base leading-relaxed'>{step.text}</span>
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
