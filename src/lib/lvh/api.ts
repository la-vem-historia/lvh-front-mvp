// Camada de dados do app. Por enquanto tudo é simulado e fica no localStorage do
// navegador; quando o backend existir, só o miolo destas funções muda.

import { chaptersFor } from './perguntas'
import type {
  Answer,
  AudioRecording,
  AnswerChanges,
  Billing,
  Book,
  Chapter,
  Collaborator,
  CollaboratorView,
  LoginProvider,
  Contribution,
  Question,
  QuestionContext,
  RoleRequest,
  NewBookInput,
  PlanId,
  Role,
  Share,
  User,
  UserBook,
  UserBookChanges,
  UserChanges
} from './types'

const USER_KEY = 'lvh:user'
const ACCOUNTS_KEY = 'lvh:accounts'
const ANSWERS_KEY = 'lvh:answers'
const SHARES_KEY = 'lvh:shares'
const ROLE_REQUESTS_KEY = 'lvh:role-requests'
const COLLABORATORS_KEY = 'lvh:collaborators'
const CONTRIBUTIONS_KEY = 'lvh:contributions'
const AUDIO_LINKS_KEY = 'lvh:audio-links'
const BOOKMARKS_KEY = 'lvh:bookmarks'
const BOOKS_KEY = 'lvh:books'

// Tudo o que é de um livro (respostas, leitores, colaboradores, voz) fica numa chave com o id dele
const PER_BOOK_KEYS = [ANSWERS_KEY, BOOKMARKS_KEY, SHARES_KEY, COLLABORATORS_KEY, CONTRIBUTIONS_KEY, AUDIO_LINKS_KEY]

const read = <T>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key)

    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))

    return true
  } catch {
    // Sem storage ou sem espaço (fotos e áudio pesam): quem chamou decide o que fazer
    return false
  }
}

// Nome a partir do e-mail quando a pessoa entra sem ter criado conta antes
const nameFromEmail = (email: string) => {
  const first = email.split('@')[0].split(/[._-]/)[0]

  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'Você'
}

// Campos que vêm do livro ativo: nunca ficam guardados no usuário
const BOOK_FIELDS = ['activeBook', 'profile', 'bookName', 'dedication', 'coverColor', 'coverPhoto', 'onboarded'] as const

const stripBookFields = (user: User): User => {
  const raw = { ...user }

  BOOK_FIELDS.forEach(field => delete raw[field])

  return raw
}

// Contas que já entraram neste navegador, por e-mail. Sair encerra só a sessão; a conta continua
// aqui para o próximo login saber que ela existe
const saveUser = (user: User) => {
  const raw = stripBookFields(user)
  const accounts = read<Record<string, User>>(ACCOUNTS_KEY, {})

  write(ACCOUNTS_KEY, { ...accounts, [raw.email]: raw })

  return write(USER_KEY, raw)
}

// Antes havia um livro só, guardado no próprio usuário. Na primeira leitura, a conta vira o
// primeiro livro e as chaves antigas passam a ter o id dele
const migrateToBooks = () => {
  try {
    if (window.localStorage.getItem(BOOKS_KEY) !== null) return
  } catch {
    return
  }

  const legacy = read<User | null>(USER_KEY, null)

  if (!legacy?.profile) {
    write(BOOKS_KEY, [])

    return
  }

  const book: UserBook = {
    id: crypto.randomUUID(),
    role: legacy.profile as Role,
    recipientName: '',
    recipientGender: 'menino',
    bookName: legacy.bookName,
    dedication: legacy.dedication,
    coverColor: legacy.coverColor,
    coverPhoto: legacy.coverPhoto,
    createdAt: new Date().toISOString()
  }

  PER_BOOK_KEYS.forEach(key => {
    try {
      const value = window.localStorage.getItem(key)

      if (value !== null) {
        window.localStorage.setItem(`${key}:${book.id}`, value)
        window.localStorage.removeItem(key)
      }
    } catch {}
  })

  write(BOOKS_KEY, [book])
  saveUser({ ...legacy, activeBookId: book.id })
}

const readBooks = () => {
  migrateToBooks()

  return read<UserBook[]>(BOOKS_KEY, [])
}

const rawUser = () => {
  migrateToBooks()

  return read<User | null>(USER_KEY, null)
}

