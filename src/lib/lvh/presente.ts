// Cartão-presente: alguém compra meses de Lá Vem História para outra pessoa contar a própria história.
// Protótipo: os cartões ficam no navegador de quem comprou (localStorage), nenhum pagamento é cobrado
// e nenhum e-mail é enviado; com o backend, a compra e o resgate passam a ser de verdade

import { getCurrentUser, updateUser } from './api'

const GIFTS_KEY = 'lvh:presentes'
// Código digitado antes de a pessoa ter conta: é aplicado assim que ela entra no app
const PENDING_KEY = 'lvh:presente-pendente'

// Preço do mês avulso; o presente fica mais barato por mês quanto mais meses
export const MONTHLY_PRICE = 29.9

export const GIFT_OPTIONS = [
  { months: 3, price: 84.9 },
  { months: 6, price: 159.9 },
  { months: 12, price: 298.8 }
] as const

export type GiftMonths = (typeof GIFT_OPTIONS)[number]['months']

export const pricePerMonth = (option: (typeof GIFT_OPTIONS)[number]) => option.price / option.months

// Quanto sai mais barato que pagar mês a mês, em %
export const savingsOf = (option: (typeof GIFT_OPTIONS)[number]) =>
  Math.round((1 - option.price / (MONTHLY_PRICE * option.months)) * 100)

export type GiftDelivery = 'email' | 'pdf'

export type GiftCard = {
  code: string
  months: GiftMonths
  price: number
  recipientName: string
  message?: string
  buyerName: string
  buyerEmail: string
  // E-mail de quem ganha: o cartão vai direto para ele. No PDF, o cartão vai para quem comprou
  delivery: GiftDelivery
  recipientEmail?: string
  createdAt: string
  redeemedAt?: string
}

const read = (): Record<string, GiftCard> => {
  try {
    return JSON.parse(window.localStorage.getItem(GIFTS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

const write = (gifts: Record<string, GiftCard>) => window.localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts))

// Sem letras e números que se confundem (O e 0, I e 1), para ditar ou digitar sem erro
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const newCode = () => {
  const values = crypto.getRandomValues(new Uint32Array(8))
  const chars = [...values].map(value => ALPHABET[value % ALPHABET.length])

  return `LVH-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

// Aceita o código com ou sem traços, em maiúscula ou minúscula
export const normalizeCode = (code: string) => {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LVH/, '')

  return clean.length === 8 ? `LVH-${clean.slice(0, 4)}-${clean.slice(4)}` : code.trim().toUpperCase()
}

export async function createGiftCard(
  input: Omit<GiftCard, 'code' | 'price' | 'createdAt' | 'redeemedAt'>
): Promise<GiftCard> {
  const option = GIFT_OPTIONS.find(item => item.months === input.months)

  if (!option) throw new Error('Escolha 3, 6 ou 12 meses.')

  const gifts = read()
  let code = newCode()

  while (gifts[code]) code = newCode()

  const gift: GiftCard = {
    ...input,
    recipientName: input.recipientName.trim(),
    message: input.message?.trim() || undefined,
    buyerName: input.buyerName.trim(),
    buyerEmail: input.buyerEmail.trim().toLowerCase(),
    recipientEmail: input.delivery === 'email' ? input.recipientEmail?.trim().toLowerCase() : undefined,
    code,
    price: option.price,
    createdAt: new Date().toISOString()
  }

  write({ ...gifts, [code]: gift })

  return gift
}

export async function getGiftCard(code: string): Promise<GiftCard | null> {
  return read()[normalizeCode(code)] ?? null
}

// Soma os meses ao que a pessoa já tem de presente: um segundo cartão começa quando o primeiro acaba
const addMonths = (from: Date, months: number) => {
  const date = new Date(from)

  date.setMonth(date.getMonth() + months)

  return date
}

export async function redeemGiftCard(code: string): Promise<{ gift: GiftCard; until: string }> {
  const gifts = read()
  const gift = gifts[normalizeCode(code)]

  if (!gift) throw new Error('Não encontramos este código. Confira as letras e os números.')
  if (gift.redeemedAt) throw new Error('Este presente já foi resgatado.')

  const user = await getCurrentUser()

  if (!user) throw new Error('Entre na sua conta para resgatar o presente.')

  const now = new Date()
  const current = user.giftUntil && new Date(user.giftUntil) > now ? new Date(user.giftUntil) : now
  const until = addMonths(current, gift.months).toISOString()

  await updateUser({ giftUntil: until })
  write({ ...gifts, [gift.code]: { ...gift, redeemedAt: now.toISOString() } })

  return { gift, until }
}

// Guarda o código de quem ainda vai criar a conta
export const savePendingGift = (code: string) => window.localStorage.setItem(PENDING_KEY, normalizeCode(code))

// Ao entrar no app, aplica o código guardado; devolve o resgate, ou nada se não havia código ou ele não vale mais
export async function redeemPendingGift() {
  const code = window.localStorage.getItem(PENDING_KEY)

  if (!code) return null

  window.localStorage.removeItem(PENDING_KEY)

  try {
    return await redeemGiftCard(code)
  } catch {
    return null
  }
}

export const formatGiftDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
