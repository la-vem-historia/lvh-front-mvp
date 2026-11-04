'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pageTitleClassName } from '@/components/app/page-heading'

import {
  deleteAccount,
  exportMyData,
  getAnswers,
  getCollaborators,
  getContributions,
  getShares,
  isAnswered
} from '@/lib/lvh/api'

const CONFIRMATION_WORD = 'EXCLUIR'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// Fluxo de exclusão: primeiro o que se perde e o backup, depois a confirmação digitada
const ExcluirConta = () => {
  const router = useRouter()
  const [step, setStep] = useState<'antes' | 'confirmar'>('antes')
  const [counts, setCounts] = useState({ answers: 0, readers: 0, collaborators: 0, contributions: 0 })
  const [downloaded, setDownloaded] = useState(false)
  const [ready, setReady] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([getAnswers(), getShares(), getCollaborators(), getContributions()]).then(
      ([answers, readers, collaborators, contributions]) =>
        setCounts({
          answers: Object.values(answers).filter(answer => isAnswered(answer)).length,
          readers: readers.length,
          collaborators: collaborators.length,
          contributions: contributions.filter(item => item.text.trim()).length
        })
    )
  }, [])

  const download = async () => {
    const data = await exportMyData()
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')

    link.href = url
    link.download = `la-vem-historia-meus-dados-${data.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
  }

  const confirm = async () => {
    setDeleting(true)
    await deleteAccount()
    router.replace('/conta-excluida')
  }

  const losses = [
    `${plural(counts.answers, 'resposta', 'respostas')}, com as fotos e os áudios`,
    'O seu livro, a capa e a dedicatória',
    `${plural(counts.contributions, 'lembrança', 'lembranças')} que os seus convidados escreveram`,
    `O acesso de ${plural(counts.readers, 'leitor', 'leitores')} e ${plural(counts.collaborators, 'colaborador', 'colaboradores')}: os links deixam de funcionar`
  ]

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-10 sm:px-6 lg:py-16'>
      {step === 'antes' ? (
        <Link
          href='/app/configuracoes'
          className='text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 text-sm'
        >
          <ArrowLeftIcon className='size-4' />
          Configurações
        </Link>
      ) : (
        <button
          type='button'
          onClick={() => setStep('antes')}
          className='text-muted-foreground hover:text-foreground flex w-fit cursor-pointer items-center gap-2 text-sm'
        >
          <ArrowLeftIcon className='size-4' />
          Voltar
        </button>
      )}

      {step === 'antes' && (
        <>
          <div className='flex flex-col gap-4'>
            <p className='text-destructive text-sm font-medium uppercase'>Excluir conta · 1 de 2</p>
            <h1 className={pageTitleClassName}>Antes de ir, guarde uma cópia.</h1>
            <p className='text-muted-foreground text-base text-pretty'>
              Excluir a conta apaga tudo de uma vez, e não conseguimos recuperar depois. Isto é o que vai embora:
            </p>
          </div>

          <ul className='border-border flex flex-col border-b'>
            {losses.map(loss => (
              <li key={loss} className='border-border border-t py-3 text-base'>
                {loss}
              </li>
            ))}
          </ul>

          <section className='bg-sand flex flex-col gap-5 rounded-2xl p-6'>
            <div className='flex flex-col gap-1'>
              <h2 className='text-base font-medium'>Faça o backup dos seus dados</h2>
              <p className='text-muted-foreground text-sm'>
                Uma cópia completa das suas respostas, fotos, áudios e convidados, para guardar com você.
              </p>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-wrap items-center gap-4'>
                <Button type='button' variant='outline' className='bg-background h-10 gap-2 px-5' onClick={download}>
                  <DownloadIcon />
                  Baixar meus dados
                </Button>
                {downloaded && (
                  <span role='status' className='text-sm'>
                    Cópia baixada.
                  </span>
                )}
              </div>
              <div className='flex flex-wrap items-center gap-4'>
                <Button type='button' variant='outline' className='bg-background h-10 gap-2 px-5' disabled>
                  <DownloadIcon />
                  Baixar o livro em PDF
                </Button>
                <span className='border-border rounded-full border px-2.5 py-0.5 text-xs font-medium'>Em breve</span>
              </div>
            </div>
          </section>

          <label className='flex cursor-pointer items-start gap-3 text-base'>
            <input
              type='checkbox'
              checked={ready}
              onChange={event => setReady(event.target.checked)}
              className='accent-foreground mt-1 size-4'
            />
            Já guardei uma cópia dos meus dados, ou não preciso dela.
          </label>

          <div className='flex flex-wrap items-center gap-4'>
            <Button type='button' size='cta' disabled={!ready} onClick={() => setStep('confirmar')}>
              Continuar
            </Button>
            <Link href='/app/configuracoes' className='text-muted-foreground text-sm underline underline-offset-4'>
              Cancelar e manter a conta
            </Link>
          </div>
        </>
      )}

      {step === 'confirmar' && (
        <>
          <div className='flex flex-col gap-4'>
            <p className='text-destructive text-sm font-medium uppercase'>Excluir conta · 2 de 2</p>
            <h1 className={pageTitleClassName}>Tem certeza?</h1>
            <p className='text-muted-foreground text-base text-pretty'>
              Esta ação é <span className='text-foreground font-medium'>definitiva e não pode ser desfeita</span>. A sua
              conta e todas as suas histórias serão apagadas agora, e ninguém mais vai conseguir abrir o seu livro.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='confirmar-exclusao'>
              Para confirmar, digite <span className='font-semibold'>{CONFIRMATION_WORD}</span>
            </Label>
            <Input
              id='confirmar-exclusao'
              value={typed}
              onChange={event => setTyped(event.target.value)}
              autoComplete='off'
              autoFocus
              className='bg-background h-12 max-w-xs px-4 text-base'
            />
          </div>

          <div className='flex flex-wrap items-center gap-4'>
            <Button
              type='button'
              size='cta'
              disabled={typed.trim().toUpperCase() !== CONFIRMATION_WORD || deleting}
              onClick={confirm}
              className='bg-destructive hover:bg-destructive/90 text-white'
            >
              Excluir minha conta para sempre
            </Button>
            <Link href='/app/configuracoes' className='text-muted-foreground text-sm underline underline-offset-4'>
              Cancelar e manter a conta
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default ExcluirConta
