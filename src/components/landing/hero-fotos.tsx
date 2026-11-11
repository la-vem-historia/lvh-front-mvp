'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'

import { cn } from '@/lib/utils'

import cama from '@/assets/landing/hero/cama.jpg'
import biblioteca from '@/assets/landing/hero/biblioteca.jpg'
import sofa from '@/assets/landing/hero/sofa.jpg'

// Fotos do hero, que se alternam devagar. Todas seguem a mesma regra: a família à direita
// e uma parede calma à esquerda, onde fica o texto. Para incluir uma foto, basta somá-la aqui
const FOTOS: { src: StaticImageData; alt: string }[] = [
  {
    src: sofa,
    alt: 'Avó, mãe e neta sentadas juntinhas no sofá da sala, rindo enquanto leem o livro de capa verde no colo da avó'
  },
  {
    src: biblioteca,
    alt: 'Num cantinho de leitura cercado de livros, num dia de chuva, o avô lê em voz alta o livro de capa verde para o neto, que se apoia na poltrona'
  },
  {
    src: cama,
    alt: 'Mãe e filha recostadas na cama, abraçadas, sorrindo enquanto leem o livro de capa verde numa tarde de chuva'
  }
]

const INTERVALO = 7000

// Troca com um fade lento; quem pediu menos movimento fica na primeira foto
const HeroFotos = ({ className }: { className?: string }) => {
  const [active, setActive] = useState(0)
  const images = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    if (FOTOS.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Só troca para uma foto que já terminou de baixar; senão apareceria o borrão do placeholder.
    // Se a próxima ainda não chegou, tenta de novo no ciclo seguinte
    const timer = window.setInterval(() => {
      setActive(current => {
        const next = (current + 1) % FOTOS.length
        const image = images.current[next]

        return image?.complete && image.naturalWidth ? next : current
      })
    }, INTERVALO)

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
          // As outras baixam logo depois da primeira, sem esperar a troca
          loading={index === 0 ? undefined : 'eager'}
          ref={element => {
            images.current[index] = element
          }}
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
