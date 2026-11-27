// Dados da nota fiscal de quem assina. O CPF chega pelo webhook do pagamento (é pedido no checkout do provedor)
// e fica na conta: o próximo checkout já vem preenchido e a nota de cada cobrança sai para ele.
// Separado do registro da assinatura de propósito: a página de estados troca a assinatura, não o CPF

import { getCurrentUser } from './api'
import { cpfDigits, isValidCpf } from './cpf'

export type FiscalData = { cpf?: string }

const storageKey = (email: string) => `lvh:nota-fiscal:${email}`

export const readFiscalData = (email: string): FiscalData => {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(email)) ?? '{}') as FiscalData
  } catch {
    return {}
  }
}

// Usado pelo webhook: o CPF que a pessoa digitou no checkout passa a ser o da conta
export const saveFiscalCpf = (email: string, cpf: string) =>
  window.localStorage.setItem(storageKey(email), JSON.stringify({ ...readFiscalData(email), cpf: cpfDigits(cpf) }))

export async function getFiscalData(): Promise<FiscalData> {
  const user = await getCurrentUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  return readFiscalData(user.email)
}

// Corrigir o CPF na página Assinatura: vale a partir da próxima nota
export async function updateFiscalCpf(cpf: string): Promise<FiscalData> {
  const user = await getCurrentUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')
  if (!isValidCpf(cpf)) throw new Error('Este CPF não é válido. Confira os números.')

  saveFiscalCpf(user.email, cpf)

  return readFiscalData(user.email)
}
