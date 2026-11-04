export type Question = {
  id: number
  text: string
  // Perguntas só para um perfil (ex.: 'Pai'); sem perfil valem para todos
  profile?: string
}

export type Chapter = {
  id: string
  title: string
  questions: Question[]
}

export type User = {
  name: string
  email: string
  // Preenchidos no onboarding
  profile?: string
  bookName?: string
  dedication?: string
  onboarded?: boolean
  // A pessoa fechou o card de primeiros passos da home
  checklistHidden?: boolean
  // Foto de perfil: enviada pela pessoa ou, no futuro, vinda da conta Google
  avatar?: string
  coverColor?: CoverColor
  coverPhoto?: string
  // Contas sociais ligadas a este login (Google, Apple, Facebook)
  providers?: LoginProvider[]
  // E-mail semanal com a próxima pergunta
  emailReminder?: EmailReminder
}

// Dia da semana (0 = domingo) e horário (HH:MM) em que a pergunta da semana chega por e-mail
export type EmailReminder = { enabled: boolean; day: number; time: string }

export type LoginProvider = 'google' | 'apple' | 'facebook'

export type CoverColor = 'verde' | 'terracota' | 'marinho' | 'areia'

export type UserChanges = Partial<
  Pick<
    User,
    | 'name'
    | 'profile'
    | 'bookName'
    | 'dedication'
    | 'onboarded'
    | 'checklistHidden'
    | 'avatar'
    | 'coverColor'
    | 'coverPhoto'
    | 'providers'
    | 'emailReminder'
  >
>

export type AudioRecording = {
  // data URL enquanto não há backend; vira URL de arquivo depois
  url: string
  seconds: number
}

export type Answer = {
  questionId: number
  text: string
  photos: string[]
  // Legenda opcional de cada foto, na mesma ordem de photos
  photoCaptions?: string[]
  audio?: AudioRecording
  updatedAt: string
}

export type AnswerChanges = Partial<Pick<Answer, 'text' | 'photos' | 'photoCaptions' | 'audio'>>

// Pergunta com a posição dela no capítulo e as vizinhas, para a tela de escrita
export type QuestionContext = {
  question: Question
  chapter: Chapter
  chapterIndex: number
  position: number
  previous?: Question
  next?: Question
  nextChapter?: Chapter
}

export type BookEntry = {
  question: Question
  answer?: Answer
  contributions: { name: string; text: string }[]
}

export type BookChapter = {
  id: string
  number: number
  title: string
  entries: BookEntry[]
}

// O livro é montado só com as perguntas respondidas
export type Book = {
  author: string
  dedication?: string
  coverColor: CoverColor
  coverPhoto?: string
  year: number
  // Quem teve lembranças aprovadas no livro, para o colofão
  contributors: string[]
  chapters: BookChapter[]
}

// Pessoa com acesso ao livro fechado; o link pessoal deixa de valer ao remover
export type Share = {
  id: string
  name: string
  email: string
  token: string
  createdAt: string
}

// Pedido de aviso para um papel que ainda não existe; serve para medir o que lançar primeiro
export type RoleRequest = {
  role: string
  email: string
  createdAt: string
}

// Pessoa convidada para responder perguntas junto. Um link por pessoa, que dá acesso
// só às perguntas liberadas para ela, e nunca às respostas de quem convidou
export type Collaborator = {
  id: string
  name: string
  email: string
  token: string
  questionIds: number[]
  // Última mensagem enviada com o convite; aparece no topo da página do convidado
  message?: string
  createdAt: string
}

export type Contribution = {
  id: string
  collaboratorId: string
  questionId: number
  text: string
  // Só entra no livro depois que o autor aprova; editar depois volta a pedir aprovação
  approved?: boolean
  updatedAt: string
}

// O que o convidado enxerga: as perguntas liberadas e as respostas dele, nada mais
export type CollaboratorView = {
  collaborator: Collaborator
  ownerName: string
  questions: Question[]
  contributions: Record<number, Contribution>
}
