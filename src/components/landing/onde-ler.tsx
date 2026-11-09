import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { BookOpenIcon, LaptopIcon, SmartphoneIcon, TabletIcon, TabletSmartphoneIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'
import Cta from '@/components/landing/cta'

import { cn } from '@/lib/utils'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

type Forma = {
  title: string
  text: string
  Icon: LucideIcon
  // Foto de alguém lendo assim. Sem ela, aparece uma moldura com a descrição da foto que falta
  image?: StaticImageData
  alt: string
  // Lugar no bento (a partir do lg): o celular ocupa a coluna da esquerda em pé, o impresso fecha embaixo
  area: string
}

const formas: Forma[] = [
  {
    title: 'No celular',
    text: 'Abra o link e leia onde estiver: no ônibus, na fila, antes de dormir. As gravações tocam ali mesmo.',
    Icon: SmartphoneIcon,
    alt: 'Uma neta lendo o livro da avó no celular, no sofá',
    area: 'lg:row-span-2'
  },
  {
    title: 'No computador',
    text: 'Páginas lado a lado, como um livro aberto em cima da mesa.',
    Icon: LaptopIcon,
    alt: 'Um filho lendo o livro do pai no computador, na mesa da cozinha',
    area: 'lg:col-span-2'
  },
  {
    title: 'No iPad e no tablet',
    text: 'Vire as páginas com o dedo, no sofá ou na cama.',
    Icon: TabletIcon,
    alt: 'Uma mãe e uma criança lendo juntas num tablet',
    area: ''
  },
  {
    title: 'No Kindle e em outros leitores',
    text: 'Baixe o EPUB e leia no Kindle, no app Livros, no Play Livros ou no Kobo.',
    Icon: TabletSmartphoneIcon,
    alt: 'Alguém lendo o livro num Kindle, perto da janela',
    area: ''
  },
  {
    title: 'No livro impresso',
    text: 'O PDF vai pronto para a gráfica. Nas respostas gravadas, um QR code leva até a sua voz.',
    Icon: BookOpenIcon,
    alt: 'Avô e neto folheando o livro impresso, com o celular apontado para um QR code',
    area: 'lg:col-span-3'
  }
]

// Espaço reservado enquanto a foto não chega: a mesma proporção, o ícone do aparelho e o que a foto vai mostrar
const Moldura = ({ Icon, alt }: Pick<Forma, 'Icon' | 'alt'>) => (
  <div className='border-foreground/15 text-muted-foreground absolute inset-3 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center'>
    <Icon className='size-8' strokeWidth={1.25} aria-hidden='true' />
    <p className='max-w-56 text-xs text-pretty'>Foto: {alt.charAt(0).toLowerCase() + alt.slice(1)}</p>
  </div>
)

// As formas de ler o livro, num bento: cada uma com a foto de alguém lendo daquele jeito
const OndeLer = () => (
  <section id='onde-ler' className='scroll-mt-24'>
    <div className='mx-auto flex max-w-7xl flex-col gap-12 px-4 py-24 sm:px-6 lg:gap-16 lg:px-16 lg:py-32'>
      <MotionPreset {...reveal} className='flex max-w-2xl flex-col gap-4'>
        <p className='text-sm font-medium uppercase'>Onde ler</p>
        <WordsReveal
          as='h2'
          text='Do celular da neta à estante da sala.'
          className='font-heading text-display text-balance'
        />
        <p className='text-muted-foreground text-base text-pretty'>
          É o mesmo livro em qualquer lugar. Quem você convidar lê na tela que tiver à mão, e você pode ter o livro
          também em papel.
        </p>
      </MotionPreset>

      <ul className='grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {formas.map(({ title, text, Icon, image, alt, area }, index) => (
          <MotionPreset
            key={title}
            component='li'
            {...reveal}
            delay={0.08 * index}
            className={cn('bg-sand flex flex-col overflow-hidden rounded-2xl', area, index === 4 && 'sm:col-span-2')}
          >
            <div className='relative min-h-56 flex-1'>
              {image ? (
                <Image
                  src={image}
                  alt={alt}
                  fill
                  sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                  className='object-cover'
                />
              ) : (
                <Moldura Icon={Icon} alt={alt} />
              )}
            </div>
            <div className='flex flex-col gap-1 p-6 pt-4'>
              <h3 className='text-base font-medium'>{title}</h3>
              <p className='text-muted-foreground text-sm text-pretty'>{text}</p>
            </div>
          </MotionPreset>
        ))}
      </ul>

      <MotionPreset {...reveal} delay={0.2}>
        <Cta>Criar o livro da família</Cta>
      </MotionPreset>
    </div>
  </section>
)

export default OndeLer
