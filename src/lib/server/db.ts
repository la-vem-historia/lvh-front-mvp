// Postgres (Neon) apontado por DATABASE_URL, com as tabelas criadas na primeira chamada.
// Guarda a lista de interessados e as mensagens do formulário de dúvidas
import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

let database: { sql: NeonQueryFunction<false, false>; ready: Promise<unknown> } | null = null

export const getDatabase = () => {
  if (!process.env.DATABASE_URL) return null

  if (!database) {
    const sql = neon(process.env.DATABASE_URL)
    const ready = Promise.all([
      sql`
        CREATE TABLE IF NOT EXISTS leads (
          id serial PRIMARY KEY,
          email text NOT NULL UNIQUE,
          created_at timestamptz NOT NULL DEFAULT now()
        )`,
      sql`
        CREATE TABLE IF NOT EXISTS contatos (
          id serial PRIMARY KEY,
          name text NOT NULL,
          email text NOT NULL,
          message text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )`
    ])
    database = { sql, ready }
  }

  return database
}

// No computador, sem banco configurado, as rotas funcionam de mentira. Publicado, nada se perde calado
export const missingDatabase = () =>
  process.env.NODE_ENV === 'production'
    ? Response.json({ error: 'O site ainda não está ligado a um banco de dados.' }, { status: 503 })
    : null

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