// O usuário que o app enxerga: a conta mais os campos do livro aberto
const withActiveBook = (user: User): User => {
  const books = readBooks()
  const book = books.find(item => item.id === user.activeBookId) ?? books[0]

  return {
    ...user,
    activeBookId: book?.id,
    activeBook: book,
    profile: book?.role,
    bookName: book?.bookName,
    dedication: book?.dedication,
    coverColor: book?.coverColor,
    coverPhoto: book?.coverPhoto,
    onboarded: Boolean(book)
  }
}

const activeBookId = () => {
  const user = rawUser()

  return user ? withActiveBook(user).activeBookId : undefined
}

const bookKey = (key: string, bookId = activeBookId()) => `${key}:${bookId ?? 'sem-livro'}`

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const findAccount = (email: string) => {
  const current = read<User | null>(USER_KEY, null)

  return read<Record<string, User>>(ACCOUNTS_KEY, {})[email] ?? (current?.email === email ? current : undefined)
}

export type LoginResult = { user: User; isNew: boolean }

// Login sem senha: a pessoa só informa o e-mail e nós decidimos se é conta nova ou existente.
// Hoje nenhum e-mail sai daqui; com o backend, esta função envia o código de verdade
export async function sendLoginCode(email: string): Promise<{ isNew: boolean }> {
  return { isNew: !findAccount(normalizeEmail(email)) }
}

// Protótipo: qualquer código de 6 números vale
export async function verifyLoginCode(email: string, code: string): Promise<LoginResult> {
  if (!/^\d{6}$/.test(code)) throw new Error('O código tem 6 números. Confira o e-mail que enviamos.')

  const address = normalizeEmail(email)
  const existing = findAccount(address)
  const user = existing ?? { email: address, name: nameFromEmail(address) }

  saveUser(user)

  return { user: withActiveBook(user), isNew: !existing }
}

// Contas de exemplo no lugar do OAuth de cada serviço, que entra junto com o backend
const providerProfiles: Record<LoginProvider, { email: string; name: string }> = {
  google: { email: 'maria.oliveira@gmail.com', name: 'Maria' },
  apple: { email: 'maria.oliveira@icloud.com', name: 'Maria' },
  facebook: { email: 'maria.oliveira@facebook.com', name: 'Maria' }
}

export async function signInWithProvider(provider: LoginProvider): Promise<LoginResult> {
  const profile = providerProfiles[provider]
  const existing = findAccount(profile.email)
  const user = { ...(existing ?? profile), providers: [...new Set([...(existing?.providers ?? []), provider])] }

  saveUser(user)

  return { user: withActiveBook(user), isNew: !existing }
}

export type { LoginProvider }

// Todas as perguntas de um papel, na ordem do livro
const questionsFor = (role: string | undefined) => chaptersFor(role).flatMap(chapter => chapter.questions)

// Respostas que só existem para um papel (ex.: perguntas de pai). Trocar de papel apaga essas respostas
const profileOnlyAnswered = (profile: string | undefined, answers: Record<number, Answer>) =>
  questionsFor(profile)
    .filter(question => question.profile && isAnswered(answers[question.id]))
    .map(question => question.id)

export async function countProfileOnlyAnswers(profile: string | undefined): Promise<number> {
  return profileOnlyAnswered(profile, read<Record<number, Answer>>(bookKey(ANSWERS_KEY), {})).length
}

// Troca o papel do livro aberto. As respostas que só existem para o papel antigo são apagadas
export async function changeProfile(profile: string): Promise<User> {
  const current = await getCurrentUser()

  if (!current?.activeBook) throw new Error('Sessão expirada. Entre de novo.')

  const key = bookKey(ANSWERS_KEY, current.activeBook.id)
  const answers = read<Record<number, Answer>>(key, {})
  const lost = profileOnlyAnswered(current.profile, answers)

  if (current.profile !== profile && lost.length) {
    write(key, Object.fromEntries(Object.entries(answers).filter(([id]) => !lost.includes(Number(id)))))
  }

  await updateBook(current.activeBook.id, { role: profile as Role })

  return (await getCurrentUser()) as User
}

export async function signOut() {
  try {
    window.localStorage.removeItem(USER_KEY)
  } catch {}
}

export async function getCurrentUser(): Promise<User | null> {
  const user = rawUser()

  return user ? withActiveBook(user) : null
}

