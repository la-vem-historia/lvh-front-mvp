// Lista de interessados: quem tenta criar conta antes da abertura. Guarda o e-mail no Postgres (Neon) apontado por DATABASE_URL
import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

import type { LeadResult } from '@/lib/lvh/pre-abertura'

export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let database: { sql: NeonQueryFunction<false, false>; ready: Promise<unknown> } | null = null

// Uma conexão por instância; a tabela é criada na primeira chamada
const getDatabase = () => {
  if (!process.env.DATABASE_URL) return null

  if (!database) {
    const sql = neon(process.env.DATABASE_URL)
    const ready = sql`
      CREATE TABLE IF NOT EXISTS leads (
        id serial PRIMARY KEY,
        email text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now()
      )`
    database = { sql, ready }
  }

  return database
}

// No computador, sem banco configurado, a lista funciona de mentira. Publicada, ela nunca perde um e-mail calada
const missingDatabase = () =>
  process.env.NODE_ENV === 'production'
    ? Response.json({ error: 'A lista ainda não está ligada a um banco de dados.' }, { status: 503 })
    : null

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  // Campo escondido que só robôs preenchem: finge que deu certo e não guarda nada
  if (body?.site) return Response.json({ already: false } satisfies LeadResult)

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return Response.json({ error: 'Confira o e-mail.' }, { status: 400 })
  }

  const db = getDatabase()

  if (!db) {
    return missingDatabase() ?? Response.json({ already: false } satisfies LeadResult)
  }

  await db.ready

  // Quem se cadastra de novo mantém o primeiro registro
  const [lead] = await db.sql`
    INSERT INTO leads (email) VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING (xmax = 0) AS inserted`

  return Response.json({ already: !lead.inserted } satisfies LeadResult)
}
