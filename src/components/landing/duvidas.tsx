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
import { Textarea } from '@/components/ui/textarea'
import { WordsReveal } from '@/components/landing/motion'
import { TRIAL_ANSWERS, TRIAL_DAYS } from '@/components/landing/teste-gratis'
import { overlayDescriptionClassName, overlayTitleClassName } from '@/components/app/page-heading'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const CONTACT_EMAIL = 'oi@lavemhistoria.com.br'

// Perguntas na ordem em que costumam aparecer: primeiro o medo de escrever, depois onde ler e quem lê, livro e preço
const questions = [
  {
    question: 'Preciso saber escrever bem?',
    answer:
      'Não. Cada pergunta puxa uma lembrança de cada vez, e você responde do seu jeito, como se estivesse contando para alguém. Se preferir falar, use o ditado ou grave a sua voz.'
  },
  {
    question: 'Como funcionam as perguntas?',
    answer:
      'São mais de 300 perguntas, na ordem de uma vida, em capítulos como De onde você vem, Sua infância, Seus amores, Seu trabalho e o que você ama e O que você quer me dizer. Você responde na ordem que quiser, pula as que não fazem sentido e marca as que quer deixar para depois.'
  },
  {
    question: 'Posso responder falando, em vez de escrever?',
    answer:
      'Pode. Você dita e o texto aparece sozinho, ou grava a sua voz. A gravação fica junto da resposta e toca dentro do livro, para a família ouvir a história contada por você.'
  },
  {
    question: 'Onde dá para ler o livro?',
    answer:
      'Em vários lugares. Direto no navegador do celular, do tablet ou do computador, virando as páginas como num livro. Você também baixa o livro em EPUB, o formato dos livros digitais, e lê no Kindle, no app Livros do iPhone, iPad e Mac, no Google Play Livros ou no Kobo. E ainda tem o PDF para imprimir.'
  },
  {
    question: 'Para quem posso mandar o livro?',
    answer:
      'Para quem você quiser, sem limite de leitores: filhos, netos, irmãos, amigos. O livro é fechado, então só lê quem você convidar, e você tira o acesso de qualquer pessoa quando quiser. Não precisa esperar terminar: a família já pode ler enquanto você escreve.'
  },
  {
    question: 'Como a pessoa convidada lê o livro?',
    answer:
      'Ela recebe um link pessoal, confirma o e-mail com um código e abre o livro no navegador, sem senha e sem instalar nada. Cada resposta nova aparece no livro dela sozinha, e as gravações tocam ali mesmo. Se preferir, você manda o EPUB para ela ler no Kindle ou no celular.'
  },
  {
    question: 'A família pode ajudar a contar?',
    answer:
      'Pode. Convide um irmão, um filho ou um amigo para responder uma pergunta com a versão dele. A pessoa nunca vê a sua resposta, e a lembrança dela só entra no livro depois que você aprovar.'
  },
  {
    question: 'Dá para ter o livro impresso?',
    answer:
      'Dá. Você baixa um PDF no tamanho A5, com capa, sumário e capítulos, pronto para levar a uma gráfica. As respostas gravadas ganham um QR code: quem lê o livro impresso aponta o celular e ouve a sua voz. Também estamos testando com uma gráfica parceira um livro impresso e encadernado por nós. Ainda não tem data: ele só entra no site quando o papel, as cores e o acabamento estiverem à altura da história.'
  },
  {
    question: 'Quanto custa?',
    answer:
      'No anual, R$ 24,90 por mês: R$ 298,80 cobrados de uma vez, o mesmo que ganhar dois meses. No mensal, R$ 29,90 por mês, sem fidelidade. A assinatura inclui um livro em andamento. Quando ele fica pronto, continua online para leitura, sem custo, e você pode começar o próximo. Para escrever mais de um ao mesmo tempo, cada livro a mais custa R$ 9,90 por mês.'
  },
  {
    question: 'Como funciona o teste grátis?',
    answer: `Você cria a conta e usa tudo, com voz, fotos e família respondendo junto, por ${TRIAL_DAYS} dias ou até ${TRIAL_ANSWERS} respostas, o que vier primeiro. Depois, assina para continuar. Nada do que você escreveu no teste se perde.`
  },
  {
    question: 'Posso dar de presente?',
    answer:
      'Pode. Você compra um cartão-presente de 1, 3, 6 ou 12 meses, e quanto mais meses, menor o preço por mês. O cartão vai direto para o e-mail de quem ganha, ou chega para você em PDF, para imprimir e entregar em mãos. Quem ganha digita o código e usa tudo pelos meses do presente; a assinatura só é cobrada depois, se a pessoa quiser continuar.'
  },
  {
    question: 'Terminei o livro. E agora?',
    answer:
      'Agora ele continua vivo. A vida não para, e sempre aparece uma história nova, uma lembrança que tinha ficado de fora ou um detalhe que vale corrigir. Enquanto a assinatura estiver ativa, a gente manda um lembrete de tempos em tempos e convida você a rever as suas respostas, revisitar as fotos e as gravações e acrescentar o que faltou, para o livro estar sempre em dia com a sua história.'
  },
  {
    question: 'Posso cancelar?',
    answer:
      'Pode. No mensal não há fidelidade: você cancela e não é cobrado no mês seguinte. No anual, o valor dos 12 meses é cobrado de uma vez.'
  },
  {
    question: 'O que acontece se eu cancelar minha assinatura?',
    answer:
      'O livro fica fechado para edição: não dá mais para escrever, corrigir respostas, trocar fotos, gravar ou mudar a capa. Mas as histórias continuam suas. Você pode baixar tudo o que escreveu quando quiser, e as respostas, fotos e gravações só são apagadas se você decidir excluir a conta.'
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
          <Input id='contato-nome' name='name' autoComplete='name' maxLength={120} required />
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='contato-email'>E-mail</Label>
          <Input id='contato-email' name='email' type='email' autoComplete='email' maxLength={254} required />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='contato-mensagem'>Sua dúvida</Label>
        <Textarea id='contato-mensagem' name='message' required minLength={5} maxLength={4000} rows={4} />
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
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 max-md:gap-10 max-md:py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col gap-4 max-md:text-center lg:sticky lg:top-28 lg:col-span-5 lg:self-start'>
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
              <CollapsibleTrigger className='group hover:text-earth flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left transition-colors max-md:gap-3 max-md:text-center'>
                {/* No celular a pergunta fica centralizada: um espaço do tamanho do + à esquerda equilibra o ícone */}
                <span aria-hidden='true' className='size-5 shrink-0 md:hidden' />
                <span className='font-heading text-xl max-md:flex-1 sm:text-2xl'>{item.question}</span>
                <PlusIcon
                  aria-hidden='true'
                  className='size-5 shrink-0 transition-transform duration-300 group-data-[panel-open]:rotate-45'
                />
              </CollapsibleTrigger>
              <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0'>
                <p className='text-muted-foreground max-w-2xl pb-6 text-base leading-relaxed text-pretty max-md:text-center'>
                  {item.answer}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Link discreto depois da última pergunta: abre o formulário de contato */}
          <div className='border-foreground border-t pt-6 max-md:flex max-md:justify-center'>
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
        <DialogContent className='bg-cream flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-y-auto rounded-2xl p-6 sm:max-w-lg sm:p-8'>
          <div className='flex flex-col gap-2 pr-8'>
            <DialogTitle className={overlayTitleClassName}>Ainda com dúvida?</DialogTitle>
            <DialogDescription className={overlayDescriptionClassName}>
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
