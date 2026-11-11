'use client'

import { useState } from 'react'

import Logo from '@/components/shadcn-studio/logo'
import Simbolo from '@/components/landing/simbolo'

const email = 'oi@lavemhistoria.com.br'

const Rodape = () => {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <footer className='bg-stone'>
      <div className='mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 max-sm:items-center max-sm:gap-6 max-sm:text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-16'>
        <Logo />
        <Simbolo className='size-7 max-sm:hidden' />
        <div className='flex flex-col gap-1 text-sm max-sm:items-center sm:items-end'>
          <button
            type='button'
            onClick={copyEmail}
            className='hover:text-earth w-fit cursor-pointer underline underline-offset-4 transition-colors'
            aria-label={`Copiar o e-mail ${email}`}
          >
            {copied ? 'Copiado!' : email}
          </button>
          <span className='text-muted-foreground'>© {new Date().getFullYear()} Lá Vem História</span>
        </div>
      </div>
    </footer>
  )
}

export default Rodape
