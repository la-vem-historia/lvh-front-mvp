import Image from 'next/image'

import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'

import morenoImage from '@/assets/landing/moreno.png'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// Texto do fundador, revisado por ele: uma linha por frase, sem espaço entre parágrafos
const letter = [
  '“Em setembro de 2025 meu pai comemorou seus 70 anos com uma grande festa.',
  'Lá, seus amigos de infância me contaram histórias que ele mesmo nunca havia me contado.',
  'Assim, comecei a enxergar meu pai de uma maneira diferente: ainda mais divertido, gentil e generoso.',
  'Dois meses depois, ele morreu.',
  'E muitas outras histórias foram junto com ele.',
  'Por isso criei o Lá vem história!: um lugar para você registrar suas memórias em texto, imagem e voz, e eternizá-las para seus filhos e netos.”'
]

const Recado = () => {
  return (
    <section id='recado' className='bg-sand'>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col gap-4 lg:sticky lg:top-28 lg:col-span-4 lg:self-start'>
          <p className='text-sm font-medium uppercase'>Carta do fundador</p>
          <WordsReveal as='h2' text='Um recado para você.' className='font-heading text-display' />
        </MotionPreset>

        <MotionPreset {...reveal} delay={0.15} className='flex flex-col gap-3 lg:col-span-7 lg:col-start-6 lg:pt-16'>
          <div className='flex flex-col gap-6'>
            <p className='text-sm leading-[2] italic'>
              {letter.map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <div className='flex items-center gap-3'>
              <Image src={morenoImage} alt='' width={48} height={48} className='size-12 rounded-full object-cover' />
              <div className='flex flex-col'>
                <span className='text-base font-medium'>Moreno Lennertz</span>
                <span className='text-muted-foreground text-[0.8125rem] leading-5'>Fundador do Lá Vem História!</span>
              </div>
            </div>
          </div>
          <p className='border-foreground border-t pt-8 text-base font-medium'>
            Não deixe para depois. Pode ser tarde demais.
          </p>
        </MotionPreset>
      </div>
    </section>
  )
}

export default Recado
