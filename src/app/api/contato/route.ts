// Mensagens do formulário de dúvidas da landing. Ficam na collection contacts para a equipe responder por e-mail
import { EMAIL_PATTERN, databaseError, getDatabase, missingDatabase } from '@/lib/server/db'
import { CONTACT_LIMIT, hitRateLimit, readJson, tooLargeResponse } from '@/lib/server/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { body, tooLarge } = await readJson(request)

  if (tooLarge) return tooLargeResponse()

  const field = (key: string) => {
    const value = body?.[key]

    return typeof value === 'string' ? value.trim() : ''
  }
  const name = field('name')
  const email = field('email').toLowerCase()
  const message = field('message')

  // Campo escondido que só robôs preenchem: finge que deu certo e não guarda nada
  if (body?.site) return Response.json({ ok: true })

  if (!name || name.length > 120 || !EMAIL_PATTERN.test(email) || email.length > 254) {
    return Response.json({ error: 'Confira o nome e o e-mail.' }, { status: 400 })
  }

  if (message.length < 5 || message.length > 4000) {
    return Response.json({ error: 'Escreva a sua dúvida em até 4.000 caracteres.' }, { status: 400 })
  }

  const connection = getDatabase()

  if (!connection) return missingDatabase() ?? Response.json({ ok: true })

  try {
    const { contacts, rateLimits } = await connection

    const limited = await hitRateLimit(rateLimits, request, CONTACT_LIMIT)

    if (limited) return limited

    await contacts.insertOne({ name, email, message, createdAt: new Date() })

    return Response.json({ ok: true })
  } catch (error) {
    return databaseError(error)
  }
}
