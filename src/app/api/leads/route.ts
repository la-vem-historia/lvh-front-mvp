// Lista de interessados: quem tenta criar conta antes da abertura deixa o e-mail aqui
import { EMAIL_PATTERN, databaseError, getDatabase, isDuplicateKey, missingDatabase } from '@/lib/server/db'
import type { LeadResult } from '@/lib/lvh/pre-abertura'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  // Campo escondido que só robôs preenchem: finge que deu certo e não guarda nada
  if (body?.site) return Response.json({ already: false } satisfies LeadResult)

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return Response.json({ error: 'Confira o e-mail.' }, { status: 400 })
  }

  const connection = getDatabase()

  if (!connection) return missingDatabase() ?? Response.json({ already: false } satisfies LeadResult)

  try {
    const { leads } = await connection

    // Quem se cadastra de novo mantém o primeiro registro: só grava a data na primeira vez
    const result = await leads.updateOne(
      { email },
      { $setOnInsert: { email, createdAt: new Date() } },
      { upsert: true }
    )

    return Response.json({ already: result.upsertedCount === 0 } satisfies LeadResult)
  } catch (error) {
    // Dois envios do mesmo e-mail ao mesmo tempo: o segundo bate no índice único e já está na lista
    if (isDuplicateKey(error)) return Response.json({ already: true } satisfies LeadResult)

    return databaseError(error)
  }
}
