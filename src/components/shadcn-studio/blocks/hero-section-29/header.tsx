'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { Navigation } from '@/components/shadcn-studio/blocks/hero-navigation-02'

import { HeroNavigation02, HeroNavigation02SmallScreen } from '@/components/shadcn-studio/blocks/hero-navigation-02'

import { cn } from '@/lib/utils'

import Logo from '@/components/shadcn-studio/logo'

type HeaderProps = {
  navigationData: Navigation[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    // Barra fixa de largura total, translúcida; ao rolar ganha um fundo mais opaco com desfoque
    <header
      className={cn(
        'bg-cream/50 fixed top-0 z-50 h-20 w-full transition-all duration-300',
        {
          'before:bg-cream/75 before:absolute before:inset-0 before:-z-1 before:size-full before:backdrop-blur':
            isScrolled
        },
        className
      )}
    >
      <div className='mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8'>
        <div className='flex w-full items-center justify-between gap-6'>
          {/* Logo */}
          <a href='#'>
            <Logo className='gap-3 [&_svg]:h-[2.125rem]' />
          </a>

          <div className='flex items-center gap-7.5'>
            {/* Navigation: os links já têm 12px de respiro, então o espaço até os botões fica em 30px */}
            <HeroNavigation02 navigationData={navigationData} className='max-lg:hidden' />

            {/* Entrar e criar conta */}
            <div className='flex items-center gap-4 max-lg:hidden'>
              <Button
                variant='outline'
                size='cta'
                className='min-w-0'
                render={<Link href='/entrar' />}
                nativeButton={false}
              >
                Entrar
              </Button>
              <Button
                variant='honey'
                size='cta'
                className='min-w-0'
                render={<Link href='/entrar?modo=criar' />}
                nativeButton={false}
              >
                Cadastre-se grátis
              </Button>
            </div>
          </div>

          {/* Navigation for small screens */}
          <div className='flex gap-2 lg:hidden'>
            <Button
              variant='outline'
              size='cta'
              className='min-w-0 max-md:h-11 max-md:px-5'
              render={<Link href='/entrar' />}
              nativeButton={false}
            >
              Entrar
            </Button>

            <HeroNavigation02SmallScreen
              navigationData={navigationData}
              cta={{ title: 'Cadastre-se grátis', href: '/entrar?modo=criar' }}
              triggerClassName='size-12 max-md:size-11 bg-background/80 text-foreground hover:bg-background'
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
