// Acesso restrito enquanto o produto não é lançado: o site inteiro pede usuário e senha
// (Basic Auth do navegador). As credenciais vêm de SITE_USER e SITE_PASSWORD
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' }

export function proxy(request: NextRequest) {
  const user = process.env.SITE_USER
  const password = process.env.SITE_PASSWORD

  if (!user || !password) {
    // No computador, sem senha configurada, o site abre normalmente. Publicado, ele nunca fica aberto por engano
    if (process.env.NODE_ENV !== 'production') return NextResponse.next()
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
      return response
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