// Campos do livro vão para o livro aberto; o resto fica na conta
export async function updateUser(changes: UserChanges): Promise<User> {
  const current = rawUser()

  if (!current) throw new Error('Sessão expirada. Entre de novo.')

  const { profile, bookName, dedication, coverColor, coverPhoto, ...accountChanges } = changes

  // Ter livro é o que conta como onboarding feito; não é um campo da conta
  delete accountChanges.onboarded
  const bookChanges: UserBookChanges = {
    ...('profile' in changes && { role: profile as Role }),
    ...('bookName' in changes && { bookName }),
    ...('dedication' in changes && { dedication }),
    ...('coverColor' in changes && { coverColor }),
    ...('coverPhoto' in changes && { coverPhoto })
  }
  const bookId = withActiveBook(current).activeBookId

  if (Object.keys(bookChanges).length) {
    if (bookId) await updateBook(bookId, bookChanges)
    // Onboarding antigo (app mobile): escolhe só o papel, sem dizer para quem é o livro
    else if (profile) await createBook({ role: profile as Role, recipientName: '', recipientGender: 'menino' })
  }

  const user = { ...rawUser()!, ...accountChanges }

  if (!saveUser(user)) throw new Error('Não foi possível salvar.')

  return withActiveBook(user)
}

// Livros

export async function getBooks(): Promise<UserBook[]> {
  return readBooks()
}

const saveBooks = (books: UserBook[]) => {
  if (!write(BOOKS_KEY, books)) throw new Error('Não foi possível salvar o livro.')
}


// Respostas de outro livro que valem para o livro novo: as que existem para o papel novo e
// não falam de quem recebe o livro
const copyableAnswers = (fromId: string, role: Role) => {
  const answers = read<Record<number, Answer>>(bookKey(ANSWERS_KEY, fromId), {})

  return questionsFor(role)
    .filter(question => !question.aboutRecipient && isAnswered(answers[question.id]))
    .map(question => answers[question.id])
}

export async function countCopyableAnswers(fromId: string, role: Role): Promise<number> {
  return copyableAnswers(fromId, role).length
}

// Cria o livro, abre ele e, se pedido, copia as respostas de outro livro (com fotos e voz)
export async function createBook({ copyFrom, ...input }: NewBookInput): Promise<User> {
  const user = rawUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  if (!(await hasFreeSlot())) {
    throw new Error('Todas as vagas estão em uso. Conclua um livro ou adicione uma vaga.')
  }

  const book: UserBook = {
    ...input,
    recipientName: input.recipientName.trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'em-andamento'
  }

  saveBooks([...readBooks(), book])

  if (copyFrom) {
    const now = new Date().toISOString()
    const copied = Object.fromEntries(
      copyableAnswers(copyFrom, book.role).map(answer => [answer.questionId, { ...answer, updatedAt: now }])
    )

    if (!write(bookKey(ANSWERS_KEY, book.id), copied)) {
      saveBooks(readBooks().filter(item => item.id !== book.id))
      throw new Error('Não deu para copiar as respostas: o espaço do navegador acabou.')
    }
  }

  saveUser({ ...user, activeBookId: book.id })

  return withActiveBook({ ...user, activeBookId: book.id })
}

export async function updateBook(id: string, changes: UserBookChanges): Promise<UserBook> {
  const books = readBooks()
  const current = books.find(book => book.id === id)

  if (!current) throw new Error('Livro não encontrado.')

  const book = { ...current, ...changes }

  saveBooks(books.map(item => (item.id === id ? book : item)))

  return book
}

export async function setActiveBook(id: string): Promise<User> {
  const user = rawUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  saveUser({ ...user, activeBookId: id })

  return withActiveBook({ ...user, activeBookId: id })
}

// Exclusão definitiva do livro: respostas, leitores, colaboradores e voz somem junto
export async function deleteBook(id: string): Promise<User> {
  const user = rawUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  saveBooks(readBooks().filter(book => book.id !== id))
  PER_BOOK_KEYS.forEach(key => {
    try {
      window.localStorage.removeItem(bookKey(key, id))
    } catch {}
  })

  const next = { ...user, activeBookId: user.activeBookId === id ? undefined : user.activeBookId }

  saveUser(next)

  return withActiveBook(next)
}

