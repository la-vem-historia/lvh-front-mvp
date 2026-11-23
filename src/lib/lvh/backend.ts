// Cliente da API (lvh-services). A sessão vai num cookie HttpOnly que o navegador guarda e manda
// sozinho (credentials: 'include'): o JavaScript da página nunca vê o token.
// Sem NEXT_PUBLIC_API_URL o app continua no modo protótipo, tudo no localStorage

import type { LoginProvider } from './types'

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

export const hasBackend = Boolean(API_URL)

// localhost e 127.0.0.1 são sites diferentes para o navegador: o cookie de sessão (SameSite=Strict)
// criado num não vai para o outro, e tudo depois do login dá 401. Em produção vale o mesmo: a API
// fica em api.lavemhistoria.com.br, no mesmo site do front
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production' && hasBackend) {
  const loopback = ['localhost', '127.0.0.1', '[::1]']
  const apiHost = new URL(API_URL).hostname
  const pageHost = window.location.hostname

  if (apiHost !== pageHost && loopback.includes(apiHost) && loopback.includes(pageHost)) {
    console.warn(
      `[lvh] A API está em ${apiHost} e a página em ${pageHost}: o cookie de sessão não vai passar. ` +
        `Use o mesmo host nos dois (NEXT_PUBLIC_API_URL e o endereço do navegador).`
    )
  }
}

// Usuário como a API devolve (sem os campos do livro, que ainda moram no navegador)
export type ApiUser = {
  id: string
  email: string
  name: string | null
  providers: LoginProvider[]
  createdAt: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export async function apiFetch<T>(path: string, { method = 'GET', body }: { method?: Method; body?: unknown } = {}) {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      // Só manda Content-Type quando há corpo: a API recusa JSON vazio
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch {
    throw new ApiError(0, 'NETWORK', 'Sem conexão com o servidor. Confira a internet e tente de novo.')
  }

  if (response.status === 204) return undefined as T

  const data = await response.json().catch(() => null)

  // A API já manda a mensagem pronta para mostrar (ex.: código incorreto, muitas tentativas)
  if (!response.ok) {
    throw new ApiError(response.status, data?.code ?? 'UNKNOWN', data?.error ?? 'Algo deu errado. Tente de novo.')
  }

  return data as T
}
