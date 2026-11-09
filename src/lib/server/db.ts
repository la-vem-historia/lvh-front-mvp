// MongoDB (Atlas) apontado por MONGODB_URI, no database MONGODB_DB (padrão: site).
// Guarda a lista de interessados (leads), as mensagens do formulário de dúvidas (contacts)
// e os contadores do limite de envios por IP (rate_limits)
import { MongoClient } from 'mongodb'
import type { Collection } from 'mongodb'

export type Lead = {
  email: string
  createdAt: Date
}

export type Contact = {
  name: string
  email: string
  message: string
  createdAt: Date
}

// Um documento por IP, rota e janela de tempo. O Mongo apaga sozinho quando expiresAt passa
export type RateLimit = {
  _id: string
  count: number
  expiresAt: Date
}

type Database = {
  leads: Collection<Lead>
  contacts: Collection<Contact>
  rateLimits: Collection<RateLimit>
}

// Na Vercel cada função pode ser reaproveitada entre chamadas: a conexão fica no escopo global
// para não abrir uma nova a cada requisição e estourar o limite de conexões do cluster
const cache = globalThis as typeof globalThis & { lvhSiteDatabase?: Promise<Database> }

const connect = async (uri: string): Promise<Database> => {
  const client = new MongoClient(uri, {
    appName: 'lvh-site',
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000
  })

  await client.connect()

  const db = client.db(process.env.MONGODB_DB || 'site')
  const leads = db.collection<Lead>('leads')
  const contacts = db.collection<Contact>('contacts')
  const rateLimits = db.collection<RateLimit>('rate_limits')

  // createIndex não faz nada se o índice já existe. O terceiro argumento (opções do comando) é
  // obrigatório na assinatura nova do driver 7; sem ele cai na versão de dois argumentos, que está obsoleta
  await Promise.all([
    // Um e-mail só aparece uma vez na lista
    leads.createIndex({ email: 1 }, { unique: true }, undefined),
    // Índice TTL: o Mongo remove os contadores vencidos (roda a cada ~60 s)
    rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }, undefined)
  ])

  return { leads, contacts, rateLimits }
}

export const getDatabase = () => {
  const uri = process.env.MONGODB_URI

  if (!uri) return null

  // Se a conexão falhar, esquece a tentativa para a próxima requisição tentar de novo
  cache.lvhSiteDatabase ??= connect(uri).catch(error => {
    cache.lvhSiteDatabase = undefined
    throw error
  })

  return cache.lvhSiteDatabase
}

// No computador, sem banco configurado, as rotas funcionam de mentira. Publicado, nada se perde calado
export const missingDatabase = () =>
  process.env.NODE_ENV === 'production'
    ? Response.json({ error: 'O site ainda não está ligado a um banco de dados.' }, { status: 503 })
    : null

// Banco fora do ar ou recusando a conexão: registra no log da Vercel e avisa quem enviou
export const databaseError = (error: unknown) => {
  console.error('[mongo]', error)

  return Response.json({ error: 'Não conseguimos guardar agora. Tente de novo em instantes.' }, { status: 503 })
}

// Erro do Mongo quando o índice único barra um valor repetido
export const isDuplicateKey = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
