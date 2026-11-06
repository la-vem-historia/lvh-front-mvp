import { MotionPreset } from '@/components/ui/motion-preset'
import ListaFundadores, { VagasFundadores } from '@/components/landing/lista-fundadores'
import { DrawLine, WordsReveal } from '@/components/landing/motion'

import { FOUNDER_SPOTS } from '@/lib/lvh/fundadores'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const perks = [
  {
    title: '50% de desconto no primeiro ano',
    text: 'Em qualquer plano. O preço de fundador fica guardado no seu e-mail até a assinatura.'
  },
  {
    title: 'Acesso antes de todo mundo',
    text: 'Você começa a responder antes da abertura e conta para a gente o que achou.'
  },
  {
    title: 'Nada para pagar agora',
    text: 'Entrar na lista é grátis e sem compromisso. Quando abrirmos, você decide se quer assinar.'
  }
]

// Captação de interessados enquanto o site não abre: os primeiros da lista viram membros fundadores
const Fundadores = () => {
  return (
    <section id='fundadores' className='bg-sand scroll-mt-20'>
      <div className='mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-32'>
        <div className='flex flex-col gap-10 lg:col-span-6'>
          <MotionPreset {...reveal} className='flex flex-col gap-4'>
            <p className='text-sm font-medium uppercase'>Membros fundadores</p>
            <WordsReveal
              as='h2'
              text={`Entre para a lista dos ${FOUNDER_SPOTS} primeiros.`}
              className='font-heading text-display text-balance'
            />
            <p className='text-muted-foreground text-base text-pretty'>
              Estamos dando os últimos retoques no Lá Vem História. Quem chegar primeiro ajuda a construir o produto e
              paga menos por isso.
            </p>
          </MotionPreset>

          <dl className='flex flex-col'>
            {perks.map((perk, index) => (
              <MotionPreset
                key={perk.title}
                {...reveal}
                delay={0.1 * (index + 1)}
                className='relative flex flex-col gap-2 py-6'
              >
                <DrawLine className='bg-foreground absolute inset-x-0 top-0' delay={0.12 * index} />
                <dt className='text-sm font-bold uppercase'>{perk.title}</dt>
                <dd className='text-muted-foreground text-base leading-relaxed'>{perk.text}</dd>
              </MotionPreset>
            ))}
          </dl>
        </div>

        <MotionPreset {...reveal} delay={0.2} className='lg:col-span-5 lg:col-start-8 lg:self-center'>
          <div className='bg-cream flex flex-col gap-8 rounded-[1.5rem] p-8 sm:p-10'>
            <div className='flex flex-col gap-2'>
              <h3 className='font-heading text-2xl'>Garanta a sua vaga</h3>
              <p className='text-muted-foreground text-sm'>Só pedimos o seu melhor e-mail.</p>
            </div>
            <ListaFundadores id='fundadores' stacked />
            <VagasFundadores />
          </div>
        </MotionPreset>
      </div>
    </section>
  )
}

export default Fundadores