// Quantas perguntas cada livro já tem respondidas, para a lista de livros
export async function countAnsweredByBook(): Promise<Record<string, number>> {
  return Object.fromEntries(
    readBooks().map(book => {
      const answers = read<Record<number, Answer>>(bookKey(ANSWERS_KEY, book.id), {})

      return [book.id, questionsFor(book.role).filter(question => isAnswered(answers[question.id])).length]
    })
  )
}

// Preço por mês: o plano dá uma vaga de livro em andamento; cada vaga a mais custa o valor de extra
export const planPrices: Record<PlanId, { name: string; base: number; extra: number }> = {
  essencial: { name: 'Essencial', base: 9.9, extra: 4.9 },
  completo: { name: 'Completo', base: 29.9, extra: 9.9 }
}

const isInProgress = (book: UserBook) => book.status !== 'concluido'

const slotInfo = () => {
  const extraSlots = rawUser()?.extraSlots ?? 0

  return { slots: 1 + extraSlots, extraSlots, inProgress: readBooks().filter(isInProgress).length }
}

export async function hasFreeSlot(): Promise<boolean> {
  const { slots, inProgress } = slotInfo()

  return inProgress < slots
}

export async function getBilling(): Promise<Billing> {
  const plan = rawUser()?.plan ?? 'completo'
  const { slots, extraSlots, inProgress } = slotInfo()
  const { base, extra } = planPrices[plan]

  return {
    plan,
    base,
    extraSlots,
    extraPrice: extra,
    total: Math.round((base + extraSlots * extra) * 100) / 100,
    slots,
    inProgress
  }
}

// Vagas a mais: só tira uma vaga que está livre, nunca a de um livro em andamento
export async function setExtraSlots(extraSlots: number): Promise<User> {
  const { inProgress } = slotInfo()

  if (extraSlots < 0 || 1 + extraSlots < inProgress) {
    throw new Error('Conclua um livro em andamento antes de tirar essa vaga.')
  }

  return updateUser({ extraSlots })
}

// Concluir: o livro fica pronto, continua online para quem lê e libera a vaga
export async function concludeBook(id: string): Promise<UserBook> {
  return updateBook(id, { status: 'concluido', concludedAt: new Date().toISOString() })
}

// Reabrir para mudar algo: volta a ocupar uma vaga
export async function reopenBook(id: string): Promise<UserBook> {
  if (!(await hasFreeSlot())) {
    throw new Error('Todas as vagas estão em uso. Conclua outro livro ou adicione uma vaga.')
  }

  return updateBook(id, { status: 'em-andamento', concludedAt: undefined })
}


export async function getChapters(user: User): Promise<Chapter[]> {
  return chaptersFor(user.profile, user.activeBook?.recipientGender)
}

export async function getQuestionContext(user: User, questionId: number): Promise<QuestionContext | null> {
  const chapters = await getChapters(user)
  const questions = chapters.flatMap(chapter => chapter.questions)
  const index = questions.findIndex(question => question.id === questionId)

  if (index === -1) return null

  const chapterIndex = chapters.findIndex(chapter => chapter.questions.some(question => question.id === questionId))
  const chapter = chapters[chapterIndex]
  const next = questions[index + 1]

  return {
    question: questions[index],
    chapter,
    chapterIndex,
    position: chapter.questions.findIndex(question => question.id === questionId),
    previous: questions[index - 1],
    next,
    nextChapter: next && !chapter.questions.includes(next) ? chapters[chapterIndex + 1] : undefined
  }
}

// A pergunta da semana: a primeira ainda sem resposta, na ordem do livro
export async function getNextQuestion(user: User): Promise<Question | undefined> {
  const [chapters, answers] = await Promise.all([getChapters(user), getAnswers()])

  return chapters.flatMap(chapter => chapter.questions).find(question => !isAnswered(answers[question.id]))
}

// Para quem prefere fugir da ordem: qualquer pergunta ainda sem resposta
export async function getRandomQuestion(user: User): Promise<Question | undefined> {
  const [chapters, answers] = await Promise.all([getChapters(user), getAnswers()])
  const open = chapters.flatMap(chapter => chapter.questions).filter(question => !isAnswered(answers[question.id]))

  return open[Math.floor(Math.random() * open.length)]
}

export const isAnswered = (answer?: Answer) =>
  Boolean(answer && (answer.text.trim() || answer.photos.length || answer.audio))

export async function getAnswers(): Promise<Record<number, Answer>> {
  return read<Record<number, Answer>>(bookKey(ANSWERS_KEY), {})
}

