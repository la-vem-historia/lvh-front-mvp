// MongoDB (Atlas) apontado por MONGODB_URI, no database MONGODB_DB (padrão: site).
// Guarda a lista de interessados (leads) e as mensagens do formulário de dúvidas (contacts)
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

type Database = {
  leads: Collection<Lead>
  contacts: Collection<Contact>
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

  // Um e-mail só aparece uma vez na lista. createIndex não faz nada se o índice já existe
  await leads.createIndex({ email: 1 }, { unique: true })

  return { leads, contacts }
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
