// Camada de dados do app. Por enquanto tudo é simulado e fica no localStorage do
// navegador; quando o backend existir, só o miolo destas funções muda.

import { chapters as allChapters } from './perguntas'
import type {
  Answer,
  AudioRecording,
  AnswerChanges,
  Book,
  Chapter,
  Collaborator,
  CollaboratorView,
  LoginProvider,
  Contribution,
  Question,
  QuestionContext,
  RoleRequest,
  Share,
  User,
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

// Contas que já entraram neste navegador, por e-mail. Sair encerra só a sessão; a conta continua
// aqui para o próximo login saber que ela existe
const saveUser = (user: User) => {
  const accounts = read<Record<string, User>>(ACCOUNTS_KEY, {})

  write(ACCOUNTS_KEY, { ...accounts, [user.email]: user })

  return write(USER_KEY, user)
}

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

  return { user, isNew: !existing }
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

  return { user, isNew: !existing }
}

export type { LoginProvider }

// Respostas que só existem para um papel (ex.: perguntas de pai). Trocar de papel apaga essas respostas
const profileOnlyAnswered = (profile: string | undefined, answers: Record<number, Answer>) =>
  allChapters
    .flatMap(chapter => chapter.questions)
    .filter(question => question.profile && question.profile === profile && isAnswered(answers[question.id]))
    .map(question => question.id)

export async function countProfileOnlyAnswers(profile: string | undefined): Promise<number> {
  return profileOnlyAnswered(profile, read<Record<number, Answer>>(ANSWERS_KEY, {})).length
}

export async function changeProfile(profile: string): Promise<User> {
  const current = read<User | null>(USER_KEY, null)

  if (!current) throw new Error('Sessão expirada. Entre de novo.')

  const answers = read<Record<number, Answer>>(ANSWERS_KEY, {})
  const lost = profileOnlyAnswered(current.profile, answers)

  if (current.profile !== profile && lost.length) {
    write(ANSWERS_KEY, Object.fromEntries(Object.entries(answers).filter(([id]) => !lost.includes(Number(id)))))
  }

  return updateUser({ profile })
}

export async function signOut() {
  try {
    window.localStorage.removeItem(USER_KEY)
  } catch {}
}

export async function getCurrentUser(): Promise<User | null> {
  return read<User | null>(USER_KEY, null)
}

export async function updateUser(changes: UserChanges): Promise<User> {
  const current = read<User | null>(USER_KEY, null)

  if (!current) throw new Error('Sessão expirada. Entre de novo.')

  const user = { ...current, ...changes }

  if (!saveUser(user)) throw new Error('Não foi possível salvar.')

  return user
}

export async function getChapters(user: User): Promise<Chapter[]> {
  return allChapters
    .map(chapter => ({
      ...chapter,
      questions: chapter.questions.filter(question => !question.profile || question.profile === user.profile)
    }))
    .filter(chapter => chapter.questions.length > 0)
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
  return read<Record<number, Answer>>(ANSWERS_KEY, {})
}

export async function getAnswer(questionId: number): Promise<Answer | undefined> {
  return (await getAnswers())[questionId]
}

export async function saveAnswer(questionId: number, changes: AnswerChanges): Promise<Answer> {
  const answers = read<Record<number, Answer>>(ANSWERS_KEY, {})
  const current = answers[questionId] ?? { questionId, text: '', photos: [], updatedAt: '' }
  const answer: Answer = { ...current, ...changes, updatedAt: new Date().toISOString() }

  if (!write(ANSWERS_KEY, { ...answers, [questionId]: answer })) {
    throw new Error('Não foi possível salvar. O espaço do navegador pode ter acabado.')
  }

  return answer
}

// Perguntas marcadas para voltar depois (buscar uma foto, lembrar melhor). A mais recente vem primeiro
export async function getBookmarks(): Promise<number[]> {
  return read<number[]>(BOOKMARKS_KEY, [])
}

export async function setBookmark(questionId: number, marked: boolean): Promise<number[]> {
  const rest = read<number[]>(BOOKMARKS_KEY, []).filter(id => id !== questionId)
  const next = marked ? [questionId, ...rest] : rest

  write(BOOKMARKS_KEY, next)

  return next
}

export async function getBook(user: User): Promise<Book> {
  const [chapters, answers, collaborators, contributions] = await Promise.all([
    getChapters(user),
    getAnswers(),
    getCollaborators(),
    getContributions()
  ])
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

export async function getShares(): Promise<Share[]> {
  return read<Share[]>(SHARES_KEY, [])
}

export async function addShare({ name, email }: { name: string; email: string }): Promise<Share> {
  const share: Share = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    token: newToken(),
    createdAt: new Date().toISOString()
  }

  if (!write(SHARES_KEY, [...read<Share[]>(SHARES_KEY, []), share])) {
    throw new Error('Não foi possível salvar o convite.')
  }

  return share
}

export async function removeShare(id: string) {
  write(
    SHARES_KEY,
    read<Share[]>(SHARES_KEY, []).filter(share => share.id !== id)
  )
}

// Leitura por convidado. Simulado: só funciona no mesmo navegador de quem escreveu
export async function getSharedBook(token: string): Promise<{ book: Book; reader: Share } | null> {
  const reader = read<Share[]>(SHARES_KEY, []).find(share => share.token === token)
  const owner = await getCurrentUser()

  if (!reader || !owner) return null

  return { book: await getBook(owner), reader }
}

