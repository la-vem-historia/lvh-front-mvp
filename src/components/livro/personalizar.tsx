'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUpdateUser, useUser } from '@/components/app/session'
import BookCover, { coverColors } from '@/components/livro/book-cover'
import DedicationPreview from '@/components/livro/dedication-preview'

import { getAnswers } from '@/lib/lvh/api'
import { resizeImage } from '@/lib/lvh/media'
import type { CoverColor } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const DEDICATION_EXAMPLE = 'Para os meus netos, Pedro e Luísa.'

// Personalizar o livro sem sair dele: capa (nome, cor, foto) e dedicatória, com prévias ao vivo
const Personalizar = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const fileInput = useRef<HTMLInputElement>(null)
  const [bookName, setBookName] = useState(user.bookName ?? user.name)
  const [dedication, setDedication] = useState(user.dedication ?? '')
  const [color, setColor] = useState<CoverColor>(user.coverColor ?? 'verde')
  const [photo, setPhoto] = useState<string | undefined>(user.coverPhoto)
  const [answerPhotos, setAnswerPhotos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAnswers().then(answers => setAnswerPhotos(Object.values(answers).flatMap(answer => answer.photos ?? [])))
  }, [])

  const photos = [...new Set([...(photo ? [photo] : []), ...answerPhotos])]

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ''
    if (file) setPhoto(await resizeImage(file, 900, 0.85))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await updateUser({
        bookName: bookName.trim(),
        dedication: dedication.trim(),
        coverColor: color,
        coverPhoto: photo
      })
      onOpenChange(false)
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  const author = bookName.trim() || user.name

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='bg-background w-full gap-0 overflow-y-auto sm:max-w-lg'>
        <SheetHeader className='gap-3 p-6 pt-10'>
          <SheetTitle className='font-heading text-display font-normal'>Personalizar o livro</SheetTitle>
          <SheetDescription className='text-base'>
            A capa e a dedicatória. Dá para mudar quando quiser, aqui mesmo.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='flex flex-col'>
          <section className='border-border flex flex-col gap-6 border-t p-6'>
            <h3 className='text-sm font-medium'>Capa</h3>
            <div className='flex justify-center'>
              <BookCover
                author={author}
                color={color}
                photo={photo}
                year={new Date().getFullYear()}
                className='w-40 shadow-[3px_2px_0_-1px_#f5f0e3,5px_4px_0_-1px_#e6dfcd,0_22px_34px_-16px_rgb(50_38_24/0.55)]'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='personalizar-nome'>Nome na capa</Label>
              <Input
                id='personalizar-nome'
                value={bookName}
                onChange={event => setBookName(event.target.value)}
                placeholder='Maria Oliveira'
                required
                className='bg-background font-heading h-12 px-5 text-xl md:text-xl'
              />
            </div>

            <div className='flex flex-col gap-3'>
              <span className='text-sm font-medium'>Cor do tecido</span>
              <div className='flex flex-wrap gap-3'>
                {(Object.keys(coverColors) as CoverColor[]).map(option => (
                  <button
                    key={option}
                    type='button'
                    aria-pressed={color === option}
                    onClick={() => setColor(option)}
                    className='flex cursor-pointer flex-col items-center gap-1.5 text-xs'
                  >
                    <span
                      className={cn(
                        'ring-offset-background size-9 rounded-full ring-offset-2 transition-shadow',
                        color === option ? 'ring-foreground ring-2' : 'ring-border hover:ring-2'
                      )}
                      style={{ backgroundColor: coverColors[option].cloth }}
                    />
                    <span className={color === option ? 'font-medium' : 'text-muted-foreground'}>
                      {coverColors[option].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <span className='text-sm font-medium'>Foto na capa</span>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  aria-pressed={!photo}
                  onClick={() => setPhoto(undefined)}
                  className={cn(
                    'flex size-14 cursor-pointer items-center justify-center rounded-xl border text-xs',
                    !photo ? 'border-foreground border-2' : 'border-border hover:border-foreground/40'
                  )}
                >
                  Sem foto
                </button>
                {photos.map((item, index) => (
                  <button
                    key={item.slice(-40)}
                    type='button'
                    aria-pressed={photo === item}
                    aria-label={`Usar a foto ${index + 1} na capa`}
                    onClick={() => setPhoto(item)}
                    className={cn(
                      'size-14 cursor-pointer overflow-hidden rounded-xl border',
                      photo === item ? 'border-foreground border-2' : 'border-border hover:border-foreground/40'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item} alt='' className='size-full object-cover' />
                  </button>
                ))}
                <button
                  type='button'
                  onClick={() => fileInput.current?.click()}
                  className='border-border hover:border-foreground/40 text-muted-foreground flex size-14 cursor-pointer items-center justify-center rounded-xl border border-dashed text-center text-xs leading-tight'
                >
                  Enviar
                </button>
                <input
                  ref={fileInput}
                  type='file'
                  accept='image/*'
                  onChange={upload}
                  className='hidden'
                  aria-label='Escolher foto para a capa'
                />
              </div>
            </div>
          </section>

          <section className='border-border flex flex-col gap-6 border-t p-6'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-sm font-medium'>Dedicatória</h3>
              <p className='text-muted-foreground text-sm'>
                A primeira página depois da capa. Se preferir, deixe em branco.
              </p>
            </div>
            <DedicationPreview
              dedication={dedication}
              author={author}
              placeholder={DEDICATION_EXAMPLE}
              className='mx-auto w-full max-w-80'
            />
            <textarea
              value={dedication}
              onChange={event => setDedication(event.target.value)}
              aria-label='Dedicatória'
              placeholder={DEDICATION_EXAMPLE}
              rows={3}
              className='border-border bg-background font-heading placeholder:text-muted-foreground/70 focus-visible:border-ring w-full resize-none rounded-2xl border p-4 text-lg italic outline-none'
            />
          </section>

          <div className='border-border bg-background sticky bottom-0 flex items-center gap-4 border-t p-6'>
            <Button type='submit' variant='honey' size='cta'>
              Salvar
            </Button>
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              className='text-muted-foreground cursor-pointer text-sm underline underline-offset-4'
            >
              Cancelar
            </button>
            {error && <p className='text-destructive text-sm'>{error}</p>}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default Personalizar
