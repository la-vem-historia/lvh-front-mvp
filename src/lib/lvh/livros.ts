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

// Nome curto do livro, o mesmo no cabeçalho, em Meus livros e no ZIP: "Livro do Tom", "Livro da Lara"
export const bookTitle = (book: Pick<UserBook, 'recipientName' | 'recipientGender'>) => {
  const name = book.recipientName.trim()

  return name ? `Livro ${book.recipientGender === 'menina' ? 'da' : 'do'} ${name}` : 'Livro da família'
}

// O mesmo nome no meio de uma frase: "o livro da Lara está pronto"
export const bookTitleInline = (book: Pick<UserBook, 'recipientName' | 'recipientGender'>) =>
  bookTitle(book).replace(/^Livro/, 'livro')

// Título da capa quando a pessoa ainda não escolheu um
export const DEFAULT_COVER_TITLE = 'A minha história'

export const formatPrice = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Código de cada foto e áudio, igual no livro impresso e no nome do arquivo do ZIP:
// P047-F1 é a foto 1 da pergunta 47; P047-A é a voz da pergunta 47. Vem do id fixo da pergunta
export const mediaCode = (questionId: number, kind: 'foto' | 'audio', index = 0) =>
  `P${String(questionId).padStart(3, '0')}-${kind === 'audio' ? 'A' : `F${index + 1}`}`
