import Image from 'next/image'

import { MotionPreset } from '@/components/ui/motion-preset'
import { DrawLine, WordsReveal } from '@/components/landing/motion'
import Cta from '@/components/landing/cta'

import livroTelas from '@/assets/landing/livro-telas.jpg'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const details = [
  {
    title: 'Fechado, só para convidados',
    text: 'Você escolhe quem pode ler, pessoa por pessoa, e tira o acesso de qualquer uma quando quiser.'
  },
  {
    title: 'A sua voz dentro das páginas',
    text: 'As lembranças que você gravou tocam ali mesmo, para a família ouvir a história contada por você.'
  },
  {
    title: 'Fotos ao lado das histórias',
    text: 'As fotos que você acrescentou aparecem junto às lembranças que elas contam.'
  }
]

const OLivro = () => {
  return (
    <section id='o-livro' className='bg-paper scroll-mt-24'>
      <div className='mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-32'>
        {/* O mesmo livro no papel, no iPad e no celular, visto de cima numa mesa: num card, como o hero */}
        <MotionPreset {...reveal} className='flex items-center lg:col-span-6'>
          <div className='relative aspect-square w-full overflow-hidden rounded-2xl'>
            <Image
              src={livroTelas}
              alt='Vista de cima de uma mesa de madeira com o livro de capa terracota “Minha vida, muitas histórias”, um iPad e um iPhone mostrando a mesma capa, e uma xícara de café'
              placeholder='blur'
              sizes='(min-width: 1024px) 45vw, 100vw'
              className='size-full object-cover'
            />
          </div>
        </MotionPreset>

        <div className='flex flex-col gap-12 lg:col-span-5 lg:col-start-8 lg:justify-center'>
          <MotionPreset {...reveal} delay={0.1} className='flex flex-col gap-4'>
            <p className='text-sm font-medium uppercase'>O livro</p>
            <WordsReveal
              as='h2'
              text='Um livro de verdade, para ler em qualquer tela.'
              className='font-heading text-display'
            />
            <p className='text-muted-foreground text-base text-pretty'>
              Nada de arquivo esquecido no computador. O que você conta vira um livro digital, com capa, sumário e
              capítulos, que cresce a cada resposta.
            </p>
          </MotionPreset>

          <dl className='flex flex-col'>
            {details.map((detail, index) => (
              <MotionPreset
                key={detail.title}
                {...reveal}
                delay={0.1 * (index + 2)}
                className='relative flex flex-col gap-4 py-8'
              >
                <DrawLine className='bg-foreground absolute inset-x-0 top-0' delay={0.12 * index} />
                <dt className='text-sm font-bold uppercase'>{detail.title}</dt>
                <dd className='text-muted-foreground text-base leading-relaxed'>{detail.text}</dd>
              </MotionPreset>
            ))}
          </dl>

          <MotionPreset {...reveal} delay={0.5}>
            <Cta>Começar o meu livro</Cta>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default OLivro
