'use client'

import { useState, type FormEvent } from 'react'

import { useRouter } from 'next/navigation'
import { CircleCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import AvisePapeis from '@/components/app/avise-papeis'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useUpdateUser, useUser } from '@/components/app/session'

import { cn } from '@/lib/utils'

// Cada perfil ganha uma cor dos cards de planos da landing quando é escolhido
const profiles = [
  {
    value: 'Pai',
    label: 'Pai',
    hint: 'As perguntas falam com você como pai.',
    selected: 'bg-olive text-cream border-olive',
    check: 'fill-cream text-olive'
  },
  {
    value: 'Mãe',
    label: 'Mãe',
    hint: 'As perguntas falam com você como mãe.',
    selected: 'bg-lilac text-ink border-lilac',
    check: 'fill-ink text-lilac'
  }
]

// Onboarding de uma tela: só o que muda as perguntas. Nome da capa e dedicatória
// ficam para depois, em Personalizar na página do livro
const BoasVindas = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const router = useRouter()
  const [profile, setProfile] = useState(user.profile ?? '')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)

    await updateUser({ profile, onboarded: true })

    // Vai para a home, com os capítulos fechados, para a pessoa ver o todo antes de responder
    router.replace('/app')
  }

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:py-16'>
      <span className={eyebrowClassName}>Boas-vindas, {user.name}</span>

      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        <fieldset aria-labelledby='perfil-titulo' className='flex flex-col gap-6'>
          <div className='flex flex-col gap-3'>
            <h1 id='perfil-titulo' className={pageTitleClassName}>
              Você vai contar a sua história como…
            </h1>
            <p className='text-muted-foreground text-base'>As perguntas se adaptam a quem está contando.</p>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            {profiles.map(option => {
              const isSelected = profile === option.value
              // Com um perfil escolhido, o outro recua: menor e mais apagado
              const isDimmed = profile !== '' && !isSelected

              return (
                <label
                  key={option.value}
                  className={cn(
                    'has-focus-visible:ring-ring/50 relative flex min-h-44 cursor-pointer flex-col justify-between gap-6 rounded-[1.5rem] border p-5 transition-[translate,scale,opacity,box-shadow,background-color,border-color,color] duration-500 ease-out has-focus-visible:ring-3 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(34_34_34/0.6)] sm:min-h-52 sm:p-6',
                    isSelected ? option.selected : 'border-border',
                    isDimmed && 'scale-95 opacity-55 hover:opacity-90'
                  )}
                >
                  <input
                    type='radio'
                    name='profile'
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setProfile(option.value)}
                    required
                    className='peer sr-only'
                  />
                  {/* Marcador: círculo vazio, que vira check sólido ao escolher */}
                  <span className='border-border size-5 rounded-full border peer-checked:hidden' aria-hidden='true' />
                  <CircleCheckIcon
                    aria-hidden='true'
                    className={cn('hidden size-5 peer-checked:block', option.check)}
                  />
                  <span className='flex flex-col gap-2'>
                    <span className='font-heading text-display lg:text-display-lg'>{option.label}</span>
                    <span className={cn('text-sm', isSelected ? 'opacity-85' : 'text-muted-foreground')}>
                      {option.hint}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Fora do fieldset: link discreto, não faz parte da escolha de perfil */}
        <AvisePapeis />

        <Button type='submit' variant='honey' size='cta' disabled={pending || !profile} className='w-fit'>
          Começar a minha história
        </Button>
      </form>
    </div>
  )
}

export default BoasVindas