export async function getAnswer(questionId: number): Promise<Answer | undefined> {
  return (await getAnswers())[questionId]
}

export async function saveAnswer(questionId: number, changes: AnswerChanges): Promise<Answer> {
  const answers = read<Record<number, Answer>>(bookKey(ANSWERS_KEY), {})
  const current = answers[questionId] ?? { questionId, text: '', photos: [], updatedAt: '' }
  const answer: Answer = { ...current, ...changes, updatedAt: new Date().toISOString() }

  if (!write(bookKey(ANSWERS_KEY), { ...answers, [questionId]: answer })) {
    throw new Error('Não foi possível salvar. O espaço do navegador pode ter acabado.')
  }

  return answer
}

// Perguntas marcadas para voltar depois (buscar uma foto, lembrar melhor). A mais recente vem primeiro
export async function getBookmarks(): Promise<number[]> {
  return read<number[]>(bookKey(BOOKMARKS_KEY), [])
}

export async function setBookmark(questionId: number, marked: boolean): Promise<number[]> {
  const rest = read<number[]>(bookKey(BOOKMARKS_KEY), []).filter(id => id !== questionId)
  const next = marked ? [questionId, ...rest] : rest

  write(bookKey(BOOKMARKS_KEY), next)

  return next
}

export async function getBook(user: User): Promise<Book> {
  const id = user.activeBookId
  const chapters = await getChapters(user)
  const answers = read<Record<number, Answer>>(bookKey(ANSWERS_KEY, id), {})
  const collaborators = read<Collaborator[]>(bookKey(COLLABORATORS_KEY, id), [])
  const contributions = read<Contribution[]>(bookKey(CONTRIBUTIONS_KEY, id), [])
  const nameOf = (id: string) => collaborators.find(collaborator => collaborator.id === id)?.name ?? 'Convidado'

  const approvedNames = contributions
    .filter(item => item.approved && item.text.trim())
    .map(item => nameOf(item.collaboratorId))

  return {
    author: user.bookName?.trim() || user.name,
    dedication: user.dedication?.trim() || undefined,
    coverColor: user.coverColor ?? 'verde',
    coverPhoto: user.coverPhoto,
    year: new Date().getFullYear(),
    contributors: [...new Set(approvedNames)],
    chapters: chapters
      .map((chapter, index) => ({
        id: chapter.id,
        number: index + 1,
        title: chapter.title,
        entries: chapter.questions
          .map(question => ({
            question,
            answer: isAnswered(answers[question.id]) ? answers[question.id] : undefined,
            contributions: contributions
              .filter(item => item.questionId === question.id && item.approved && item.text.trim())
              .map(item => ({ name: nameOf(item.collaboratorId), text: item.text }))
          }))
          .filter(entry => entry.answer || entry.contributions.length)
      }))
      .filter(chapter => chapter.entries.length > 0)
  }
}

// Links de leitores, colaboradores e voz valem para o livro em que foram criados, aberto ou não
const findInBooks = <T>(key: string, match: (item: T) => boolean) => {
  for (const book of readBooks()) {
    const item = read<T[]>(bookKey(key, book.id), []).find(match)

    if (item) return { book, item }
  }

  return undefined
}

// O dono visto a partir de um livro específico, para montar aquele livro
const ownerOf = async (bookId: string) => {
  const owner = rawUser()

  return owner ? withActiveBook({ ...owner, activeBookId: bookId }) : null
}

export async function getShares(): Promise<Share[]> {
  return read<Share[]>(bookKey(SHARES_KEY), [])
}

export async function addShare({ name, email }: { name: string; email: string }): Promise<Share> {
  const share: Share = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    token: newToken(),
    createdAt: new Date().toISOString()
  }

  if (!write(bookKey(SHARES_KEY), [...read<Share[]>(bookKey(SHARES_KEY), []), share])) {
    throw new Error('Não foi possível salvar o convite.')
  }

  return share
}

export async function removeShare(id: string) {
  write(
    bookKey(SHARES_KEY),
    read<Share[]>(bookKey(SHARES_KEY), []).filter(share => share.id !== id)
  )
}

// Leitura por convidado. Simulado: só funciona no mesmo navegador de quem escreveu
export async function getSharedBook(token: string): Promise<{ book: Book; reader: Share } | null> {
  const found = findInBooks<Share>(SHARES_KEY, share => share.token === token)
  const owner = found && (await ownerOf(found.book.id))

  if (!found || !owner) return null

  return { book: await getBook(owner), reader: found.item }
}

