import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// Os três planos ainda repetem preço, descrição e benefícios: os dados finais chegam depois.
// Cada plano tem a sua cor; o Individual é claro, com texto e botão escuros
const features = [
  'Perguntas guiadas sobre toda a sua vida',
  'Livro digital fechado, só para quem você convidar',
  'Convidados ilimitados, com acesso que você pode remover',
  'Upload ilimitado de fotos e áudios'
]

const plans = [
  { name: 'Individual', card: 'bg-lilac text-ink', line: 'border-ink', button: 'default' as const },
  { name: 'Duo', card: 'bg-olive text-cream', line: 'border-cream', button: 'inverse' as const },
  { name: 'Família', card: 'bg-umber text-cream', line: 'border-cream', button: 'inverse' as const }
].map(plan => ({
  ...plan,
  description: 'Tudo para contar a sua história e dividi-la com quem você ama.',
  price: 'R$ 29,90',
  period: '/ mês',
  features
}))

const Planos = () => {
  return (
    <section id='planos' className='scroll-mt-24'>
      <div className='mx-auto flex max-w-7xl flex-col gap-16 px-4 py-24 sm:px-6 lg:gap-20 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col items-center gap-6 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <p className='text-sm font-medium uppercase'>Planos</p>
            <WordsReveal
              as='h2'
              text='Um preço simples para guardar o que importa.'
              className='font-heading text-display text-balance'
            />
          </div>
          <p className='text-muted-foreground text-base text-pretty'>
            Uma assinatura só, com tudo incluído: escrever, gravar, montar o livro e compartilhar com a família.
          </p>
        </MotionPreset>

        <div className='grid gap-8 lg:grid-cols-3'>
          {plans.map((plan, index) => (
            <MotionPreset
              key={plan.name}
              {...reveal}
              delay={0.1 * (index + 1)}
              className={`${plan.card} flex flex-col gap-8 rounded-[1.5rem] p-8 transition-[translate,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(34_34_34/0.6)] sm:p-10`}
            >
              <div className='flex flex-col gap-2'>
                <h3 className='font-heading text-display'>{plan.name}</h3>
                <p className='text-base'>{plan.description}</p>
              </div>

              <p className='flex items-baseline gap-2'>
                <span className='font-heading text-display-lg'>{plan.price}</span>
                <span className='text-sm'>{plan.period}</span>
              </p>

              <ul className='flex flex-1 flex-col'>
                {plan.features.map(feature => (
                  <li key={feature} className={`${plan.line} border-t py-3 text-sm`}>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                render={<a href='#lista-de-espera' />}
                nativeButton={false}
                variant={plan.button}
                size='cta'
                // O botão escuro do Individual usa a mesma sombra dos botões claros dos outros cards,
                // para a elevação no hover aparecer junto com a do card
                className={
                  plan.button === 'default'
                    ? 'bg-ink hover:bg-[#2c2c2c] hover:shadow-[0_12px_24px_-10px_rgb(0_0_0/0.75)]!'
                    : undefined
                }
              >
                Assinar e começar agora
              </Button>
            </MotionPreset>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Planos
