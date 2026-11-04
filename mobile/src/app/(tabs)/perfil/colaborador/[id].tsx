// Um colaborador: as perguntas liberadas para ele, com a situação de cada uma, e as ações do site
// (link, tirar acesso, remover). O link sai pela folha de compartilhar do sistema
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, Share, StyleSheet } from 'react-native'

import { getCollaborators, getContributions, removeCollaborator, removeCollaboratorFromQuestion } from '@lvh/api'
import { chapters as allChapters } from '@lvh/perguntas'
import type { Collaborator, Contribution } from '@lvh/types'

import { ListRow, ListSection } from '@/components/list'
import { confirm } from '@/lib/confirm'
import { collaboratorLink } from '@/lib/site'

const questionText = (id: number) =>
  allChapters.flatMap(chapter => chapter.questions).find(question => question.id === id)?.text ?? `Pergunta ${id}`

export default function ColaboradorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [collaborator, setCollaborator] = useState<Collaborator | null>()
  const [contributions, setContributions] = useState<Contribution[]>([])

  const load = useCallback(() => {
    Promise.all([getCollaborators(), getContributions()]).then(([collaborators, nextContributions]) => {
      setCollaborator(collaborators.find(item => item.id === id) ?? null)
      setContributions(nextContributions.filter(item => item.collaboratorId === id && item.text.trim()))
    })
  }, [id])

  useFocusEffect(load)

  if (!collaborator) return null

  const shareLink = () =>
    Share.share({
      message: `${collaborator.name}, responda algumas perguntas do meu livro: ${collaboratorLink(collaborator.token)}`
    })

  const removeQuestion = (questionId: number) =>
    confirm(
      'Tirar o acesso a esta pergunta?',
      `${collaborator.name} deixa de ver “${questionText(questionId)}”.`,
      'Tirar acesso',
      () => removeCollaboratorFromQuestion(collaborator.id, questionId).then(load)
    )

  const remove = () =>
    confirm(
      `Remover ${collaborator.name}?`,
      'A pessoa perde o acesso e as respostas dela saem do seu livro.',
      'Remover',
      () => removeCollaborator(collaborator.id).then(() => router.back())
    )

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: collaborator.name }} />

      <ListSection footer={collaborator.email}>
        <ListRow label='Compartilhar link do convite' chevron onPress={shareLink} />
      </ListSection>

      <ListSection
        title='Perguntas liberadas'
        footer={collaborator.questionIds.length ? 'Toque numa pergunta para tirar o acesso dela.' : undefined}
      >
        {collaborator.questionIds.length ? (
          collaborator.questionIds.map(questionId => {
            const contribution = contributions.find(item => item.questionId === questionId)

            return (
              <ListRow
                key={questionId}
                label={questionText(questionId)}
                detail={
                  contribution ? (contribution.approved ? 'No livro' : 'Aguardando aprovação') : 'Aguardando resposta'
                }
                onPress={() => removeQuestion(questionId)}
              />
            )
          })
        ) : (
          <ListRow label='Sem acesso a nenhuma pergunta no momento' />
        )}
      </ListSection>

      <ListSection footer='Remove a pessoa e as respostas dela.'>
        <ListRow label='Remover colaborador' destructive onPress={remove} />
      </ListSection>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 32 }
})