// Link de cada voz, para o QR code do livro impresso: um código por resposta, que não muda
// e não revela nada além daquele áudio
export async function getAudioLinks(questionIds: number[]): Promise<Record<number, string>> {
  const links = read<Record<number, string>>(bookKey(AUDIO_LINKS_KEY), {})
  const missing = questionIds.filter(id => !links[id])

  if (missing.length) {
    missing.forEach(id => (links[id] = newToken()))
    write(bookKey(AUDIO_LINKS_KEY), links)
  }

  return Object.fromEntries(questionIds.map(id => [id, links[id]]))
}

// Quem aponta a câmera para o QR code ouve a voz. Simulado: só funciona no mesmo navegador de quem escreveu
export async function getSharedAudio(
  token: string
): Promise<{ author: string; question: string; audio: AudioRecording } | null> {
  const found = readBooks()
    .map(book => ({
      book,
      entry: Object.entries(read<Record<number, string>>(bookKey(AUDIO_LINKS_KEY, book.id), {})).find(
        ([, link]) => link === token
      )
    }))
    .find(item => item.entry)
  const owner = found && (await ownerOf(found.book.id))

  if (!found?.entry || !owner) return null

  const questionId = Number(found.entry[0])
  const audio = read<Record<number, Answer>>(bookKey(ANSWERS_KEY, found.book.id), {})[questionId]?.audio
  const question = (await getChapters(owner)).flatMap(chapter => chapter.questions).find(item => item.id === questionId)

  if (!audio || !question) return null

  return { author: owner.bookName?.trim() || owner.name, question: question.text, audio }
}

// Avise-me de novos papéis. Simulado: no backend vira uma tabela para contar os votos
export async function getRoleRequest(email: string): Promise<RoleRequest | undefined> {
  return read<RoleRequest[]>(ROLE_REQUESTS_KEY, []).find(request => request.email === email)
}

export async function requestRole(email: string, role: string): Promise<RoleRequest> {
  const request: RoleRequest = { role, email, createdAt: new Date().toISOString() }
  const others = read<RoleRequest[]>(ROLE_REQUESTS_KEY, []).filter(item => item.email !== email)

  if (!write(ROLE_REQUESTS_KEY, [...others, request])) throw new Error('Não foi possível salvar o pedido.')

  return request
}

// Colaboradores. Simulado: convites não enviam e-mail e o link só abre neste navegador
const newToken = () => crypto.randomUUID().replace(/-/g, '')

export async function getCollaborators(): Promise<Collaborator[]> {
  return read<Collaborator[]>(bookKey(COLLABORATORS_KEY), [])
}

// Convida para uma pergunta; se a pessoa já colabora, só libera mais essa pergunta
export async function inviteCollaborator({
  name,
  email,
  questionId,
  message
}: {
  name: string
  email: string
  questionId: number
  message?: string
}): Promise<Collaborator> {
  const collaborators = read<Collaborator[]>(bookKey(COLLABORATORS_KEY), [])
  const normalized = email.trim().toLowerCase()
  const existing = collaborators.find(collaborator => collaborator.email === normalized)

  const collaborator: Collaborator = existing
    ? {
        ...existing,
        message: message ?? existing.message,
        questionIds: [...new Set([...existing.questionIds, questionId])]
      }
    : {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        token: newToken(),
        questionIds: [questionId],
        message,
        createdAt: new Date().toISOString()
      }

  const next = existing
    ? collaborators.map(item => (item.id === existing.id ? collaborator : item))
    : [...collaborators, collaborator]

  if (!write(bookKey(COLLABORATORS_KEY), next)) throw new Error('Não foi possível salvar o convite.')

  return collaborator
}

// Tira o acesso a uma pergunta; a resposta já dada continua até você apagar
export async function removeCollaboratorFromQuestion(collaboratorId: string, questionId: number) {
  write(
    bookKey(COLLABORATORS_KEY),
    read<Collaborator[]>(bookKey(COLLABORATORS_KEY), []).map(collaborator =>
      collaborator.id === collaboratorId
        ? { ...collaborator, questionIds: collaborator.questionIds.filter(id => id !== questionId) }
        : collaborator
    )
  )
}

