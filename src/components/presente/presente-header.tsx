import Link from 'next/link'

import Logo from '@/components/shadcn-studio/logo'

// Cabeçalho das páginas do presente: o logo leva de volta à landing
const PresenteHeader = () => (
  <header className='mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8 print:hidden'>
    <Link href='/' className='w-fit'>
      <Logo className='[&_svg]:h-[2.125rem]' />
    </Link>
    <Link href='/#presente' className='text-muted-foreground hover:text-foreground text-sm transition-colors'>
      Voltar ao site
    </Link>
  </header>
)

export default PresenteHeader
