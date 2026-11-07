export type Question = {
  id: number
  text: string
  // Perguntas só para um perfil (ex.: 'Pai'); sem perfil valem para todos
  profile?: string
  // Pergunta sobre a relação com quem vai receber o livro ("quando eu nasci"). Ao aproveitar
  // respostas de outro livro, estas ficam em branco
  aboutRecipient?: boolean
}

// Papel de quem escreve. É de cada livro: a avó é mãe no livro do filho e avó no livro do neto
export type Role = 'Mãe' | 'Pai' | 'Avó' | 'Avô'

export type RecipientGender = 'menino' | 'menina'

export type PlanId = 'essencial' | 'completo'

// Um livro é sempre de uma pessoa para outra: de Moreno, o pai, para o Tom
export type UserBook = {
  id: string
  role: Role
  recipientName: string
  recipientGender: RecipientGender
  // Só nos livros de avós: quem recebe é filho ou filha do seu filho ou da sua filha
  childOf?: 'filho' | 'filha'
  bookName?: string
  dedication?: string
  coverColor?: CoverColor
  coverPhoto?: string
  createdAt: string
  // Em andamento ocupa uma vaga da assinatura. Concluído fica pronto, online e sem custo
  status?: BookStatus
  concludedAt?: string
}

export type BookStatus = 'em-andamento' | 'concluido'

export type NewBookInput = Pick<UserBook, 'role' | 'recipientName' | 'recipientGender' | 'childOf'> & {
  // Livro de onde copiar as respostas que não são sobre quem recebe
  copyFrom?: string
}

export type UserBookChanges = Partial<
  Pick<
    UserBook,
    | 'role'
    | 'recipientName'
    | 'recipientGender'
    | 'childOf'
    | 'bookName'
    | 'dedication'
    | 'coverColor'
    | 'coverPhoto'
    | 'status'
    | 'concludedAt'
  >
>

// Cobrança mensal: o plano dá uma vaga de livro em andamento; cada vaga a mais soma um valor menor.
// Livros concluídos não ocupam vaga
export type Billing = {
  plan: PlanId
  base: number
  extraSlots: number
  extraPrice: number
  total: number
  slots: number
  inProgress: number
}

export type Chapter = {
  id: string
  title: string
  questions: Question[]
}

export type User = {
  name: string
  email: string
  // Livro aberto agora. Os campos abaixo, até coverPhoto, vêm dele: getCurrentUser os preenche
  // a partir do livro ativo e updateUser os grava de volta nele
  activeBookId?: string
  activeBook?: UserBook
  profile?: string
  bookName?: string
  dedication?: string
  // Tem pelo menos um livro criado
  onboarded?: boolean
  plan?: PlanId
  // Vagas pagas além da que vem no plano, para escrever mais de um livro ao mesmo tempo
  extraSlots?: number
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
    | 'plan'
    | 'extraSlots'
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
