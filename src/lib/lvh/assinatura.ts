// Assinatura: em que pé está a conta (teste, ativa, cartão recusado, encerrada) e o que a pessoa pode fazer.
// Simulada no localStorage, como o resto do app; quando o backend existir, o estado vem do provedor de pagamento
// e só o miolo de readSubscription / writeSubscription muda. A tela nunca lê o registro cru: lê getAccess()

import { TRIAL_ANSWERS, TRIAL_DAYS } from '@/components/landing/teste-gratis'

import { countAnsweredByBook, getCurrentUser } from './api'
import { readFiscalData, saveFiscalCpf } from './nota-fiscal'
import { checkoutUrl, createCheckoutSession, settleSession, takeDueEvents, type CheckoutSession } from './pagamento'

export type PlanInterval = 'mensal' | 'anual'

// O mensal é mais caro de propósito, para o anual valer a pena: R$ 24,90 por mês, pagos de uma vez
export const PLAN_PRICES = {
  mensal: 29.9,
  anualPorMes: 24.9,
  anual: 298.8
} as const

// O que se economiza no anual frente a 12 meses do mensal: R$ 60, o mesmo que dois meses grátis
export const ANNUAL_SAVINGS = Math.round((PLAN_PRICES.mensal * 12 - PLAN_PRICES.anual) * 100) / 100

// Quantos dias o livro continua aberto depois de um cartão recusado, enquanto tentamos cobrar de novo
export const GRACE_DAYS = 7

// A partir de quando o teste "está acabando": faltam 3 dias ou 3 respostas
const ENDING_DAYS = 3
const ENDING_ANSWERS = 3

// Presente perto do fim: avisa uma semana antes
const GIFT_ENDING_DAYS = 7

export type Card = { brand: string; last4: string }

// O registro como o provedor de pagamento guardaria
type Subscription = {
  trialStartedAt: string
  // Sem plano enquanto a pessoa não assina
  interval?: PlanInterval
  // Fim do período já pago: próxima cobrança, ou o último dia de acesso se a renovação foi cancelada
  currentPeriodEnd?: string
  // Pediu para mudar de plano: vale na próxima renovação
  nextInterval?: PlanInterval
  cancelAtPeriodEnd?: boolean
  // Cobrança recusada: o livro continua aberto até paymentFailedAt + GRACE_DAYS
  paymentFailedAt?: string
  // Assinatura terminada (cancelou e o período acabou, ou o cartão não passou até o fim do prazo)
  endedAt?: string
  endedReason?: 'cancelou' | 'pagamento'
  card?: Card
  // Posto pela página de estados: ignora um presente da conta, para o estado simulado aparecer
  simulated?: boolean
}

// O que a tela precisa saber. Cada estado tem um aviso, um cartão em Pagamento e, quando trava, um paywall
export type Access =
  | { kind: 'trial'; daysLeft: number; answersLeft: number; endsAt: string; answered: number }
  | {
      kind: 'trial-acabando'
      daysLeft: number
      answersLeft: number
      endsAt: string
      answered: number
      // O que vai acabar primeiro
      reason: 'dias' | 'respostas'
    }
  | { kind: 'trial-encerrado'; reason: 'dias' | 'respostas'; answered: number }
  | { kind: 'presente'; until: string; daysLeft: number; ending: boolean; answered: number }
  | {
      kind: 'ativa'
      interval: PlanInterval
      renewsAt: string
      nextInterval?: PlanInterval
      card?: Card
      answered: number
    }
  | { kind: 'cancelamento-agendado'; interval: PlanInterval; endsAt: string; daysLeft: number; answered: number }
  | {
      kind: 'pagamento-recusado'
      interval: PlanInterval
      graceUntil: string
      daysLeft: number
      card?: Card
      answered: number
    }
  | { kind: 'expirada'; endedAt: string; reason: 'cancelou' | 'pagamento'; answered: number }

export type AccessKind = Access['kind']

const DAY = 24 * 60 * 60 * 1000

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY)

const addMonths = (date: Date, months: number) => {
  const next = new Date(date)

  next.setMonth(next.getMonth() + months)

  return next
}

const periodOf = (interval: PlanInterval) => (interval === 'anual' ? 12 : 1)

// Dias que faltam, arredondando para cima: falta 1 dia até o último minuto
const daysUntil = (iso: string, now: Date) => Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY))

const storageKey = (email: string) => `lvh:assinatura:${email}`

// Cópia do registro de verdade, guardada na primeira simulação para poder voltar a ele
const backupKey = (email: string) => `lvh:assinatura-real:${email}`

