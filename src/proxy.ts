// Acesso restrito enquanto o produto não é lançado: o site inteiro pede usuário e senha
// (Basic Auth do navegador). As credenciais vêm de SITE_USER e SITE_PASSWORD
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { TEAM_COOKIE } from '@/lib/lvh/pre-abertura'

const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' }

// A landing, a tela de criar conta, a lista de interessados e o formulário de dúvidas ficam abertos: quem cria
// conta antes da abertura deixa o e-mail na lista. O app continua fechado
const PUBLIC_PATHS = ['/', '/entrar', '/api/leads', '/api/contato']
// Links que o autor manda para a família (ler o livro, ouvir uma voz pelo QR code, responder junto):
// quem recebe não tem a senha do site
const PUBLIC_PREFIXES = ['/ler/', '/ouvir/', '/colaborar/']

// Quem passou pela senha é da equipe: o cookie libera criar conta e entrar no app de verdade
const asTeam = (response: NextResponse) => {
  response.cookies.set(TEAM_COOKIE, '1', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  return response
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (PUBLIC_PATHS.includes(path) || PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return NextResponse.next()
  }

  const user = process.env.SITE_USER
  const password = process.env.SITE_PASSWORD

  if (!user || !password) {
    // No computador, sem senha configurada, o site abre normalmente. Publicado, ele nunca fica aberto por engano
    if (process.env.NODE_ENV !== 'production') return asTeam(NextResponse.next())
    return new NextResponse('Acesso restrito: falta configurar SITE_USER e SITE_PASSWORD.', {
      status: 503,
      headers: NOINDEX
    })
  }

  const [scheme, encoded] = request.headers.get('authorization')?.split(' ') ?? []

  if (scheme === 'Basic' && encoded) {
    const decoded = atob(encoded)
    const separator = decoded.indexOf(':')

    if (decoded.slice(0, separator) === user && decoded.slice(separator + 1) === password) {
      const response = NextResponse.next()
      response.headers.set('X-Robots-Tag', NOINDEX['X-Robots-Tag'])
      return asTeam(response)
    }
  }

  return new NextResponse('Acesso restrito.', {
    status: 401,
    headers: { ...NOINDEX, 'WWW-Authenticate': 'Basic realm="Lá Vem História", charset="UTF-8"' }
  })
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)'
}
