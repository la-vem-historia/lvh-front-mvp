// Mensagens do formulário de dúvidas da landing. Ficam na collection contacts para a equipe responder por e-mail
import { EMAIL_PATTERN, databaseError, getDatabase, missingDatabase } from '@/lib/server/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const field = (key: string) => (typeof body?.[key] === 'string' ? body[key].trim() : '')
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
    const { contacts } = await connection

    await contacts.insertOne({ name, email, message, createdAt: new Date() })

    return Response.json({ ok: true })
  } catch (error) {
    return databaseError(error)
  }
}