const readSubscription = (email: string): Subscription => {
  try {
    const value = window.localStorage.getItem(storageKey(email))

    if (value) return JSON.parse(value) as Subscription
  } catch {
    // Registro corrompido: recomeça o teste, como numa conta nova
  }

  // Primeira vez: o teste começa agora
  const fresh: Subscription = { trialStartedAt: new Date().toISOString() }

  writeSubscription(email, fresh)

  return fresh
}

const writeSubscription = (email: string, subscription: Subscription) =>
  window.localStorage.setItem(storageKey(email), JSON.stringify(subscription))

const currentEmail = async () => {
  const user = await getCurrentUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  return user.email
}

const countAnswered = async () => Object.values(await countAnsweredByBook()).reduce((sum, count) => sum + count, 0)

// Avança o registro até agora: renova o que venceu, encerra o que tinha de encerrar.
// No backend isso é o webhook do provedor; aqui roda a cada leitura
const settle = (subscription: Subscription, now: Date): Subscription => {
  const next = { ...subscription }

  if (next.endedAt || !next.interval || !next.currentPeriodEnd) return next

  if (next.paymentFailedAt) {
    if (addDays(new Date(next.paymentFailedAt), GRACE_DAYS) <= now) {
      next.endedAt = addDays(new Date(next.paymentFailedAt), GRACE_DAYS).toISOString()
      next.endedReason = 'pagamento'
    }

    return next
  }

  // Período pago acabou: ou encerra (renovação cancelada), ou renova (já no plano novo, se pediu a troca)
  while (new Date(next.currentPeriodEnd!) <= now) {
    if (next.cancelAtPeriodEnd) {
      next.endedAt = next.currentPeriodEnd
      next.endedReason = 'cancelou'
      break
    }

    if (next.nextInterval) {
      next.interval = next.nextInterval
      next.nextInterval = undefined
    }

    next.currentPeriodEnd = addMonths(new Date(next.currentPeriodEnd!), periodOf(next.interval!)).toISOString()
  }

  return next
}

const accessOf = (subscription: Subscription, answered: number, giftUntil: string | undefined, now: Date): Access => {
  const { interval, currentPeriodEnd } = subscription

  if (subscription.endedAt) {
    return { kind: 'expirada', endedAt: subscription.endedAt, reason: subscription.endedReason ?? 'cancelou', answered }
  }

  if (interval && currentPeriodEnd) {
    if (subscription.paymentFailedAt) {
      const graceUntil = addDays(new Date(subscription.paymentFailedAt), GRACE_DAYS).toISOString()

      return {
        kind: 'pagamento-recusado',
        interval,
        graceUntil,
        daysLeft: daysUntil(graceUntil, now),
        card: subscription.card,
        answered
      }
    }

    if (subscription.cancelAtPeriodEnd) {
      return {
        kind: 'cancelamento-agendado',
        interval,
        endsAt: currentPeriodEnd,
        daysLeft: daysUntil(currentPeriodEnd, now),
        answered
      }
    }

    return {
      kind: 'ativa',
      interval,
      renewsAt: currentPeriodEnd,
      nextInterval: subscription.nextInterval,
      card: subscription.card,
      answered
    }
  }

  // Presente sem assinatura: está pago até a data do presente, e avisa uma semana antes de acabar
  if (giftUntil && new Date(giftUntil) > now && !subscription.simulated) {
    const daysLeft = daysUntil(giftUntil, now)

    return { kind: 'presente', until: giftUntil, daysLeft, ending: daysLeft <= GIFT_ENDING_DAYS, answered }
  }

  // Teste: 14 dias ou 14 respostas, o que vier primeiro
  const endsAt = addDays(new Date(subscription.trialStartedAt), TRIAL_DAYS).toISOString()
  const daysLeft = daysUntil(endsAt, now)
  const answersLeft = Math.max(0, TRIAL_ANSWERS - answered)

  if (daysLeft === 0 || answersLeft === 0) {
    return { kind: 'trial-encerrado', reason: answersLeft === 0 ? 'respostas' : 'dias', answered }
  }

  if (daysLeft <= ENDING_DAYS || answersLeft <= ENDING_ANSWERS) {
    // O que acaba primeiro, em proporção: 2 dias de 14 pesa mais que 3 respostas de 14
    const reason = daysLeft / TRIAL_DAYS <= answersLeft / TRIAL_ANSWERS ? 'dias' : 'respostas'

    return { kind: 'trial-acabando', daysLeft, answersLeft, endsAt, answered, reason }
  }

  return { kind: 'trial', daysLeft, answersLeft, endsAt, answered }
}

