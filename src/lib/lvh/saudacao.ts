// Saudação do painel: muda a cada vez que a pessoa entra, conforme a hora e o quanto já respondeu.
// O título é curto (cumprimento e nome); a frase vem logo abaixo
export type Saudacao = { title: string; line: string }

type Periodo = 'manha' | 'tarde' | 'noite'

// Fica a mesma enquanto a aba estiver aberta; numa nova visita, sorteia outra
const SAUDACAO_KEY = 'lvh:saudacao'

const periodoDe = (hour: number): Periodo => (hour >= 5 && hour < 12 ? 'manha' : hour >= 12 && hour < 18 ? 'tarde' : 'noite')

const CUMPRIMENTO: Record<Periodo, string> = { manha: 'Bom dia', tarde: 'Boa tarde', noite: 'Boa noite' }

// Quem ainda não respondeu nada recebe a explicação de como funciona, sem sorteio
const PRIMEIRA_VEZ = 'Responda no seu tempo, na ordem que quiser. Cada resposta vira um trecho do seu livro.'

// Sem adjetivo com gênero ("inspirado/inspirada"): não sabemos como a pessoa se identifica
const FRASES: { line: string; periodo?: Periodo }[] = [
  { line: 'Assim você vai acabar o livro em uma semana!' },
  { line: 'Sentindo a inspiração hoje?' },
  { line: 'Vamos falar sobre uma coisa boa hoje: você.' },
  { line: 'Que tal mais uma lembrança para o livro?' },
  { line: 'Uma pergunta por dia e, quando você perceber, o livro está pronto.' },
  { line: 'Já pegou o seu café para responder algumas perguntas sobre a sua vida?', periodo: 'manha' },
  { line: 'Fim de dia é uma boa hora para lembrar.', periodo: 'noite' }
]

const sortear = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

export const getSaudacao = (name: string, answered: number, now = new Date()): Saudacao => {
  const firstName = name.trim().split(/\s+/)[0] || name

  const periodo = periodoDe(now.getHours())

  // Antes da primeira resposta: cumprimento pela hora, sem "Oi de novo", e a explicação de como funciona
  if (!answered) return { title: `${CUMPRIMENTO[periodo]}, ${firstName}!`, line: PRIMEIRA_VEZ }

  try {
    const saved = sessionStorage.getItem(SAUDACAO_KEY)

    if (saved) return JSON.parse(saved) as Saudacao
  } catch {
    // Sem sessionStorage (aba privada, por exemplo): só sorteia de novo
  }

  const cumprimento = sortear([CUMPRIMENTO[periodo], 'Oi de novo'])
  const saudacao = {
    title: `${cumprimento}, ${firstName}!`,
    line: sortear(FRASES.filter(frase => !frase.periodo || frase.periodo === periodo)).line
  }

  try {
    sessionStorage.setItem(SAUDACAO_KEY, JSON.stringify(saudacao))
  } catch {
    // Sem onde guardar: a próxima tela sorteia outra, sem problema
  }

  return saudacao
}
