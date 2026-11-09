// Proteção dos formulários públicos da landing contra abuso: limite de envios por IP numa janela
// de tempo e corpo da requisição com tamanho máximo. Os contadores ficam no Mongo (rate_limits)
import { createHash } from 'node:crypto'

import type { Collection } from 'mongodb'

import { isDuplicateKey } from '@/lib/server/db'
import type { RateLimit } from '@/lib/server/db'

type Rule = {
  // Nome da rota, separa os contadores de cada formulário
  scope: string
  // Quantos envios cabem na janela
  limit: number
  // Tamanho da janela em milissegundos
  windowMs: number
}

export const LEAD_LIMIT: Rule = { scope: 'leads', limit: 5, windowMs: 10 * 60 * 1000 }
export const CONTACT_LIMIT: Rule = { scope: 'contacts', limit: 3, windowMs: 10 * 60 * 1000 }

// Os formulários mandam poucos campos curtos: qualquer coisa acima disso não é uso normal
const MAX_BODY_BYTES = 16 * 1024

// Na Vercel, o primeiro endereço de x-forwarded-for é o IP real de quem chamou
const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconhecido'

// O IP não é guardado: só um hash dele, que basta para contar envios e não identifica ninguém
const hashIp = (ip: string) => createHash('sha256').update(ip).digest('hex').slice(0, 32)

// Lê o JSON do corpo recusando corpos grandes demais. Devolve null se não for JSON válido
export const readJson = async (request: Request): Promise<{ body: Record<string, unknown> | null; tooLarge: boolean }> => {
  const declared = Number(request.headers.get('content-length') ?? 0)

  if (declared > MAX_BODY_BYTES) return { body: null, tooLarge: true }

  const text = await request.text().catch(() => '')

  if (text.length > MAX_BODY_BYTES) return { body: null, tooLarge: true }

  try {
    const parsed = JSON.parse(text)

    return { body: typeof parsed === 'object' && parsed !== null ? parsed : null, tooLarge: false }
  } catch {
    return { body: null, tooLarge: false }
  }
}

export const tooLargeResponse = () => Response.json({ error: 'Envio grande demais.' }, { status: 413 })

// Conta mais um envio deste IP e diz se passou do limite. Janela fixa: o contador zera quando ela vira
export const hitRateLimit = async (rateLimits: Collection<RateLimit>, request: Request, rule: Rule) => {
  const now = Date.now()
  const window = Math.floor(now / rule.windowMs)
  const _id = `${rule.scope}:${hashIp(clientIp(request))}:${window}`
  const expiresAt = new Date((window + 1) * rule.windowMs)

  const increment = () =>
    rateLimits.findOneAndUpdate(
      { _id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: 'after' }
    )

  // Duas requisições ao mesmo tempo podem tentar criar o mesmo contador: a segunda tenta de novo e só incrementa
  const counter = await increment().catch(error => {
    if (isDuplicateKey(error)) return increment()
    throw error
  })

  const count = counter?.count ?? 1

  if (count <= rule.limit) return null

  const retryAfter = Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000))

  return Response.json(
    { error: 'Muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}
