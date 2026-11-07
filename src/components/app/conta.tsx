'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Avatar from '@/components/app/avatar'
import Section from '@/components/app/section'
import { useUpdateUser, useUser } from '@/components/app/session'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/app/social-icons'

import { changeProfile, countProfileOnlyAnswers, signOut, type LoginProvider } from '@/lib/lvh/api'
import { resizeImage } from '@/lib/lvh/media'
import { cn } from '@/lib/utils'

const fieldClassName = 'bg-background h-12 px-5 text-base'

// Papéis disponíveis, com a mesma cor do card escolhido no onboarding
const roles = [
  { value: 'Pai', hint: 'As perguntas falam com você como pai.', card: 'bg-olive text-cream', topic: 'paternidade', grand: false },
  { value: 'Mãe', hint: 'As perguntas falam com você como mãe.', card: 'bg-lilac text-ink', topic: 'maternidade', grand: false },
  { value: 'Avô', hint: 'As perguntas falam com você como avô.', card: 'bg-moss text-cream', topic: 'avós', grand: true },
  { value: 'Avó', hint: 'As perguntas falam com você como avó.', card: 'bg-clay text-cream', topic: 'avós', grand: true }
]

// Perfil: foto (salva na hora) e o nome que aparece no app
const Perfil = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ''
    if (!file) return

    try {
      await updateUser({ avatar: await resizeImage(file, 400, 0.85) })
      setError(null)
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  const [name, setName] = useState(user.name)
  // O botão de salvar só existe quando há um nome novo de verdade
  const changed = name.trim() !== '' && name.trim() !== user.name

  const handleName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!changed) return
    await updateUser({ name: name.trim() })
    setName(name.trim())
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center gap-5'>
        <Avatar user={user} className='size-20 text-2xl' />
        <div className='flex flex-col items-start gap-2'>
          <Button type='button' variant='outline' className='h-10 px-5' onClick={() => fileInput.current?.click()}>
            {user.avatar ? 'Trocar foto' : 'Enviar foto'}
          </Button>
          {user.avatar && (
            <button
              type='button'
              onClick={() => updateUser({ avatar: undefined })}
              className='text-muted-foreground hover:text-destructive cursor-pointer text-xs underline underline-offset-4'
            >
              Remover foto
            </button>
          )}
          <input
            ref={fileInput}
            type='file'
            accept='image/*'
            onChange={upload}
            className='hidden'
            aria-label='Escolher foto de perfil'
          />
        </div>
      </div>
      {error && <p className='text-destructive text-sm'>{error}</p>}

      <form onSubmit={handleName} className='flex flex-col gap-2'>
        <Label htmlFor='conta-nome'>Nome</Label>
        <div className='flex items-center'>
          <Input
            id='conta-nome'
            name='name'
            autoComplete='given-name'
            value={name}
            onChange={event => setName(event.target.value)}
            required
            className={cn(fieldClassName, 'min-w-0 flex-1')}
          />
          {/* O campo encolhe aos poucos para dar lugar ao botão; a folga em volta deixa a sombra inteira */}
          <AnimatePresence initial={false}>
            {changed && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className='-my-6 -mr-4 shrink-0 overflow-hidden py-6 pr-4'
              >
                <Button type='submit' variant='honey' className='ml-3 h-12 px-7 text-sm'>
                  Salvar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span role='status' className='text-muted-foreground min-h-5 text-sm'>
          {saved ? 'Nome salvo' : ''}
        </span>
      </form>
    </div>
  )
}

