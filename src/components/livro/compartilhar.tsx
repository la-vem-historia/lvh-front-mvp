'use client'

import { useEffect, useState, type FormEvent } from 'react'

import { ForwardIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { overlayDescriptionClassName, overlayTitleClassName } from '@/components/app/page-heading'

import { addShare, getShares, removeShare } from '@/lib/lvh/api'
import type { Share } from '@/lib/lvh/types'

const fieldClassName = 'bg-field h-12 px-5 text-base'

const linkFor = (share: Share) => `${window.location.origin}/ler/${share.token}`

const Compartilhar = () => {
  const [shares, setShares] = useState<Share[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Quando o navegador bloqueia a cópia, o link aparece para copiar à mão
  const [visibleLink, setVisibleLink] = useState<string | null>(null)

  useEffect(() => {
    getShares().then(setShares)
  }, [])

  const copy = async (share: Share) => {
    try {
      await navigator.clipboard.writeText(linkFor(share))
      setCopied(share.id)
      window.setTimeout(() => setCopied(current => (current === share.id ? null : current)), 2000)
    } catch {
      setVisibleLink(share.id)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email')).trim().toLowerCase()

    if (shares.some(share => share.email === email)) {
      setError('Essa pessoa já tem acesso.')

      return
    }

    try {
      const share = await addShare({ name: String(data.get('name')), email })

      setShares(current => [...current, share])
      setError(null)
      form.reset()
      copy(share)
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  const revoke = async (share: Share) => {
    await removeShare(share.id)
    setShares(current => current.filter(item => item.id !== share.id))
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' size='cta' className='gap-2' />}>
        Compartilhar
        <ForwardIcon className='size-5' />
      </SheetTrigger>
      <SheetContent className='bg-background w-full gap-0 overflow-y-auto sm:max-w-md'>
        <SheetHeader className='gap-3 p-6 pt-10'>
          <SheetTitle className={overlayTitleClassName}>Quem pode ler</SheetTitle>
          <SheetDescription className={overlayDescriptionClassName}>
            O livro é fechado: só lê quem você convidar, pelo link pessoal. Você pode tirar o acesso quando quiser.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='border-border flex flex-col gap-4 border-t p-6'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='convite-nome'>Nome</Label>
            <Input id='convite-nome' name='name' required className={fieldClassName} />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='convite-email'>E-mail</Label>
            <Input id='convite-email' name='email' type='email' required className={fieldClassName} />
          </div>
          {error && <p className='text-destructive text-sm'>{error}</p>}
          <Button type='submit' variant='honey' size='cta' className='w-full'>
            Convidar e copiar link
          </Button>
        </form>

        <div className='border-border flex flex-col border-t p-6'>
          <p className='pb-3 text-sm font-medium'>
            {shares.length
              ? `${shares.length} ${shares.length === 1 ? 'pessoa tem' : 'pessoas têm'} acesso`
              : 'Ninguém tem acesso ainda'}
          </p>
          <ul className='flex flex-col'>
            {shares.map(share => (
              <li key={share.id} className='border-border flex flex-col gap-3 border-t py-3'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-medium'>{share.name}</span>
                    <span className='text-muted-foreground truncate text-xs'>{share.email}</span>
                  </div>
                  <div className='flex shrink-0 items-center gap-4 text-xs'>
                    <button
                      type='button'
                      onClick={() => copy(share)}
                      className='cursor-pointer underline underline-offset-4'
                    >
                      {copied === share.id ? 'Copiado!' : 'Copiar link'}
                    </button>
                    <button
                      type='button'
                      onClick={() => revoke(share)}
                      className='text-muted-foreground hover:text-destructive cursor-pointer underline underline-offset-4'
                    >
                      Remover acesso
                    </button>
                  </div>
                </div>
                {visibleLink === share.id && (
                  <input
                    readOnly
                    value={linkFor(share)}
                    aria-label={`Link de ${share.name}`}
                    onFocus={event => event.currentTarget.select()}
                    className='border-border bg-sand h-9 w-full rounded-full border px-4 text-xs'
                  />
                )}
              </li>
            ))}
          </ul>
          {/* Convites simulados: o e-mail não é enviado e o link só abre neste navegador */}
          <p className='text-muted-foreground border-border mt-4 border-t pt-3 text-xs'>
            Protótipo: nenhum e-mail é enviado, e o link só abre neste navegador.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Compartilhar
