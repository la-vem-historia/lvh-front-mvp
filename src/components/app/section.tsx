import type { ReactNode } from 'react'

// Bloco das páginas de conta e configurações: título e descrição à esquerda, conteúdo à direita
const Section = ({
  id,
  title,
  description,
  children
}: {
  id?: string
  title: string
  description: string
  children: ReactNode
}) => (
  <section id={id} className='border-foreground grid scroll-mt-28 gap-6 border-t pt-8 lg:grid-cols-12 lg:gap-8'>
    <div className='flex flex-col gap-2 lg:col-span-4'>
      <h2 className='font-heading text-2xl'>{title}</h2>
      <p className='text-muted-foreground text-sm text-pretty'>{description}</p>
    </div>
    <div className='flex flex-col gap-4 lg:col-span-7 lg:col-start-6'>{children}</div>
  </section>
)

export default Section
