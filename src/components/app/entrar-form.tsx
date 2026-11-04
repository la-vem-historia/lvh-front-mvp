'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MotionPreset } from '@/components/ui/motion-preset'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/app/social-icons'

import { sendLoginCode, signInWithProvider, updateUser, verifyLoginCode, type LoginProvider } from '@/lib/lvh/api'
import { CADASTRO_EMAIL_KEY } from '@/lib/lvh/cadastro'

const fieldClassName = 'bg-background h-12 px-5 text-base'

// Mesma entrada suave dos blocos da landing
const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// Tempo até poder pedir outro código
const RESEND_SECONDS = 30

type Mode = 'entrar' | 'criar'
type Step = 'email' | 'codigo' | 'nome'

const Heading = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) => (
  <div className='flex flex-col gap-4'>
    <p className={eyebrowClassName}>{eyebrow}</p>
    <h1 className={pageTitleClassName}>{title}</h1>
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
        <Heading eyebrow='Conta criada' title='Como podemos te chamar?'>
          É o nome que aparece no seu livro e para quem você convidar. Dá para mudar depois.
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
              className={fieldClassName}
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
        title={isCreating ? 'Crie a sua conta e comece a contar.' : 'Entre para continuar a sua história.'}
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
              className={fieldClassName}
            />
          </div>
          <Button type='submit' variant='honey' size='cta' disabled={pending !== null} className='w-full'>
            Continuar com e-mail
          </Button>
        </form>
      </div>

      <div className='flex flex-col gap-3 text-sm'>
        <p className='text-muted-foreground text-pretty'>
          Sem senha: mandamos um código para o seu e-mail. Se ainda não tiver conta, criamos uma para você.
        </p>
        <PrototypeNote>
          Protótipo: nada sai do seu navegador, e Google, Apple e Facebook entram com uma conta de exemplo.
        </PrototypeNote>
      </div>
    </MotionPreset>
  )
}

export default EntrarForm
