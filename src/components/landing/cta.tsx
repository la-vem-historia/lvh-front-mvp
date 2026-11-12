import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

// Chamada para começar, uma por seção da landing: o texto muda com o assunto da seção, o destino é sempre criar a conta
const Cta = ({ children, className }: { children: string; className?: string }) => (
  <Button
    render={<Link href='/entrar?modo=criar' />}
    nativeButton={false}
    variant='honey'
    size='cta'
    className={cn('w-full sm:w-fit', className)}
  >
    {children}
  </Button>
)

export default Cta
