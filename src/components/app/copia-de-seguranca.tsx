'use client'

import { useRef, useState } from 'react'

import Link from 'next/link'
import { DownloadIcon, UploadIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useRefreshUser } from '@/components/app/session'

import {
  exportMyData,
  parseBackup,
  restoreBackup,
  summarizeBackup,
  type Backup,
  type BackupSummary
} from '@/lib/lvh/api'
import { cn } from '@/lib/utils'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

type Mode = 'juntar' | 'substituir'

const MODES: { value: Mode; title: string; text: string }[] = [
  {
    value: 'juntar',
    title: 'Juntar com o que já está aqui',
    text: 'Os livros da cópia entram ao lado dos seus. Nada do que já existe é apagado.'
  },
  {
    value: 'substituir',
    title: 'Substituir tudo',
    text: 'Os livros que estão aqui agora são apagados e a conta fica exatamente como na cópia.'
  }
]

// Baixa tudo num arquivo e importa de volta: para trocar de navegador, abrir outra conta ou só guardar
const CopiaDeSeguranca = () => {
  const refreshUser = useRefreshUser()
  const input = useRef<HTMLInputElement>(null)
  const [backup, setBackup] = useState<Backup | null>(null)
  const [summary, setSummary] = useState<BackupSummary | null>(null)
  const [mode, setMode] = useState<Mode>('juntar')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [restored, setRestored] = useState(false)

  const download = async () => {
    const data = await exportMyData()
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
    const link = document.createElement('a')

    link.href = url
    link.download = `la-vem-historia-copia-${data.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const choose = async (file?: File) => {
    setError('')
    setRestored(false)
    if (!file) return

    try {
      const parsed = parseBackup(await file.text())

      setBackup(parsed)
      setSummary(summarizeBackup(parsed))
      setMode('juntar')
    } catch (reason) {
      setError((reason as Error).message)
    }

    // Deixa escolher o mesmo arquivo de novo
    if (input.current) input.current.value = ''
  }

  const cancel = () => {
    setBackup(null)
    setSummary(null)
    setError('')
  }

  const restore = async () => {
    if (!backup) return

    setPending(true)
    setError('')

    try {
      await restoreBackup(backup, mode)
      await refreshUser()
      setBackup(null)
      setSummary(null)
      setRestored(true)
    } catch (reason) {
      setError((reason as Error).message)
    }

    setPending(false)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-3'>
        <Button type='button' variant='outline' className='h-10 gap-2 border px-5' onClick={download}>
          <DownloadIcon className='size-4' aria-hidden='true' />
          Baixar cópia
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-10 gap-2 border px-5'
          onClick={() => input.current?.click()}
        >
          <UploadIcon className='size-4' aria-hidden='true' />
          Restaurar de uma cópia
        </Button>
        <input
          ref={input}
          type='file'
          accept='application/json,.json'
          className='hidden'
          onChange={event => choose(event.target.files?.[0])}
        />
      </div>

      <p className='text-muted-foreground text-sm text-pretty'>
        A cópia leva as suas respostas, fotos e vozes. Guarde o arquivo num lugar seguro, como guardaria um documento
        pessoal.
      </p>

      {summary && (
        <div className='bg-sand flex flex-col gap-5 rounded-2xl p-5'>
          <div className='flex flex-col gap-1'>
            <p className='text-base font-medium'>Cópia de {formatDate(summary.exportedAt)}</p>
            <p className='text-muted-foreground text-sm text-pretty'>
              {plural(summary.books, 'livro', 'livros')} ({summary.bookTitles.join(', ')}),{' '}
              {plural(summary.answers, 'resposta', 'respostas')}, {plural(summary.voices, 'voz', 'vozes')} e{' '}
              {plural(summary.photos, 'foto', 'fotos')}.
            </p>
          </div>

          <fieldset className='flex flex-col gap-2'>
            <legend className='sr-only'>Como restaurar</legend>
            {MODES.map(option => (
              <label
                key={option.value}
                className={cn(
                  'bg-background flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                  mode === option.value ? 'border-foreground' : 'border-transparent'
                )}
              >
                <input
                  type='radio'
                  name='modo-restaurar'
                  value={option.value}
                  checked={mode === option.value}
                  onChange={() => setMode(option.value)}
                  className='accent-foreground mt-1 size-4'
                />
                <span className='flex flex-col gap-0.5'>
                  <span className='text-sm font-medium'>{option.title}</span>
                  <span className='text-muted-foreground text-sm text-pretty'>{option.text}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className='flex flex-wrap items-center gap-3'>
            <Button
              type='button'
              variant={mode === 'substituir' ? 'default' : 'moss'}
              className='h-10 px-5'
              disabled={pending}
              onClick={restore}
            >
              {pending ? 'Restaurando…' : mode === 'substituir' ? 'Apagar e restaurar' : 'Restaurar'}
            </Button>
            <button
              type='button'
              onClick={cancel}
              className='text-muted-foreground hover:text-foreground cursor-pointer text-sm underline underline-offset-4'
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role='alert' className='text-destructive text-sm text-pretty'>
          {error}
        </p>
      )}

      {restored && (
        <p role='status' className='text-sm'>
          Cópia restaurada.{' '}
          <Link href='/app' className='underline underline-offset-4'>
            Ir para o início
          </Link>
        </p>
      )}
    </div>
  )
}

export default CopiaDeSeguranca
