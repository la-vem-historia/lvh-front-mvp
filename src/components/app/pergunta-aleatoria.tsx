'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useUser } from '@/components/app/session'

import { getRandomQuestion } from '@/lib/lvh/api'

// Link do e-mail semanal: sorteia uma pergunta ainda sem resposta e abre ela. Sem nenhuma, volta para a home
const PerguntaAleatoria = () => {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    getRandomQuestion(user).then(question => router.replace(question ? `/app/pergunta/${question.id}` : '/app'))
  }, [user, router])

  return <p className='text-muted-foreground px-4 py-16 text-center text-sm'>Escolhendo uma pergunta para você…</p>
}

export default PerguntaAleatoria
