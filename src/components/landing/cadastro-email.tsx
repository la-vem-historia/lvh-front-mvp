'use client'

import type { FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { CADASTRO_EMAIL_KEY } from '@/lib/lvh/cadastro'

// Campo de e-mail com o botão ao lado. Ao enviar, leva para Criar conta
// com o e-mail já preenchido; o e-mail vai pelo sessionStorage para não aparecer na URL
const CadastroEmail = () => {
  const router = useRouter()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()

    try {
      sessionStorage.setItem(CADASTRO_EMAIL_KEY, email)
    } catch {
      // Sem sessionStorage o e-mail só não vem preenchido
    }

    router.push('/entrar?modo=criar')
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2 sm:flex-row'>
      <Label className='sr-only' htmlFor='hero-email'>
        Seu e-mail
      </Label>
      <Input
        id='hero-email'
        name='email'
        type='email'
        autoComplete='email'
        placeholder='Seu melhor e-mail'
        required
        className='bg-background h-12 px-5 text-base'
      />
      <Button type='submit' variant='honey' size='cta' className='sm:min-w-0'>
        Cadastre-se grátis
      </Button>
    </form>
  )
}

export default CadastroEmail
