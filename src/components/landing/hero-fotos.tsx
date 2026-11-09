'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'

import { cn } from '@/lib/utils'

import biblioteca from '@/assets/landing/hero/biblioteca.jpg'
import cama from '@/assets/landing/hero/cama.jpg'
import cozinha from '@/assets/landing/hero/cozinha.jpg'

// Fotos do hero, que se alternam devagar. Todas seguem a mesma regra: a família à direita
// e uma parede calma à esquerda, onde fica o texto. Para incluir uma foto, basta somá-la aqui
const FOTOS: { src: StaticImageData; alt: string }[] = [
  {
    src: biblioteca,
    alt: 'Num cantinho de leitura cercado de livros, num dia de chuva, o avô lê em voz alta o livro de capa verde para o neto, que se apoia na poltrona'
  },
  {
    src: cozinha,
    alt: 'Pai e filho rindo à mesa da cozinha, com dois cafés, enquanto o pai aponta uma página do livro de capa verde'
  },
  {
    src: cama,
    alt: 'Mãe e filha debaixo do edredom numa manhã de chuva, abraçadas, lendo juntas o livro no tablet'
  }
]

const INTERVALO = 7000

// Troca com um fade lento; quem pediu menos movimento fica na primeira foto
const HeroFotos = ({ className }: { className?: string }) => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (FOTOS.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => setActive(current => (current + 1) % FOTOS.length), INTERVALO)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {FOTOS.map((foto, index) => (
        <Image
          key={foto.alt}
          src={foto.src}
          alt={index === active ? foto.alt : ''}
          aria-hidden={index !== active}
          priority={index === 0}
          placeholder='blur'
          sizes='100vw'
          className={cn(
            'absolute inset-0 size-full object-cover object-[78%_50%] transition-opacity duration-[1500ms] ease-in-out',
            index === active ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
    </div>
  )
}

export default HeroFotos
