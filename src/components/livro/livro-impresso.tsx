import { eyebrowClassName } from '@/components/app/page-heading'

import { cn } from '@/lib/utils'

// Recado sobre o livro impresso. Ainda não é um pedido nem uma promessa: só conta que a
// parceria com a gráfica está em teste e que ela só abre quando o resultado estiver à altura
const LivroImpresso = ({ className }: { className?: string }) => (
  <div className={cn('border-border flex w-full flex-col gap-2 border-t pt-4', className)}>
    <p className={eyebrowClassName}>Livro impresso</p>
    <p className='text-muted-foreground text-sm text-pretty'>
      Estamos testando com uma gráfica parceira o papel, as cores e a encadernação. O livro impresso só chega aqui
      quando estiver à altura da sua história, por isso ainda não tem data.
    </p>
  </div>
)

export default LivroImpresso
