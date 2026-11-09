import Image from 'next/image'
import Link from 'next/link'
import { PlayIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'
import { TRIAL } from '@/components/landing/teste-gratis'

import heroFoto from '@/assets/landing/hero-livro-foto.jpg'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const Hero = () => {
  return (
    // Até 1536px: mesma largura e margens do header, com o texto alinhado ao logo.
    // Em telas grandes: a margem esquerda (30vw - metade do bloco) volta a centralizar o texto nos 60% da esquerda,
    // e o livro fica centralizado em todo o espaço que sobra à direita do texto
    <section className='mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,36.5rem)_minmax(0,1fr)] lg:gap-16 lg:px-8 2xl:max-w-none 2xl:pr-16 2xl:pl-[calc(30vw-18.25rem)]'>
      <div className='flex items-center py-16 lg:py-24'>
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
              className='text-muted-foreground max-w-xl text-base text-pretty'
            >
              A infância, o primeiro amor, as escolhas difíceis. Deixe para seus filhos e netos as histórias que só você
              pode contar, na sua voz.
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
            <p className='text-muted-foreground text-sm text-pretty'>{TRIAL}.</p>
          </MotionPreset>
        </div>
      </div>

      {/* O livro de verdade: impresso na frente e, atrás, o mesmo livro aberto no iPad, que é o que já existe hoje.
          As bordas da foto somem no creme da página, para o livro parecer estar em cima dela */}
      <MotionPreset {...reveal} delay={0.3} className='flex items-center justify-center pb-16 lg:py-10'>
        <div className='relative w-full max-w-[40rem]'>
          <Image
            src={heroFoto}
            alt='O livro “A minha história”, de Maria Oliveira, em capa dura de tecido verde com letras douradas, sobre uma toalha de linho, com um iPad atrás mostrando o mesmo livro aberto, uma foto antiga de um casal e óculos de leitura'
            priority
            placeholder='blur'
            sizes='(min-width: 1024px) 45vw, 100vw'
            className='h-auto w-full'
            style={{
              maskImage:
                'linear-gradient(to right, transparent, black 14%, black 86%, transparent), linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in'
            }}
          />

          {/* A voz que vem junto com o livro: o que o papel sozinho não tem */}
          <div
            aria-hidden='true'
            className='bg-cream/95 absolute bottom-[14%] left-[3%] flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 sm:gap-3 sm:py-2 sm:pr-5 sm:pl-2 shadow-[0_14px_30px_-14px_rgb(40_30_20/0.45)] backdrop-blur-sm [--drift-delay:0s] [--drift-duration:9s] [--drift-x:0px] [--drift-y:-6px] [animation:keepsake-drift_var(--drift-duration)_ease-in-out_var(--drift-delay)_infinite] motion-reduce:[animation:none]'
          >
            <span className='bg-earth text-cream flex size-7 items-center sm:size-9 justify-center rounded-full'>
              <PlayIcon className='ml-0.5 size-3.5 fill-current sm:size-4' />
            </span>
            <span className='flex flex-col gap-1'>
              <span className='font-heading text-page-muted text-xs italic sm:text-sm'>A voz de Maria · 1:24</span>
              <span className='flex h-3 items-center gap-[2px]'>
                {[4, 8, 5, 10, 7, 12, 6, 9, 4, 11, 7, 5, 9, 6, 3, 8, 5, 4].map((height, index) => (
                  <span key={index} className='bg-page-subtle/70 w-[2px] rounded-full' style={{ height }} />
                ))}
              </span>
            </span>
          </div>
        </div>
      </MotionPreset>
    </section>
  )
}

export default Hero