export async function getAccess(now = new Date()): Promise<Access> {
  const user = await getCurrentUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  // Primeiro o que o provedor avisou (webhook), depois o que o tempo mudou (renovações, prazos)
  const stored = readSubscription(user.email)
  const settled = settle(receiveProviderEvents(user.email, stored, user.giftUntil, now), now)

  if (JSON.stringify(settled) !== JSON.stringify(stored)) writeSubscription(user.email, settled)

  return accessOf(settled, await countAnswered(), user.giftUntil, now)
}

// Escrever, gravar, trocar fotos e mudar a capa. Ler, compartilhar e baixar continuam liberados em qualquer estado
export const canEdit = (access: Access) => access.kind !== 'trial-encerrado' && access.kind !== 'expirada'

// Ainda não pagou nada: quem está no teste ou no presente vê o paywall de primeira assinatura
export const isSubscriber = (access: Access) =>
  access.kind === 'ativa' || access.kind === 'cancelamento-agendado' || access.kind === 'pagamento-recusado'

const update = async (change: (subscription: Subscription, now: Date) => Subscription) => {
  const email = await currentEmail()
  const now = new Date()

  writeSubscription(email, change(settle(readSubscription(email), now), now))

  return getAccess(now)
}

// O cartão que a página do provedor "salvou". Pix não deixa cartão: a renovação pede outro pagamento
const DEMO_CARD: Card = { brand: 'Visa', last4: '4242' }

// Quando cai a primeira cobrança. No teste, no dia em que o teste acabaria, e num presente, quando ele acaba:
// ninguém perde os dias que faltam. Depois do teste, ou voltando de uma assinatura encerrada, hoje
const firstChargeOf = (subscription: Subscription, giftUntil: string | undefined, now: Date) => {
  const trialEnd = addDays(new Date(subscription.trialStartedAt), TRIAL_DAYS)
  const gift = giftUntil && !subscription.simulated ? new Date(giftUntil) : now
  const free = !subscription.interval && !subscription.endedAt && trialEnd > now ? trialEnd : now

  return gift > free ? gift : free
}

const priceOf = (interval: PlanInterval) => (interval === 'anual' ? PLAN_PRICES.anual : PLAN_PRICES.mensal)

// Assinar: cria a sessão no provedor e devolve o endereço do checkout. A assinatura só vale quando o
// webhook do pagamento chega (receiveProviderEvents), nunca na volta do checkout
export async function startSubscriptionCheckout(interval: PlanInterval): Promise<string> {
  const user = await getCurrentUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  const now = new Date()
  const firstCharge = firstChargeOf(settle(readSubscription(user.email), now), user.giftUntil, now)
  const later = firstCharge > now

  const session = await createCheckoutSession({
    email: user.email,
    item: { kind: 'assinatura', interval },
    description: interval === 'anual' ? 'Lá Vem História · plano anual' : 'Lá Vem História · plano mensal',
    amountToday: later ? 0 : priceOf(interval),
    // No provedor, é o fim do período de teste da assinatura (trial_end no Stripe)
    nextCharge: {
      amount: priceOf(interval),
      date: (later ? firstCharge : addMonths(now, periodOf(interval))).toISOString()
    },
    // Mensal é recorrente: só cartão. O anual pago hoje também aceita Pix
    methods: interval === 'anual' && !later ? ['cartao', 'pix'] : ['cartao'],
    cpf: readFiscalData(user.email).cpf,
    returnPath: '/app/assinatura'
  })

  return checkoutUrl(session)
}

// Cartão recusado: o portal do provedor troca o cartão e cobra o que ficou pendente
export async function startCardUpdate(): Promise<string> {
  const user = await getCurrentUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  const interval = readSubscription(user.email).interval ?? 'mensal'
  const session = await createCheckoutSession({
    email: user.email,
    item: { kind: 'cartao', interval },
    description: 'Lá Vem História · trocar o cartão e pagar a renovação',
    amountToday: priceOf(interval),
    nextCharge: { amount: priceOf(interval), date: addMonths(new Date(), periodOf(interval)).toISOString() },
    methods: ['cartao'],
    cpf: readFiscalData(user.email).cpf,
    returnPath: '/app/assinatura'
  })

  return checkoutUrl(session)
}

