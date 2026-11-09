'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
  type ReactNode
} from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MotionPreset } from '@/components/ui/motion-preset'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/app/social-icons'

import { sendLoginCode, signInWithProvider, updateUser, verifyLoginCode, type LoginProvider } from '@/lib/lvh/api'
import { CADASTRO_EMAIL_KEY } from '@/lib/lvh/cadastro'
import { isTeam, type LeadResult } from '@/lib/lvh/pre-abertura'
import { cn } from '@/lib/utils'

// Mesma entrada suave dos blocos da landing
const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// O cookie da equipe não muda enquanto a página está aberta
const subscribeToNothing = () => () => {}

// Tempo até poder pedir outro código
const RESEND_SECONDS = 30

type Mode = 'entrar' | 'criar'
// aviso: antes da abertura, quem não é da equipe deixa o e-mail e fica sabendo que avisaremos
type Step = 'email' | 'codigo' | 'nome' | 'aviso'

const Heading = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) => (
  <div className='flex flex-col gap-4'>
    <p className={eyebrowClassName}>{eyebrow}</p>
    {/* Sem balancear: título curto fica numa linha só, sem quebra forçada no meio */}
    <h1 className={cn(pageTitleClassName, 'text-pretty')}>{title}</h1>
    {children && <p className='text-muted-foreground text-base text-pretty'>{children}</p>}
  </div>
)

const PrototypeNote = ({ children }: { children: ReactNode }) => (
  // Login simulado: some quando o backend de contas existir
  <p className='text-muted-foreground border-border border-t pt-3 text-xs'>{children}</p>
)

const socialProviders = [
  { provider: 'google', label: 'Google', Icon: GoogleIcon },
  { provider: 'apple', label: 'Apple', Icon: AppleIcon },
  { provider: 'facebook', label: 'Facebook', Icon: FacebookIcon }
] satisfies { provider: LoginProvider; label: string; Icon: typeof GoogleIcon }[]

