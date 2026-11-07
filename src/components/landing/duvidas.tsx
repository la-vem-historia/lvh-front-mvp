'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { ArrowRightIcon, CircleCheckIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const CONTACT_EMAIL = 'oi@lavemhistoria.com.br'

// Perguntas na ordem em que costumam aparecer: primeiro o medo de escrever, depois privacidade, livro e preço
const questions = [
  {
    question: 'Preciso saber escrever bem?',
    answer:
      'Não. Cada pergunta puxa uma lembrança de cada vez, e você responde do seu jeito, como se estivesse contando para alguém. Se preferir falar, use o ditado ou grave a sua voz no plano Completo.'
  },
  {
    question: 'Como funcionam as perguntas?',
    answer:
      'São mais de 100 perguntas, organizadas em capítulos como Infância, Família e Origens, Amor, Trabalho e Lições para o Futuro. Você responde na ordem que quiser, pula as que não fazem sentido e marca as que quer deixar para depois.'
  },
  {
    question: 'Posso responder falando, em vez de escrever?',
    answer:
      'Pode. No plano Completo, você dita e o texto aparece sozinho, ou grava a sua voz. A gravação fica junto da resposta e toca dentro do livro, para a família ouvir a história contada por você.'
  },
  {
    question: 'Quem consegue ler o meu livro?',
    answer:
      'Só quem você convidar. Cada pessoa recebe um link pessoal, e você pode tirar o acesso de qualquer uma quando quiser.'
  },
  {
    question: 'A família pode ajudar a contar?',
    answer:
      'Pode. Convide um irmão, um filho ou um amigo para responder uma pergunta com a versão dele. A pessoa nunca vê a sua resposta, e a lembrança dela só entra no livro depois que você aprovar.'
  },
  {
    question: 'Dá para ter o livro impresso?',
    answer:
      'Dá. No plano Completo, você baixa um PDF no tamanho A5, com capa, sumário e capítulos, pronto para levar a uma gráfica. As respostas gravadas ganham um QR code: quem lê o livro impresso aponta o celular e ouve a sua voz.'
  },
  {
    question: 'Qual a diferença entre o Essencial e o Completo?',
    answer:
      'O Essencial é para quem quer contar a história escrevendo: todas as perguntas, o livro digital e a leitura para convidados. O Completo acrescenta fotos, gravação de voz, ditado, convidados respondendo junto e o PDF para imprimir.'
  },
  {
    question: 'Posso trocar de plano ou cancelar?',
    answer:
      'Pode trocar de plano quando quiser. No mensal não há fidelidade: você cancela e não é cobrado no mês seguinte. No anual, o valor dos 12 meses é cobrado de uma vez.'
  },
  {
    question: 'Funciona no celular?',
    answer: 'Funciona no navegador do celular, do tablet e do computador, sem instalar nada.'
  },
  {
    question: 'O que acontece com as minhas histórias?',
    answer:
      'Elas são suas. Você pode baixar tudo o que escreveu quando quiser e, se decidir excluir a conta, as respostas, fotos e gravações são apagadas.'
  }
]

const fieldClassName = 'bg-background h-12 px-5 text-base'

