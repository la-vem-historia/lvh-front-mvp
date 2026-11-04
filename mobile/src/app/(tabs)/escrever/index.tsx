// Escrever: a mesa de escrita. Abre na próxima pergunta sem resposta e segue dali com Anterior e Próxima
import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/button'
import { QuestionEditor } from '@/components/question-editor'
import { type } from '@/lib/theme'
import { useNextQuestion } from '@/lib/use-next-question'

export default function Escrever() {
  const next = useNextQuestion()
  // Depois de Anterior ou Próxima, fica na pergunta escolhida; antes disso, acompanha a próxima sem resposta
  const [questionId, setQuestionId] = useState<number>()
  const current = questionId ?? next?.question.id

  if (next === undefined && questionId === undefined) return null

  if (!current) {
    return (
      <View style={styles.done}>
        <Text style={type.pageTitle}>Todas as perguntas respondidas.</Text>
        <Text style={type.bodyMuted}>A sua história está completa. Releia e ajuste o que quiser pelo Início.</Text>
        <Button title='Ver o livro' onPress={() => router.navigate('/livro')} />
      </View>
    )
  }

  return <QuestionEditor key={current} questionId={current} onGo={setQuestionId} onClose={() => router.navigate('/')} />
}

const styles = StyleSheet.create({
  done: { flex: 1, paddingHorizontal: 16, paddingTop: 32, gap: 16 }
})
