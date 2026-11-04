// Próxima pergunta sem resposta, para a aba Escrever: undefined enquanto carrega, null quando tudo foi respondido.
// Recalcula a cada troca de tela, que é quando uma resposta pode ter sido salva
import { usePathname } from 'expo-router'
import { useEffect, useState } from 'react'

import { getAnswers, getChapters, isAnswered } from '@lvh/api'
import type { Chapter, Question } from '@lvh/types'

import { useSession } from '@/lib/session'

export type NextQuestion = { question: Question; chapter: Chapter; started: boolean }

export function useNextQuestion() {
  const { user } = useSession()
  const pathname = usePathname()
  const [next, setNext] = useState<NextQuestion | null>()

  useEffect(() => {
    if (!user) return

    let active = true

    Promise.all([getChapters(user), getAnswers()]).then(([chapters, answers]) => {
      if (!active) return

      const chapter = chapters.find(item => item.questions.some(question => !isAnswered(answers[question.id])))
      const question = chapter?.questions.find(item => !isAnswered(answers[item.id]))

      setNext(
        chapter && question
          ? { chapter, question, started: Object.values(answers).some(answer => isAnswered(answer)) }
          : null
      )
    })

    return () => {
      active = false
    }
  }, [user, pathname])

  return next
}
