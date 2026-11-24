// O provedor de pagamento (Stripe, Mercado Pago, Pagar.me...), simulado no navegador.
//
// O desenho é o mesmo de um provedor de verdade:
// 1. O app cria uma sessão de checkout com o que vai ser pago e leva a pessoa para a página do provedor
// 2. A pessoa paga lá. O número do cartão nunca passa pelo nosso servidor
// 3. O provedor manda a pessoa de volta (returnUrl) e, separado, avisa o nosso servidor por webhook.
//    Só o webhook muda o estado da assinatura: a volta para o app só mostra "confirmando o pagamento"
//
// Aqui a "página do provedor" é /checkout/[id] e o webhook é uma fila de eventos no localStorage que o app
// processa quando o horário de entrega passa. Com o provedor escolhido, createCheckoutSession vira uma chamada
// à API dele no servidor, e takeDueEvents vira a rota que recebe o webhook

import type { GiftDelivery, GiftMonths } from './presente'
import type { PlanInterval } from './assinatura'

export type GiftInput = {
  months: GiftMonths
  recipientName: string
  message?: string
  delivery: GiftDelivery
  recipientEmail?: string
  buyerName: string
  buyerEmail: string
}

// O que está sendo pago
export type CheckoutItem =
  | { kind: 'assinatura'; interval: PlanInterval }
  // Portal do cliente: trocar o cartão e pagar a cobrança que ficou pendente
  | { kind: 'cartao'; interval: PlanInterval }
  // Pagamento único, de quem está dando o presente
  | { kind: 'presente'; gift: GiftInput }

export type PaymentMethod = 'cartao' | 'pix'

export type CheckoutSession = {
  id: string
  // Conta que assina (no presente, quem compra pode nem ter conta)
  email?: string
  item: CheckoutItem
  description: string
  // Cobrado hoje (zero quando a assinatura começa durante o teste)
  amountToday: number
  // A próxima cobrança, quando há: no teste, o valor cheio no dia em que o teste acabaria
  nextCharge?: { amount: number; date: string }
  // Recorrente só aceita cartão; pagamento único aceita Pix também
  methods: PaymentMethod[]
  returnUrl: string
  cancelUrl: string
  status: 'aberta' | 'paga' | 'cancelada'
  method?: PaymentMethod
  createdAt: string
  // Quando o webhook desta sessão foi processado pelo app
  settledAt?: string
  // O que o webhook criou (o código do presente, por exemplo), para não criar de novo ao recarregar
  result?: string
}

export type ProviderEvent = {
  id: string
  type: 'checkout.pago'
  sessionId: string
  deliverAt: string
}

const SESSIONS_KEY = 'lvh:provedor:sessoes'
const EVENTS_KEY = 'lvh:provedor:eventos'

// Quanto o "webhook" demora a chegar depois do pagamento: o suficiente para ver o "confirmando"
const WEBHOOK_DELAY_MS = 1500

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key)

    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key: string, value: unknown) => window.localStorage.setItem(key, JSON.stringify(value))

const readSessions = () => readJson<Record<string, CheckoutSession>>(SESSIONS_KEY, {})

const saveSession = (session: CheckoutSession) => writeJson(SESSIONS_KEY, { ...readSessions(), [session.id]: session })

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`

export async function createCheckoutSession(
  input: Omit<CheckoutSession, 'id' | 'status' | 'createdAt' | 'returnUrl' | 'cancelUrl'> & {
    // Para onde voltar; o id da sessão entra como ?checkout=
    returnPath: string
  }
): Promise<CheckoutSession> {
  const id = newId('cs')
  const { returnPath, ...rest } = input
  const join = returnPath.includes('?') ? '&' : '?'
  const session: CheckoutSession = {
    ...rest,
    id,
    status: 'aberta',
    createdAt: new Date().toISOString(),
    returnUrl: `${returnPath}${join}checkout=${id}`,
    cancelUrl: `${returnPath}${join}checkout=${id}&cancelado=1`
  }

  saveSession(session)

  return session
}

export const checkoutUrl = (session: CheckoutSession) => `/checkout/${session.id}`

export async function getCheckoutSession(id: string): Promise<CheckoutSession | null> {
  return readSessions()[id] ?? null
}

// Na página do provedor: aprovado agenda o webhook; recusado devolve o erro e a sessão continua aberta
export async function payCheckoutSession(
  id: string,
  method: PaymentMethod,
  outcome: 'aprovado' | 'recusado'
): Promise<{ ok: true; returnUrl: string } | { ok: false; error: string }> {
  const session = readSessions()[id]

  if (!session || session.status !== 'aberta') return { ok: false, error: 'Esta sessão de pagamento expirou.' }

  if (outcome === 'recusado') {
    return { ok: false, error: 'O banco recusou o cartão. Tente outro cartão ou pague com Pix, quando disponível.' }
  }

  saveSession({ ...session, status: 'paga', method })

  const events = readJson<ProviderEvent[]>(EVENTS_KEY, [])
  const event: ProviderEvent = {
    id: newId('evt'),
    type: 'checkout.pago',
    sessionId: id,
    deliverAt: new Date(Date.now() + WEBHOOK_DELAY_MS).toISOString()
  }

  writeJson(EVENTS_KEY, [...events, event])

  return { ok: true, returnUrl: session.returnUrl }
}

export async function cancelCheckoutSession(id: string): Promise<string> {
  const session = readSessions()[id]

  if (!session) return '/'

  if (session.status === 'aberta') saveSession({ ...session, status: 'cancelada' })

  return session.cancelUrl
}

// O "webhook": tira da fila os eventos que já chegaram e que este pedaço do app sabe tratar.
// Cada evento é entregue uma vez só
export function takeDueEvents(
  accepts: (session: CheckoutSession) => boolean
): { event: ProviderEvent; session: CheckoutSession }[] {
  const now = Date.now()
  const sessions = readSessions()
  const events = readJson<ProviderEvent[]>(EVENTS_KEY, [])
  const due: { event: ProviderEvent; session: CheckoutSession }[] = []
  const remaining: ProviderEvent[] = []

  for (const event of events) {
    const session = sessions[event.sessionId]

    if (session && new Date(event.deliverAt).getTime() <= now && accepts(session)) due.push({ event, session })
    else remaining.push(event)
  }

  if (due.length) writeJson(EVENTS_KEY, remaining)

  return due
}

// Marca o webhook da sessão como processado, com o que ele criou
export function settleSession(id: string, result?: string) {
  const session = readSessions()[id]

  if (session) saveSession({ ...session, settledAt: new Date().toISOString(), result })
}
