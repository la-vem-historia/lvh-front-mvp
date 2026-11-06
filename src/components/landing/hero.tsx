import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import HeroLivro from '@/components/landing/hero-livro'
import { WordsReveal } from '@/components/landing/motion'

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
              text={'Histórias de família se perdem.\nAté que você decide guardá-las.'}
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
              Responda perguntas guiadas sobre a sua vida e transforme suas respostas em um livro para as próximas
              gerações.
            </MotionPreset>
          </div>

          {/* Dois caminhos: criar a conta agora ou descer para entender como funciona */}
          <MotionPreset {...reveal} delay={0.7} className='flex flex-col gap-3 sm:flex-row'>
            <Button render={<Link href='/entrar?modo=criar' />} nativeButton={false} variant='honey' size='cta'>
              Cadastre-se grátis
            </Button>
            <Button render={<a href='#como-funciona' />} nativeButton={false} variant='outline' size='cta'>
              Como funciona
            </Button>
          </MotionPreset>
        </div>
      </div>

      {/* Livro de exemplo, com fotos, voz e recado saindo das páginas; abre no hover */}
      <MotionPreset {...reveal} delay={0.3} className='flex items-center justify-center pb-16 lg:py-10'>
        <HeroLivro />
      </MotionPreset>
    </section>
  )
}

export default Hero
