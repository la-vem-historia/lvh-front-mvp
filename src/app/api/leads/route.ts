// Lista de interessados: quem tenta criar conta antes da abertura deixa o e-mail aqui
import { EMAIL_PATTERN, getDatabase, missingDatabase } from '@/lib/server/db'
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

  const db = getDatabase()

  if (!db) return missingDatabase() ?? Response.json({ already: false } satisfies LeadResult)

  await db.ready

  // Quem se cadastra de novo mantém o primeiro registro
  const [lead] = await db.sql`
    INSERT INTO leads (email) VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING (xmax = 0) AS inserted`

  return Response.json({ already: !lead.inserted } satisfies LeadResult)
}