// O webhook do provedor: aplica os pagamentos confirmados desta conta
const receiveProviderEvents = (
  email: string,
  subscription: Subscription,
  giftUntil: string | undefined,
  now: Date
): Subscription => {
  const events = takeDueEvents(
    (session: CheckoutSession) =>
      session.email === email && (session.item.kind === 'assinatura' || session.item.kind === 'cartao')
  )

  if (!events.length) return subscription

  let next = settle(subscription, now)

  for (const { session } of events) {
    // O CPF confirmado no checkout vira o da conta: é para ele que sai a nota fiscal
    if (session.cpf) saveFiscalCpf(email, session.cpf)

    const card = session.method === 'pix' ? undefined : DEMO_CARD

    if (session.item.kind === 'assinatura') {
      const interval = session.item.interval
      const firstCharge = firstChargeOf(next, giftUntil, now)

      next = {
        trialStartedAt: next.trialStartedAt,
        interval,
        currentPeriodEnd:
          firstCharge > now ? firstCharge.toISOString() : addMonths(now, periodOf(interval)).toISOString(),
        card
      }
    } else {
      // Cartão novo: a cobrança pendente passou e o período recomeça hoje
      next = {
        ...next,
        paymentFailedAt: undefined,
        endedAt: undefined,
        endedReason: undefined,
        card: { brand: 'Mastercard', last4: '5100' },
        currentPeriodEnd: addMonths(now, periodOf(next.interval ?? 'mensal')).toISOString()
      }
    }

    settleSession(session.id)
  }

  writeSubscription(email, next)

  return next
}

// Mensal → anual (ou o contrário): vale na próxima renovação, sem cobrar de novo o mês que já foi pago
export async function changeInterval(interval: PlanInterval) {
  return update(subscription => ({
    ...subscription,
    nextInterval: interval === subscription.interval ? undefined : interval
  }))
}

// Cancelar a renovação: o acesso continua até o fim do período pago
export async function cancelRenewal() {
  return update(subscription => ({ ...subscription, cancelAtPeriodEnd: true, nextInterval: undefined }))
}

// Desistir de cancelar
export async function keepSubscription() {
  return update(subscription => ({ ...subscription, cancelAtPeriodEnd: false }))
}


// Só para a página de estados: põe a conta num estado qualquer, com datas que fazem sentido
export type SimulatedState =
  | 'trial'
  | 'trial-acabando'
  | 'trial-encerrado'
  | 'ativa-mensal'
  | 'ativa-anual'
  | 'cancelamento-agendado'
  | 'pagamento-recusado'
  | 'expirada'

export async function simulate(state: SimulatedState) {
  const email = await currentEmail()
  const now = new Date()
  const ago = (days: number) => addDays(now, -days).toISOString()
  const ahead = (days: number) => addDays(now, days).toISOString()

  const records: Record<SimulatedState, Subscription> = {
    trial: { trialStartedAt: ago(4) },
    'trial-acabando': { trialStartedAt: ago(TRIAL_DAYS - 2) },
    'trial-encerrado': { trialStartedAt: ago(TRIAL_DAYS + 1) },
    'ativa-mensal': { trialStartedAt: ago(40), interval: 'mensal', currentPeriodEnd: ahead(18), card: DEMO_CARD },
    'ativa-anual': { trialStartedAt: ago(120), interval: 'anual', currentPeriodEnd: ahead(260), card: DEMO_CARD },
    'cancelamento-agendado': {
      trialStartedAt: ago(40),
      interval: 'mensal',
      currentPeriodEnd: ahead(9),
      cancelAtPeriodEnd: true,
      card: DEMO_CARD
    },
    'pagamento-recusado': {
      trialStartedAt: ago(70),
      interval: 'mensal',
      currentPeriodEnd: ago(2),
      paymentFailedAt: ago(2),
      card: DEMO_CARD
    },
    expirada: {
      trialStartedAt: ago(90),
      interval: 'mensal',
      currentPeriodEnd: ago(12),
      endedAt: ago(12),
      endedReason: 'cancelou',
      card: DEMO_CARD
    }
  }

  if (window.localStorage.getItem(backupKey(email)) === null) {
    window.localStorage.setItem(backupKey(email), JSON.stringify(readSubscription(email)))
  }

  writeSubscription(email, { ...records[state], simulated: true })

  return getAccess(now)
}

export async function isSimulating() {
  return window.localStorage.getItem(backupKey(await currentEmail())) !== null
}

// Sai da simulação: a conta volta ao registro que tinha antes
export async function stopSimulating() {
  const email = await currentEmail()
  const backup = window.localStorage.getItem(backupKey(email))

  if (backup !== null) {
    window.localStorage.setItem(storageKey(email), backup)
    window.localStorage.removeItem(backupKey(email))
  }

  return getAccess()
}

// "12 de dezembro"; com o ano quando não é o ano corrente ("24 de novembro de 2027")
export const formatDay = (iso: string) => {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()

  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) })
}

export const intervalLabel = (interval: PlanInterval) => (interval === 'anual' ? 'Anual' : 'Mensal')
