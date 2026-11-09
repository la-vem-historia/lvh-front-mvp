import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import HeroFotos from '@/components/landing/hero-fotos'
import { WordsReveal } from '@/components/landing/motion'
import { TRIAL } from '@/components/landing/teste-gratis'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const Hero = () => {
  return (
    // Um card grande, de ponta a ponta, como uma foto de revista. A altura segue o 16:9 da largura, sem passar da tela: no desktop a família fica à direita e o texto em cima da parede
    // calma da esquerda; no celular, onde o 16:9 fica baixo demais, a foto vai em cima e o texto embaixo
    <section className='px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6'>
      <div className='bg-paper relative w-full overflow-hidden rounded-2xl lg:h-[min(calc(56.25vw-4rem),calc(100svh-10rem))] lg:min-h-[32rem]'>
        <HeroFotos className='aspect-[4/3] sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto' />

        {/* Véu claro só atrás do texto, para ele continuar legível em qualquer das fotos */}
        <div
          aria-hidden='true'
          className='from-cream/60 via-cream/25 pointer-events-none absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r to-transparent lg:block'
        />

        <div className='relative flex items-center px-5 py-10 sm:px-8 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[44%] lg:px-12 xl:w-[40%] xl:px-16'>
          <div className='@container flex w-full max-w-[36.5rem] flex-col gap-10'>
            <div className='flex flex-col gap-6'>
              <MotionPreset {...reveal} component='p' className='text-sm font-medium uppercase'>
                Livro de memórias de família
              </MotionPreset>
              {/* Duas linhas fixas no desktop: o tamanho acompanha a largura do bloco de texto */}
              <WordsReveal
                text={'Tem coisas que só você sabe.\nConte antes que se percam.'}
                delay={0.15}
                lineClassName='lg:whitespace-nowrap'
                className='font-heading text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.01em] sm:text-5xl lg:text-[clamp(1.75rem,6.5cqw,2.5rem)] lg:leading-[1.1]'
              />
              <MotionPreset
                {...reveal}
                component='p'
                delay={0.55}
                className='text-foreground/80 max-w-xl text-base text-pretty'
              >
                A infância, o primeiro amor, as escolhas difíceis. Deixe para seus filhos e netos as histórias que só
                você pode contar, na sua voz.
              </MotionPreset>
            </div>

            {/* Dois caminhos: começar agora ou descer para entender como funciona. Embaixo, o que o grátis cobre */}
            <MotionPreset {...reveal} delay={0.7} className='flex flex-col gap-3'>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <Button render={<Link href='/entrar?modo=criar' />} nativeButton={false} variant='honey' size='cta'>
                  Comece sua história
                </Button>
                <Button render={<a href='#como-funciona' />} nativeButton={false} variant='outline' size='cta'>
                  Como funciona
                </Button>
              </div>
              <p className='text-foreground/70 text-sm text-pretty'>{TRIAL}.</p>
            </MotionPreset>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