// Login sem senha: a pessoa informa o e-mail (ou usa Google, Apple, Facebook) e recebe um código.
// Nós decidimos se é conta nova ou existente; conta nova só pede o nome depois do código
const EntrarForm = ({ initialMode = 'entrar' }: { initialMode?: Mode }) => {
  const router = useRouter()
  const emailInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState<'email' | 'codigo' | 'nome' | LoginProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  // Só a equipe (quem passou pela senha do site) cria conta e entra de verdade por enquanto
  // O cookie só existe no navegador: no servidor a página sai como para o público
  const team = useSyncExternalStore(subscribeToNothing, isTeam, () => false)

  // Guarda o e-mail na lista de interessados e mostra o aviso da reforma final
  const joinWaitlist = async (address: string) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: address })
    })

    if (!response.ok) throw new Error('Não conseguimos guardar o seu e-mail agora. Tente de novo em instantes.')

    return (await response.json()) as LeadResult
  }

  // E-mail digitado no cadastro da landing: preenche o campo uma vez e é descartado
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CADASTRO_EMAIL_KEY)

      if (saved && emailInput.current) {
        emailInput.current.value = saved
        sessionStorage.removeItem(CADASTRO_EMAIL_KEY)
      }
    } catch {
      // Sem sessionStorage o campo só começa vazio
    }
  }, [])

  useEffect(() => {
    if (resendIn <= 0) return

    const timer = setTimeout(() => setResendIn(seconds => seconds - 1), 1000)

    return () => clearTimeout(timer)
  }, [resendIn])

  const finish = (isNew: boolean) => {
    if (isNew) setStep('nome')
    else router.push('/app')
  }

  const requestCode = async (address: string) => {
    await sendLoginCode(address)
    setResendIn(RESEND_SECONDS)
  }

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const address = String(new FormData(event.currentTarget).get('email') ?? '').trim()

    setPending('email')

    if (!team) {
      try {
        await joinWaitlist(address)
        setEmail(address)
        setError(null)
        setStep('aviso')
      } catch (reason) {
        setError((reason as Error).message)
      }
      setPending(null)
      return
    }

    await requestCode(address)
    setEmail(address)
    setCode('')
    setError(null)
    setPending(null)
    setStep('codigo')
  }

  const verify = async (value: string) => {
    setPending('codigo')
    setError(null)

    try {
      const { isNew } = await verifyLoginCode(email, value)

      finish(isNew)
    } catch (reason) {
      setError((reason as Error).message)
      setPending(null)
    }
  }

  // Só números; ao completar os 6, confere sozinho
  const handleCode = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6)

    setCode(value)
    if (value.length === 6) verify(value)
  }

  const handleProvider = async (provider: LoginProvider) => {
    // Antes da abertura, Google, Apple e Facebook levam ao aviso, que pede o e-mail para avisarmos
    if (!team) {
      setEmail('')
      setError(null)
      return setStep('aviso')
    }

    setPending(provider)

    // A conta do Google, Apple ou Facebook já traz o nome, então não passa pela etapa do nome;
    // conta nova cai no onboarding pelo próprio /app
    await signInWithProvider(provider)
    router.push('/app')
  }

  const handleName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending('nome')
    await updateUser({ name: String(new FormData(event.currentTarget).get('name') ?? '').trim() })
    router.push('/app')
  }

  if (step === 'aviso') {
    return (
      <MotionPreset key='aviso' {...reveal} className='flex w-full max-w-md flex-col gap-10'>
        <Heading eyebrow='Quase lá' title='Estamos dando os últimos retoques.'>
          O Lá Vem História está passando pela reforma final antes de abrir para o público.{' '}
          {email ? (
            <>
              Guardamos o seu e-mail, <span className='text-foreground font-medium'>{email}</span>, e avisamos assim que
              estiver pronto.
            </>
          ) : (
            'Deixe o seu e-mail e avisamos assim que estiver pronto.'
          )}
        </Heading>

        {!email && (
          <form onSubmit={handleEmail} className='flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='aviso-email'>E-mail</Label>
              <Input
                id='aviso-email'
                name='email'
                type='email'
                autoComplete='email'
                required
              />
            </div>
            {error && <p className='text-destructive text-sm'>{error}</p>}
            <Button type='submit' variant='honey' size='cta' disabled={pending !== null} className='w-full'>
              Quero ser avisado
            </Button>
          </form>
        )}

        <Button render={<Link href='/' />} nativeButton={false} variant='outline' size='cta' className='w-fit'>
          Voltar para o início
        </Button>
      </MotionPreset>
    )
  }

  if (step === 'codigo') {
    return (
      <MotionPreset key='codigo' {...reveal} className='flex w-full max-w-md flex-col gap-10'>
        <Heading eyebrow='Confira seu e-mail' title='Digite o código que enviamos.'>
          Mandamos um código de 6 números para <span className='text-foreground font-medium'>{email}</span>. Ele vale
          por 10 minutos.
        </Heading>

        <form
          onSubmit={event => {
            event.preventDefault()
            verify(code)
          }}
          className='flex flex-col gap-5'
        >
          <div className='flex flex-col gap-2'>
            <Label htmlFor='entrar-codigo'>Código</Label>
            <Input
              id='entrar-codigo'
              name='code'
              inputMode='numeric'
              autoComplete='one-time-code'
              autoFocus
              required
              value={code}
              onChange={handleCode}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'entrar-codigo-erro' : undefined}
              placeholder='000000'
              className='bg-background placeholder:text-muted-foreground/40 h-14 px-5 text-center text-2xl font-medium tracking-[0.5em] md:text-2xl'
            />
            {error && (
              <p id='entrar-codigo-erro' className='text-destructive text-sm'>
                {error}
              </p>
            )}
          </div>
          <Button
            type='submit'
            variant='honey'
            size='cta'
            disabled={pending === 'codigo' || code.length < 6}
            className='mt-2 w-full'
          >
            Continuar
          </Button>
        </form>

        <div className='flex flex-col gap-3 text-sm'>
          <div className='text-muted-foreground flex flex-wrap gap-x-6 gap-y-2'>
            <button
              type='button'
              disabled={resendIn > 0}
              onClick={() => requestCode(email)}
              className='text-foreground cursor-pointer underline underline-offset-4 disabled:cursor-default disabled:no-underline disabled:opacity-60'
            >
              {resendIn > 0 ? `Reenviar código em ${resendIn}s` : 'Reenviar código'}
            </button>
            <button
              type='button'
              onClick={() => setStep('email')}
              className='text-foreground cursor-pointer underline underline-offset-4'
            >
              Usar outro e-mail
            </button>
          </div>
          <PrototypeNote>Protótipo: nenhum e-mail é enviado, e qualquer código de 6 números funciona.</PrototypeNote>
        </div>
      </MotionPreset>
    )
  }

  if (step === 'nome') {
    return (
      <MotionPreset key='nome' {...reveal} className='flex w-full max-w-md flex-col gap-10'>
        <Heading eyebrow='Conta criada' title='Qual é o seu nome?'>
          Você pode mudar depois, mas esse é o nome que aparece como autor do livro e também para quem você convidar.
        </Heading>

        <form onSubmit={handleName} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='entrar-nome'>Nome</Label>
            <Input
              id='entrar-nome'
              name='name'
              autoComplete='given-name'
              autoFocus
              required
            />
          </div>
          <Button type='submit' variant='honey' size='cta' disabled={pending === 'nome'} className='mt-2 w-full'>
            Começar a minha história
          </Button>
        </form>
      </MotionPreset>
    )
  }

  const isCreating = initialMode === 'criar'

  return (
    <MotionPreset key='email' {...reveal} className='flex w-full max-w-md flex-col gap-10'>
      <Heading
        eyebrow={isCreating ? 'Comece agora' : 'Bem-vindo de volta'}
        title={isCreating ? 'Crie a sua conta e comece o livro.' : 'Entre para continuar o livro.'}
      />

      <div className='flex flex-col gap-6'>
        {/* Botões brancos com contorno, como pedem as guidelines de Google, Apple e Facebook;
            o Google vem primeiro por ser o caminho principal */}
        <div className='flex flex-col gap-3'>
          {socialProviders.map(({ provider, label, Icon }) => (
            <Button
              key={provider}
              type='button'
              variant='outline'
              size='cta'
              disabled={pending !== null}
              onClick={() => handleProvider(provider)}
              className='w-full justify-center gap-3 border-[#dadce0] bg-white px-6 text-[#1f1f1f] hover:bg-white hover:text-[#1f1f1f]'
            >
              <Icon className='size-5' />
              Continuar com {label}
            </Button>
          ))}
        </div>

        <div className='text-muted-foreground flex items-center gap-4 text-sm'>
          <span className='bg-border h-px flex-1' />
          ou com o seu e-mail
          <span className='bg-border h-px flex-1' />
        </div>

        <form onSubmit={handleEmail} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='entrar-email'>E-mail</Label>
            <Input
              id='entrar-email'
              name='email'
              type='email'
              autoComplete='email'
              required
              ref={emailInput}
              defaultValue={email}
            />
          </div>
          {error && <p className='text-destructive text-sm'>{error}</p>}
          <Button type='submit' variant='honey' size='cta' disabled={pending !== null} className='w-full'>
            Continuar com e-mail
          </Button>
        </form>
      </div>

      <div className='flex flex-col gap-3 text-sm'>
        <p className='text-muted-foreground text-pretty'>
          Sem senha: mandamos um código para o seu e-mail. Se ainda não tiver conta, criamos uma para você.
        </p>
        {team && (
          <PrototypeNote>
            Protótipo: nada sai do seu navegador, e Google, Apple e Facebook entram com uma conta de exemplo.
          </PrototypeNote>
        )}
      </div>
    </MotionPreset>
  )
}

export default EntrarForm
