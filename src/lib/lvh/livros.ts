// Como o app fala de cada livro: para quem é, e qual a relação com quem escreve

import type { RecipientGender, Role, UserBook } from './types'

export const isGrandparent = (role: Role) => role === 'Avó' || role === 'Avô'

// Filho, filha, neto ou neta, a partir do papel de quem escreve e de quem recebe
export const relationOf = (role: Role, gender: RecipientGender) =>
  isGrandparent(role) ? (gender === 'menina' ? 'neta' : 'neto') : gender === 'menina' ? 'filha' : 'filho'

// "o Tom", "a Lara"; sem nome, a relação: "seu filho"
export const recipientOf = (book: Pick<UserBook, 'role' | 'recipientName' | 'recipientGender'>) => {
  const name = book.recipientName.trim()

  if (!name)
    return `${book.recipientGender === 'menina' ? 'sua' : 'seu'} ${relationOf(book.role, book.recipientGender)}`

  return `${book.recipientGender === 'menina' ? 'a' : 'o'} ${name}`
}

// Título curto do livro, usado no cabeçalho e na lista: "Para o Tom"
export const bookTitle = (book: UserBook) =>
  book.recipientName.trim() ? `Para ${recipientOf(book)}` : 'Para a família'

export const formatPrice = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Código de cada foto e áudio, igual no livro impresso e no nome do arquivo do ZIP:
// P047-F1 é a foto 1 da pergunta 47; P047-A é a voz da pergunta 47. Vem do id fixo da pergunta
export const mediaCode = (questionId: number, kind: 'foto' | 'audio', index = 0) =>
  `P${String(questionId).padStart(3, '0')}-${kind === 'audio' ? 'A' : `F${index + 1}`}`
