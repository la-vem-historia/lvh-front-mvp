'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { LockIcon } from 'lucide-react'

import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'
import Cta from '@/components/landing/cta'

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
    title: 'Responda pensando em quem vai ler',
    text: 'Toda semana chega uma pergunta que a sua neta talvez nunca tenha feito: como era a sua infância, como você conheceu o amor da sua vida, o que aprendeu no trabalho. Você responde no seu tempo, como se estivesse contando para ela.',
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
    title: 'Entregue o livro para quem você escreveu',
    text: 'Suas histórias viram um livro digital. Só lê quem você convidar, e você pode tirar o acesso de qualquer pessoa quando quiser.',
    image: compartilharImage,
    alt: 'O livro “A vida de Maria” aberto em duas páginas, com a foto do triciclo, a voz da Maria e as respostas da infância',
    url: 'lavemhistoria.com.br/ler/a-vida-de-maria'
  }
]

// Leitores do livro que aparecem flutuando em volta da janela no passo de compartilhar.
// Posição em % da janela do navegador, para acompanhar qualquer largura
const readers = [
  { image: voImage, position: '-left-[6%] top-[62%]', delay: '0s' },
  { image: vovoImage, position: 'left-[3%] top-[84%]', delay: '1.2s' },
  { image: maeImage, position: 'left-[16%] top-[94%]', delay: '0.6s' },
  { image: jovemImage, position: 'right-[8%] top-[90%]', delay: '1.8s' },
  { image: paiImage, position: '-right-[5%] top-[70%]', delay: '0.9s' }
]

// O passo em que os leitores aparecem
const SHARE_STEP = 2

// A janela do navegador com a tela do passo; as três telas ficam empilhadas e trocam com um fade.
// Sem moldura em volta: só a janela, com uma sombra longa e suave, como um objeto sobre a página
const Janela = ({ active }: { active: number }) => (
  <div className='relative'>
    <div className='bg-cream overflow-hidden rounded-xl shadow-[0_60px_120px_-40px_rgb(50_38_24/0.45),0_24px_48px_-24px_rgb(50_38_24/0.3)] ring-1 ring-black/5'>
      {/* Barra do navegador, de enfeite, para a imagem ler como uma tela e não como botões */}
      <div aria-hidden='true' className='bg-stone/70 flex items-center gap-4 px-4 py-2.5'>
        <span className='flex gap-1.5'>
          <span className='bg-foreground/20 size-2.5 rounded-full' />
          <span className='bg-foreground/20 size-2.5 rounded-full' />
          <span className='bg-foreground/20 size-2.5 rounded-full' />
        </span>
        <span className='bg-cream/80 text-muted-foreground mx-auto flex max-w-xs min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem]'>
          <LockIcon className='size-2.5 shrink-0' />
          <span className='truncate'>{steps[active].url}</span>
        </span>
        <span className='w-[2.625rem]' />
      </div>
      <div className='relative aspect-[4/3]'>
        {steps.map((step, index) => (
          <Image
            key={step.title}
            src={step.image}
            alt={index === active ? step.alt : ''}
            aria-hidden={index !== active}
            sizes='(min-width: 1024px) 45vw, 90vw'
            placeholder='blur'
            className={cn(
              'pointer-events-none absolute inset-0 size-full object-cover transition-[opacity,scale] duration-500 ease-out select-none',
              index === active ? 'scale-100 opacity-100' : 'scale-[1.015] opacity-0'
            )}
          />
        ))}
      </div>
    </div>

    {/* Quem lê o livro: entram um a um quando o passo de compartilhar está na tela e ficam flutuando */}
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
        <span style={{ animationDelay: reader.delay }} className='animate-float block motion-reduce:animate-none'>
          <Image
            src={reader.image}
            alt=''
            sizes='72px'
            className='size-12 rounded-full object-cover shadow-[0_14px_28px_-12px_rgb(0_0_0/0.6)] sm:size-16 lg:size-[4.5rem]'
          />
        </span>
      </span>
    ))}
  </div>
)

// Como funciona, contado com o scroll: no desktop a seção fica presa na tela e cada passo ocupa um trecho da rolagem,
// com o texto à esquerda e a tela à direita. A roda do mouse avança um passo por vez e segura um instante em cada um,
// para nenhuma tela passar sem ser vista. No celular, os passos vêm empilhados
const PAUSA = 1100

