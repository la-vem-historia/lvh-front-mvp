import { MotionPreset } from '@/components/ui/motion-preset'
import { DrawLine, WordsReveal } from '@/components/landing/motion'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const steps = [
  {
    title: 'Responda perguntas guiadas',
    text: 'Toda semana chega uma pergunta sobre a sua vida: a infância, os amores, o trabalho, as viradas. Você responde no seu tempo, sem precisar saber escrever bem.'
  },
  {
    title: 'Acrescente fotos e voz',
    text: 'Junte fotos antigas às respostas e, se preferir falar a escrever, grave a sua voz. Cada lembrança fica guardada do jeito que ela merece.'
  },
  {
    title: 'Compartilhe com quem você ama',
    text: 'Suas histórias viram um livro digital. Só lê quem você convidar, e você pode tirar o acesso de qualquer pessoa quando quiser.'
  }
]

const ComoFunciona = () => {
  return (
    <section id='como-funciona' className='scroll-mt-24'>
      <div className='mx-auto flex max-w-7xl flex-col gap-16 px-4 py-24 sm:px-6 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4'>
            <p className='text-sm font-medium uppercase'>Como funciona</p>
            <WordsReveal
              as='h2'
              text='Da primeira pergunta ao livro nas mãos.'
              className='font-heading text-display text-balance'
            />
          </div>
          <p className='text-muted-foreground text-base text-pretty'>
            Três passos simples.
            <br />
            Você só precisa de alguns minutos por semana e de vontade de lembrar.
          </p>
        </MotionPreset>

        <ol className='grid gap-12 md:grid-cols-3 md:gap-8'>
          {steps.map((step, index) => (
            <MotionPreset
              key={step.title}
              {...reveal}
              delay={0.1 * (index + 1)}
              component='li'
              className='flex flex-col gap-8'
            >
              <div className='relative flex flex-col gap-3 pt-6'>
                <DrawLine className='bg-foreground absolute inset-x-0 top-0' delay={0.15 * index} />
                <span className='text-clay text-sm font-bold' aria-hidden='true'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className='text-sm font-bold uppercase'>{step.title}</h3>
                <p className='text-muted-foreground text-base leading-relaxed'>{step.text}</p>
              </div>
              {/* Lugar da foto de cada passo; as imagens ainda vão chegar */}
              <div className='bg-blush mt-auto aspect-[363/384] w-full rounded-[1.5rem]' aria-hidden='true' />
            </MotionPreset>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default ComoFunciona
