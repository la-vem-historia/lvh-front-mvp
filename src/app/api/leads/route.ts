// Lista de interessados da landing. Guarda o e-mail no Postgres (Neon) apontado por DATABASE_URL
import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

import { FOUNDER_SPOTS } from '@/lib/lvh/fundadores'
import type { LeadResult, LeadsCount } from '@/lib/lvh/fundadores'

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

export async function GET() {
  const db = getDatabase()

  if (!db) return missingDatabase() ?? Response.json({ taken: 0 } satisfies LeadsCount)

  await db.ready
  const [row] = await db.sql`SELECT count(*)::int AS taken FROM leads`

  return Response.json({ taken: row.taken } satisfies LeadsCount)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  // Campo escondido que só robôs preenchem: finge que deu certo e não guarda nada
  if (body?.site) return Response.json({ position: FOUNDER_SPOTS + 1, founder: false, already: false })

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return Response.json({ error: 'Confira o e-mail.' }, { status: 400 })
  }

  const db = getDatabase()

  if (!db) {
    return missingDatabase() ?? Response.json({ position: 1, founder: true, already: false } satisfies LeadResult)
  }

  await db.ready

  // Quem se inscreve de novo mantém o lugar na fila
  const [lead] = await db.sql`
    INSERT INTO leads (email) VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, (xmax = 0) AS inserted`
  const [row] = await db.sql`SELECT count(*)::int AS position FROM leads WHERE id <= ${lead.id}`

  return Response.json({
    position: row.position,
    founder: row.position <= FOUNDER_SPOTS,
    already: !lead.inserted
  } satisfies LeadResult)
}
