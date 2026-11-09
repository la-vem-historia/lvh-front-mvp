'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUpdateUser, useUser } from '@/components/app/session'

import { getNextQuestion } from '@/lib/lvh/api'
import type { EmailReminder, Question, User } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const WEEKDAYS = [
  { short: 'Dom', name: 'domingo' },
  { short: 'Seg', name: 'segunda' },
  { short: 'Ter', name: 'terça' },
  { short: 'Qua', name: 'quarta' },
  { short: 'Qui', name: 'quinta' },
  { short: 'Sex', name: 'sexta' },
  { short: 'Sáb', name: 'sábado' }
]

// De meia em meia hora, das 6h às 22h
const TIMES = Array.from({ length: 33 }, (_, index) => {
  const minutes = 6 * 60 + index * 30

  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

const DEFAULT_REMINDER: EmailReminder = { enabled: false, day: 0, time: '09:00' }

// 09:00 vira 9h; 09:30 vira 9h30
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')

  return `${Number(hours)}h${minutes === '00' ? '' : minutes}`
}

// Domingo e sábado pedem "todo"; os outros dias, "toda"
const everyDay = (day: number) => `${day === 0 || day === 6 ? 'Todo' : 'Toda'} ${WEEKDAYS[day].name}`

export const RANDOM_QUESTION_HREF = '/app/pergunta/aleatoria'

// Como o e-mail chega: a pergunta da vez, na ordem do livro, e a saída para uma pergunta qualquer
const EmailPreview = ({ user, reminder }: { user: User; reminder: EmailReminder }) => {
  const [question, setQuestion] = useState<Question | null | undefined>(undefined)

  useEffect(() => {
    getNextQuestion(user).then(next => setQuestion(next ?? null))
  }, [user])

  if (question === undefined) return null

  return (
    <div className='border-border overflow-hidden rounded-[1.5rem] border'>
      <dl className='bg-sand text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-6 py-4 text-xs'>
        <dt>De</dt>
        <dd className='text-foreground'>Lá Vem História</dd>
        <dt>Para</dt>
        <dd className='text-foreground'>{user.email}</dd>
        <dt>Assunto</dt>
        <dd className='text-foreground font-medium'>A pergunta da semana chegou</dd>
      </dl>

      <div className='bg-paper flex flex-col gap-6 px-6 py-8 sm:px-10'>
        {question ? (
          <>
            <p className='text-base'>Oi, {user.name.split(' ')[0]}. A pergunta desta semana é:</p>
            <p className='font-heading text-2xl text-pretty'>{question.text}</p>
            <div className='flex flex-wrap items-center gap-3'>
              <Button
                render={<Link href={`/app/pergunta/${question.id}`} />}
                nativeButton={false}
                variant='honey'
                size='lg'
              >
                Responder esta pergunta
              </Button>
              <Button
                render={<Link href={RANDOM_QUESTION_HREF} />}
                nativeButton={false}
                variant='outline'
                size='lg'
              >
                Responder uma pergunta aleatória
              </Button>
            </div>
          </>
        ) : (
          <p className='text-base'>Você respondeu todas as perguntas. Que tal reler o seu livro?</p>
        )}
        <p className='text-muted-foreground border-border border-t pt-4 text-xs'>
          Você recebe este e-mail {everyDay(reminder.day).toLowerCase()}, às {formatTime(reminder.time)}.{' '}
          <Link href='/app/configuracoes#pergunta-da-semana' className='underline underline-offset-4'>
            Mudar dia e horário
          </Link>
        </p>
      </div>
    </div>
  )
}

// Configuração do e-mail semanal: liga e desliga, dia e horário. Salva a cada mudança
const PerguntaDaSemana = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const [previewing, setPreviewing] = useState(false)
  const reminder = user.emailReminder ?? DEFAULT_REMINDER

  const change = (changes: Partial<EmailReminder>) => updateUser({ emailReminder: { ...reminder, ...changes } })

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-4'>
        <span id='lembrete-rotulo' className='text-base font-medium'>
          Receber a pergunta da semana por e-mail
        </span>
        <button
          type='button'
          role='switch'
          aria-checked={reminder.enabled}
          aria-labelledby='lembrete-rotulo'
          onClick={() => change({ enabled: !reminder.enabled })}
          className={cn(
            'focus-visible:ring-ring/50 relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-3',
            reminder.enabled ? 'bg-moss' : 'bg-stone'
          )}
        >
          <span
            className={cn(
              'bg-cream size-5 rounded-full shadow-sm transition-transform duration-200',
              reminder.enabled ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {reminder.enabled && (
        <>
          <div className='flex flex-col gap-3'>
            <span id='lembrete-dia' className='text-sm font-medium'>
              Dia
            </span>
            <div role='radiogroup' aria-labelledby='lembrete-dia' className='flex flex-wrap gap-2'>
              {WEEKDAYS.map((weekday, day) => (
                <button
                  key={weekday.short}
                  type='button'
                  role='radio'
                  aria-checked={reminder.day === day}
                  aria-label={weekday.name}
                  onClick={() => change({ day })}
                  className={cn(
                    'h-10 min-w-14 cursor-pointer rounded-full border px-4 text-sm transition-colors',
                    reminder.day === day ? 'bg-moss text-cream border-moss' : 'border-border hover:border-foreground/40'
                  )}
                >
                  {weekday.short}
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <Label htmlFor='lembrete-horario'>Horário</Label>
            <div className='relative w-40'>
              <select
                id='lembrete-horario'
                value={reminder.time}
                onChange={event => change({ time: event.target.value })}
                className='border-input bg-field focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full cursor-pointer appearance-none rounded-full border pr-10 pl-5 text-base outline-none focus-visible:ring-3'
              >
                {TIMES.map(time => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className='text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2' />
            </div>
          </div>

          <p className='text-muted-foreground text-sm text-pretty'>
            {everyDay(reminder.day)}, às {formatTime(reminder.time)}, em {user.email}. No e-mail, você escolhe responder
            a próxima pergunta do livro ou uma pergunta aleatória.
          </p>

          <button
            type='button'
            aria-expanded={previewing}
            onClick={() => setPreviewing(current => !current)}
            className='w-fit cursor-pointer text-sm underline underline-offset-4'
          >
            {previewing ? 'Fechar exemplo' : 'Ver como o e-mail chega'}
          </button>
          {previewing && <EmailPreview user={user} reminder={reminder} />}
        </>
      )}
    </div>
  )
}

export default PerguntaDaSemana
