// Links que o app manda para fora (convite de colaborador, leitura do livro) abrem no site.
// O endereço vem de EXPO_PUBLIC_SITE_URL; sem ela, usa o domínio do app
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? 'https://lavemhistoria.com.br').replace(/\/$/, '')

export const collaboratorLink = (token: string) => `${SITE_URL}/colaborar/${token}`
export const readerLink = (token: string) => `${SITE_URL}/ler/${token}`
