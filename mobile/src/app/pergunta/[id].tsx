// Pergunta aberta pela lista de capítulos: sobe em tela cheia por cima das abas e fecha pela seta no topo
import { router, useLocalSearchParams } from 'expo-router'

import { QuestionEditor } from '@/components/question-editor'

export default function PerguntaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <QuestionEditor
      key={id}
      questionId={Number(id)}
      onGo={next => router.setParams({ id: String(next) })}
      onClose={() => router.back()}
    />
  )
}