// Remove a pessoa de vez: o link deixa de funcionar e as respostas dela saem do livro
export async function removeCollaborator(collaboratorId: string) {
  write(
    bookKey(COLLABORATORS_KEY),
    read<Collaborator[]>(bookKey(COLLABORATORS_KEY), []).filter(collaborator => collaborator.id !== collaboratorId)
  )
  write(
    bookKey(CONTRIBUTIONS_KEY),
    read<Contribution[]>(bookKey(CONTRIBUTIONS_KEY), []).filter(item => item.collaboratorId !== collaboratorId)
  )
}

export async function getContributions(questionId?: number): Promise<Contribution[]> {
  const contributions = read<Contribution[]>(bookKey(CONTRIBUTIONS_KEY), [])

  return questionId === undefined ? contributions : contributions.filter(item => item.questionId === questionId)
}

export async function setContributionApproval(contributionId: string, approved: boolean) {
  write(
    bookKey(CONTRIBUTIONS_KEY),
    read<Contribution[]>(bookKey(CONTRIBUTIONS_KEY), []).map(item => (item.id === contributionId ? { ...item, approved } : item))
  )
}

export async function deleteContribution(contributionId: string) {
  write(
    bookKey(CONTRIBUTIONS_KEY),
    read<Contribution[]>(bookKey(CONTRIBUTIONS_KEY), []).filter(item => item.id !== contributionId)
  )
}

// Visão do convidado: nunca inclui as respostas de quem convidou
export async function getCollaboratorView(token: string): Promise<CollaboratorView | null> {
  const found = findInBooks<Collaborator>(COLLABORATORS_KEY, item => item.token === token)
  const owner = found && (await ownerOf(found.book.id))

  if (!found || !owner) return null

  const collaborator = found.item

  const questions = (await getChapters(owner))
    .flatMap(chapter => chapter.questions)
    .filter(question => collaborator.questionIds.includes(question.id))

  const contributions = Object.fromEntries(
    read<Contribution[]>(bookKey(CONTRIBUTIONS_KEY, found.book.id), [])
      .filter(item => item.collaboratorId === collaborator.id)
      .map(item => [item.questionId, item])
  )

  return { collaborator, ownerName: owner.name, questions, contributions }
}

export async function saveContribution(token: string, questionId: number, text: string): Promise<Contribution> {
  const found = findInBooks<Collaborator>(COLLABORATORS_KEY, item => item.token === token)
  const collaborator = found?.item

  if (!found || !collaborator || !collaborator.questionIds.includes(questionId)) {
    throw new Error('Você não tem mais acesso a esta pergunta.')
  }

  const key = bookKey(CONTRIBUTIONS_KEY, found.book.id)
  const contributions = read<Contribution[]>(key, [])
  const current = contributions.find(item => item.collaboratorId === collaborator.id && item.questionId === questionId)
  const contribution: Contribution = {
    id: current?.id ?? crypto.randomUUID(),
    collaboratorId: collaborator.id,
    questionId,
    text,
    approved: current?.text === text ? current.approved : false,
    updatedAt: new Date().toISOString()
  }

  const next = current
    ? contributions.map(item => (item.id === current.id ? contribution : item))
    : [...contributions, contribution]

  if (!write(key, next)) throw new Error('Não foi possível salvar.')

  return contribution
}

// Cópia de tudo o que a pessoa tem no app, para baixar antes de excluir a conta
export async function exportMyData() {
  const per = <T>(key: string, id: string, fallback: T) => read<T>(bookKey(key, id), fallback)

  return {
    exportedAt: new Date().toISOString(),
    user: rawUser(),
    books: readBooks().map(book => ({
      ...book,
      answers: per<Record<number, Answer>>(ANSWERS_KEY, book.id, {}),
      bookmarks: per<number[]>(BOOKMARKS_KEY, book.id, []),
      collaborators: per<Collaborator[]>(COLLABORATORS_KEY, book.id, []),
      contributions: per<Contribution[]>(CONTRIBUTIONS_KEY, book.id, []),
      readers: per<Share[]>(SHARES_KEY, book.id, [])
    }))
  }
}

// Exclusão definitiva: conta, respostas, convites e links somem juntos
export async function deleteAccount() {
  try {
    Object.keys(window.localStorage)
      .filter(key => key.startsWith('lvh:'))
      .forEach(key => window.localStorage.removeItem(key))
  } catch {}
}