// Formulário de dúvidas: guarda a mensagem em /api/contato, e a equipe responde por e-mail
const Contato = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data = Object.fromEntries(new FormData(event.currentTarget))

    setStatus('sending')
    setError(null)

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)

        throw new Error(body?.error ?? 'Não conseguimos enviar agora.')
      }

      setStatus('sent')
    } catch (reason) {
      setError((reason as Error).message)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role='status' className='flex items-start gap-3'>
        <CircleCheckIcon aria-hidden='true' className='fill-moss text-cream mt-0.5 size-6 shrink-0' />
        <div className='flex flex-col gap-1'>
          <p className='font-heading text-xl'>Recebemos a sua dúvida.</p>
          <p className='text-muted-foreground text-sm text-pretty'>
            Vamos responder no e-mail que você deixou. Obrigado por escrever.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='contato-nome'>Nome</Label>
          <Input
            id='contato-nome'
            name='name'
            autoComplete='name'
            maxLength={120}
            required
            className={fieldClassName}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='contato-email'>E-mail</Label>
          <Input
            id='contato-email'
            name='email'
            type='email'
            autoComplete='email'
            maxLength={254}
            required
            className={fieldClassName}
          />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='contato-mensagem'>Sua dúvida</Label>
        <textarea
          id='contato-mensagem'
          name='message'
          required
          minLength={5}
          maxLength={4000}
          rows={4}
          className='border-input bg-background placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-2xl border p-4 text-base leading-relaxed outline-none focus-visible:ring-3'
        />
      </div>
      {/* Isca para robôs: fica escondida e quem preenche é descartado em silêncio */}
      <input type='text' name='site' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
      {error && (
        <p role='alert' className='text-destructive text-sm'>
          {error}
        </p>
      )}
      <Button type='submit' variant='honey' size='cta' disabled={status === 'sending'} className='w-full sm:w-fit'>
        {status === 'sending' ? 'Enviando…' : 'Enviar dúvida'}
      </Button>
    </form>
  )
}

const Duvidas = () => {
  // O formulário só aparece num modal, depois das perguntas: assim quem tem dúvida lê as respostas antes
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <section id='duvidas' className='bg-paper scroll-mt-24'>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col gap-4 lg:sticky lg:top-28 lg:col-span-5 lg:self-start'>
          <p className='text-sm font-medium uppercase'>Dúvidas frequentes</p>
          <WordsReveal
            as='h2'
            text='Perguntas que a gente sempre ouve.'
            className='font-heading text-display text-balance'
          />
          <p className='text-muted-foreground text-base text-pretty'>
            Reunimos o que mais perguntam antes de começar o livro para os filhos ou netos.
          </p>
        </MotionPreset>

        {/* Lista de perguntas: cada uma abre e fecha sozinha, e o + vira × quando está aberta */}
        <MotionPreset {...reveal} delay={0.1} className='flex flex-col lg:col-span-7 lg:col-start-6'>
          {questions.map(item => (
            <Collapsible key={item.question} className='border-foreground border-t'>
              <CollapsibleTrigger className='group hover:text-earth flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left transition-colors'>
                <span className='font-heading text-xl sm:text-2xl'>{item.question}</span>
                <PlusIcon
                  aria-hidden='true'
                  className='size-5 shrink-0 transition-transform duration-300 group-data-[panel-open]:rotate-45'
                />
              </CollapsibleTrigger>
              <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0'>
                <p className='text-muted-foreground max-w-2xl pb-6 text-base leading-relaxed text-pretty'>
                  {item.answer}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Link discreto depois da última pergunta: abre o formulário de contato */}
          <div className='border-foreground border-t pt-6'>
            <button
              type='button'
              onClick={() => setContactOpen(true)}
              className='group text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-base transition-colors'
            >
              Ainda com dúvida?
              <span className='text-foreground underline underline-offset-4'>Fale com a gente</span>
              <ArrowRightIcon
                aria-hidden='true'
                className='size-4 transition-transform duration-200 group-hover:translate-x-0.5'
              />
            </button>
          </div>
        </MotionPreset>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className='bg-cream flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-y-auto rounded-[1.5rem] p-6 sm:max-w-lg sm:p-8'>
          <div className='flex flex-col gap-2 pr-8'>
            <DialogTitle className='font-heading text-2xl'>Ainda com dúvida?</DialogTitle>
            <DialogDescription className='text-muted-foreground text-sm text-pretty'>
              Escreva para a gente e respondemos no seu e-mail. Se preferir, mande para{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className='text-foreground underline underline-offset-4'>
                {CONTACT_EMAIL}
              </a>
              .
            </DialogDescription>
          </div>
          <Contato />
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default Duvidas