const ComoFunciona = () => {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const current = useRef(0)

  // Posição de rolagem do meio do trecho de cada passo
  const positionOf = (index: number) => {
    const element = track.current

    if (!element) return 0

    const scrollable = element.offsetHeight - window.innerHeight
    const top = element.getBoundingClientRect().top + window.scrollY

    return top + (scrollable * (index + 0.5)) / steps.length
  }

  useEffect(() => {
    let frame = 0

    const update = () => {
      const element = track.current

      if (!element) return

      const { top, height } = element.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      const progress = scrollable > 0 ? Math.min(Math.max(-top / scrollable, 0), 0.999) : 0
      const next = Math.floor(progress * steps.length)

      current.current = next
      setActive(next)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Com a seção presa na tela, cada gesto da roda leva a um passo só, e as próximas rodadas esperam a pausa.
  // No primeiro passo subindo e no último descendo, a rolagem volta a ser normal
  useEffect(() => {
    let lockedUntil = 0

    const onWheel = (event: WheelEvent) => {
      const element = track.current

      if (!element || window.innerWidth < 1024 || Math.abs(event.deltaY) < 4) return

      const { top, bottom } = element.getBoundingClientRect()
      const pinned = top <= 1 && bottom >= window.innerHeight - 1

      if (!pinned) return

      const direction = event.deltaY > 0 ? 1 : -1
      const next = current.current + direction

      if (next < 0 || next >= steps.length) return

      event.preventDefault()

      if (Date.now() < lockedUntil) return

      lockedUntil = Date.now() + PAUSA
      window.scrollTo({ top: positionOf(next), behavior: 'smooth' })
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <section id='como-funciona' className='scroll-mt-24 overflow-x-clip'>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-24 sm:px-6 lg:px-16 lg:pt-32'>
        <MotionPreset {...reveal} className='flex max-w-2xl flex-col gap-4'>
          <p className='text-sm font-medium uppercase'>Como funciona</p>
          <WordsReveal
            as='h2'
            text='Da primeira pergunta ao livro nas mãos.'
            className='font-heading text-display text-balance'
          />
          <p className='text-muted-foreground text-base text-pretty'>
            Três passos simples. Alguns minutos por semana, pensando em quem vai ler.
          </p>
        </MotionPreset>
      </div>

      {/* Desktop: trilho alto, uma tela de rolagem por passo; o conteúdo fica preso no meio da tela */}
      <div ref={track} className='relative hidden lg:block' style={{ height: `${steps.length * 100}vh` }}>
        <div className='sticky top-0 flex h-svh items-center'>
          <div className='mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-12 px-16'>
            {/* key: o texto do passo entra com um fade suave a cada troca */}
            <div
              key={active}
              aria-live='polite'
              className='animate-in fade-in slide-in-from-bottom-3 col-span-4 flex flex-col gap-5 duration-700'
            >
              <span className='text-muted-foreground text-sm tracking-wide tabular-nums'>
                {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
              </span>
              <h3 className='font-heading text-[2.5rem] leading-[1.1] text-balance'>{steps[active].title}</h3>
              <p className='text-foreground/80 text-base text-pretty'>{steps[active].text}</p>
            </div>

            <div className='col-span-7 col-start-6'>
              <Janela active={active} />
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto hidden max-w-7xl px-16 pb-24 lg:block'>
        <Cta>Responder a primeira pergunta</Cta>
      </div>

      {/* Celular e tablet: os três passos empilhados, cada um com a sua tela */}
      <div className='mx-auto flex max-w-2xl flex-col gap-16 px-4 pt-12 pb-24 sm:px-6 lg:hidden'>
        {steps.map((step, index) => (
          <MotionPreset key={step.title} {...reveal} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <span className='text-muted-foreground text-sm tabular-nums'>
                {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
              </span>
              <h3 className='font-heading text-2xl text-balance'>{step.title}</h3>
              <p className='text-foreground/80 text-base text-pretty'>{step.text}</p>
            </div>
            <Janela active={index} />
          </MotionPreset>
        ))}
        <Cta>Responder a primeira pergunta</Cta>
      </div>
    </section>
  )
}

export default ComoFunciona
