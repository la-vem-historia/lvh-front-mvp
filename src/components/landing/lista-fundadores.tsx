'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { CircleCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { FOUNDER_SPOTS } from '@/lib/lvh/fundadores'
import type { LeadResult, LeadsCount } from '@/lib/lvh/fundadores'
import { cn } from '@/lib/utils'

// Avisa quem já mostrou o contador que alguém entrou na lista, para todos atualizarem juntos
const LEAD_EVENT = 'lvh:lead'

// Vagas de fundador que ainda restam; some enquanto não sabemos o número
export const VagasFundadores = ({ className }: { className?: string }) => {
  const [taken, setTaken] = useState<number | null>(null)

  useEffect(() => {
    const load = () =>
      fetch('/api/leads')
        .then(response => (response.ok ? (response.json() as Promise<LeadsCount>) : null))
        .then(data => data && setTaken(data.taken))
        .catch(() => {})

    load()
    window.addEventListener(LEAD_EVENT, load)

    return () => window.removeEventListener(LEAD_EVENT, load)
  }, [])

  if (taken === null) return null

  const left = Math.max(FOUNDER_SPOTS - taken, 0)
  // Sem ninguém na lista, "restam 100 de 100" soaria como sala vazia: falamos das vagas abertas
  const label =
    taken === 0
      ? `As ${FOUNDER_SPOTS} vagas de fundador estão abertas`
      : left > 0
        ? `Restam ${left} de ${FOUNDER_SPOTS} vagas de fundador`
        : 'As vagas de fundador acabaram'

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className='text-sm font-medium'>{label}</p>
      <div
        role='progressbar'
        aria-valuenow={Math.min(taken, FOUNDER_SPOTS)}
        aria-valuemin={0}
        aria-valuemax={FOUNDER_SPOTS}
        aria-label='Vagas de fundador preenchidas'
        className='bg-foreground/15 h-1 w-full overflow-hidden rounded-full'
      >
        <div
          className='bg-foreground h-full rounded-full transition-[width] duration-700'
          style={{ width: `${(Math.min(taken, FOUNDER_SPOTS) / FOUNDER_SPOTS) * 100}%` }}
        />
      </div>
    </div>
  )
}

// Só o e-mail para a lista de interessados. Em linha no hero e empilhado na seção de fundadores
const ListaFundadores = ({ id, stacked = false }: { id: string; stacked?: boolean }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [result, setResult] = useState<LeadResult | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    setStatus('sending')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), site: data.get('site') })
      })

      if (!response.ok) throw new Error()

      setResult((await response.json()) as LeadResult)
      setStatus('idle')
      window.dispatchEvent(new Event(LEAD_EVENT))
    } catch {
      setStatus('error')
    }
  }

  if (result) {
    return (
      <div role='status' className='bg-background flex items-start gap-3 rounded-[1.5rem] p-5'>
        <CircleCheckIcon aria-hidden='true' className='fill-foreground text-background mt-0.5 size-5 shrink-0' />
        <div className='flex flex-col gap-1'>
          <p className='text-base font-medium'>
            {result.already ? 'Você já está na lista.' : 'Pronto! Você está na lista.'}
          </p>
          <p className='text-muted-foreground text-sm text-pretty'>
            {result.founder
              ? `Você é o membro fundador nº ${result.position} e garantiu 50% de desconto no primeiro ano. Avisamos por e-mail quando abrirmos.`
              : 'As vagas de fundador já acabaram, mas você vai saber antes de todo mundo quando abrirmos.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
      <div className={cn('flex flex-col gap-2', !stacked && 'sm:flex-row')}>
        <Label className='sr-only' htmlFor={`${id}-email`}>
          Seu e-mail
        </Label>
        <Input
          id={`${id}-email`}
          name='email'
          type='email'
          autoComplete='email'
          placeholder='Seu melhor e-mail'
          maxLength={254}
          required
          className='bg-background h-12 px-5 text-base'
        />
        {/* Isca para robôs: fica fora da tela e longe do leitor de tela */}
        <input type='text' name='site' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
        <Button
          type='submit'
          variant='honey'
          size='cta'
          disabled={status === 'sending'}
          className={cn(!stacked && 'sm:min-w-0')}
        >
          {status === 'sending' ? 'Enviando…' : 'Quero ser fundador'}
        </Button>
      </div>
      {status === 'error' && (
        <p role='alert' className='text-destructive text-sm'>
          Não deu para entrar na lista agora. Confira o e-mail e tente de novo em instantes.
        </p>
      )}
    </form>
  )
}

export default ListaFundadores
