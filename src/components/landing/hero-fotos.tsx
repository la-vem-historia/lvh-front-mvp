'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'

import { cn } from '@/lib/utils'

import sofa from '@/assets/landing/hero/sofa.jpg'

// Fotos do hero, que se alternam devagar. Todas seguem a mesma regra: a família à direita
// e uma parede calma à esquerda, onde fica o texto. Para incluir uma foto, basta somá-la aqui
const FOTOS: { src: StaticImageData; alt: string }[] = [
  {
    src: sofa,
    alt: 'Avó, mãe e neta sentadas juntinhas no sofá da sala, rindo enquanto leem o livro de capa verde no colo da avó'
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
