'use client'

import { useRef, type ReactNode } from 'react'

import { MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

import { cn } from '@/lib/utils'

// Curva suave de desaceleração, usada em toda a home para o movimento ter a mesma "mão"
export const EASE = [0.22, 1, 0.36, 1] as const

// Respeita quem pediu menos movimento no sistema: as animações viram cortes secos
export const MotionRoot = ({ children }: { children: ReactNode }) => (
  <MotionConfig reducedMotion='user'>{children}</MotionConfig>
)

// Título que sobe palavra por palavra, cada uma saindo de trás de uma máscara
export const WordsReveal = ({
  text,
  as = 'h1',
  className,
  lineClassName,
  delay = 0
}: {
  // Uma quebra de linha (\n) força a linha seguinte, como no título do hero
  text: string
  as?: 'h1' | 'h2' | 'p'
  className?: string
  lineClassName?: string
  delay?: number
}) => {
  const Tag = motion[as]
  let order = 0

  const words = (line: string) =>
    line.split(' ').map(word => {
      const index = order++

      return (
        <span key={index} aria-hidden='true' className='inline-block overflow-hidden pb-[0.08em] align-top'>
          <motion.span
            className='inline-block'
            variants={{ hidden: { y: '105%' }, visible: { y: '0%' } }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + index * 0.055 }}
          >
            {word}
            {'\u00a0'}
          </motion.span>
        </span>
      )
    })

  const lines = text.split('\n')

  return (
    <Tag
      className={className}
      aria-label={lines.join(' ')}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true }}
    >
      {lines.length > 1
        ? lines.map(line => (
            <span key={line} className={cn('block', lineClassName)}>
              {words(line)}
            </span>
          ))
        : words(text)}
    </Tag>
  )
}

// Foto que entra com um zoom lento e depois acompanha o scroll com um parallax discreto
export const ParallaxPhoto = ({ children, className }: { children: ReactNode; className?: string }) => {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  // O zoom cresce junto com o deslocamento, então a foto nunca descola da borda de cima
  const y = useTransform(scrollY, [0, 800], ['0%', reduce ? '0%' : '4%'])
  const scale = useTransform(scrollY, [0, 800], [1, reduce ? 1 : 1.1])

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='relative size-full'
        style={{ y, scale }}
        initial={{ scale: 1.14, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Linha fina que se desenha da esquerda para a direita quando entra na tela
export const DrawLine = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.span
    aria-hidden='true'
    className={cn('bg-border block h-px origin-left', className)}
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 1.1, ease: EASE, delay }}
  />
)

// Livro que gira e flutua de leve conforme a seção passa pela tela
export const ScrollTilt = ({ children, className }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 })
  const rotate = useTransform(smooth, [0, 1], reduce ? [0, 0] : [-6, 4])
  const y = useTransform(smooth, [0, 1], reduce ? [0, 0] : [50, -50])

  return (
    <motion.div ref={ref} className={className} style={{ rotate, y }}>
      {children}
    </motion.div>
  )
}