// Link de cada voz, para o QR code do livro impresso: um código por resposta, que não muda
// e não revela nada além daquele áudio
export async function getAudioLinks(questionIds: number[]): Promise<Record<number, string>> {
  const links = read<Record<number, string>>(AUDIO_LINKS_KEY, {})
  const missing = questionIds.filter(id => !links[id])

  if (missing.length) {
    missing.forEach(id => (links[id] = newToken()))
    write(AUDIO_LINKS_KEY, links)
  }

  return Object.fromEntries(questionIds.map(id => [id, links[id]]))
}

// Quem aponta a câmera para o QR code ouve a voz. Simulado: só funciona no mesmo navegador de quem escreveu
export async function getSharedAudio(
  token: string
): Promise<{ author: string; question: string; audio: AudioRecording } | null> {
  const entry = Object.entries(read<Record<number, string>>(AUDIO_LINKS_KEY, {})).find(([, link]) => link === token)
  const owner = await getCurrentUser()

  if (!entry || !owner) return null

  const questionId = Number(entry[0])
  const audio = (await getAnswer(questionId))?.audio
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
  return read<Collaborator[]>(COLLABORATORS_KEY, [])
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
  const collaborators = read<Collaborator[]>(COLLABORATORS_KEY, [])
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

  if (!write(COLLABORATORS_KEY, next)) throw new Error('Não foi possível salvar o convite.')

  return collaborator
}

// Tira o acesso a uma pergunta; a resposta já dada continua até você apagar
export async function removeCollaboratorFromQuestion(collaboratorId: string, questionId: number) {
  write(
    COLLABORATORS_KEY,
    read<Collaborator[]>(COLLABORATORS_KEY, []).map(collaborator =>
      collaborator.id === collaboratorId
        ? { ...collaborator, questionIds: collaborator.questionIds.filter(id => id !== questionId) }
        : collaborator
    )
  )
}

// Remove a pessoa de vez: o link deixa de funcionar e as respostas dela saem do livro
export async function removeCollaborator(collaboratorId: string) {
  write(
    COLLABORATORS_KEY,
    read<Collaborator[]>(COLLABORATORS_KEY, []).filter(collaborator => collaborator.id !== collaboratorId)
  )
  write(
    CONTRIBUTIONS_KEY,
    read<Contribution[]>(CONTRIBUTIONS_KEY, []).filter(item => item.collaboratorId !== collaboratorId)
  )
}

export async function getContributions(questionId?: number): Promise<Contribution[]> {
  const contributions = read<Contribution[]>(CONTRIBUTIONS_KEY, [])

  return questionId === undefined ? contributions : contributions.filter(item => item.questionId === questionId)
}

export async function setContributionApproval(contributionId: string, approved: boolean) {
  write(
    CONTRIBUTIONS_KEY,
    read<Contribution[]>(CONTRIBUTIONS_KEY, []).map(item => (item.id === contributionId ? { ...item, approved } : item))
  )
}

export async function deleteContribution(contributionId: string) {
  write(
    CONTRIBUTIONS_KEY,
    read<Contribution[]>(CONTRIBUTIONS_KEY, []).filter(item => item.id !== contributionId)
  )
}

// Visão do convidado: nunca inclui as respostas de quem convidou
export async function getCollaboratorView(token: string): Promise<CollaboratorView | null> {
  const collaborator = read<Collaborator[]>(COLLABORATORS_KEY, []).find(item => item.token === token)
  const owner = await getCurrentUser()

  if (!collaborator || !owner) return null

  const questions = allChapters
    .flatMap(chapter => chapter.questions)
    .filter(question => collaborator.questionIds.includes(question.id))

  const contributions = Object.fromEntries(
    read<Contribution[]>(CONTRIBUTIONS_KEY, [])
      .filter(item => item.collaboratorId === collaborator.id)
      .map(item => [item.questionId, item])
  )

  return { collaborator, ownerName: owner.name, questions, contributions }
}

export async function saveContribution(token: string, questionId: number, text: string): Promise<Contribution> {
  const collaborator = read<Collaborator[]>(COLLABORATORS_KEY, []).find(item => item.token === token)

  if (!collaborator || !collaborator.questionIds.includes(questionId)) {
    throw new Error('Você não tem mais acesso a esta pergunta.')
  }

  const contributions = read<Contribution[]>(CONTRIBUTIONS_KEY, [])
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

  if (!write(CONTRIBUTIONS_KEY, next)) throw new Error('Não foi possível salvar.')

  return contribution
}

// Cópia de tudo o que a pessoa tem no app, para baixar antes de excluir a conta
export async function exportMyData() {
  return {
    exportedAt: new Date().toISOString(),
    user: read<User | null>(USER_KEY, null),
    answers: read<Record<number, Answer>>(ANSWERS_KEY, {}),
    bookmarks: read<number[]>(BOOKMARKS_KEY, []),
    collaborators: read<Collaborator[]>(COLLABORATORS_KEY, []),
    contributions: read<Contribution[]>(CONTRIBUTIONS_KEY, []),
    readers: read<Share[]>(SHARES_KEY, [])
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
