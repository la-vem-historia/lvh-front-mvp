import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

// Título de página no estilo do hero da landing: Fraunces semibold, um pouco menor que o hero
export const pageTitleClassName =
  'font-heading text-[2rem] leading-[1.1] font-semibold tracking-[-0.01em] text-balance lg:text-[2.25rem]'

// Título e descrição de janelas (Dialog) e painéis laterais (Sheet): o mesmo nos dois, um degrau abaixo
// do título de página e em peso regular, como os títulos de seção
export const overlayTitleClassName = 'font-heading text-2xl font-normal text-balance'
export const overlayDescriptionClassName = 'text-muted-foreground text-base text-pretty'

// Link em texto que é uma ação solta (Cancelar, Dispensar, Ver todos): 14px, cinza, escurece no hover.
// Links dentro de uma frase herdam o tamanho e a cor do texto em volta e não usam esta classe
export const textLinkClassName =
  'text-muted-foreground hover:text-foreground cursor-pointer text-sm underline underline-offset-4 transition-colors disabled:cursor-default disabled:opacity-50'

// Etiqueta curta acima dos títulos, em caixa alta como nas seções da landing
export const eyebrowClassName = 'text-sm font-medium uppercase'

type PageHeadingProps = {
  eyebrow?: ReactNode
  title: ReactNode
  children?: ReactNode
  id?: string
  className?: string
}

const PageHeading = ({ eyebrow, title, children, id, className }: PageHeadingProps) => (
  <div className={cn('flex flex-col gap-4', className)}>
    {eyebrow && <p className={eyebrowClassName}>{eyebrow}</p>}
    <h1 id={id} className={pageTitleClassName}>
      {title}
    </h1>
    {children && <p className='text-muted-foreground max-w-md text-base text-pretty'>{children}</p>}
  </div>
)

export default PageHeading
