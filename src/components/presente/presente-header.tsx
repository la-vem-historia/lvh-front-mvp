import Link from 'next/link'

import Logo from '@/components/shadcn-studio/logo'

// Cabeçalho das páginas do presente: o logo leva de volta à landing
const PresenteHeader = () => (
  <header className='mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8 print:hidden'>
    <Link href='/' className='w-fit'>
      <Logo className='[&_svg]:h-[2.125rem]' />
    </Link>
    {/* O cartão manda resgatar em /presente: quem chega com um código acha o caminho aqui */}
    <nav className='flex items-center gap-6 text-sm'>
      <Link href='/presente/resgatar' className='text-foreground underline underline-offset-4'>
        Resgatar presente
      </Link>
      <Link href='/#presente' className='text-muted-foreground hover:text-foreground transition-colors'>
        Voltar ao site
      </Link>
    </nav>
  </header>
)

export default PresenteHeader