// Papel: mostra o atual e só troca depois de um aviso claro sobre as respostas que se perdem
const Papel = () => {
  const user = useUser()
  const [choosing, setChoosing] = useState(false)
  const [target, setTarget] = useState<string | null>(null)
  const [lostCount, setLostCount] = useState(0)
  const [pending, setPending] = useState(false)
  const current = roles.find(role => role.value === user.profile)
  // Troca só dentro da mesma geração: virar avô num livro para o filho mudaria quem recebe
  const others = roles.filter(role => role.value !== user.profile && role.grand === current?.grand)

  useEffect(() => {
    countProfileOnlyAnswers(user.profile).then(setLostCount)
  }, [user.profile])

  const cancel = () => {
    setChoosing(false)
    setTarget(null)
  }

  const confirm = async () => {
    if (!target) return

    setPending(true)
    await changeProfile(target)
    // A sessão guarda o usuário em memória: recarrega para todo o app ver o papel novo
    window.location.reload()
  }

  return (
    <div className='flex flex-col gap-5'>
      {/* Discreto de propósito: trocar de papel é exceção (quem errou no onboarding), não algo do dia a dia */}
      {current && (
        <div className='flex flex-col gap-1'>
          <p className='flex flex-wrap items-center gap-2 text-base'>
            Neste livro, você conta a história como
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', current.card)}>{current.value}</span>
          </p>
          <p className='text-muted-foreground text-sm'>{current.hint}</p>
        </div>
      )}

      {!choosing && (
        <button
          type='button'
          onClick={() => setChoosing(true)}
          className='text-muted-foreground hover:text-foreground w-fit cursor-pointer text-sm underline underline-offset-4'
        >
          Escolhi o papel errado. E agora?
        </button>
      )}

      {choosing && (
        <div className='border-border flex flex-col gap-5 rounded-[1.5rem] border p-6'>
          <div className='flex flex-col gap-3'>
            <span className='text-sm font-medium'>Contar como</span>
            <div className='flex flex-wrap gap-2'>
              {others.map(role => (
                <button
                  key={role.value}
                  type='button'
                  aria-pressed={target === role.value}
                  onClick={() => setTarget(role.value)}
                  className={cn(
                    'cursor-pointer rounded-full border px-5 py-2 text-sm transition-colors',
                    target === role.value
                      ? 'bg-moss text-cream border-moss'
                      : 'border-border hover:border-foreground/40'
                  )}
                >
                  {role.value}
                </button>
              ))}
            </div>
          </div>

          {target && (
            <div role='alert' className='bg-sand flex gap-3 rounded-2xl p-4 text-sm text-pretty'>
              <TriangleAlertIcon className='text-clay mt-0.5 size-4 shrink-0' aria-hidden='true' />
              {lostCount > 0 ? (
                <p>
                  Você já respondeu {lostCount}{' '}
                  {lostCount === 1 ? 'pergunta que só existe' : 'perguntas que só existem'} para{' '}
                  {user.profile?.toLowerCase()}.{' '}
                  <strong className='font-medium'>
                    Ao trocar para {target.toLowerCase()},{' '}
                    {lostCount === 1 ? 'essa resposta será apagada' : 'essas respostas serão apagadas'}
                  </strong>{' '}
                  e as perguntas de {target.toLowerCase()} entram no lugar. Isso não pode ser desfeito. As outras
                  respostas continuam no livro.
                </p>
              ) : (
                // Mesmo sem respostas desse tipo agora, a regra vale: o aviso nunca promete que nada se perde
                <p>
                  As perguntas passam a falar com você como {target.toLowerCase()}, e algumas perguntas mudam.{' '}
                  <strong className='font-medium'>
                    Perguntas que só existem para {user.profile?.toLowerCase()}
                    {current && `, como as de ${current.topic},`} saem do seu livro, junto com as respostas.
                  </strong>{' '}
                  Isso não pode ser desfeito.
                </p>
              )}
            </div>
          )}

          <div className='flex flex-wrap items-center gap-4'>
            <Button
              type='button'
              size='cta'
              disabled={!target || pending}
              onClick={confirm}
              className={cn('w-fit', lostCount > 0 && 'bg-destructive hover:bg-destructive/90 text-white')}
            >
              {target ? `Trocar para ${target.toLowerCase()}` : 'Escolha um papel'}
            </Button>
            <button
              type='button'
              onClick={cancel}
              className='text-muted-foreground cursor-pointer text-sm underline underline-offset-4'
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const providers = [
  { provider: 'google', label: 'Google', Icon: GoogleIcon },
  { provider: 'apple', label: 'Apple', Icon: AppleIcon },
  { provider: 'facebook', label: 'Facebook', Icon: FacebookIcon }
] satisfies { provider: LoginProvider; label: string; Icon: typeof GoogleIcon }[]

// Login: o e-mail da conta (entra por código) e as contas sociais conectadas
const Login = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const connected = user.providers ?? []

  // Protótipo: conectar só marca a conta; o OAuth de verdade vem com o backend
  const toggle = (provider: LoginProvider) =>
    updateUser({
      providers: connected.includes(provider) ? connected.filter(item => item !== provider) : [...connected, provider]
    })

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='conta-email'>E-mail</Label>
        <Input id='conta-email' value={user.email} readOnly disabled className={fieldClassName} />
        <p className='text-muted-foreground text-xs'>Você entra com um código que enviamos para este e-mail.</p>
      </div>

      <div className='flex flex-col gap-3'>
        <span className='text-sm font-medium'>Contas conectadas</span>
        <ul className='border-border flex flex-col rounded-[1.5rem] border'>
          {providers.map(({ provider, label, Icon }) => {
            const isConnected = connected.includes(provider)

            return (
              <li
                key={provider}
                className='border-border flex items-center justify-between gap-4 border-t px-5 py-4 first:border-t-0'
              >
                <span className='flex items-center gap-3 text-sm font-medium'>
                  <Icon className='size-5' />
                  {label}
                  {isConnected && <span className='text-muted-foreground font-normal'>· Conectada</span>}
                </span>
                <Button
                  type='button'
                  variant='outline'
                  className={cn('h-9 px-4 text-xs', isConnected && 'border-border text-muted-foreground')}
                  onClick={() => toggle(provider)}
                >
                  {isConnected ? 'Desconectar' : 'Conectar'}
                </Button>
              </li>
            )
          })}
        </ul>
        <p className='text-muted-foreground text-xs'>
          Conectar deixa você entrar com um clique. Protótipo: nada sai do seu navegador.
        </p>
      </div>
    </div>
  )
}

const SairDaConta = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/entrar')
  }

  return (
    <Button type='button' variant='outline' size='cta' className='w-fit' onClick={handleSignOut}>
      Sair da conta
    </Button>
  )
}

// Capa, nome na capa e dedicatória ficam na página do livro, em Personalizar
const MinhaConta = () => (
  <div className='mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-16 lg:py-16'>
    <h1 className='text-sm font-medium uppercase'>Minha conta</h1>

    <Section title='Perfil' description='A sua foto e o seu nome, como aparecem no app.'>
      <Perfil />
    </Section>

    <Section
      title='Quem conta a história'
      description='Escolhido ao criar o livro aberto agora. Define como as perguntas falam com você.'
    >
      <Papel />
    </Section>

    <Section title='Meus livros' description='Os livros que você escreve, um para cada pessoa, e o pagamento.'>
      <Link href='/app/livros' className='w-fit text-base underline underline-offset-4'>
        Ver meus livros e a mensalidade
      </Link>
    </Section>

    <Section title='Login' description='Como você entra na sua conta.'>
      <Login />
    </Section>

    <Section title='Sair' description='Você pode voltar quando quiser. O que você escreveu fica guardado.'>
      <SairDaConta />
    </Section>
  </div>
)

export default MinhaConta
