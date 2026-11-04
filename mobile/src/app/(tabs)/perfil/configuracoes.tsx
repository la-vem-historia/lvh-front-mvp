// Configurações, abertas pela engrenagem do Perfil, com tudo o que o site tem (src/components/app/configuracoes.tsx)
// em lista agrupada: o que no site é formulário aqui abre uma tela própria, e confirmações viram alertas do sistema
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Switch } from 'react-native'

import { getCollaborators, getContributions, getShares, removeShare } from '@lvh/api'
import type { Collaborator, Contribution, Share } from '@lvh/types'

import { ListRow, ListSection } from '@/components/list'
import { confirm } from '@/lib/confirm'
import { capitalize, DEFAULT_REMINDER, everyDay, formatTime, WEEKDAYS } from '@/lib/reminder'
import { useSession } from '@/lib/session'
import { colors } from '@/lib/theme'

export default function Configuracoes() {
  const { user, updateUser } = useSession()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [shares, setShares] = useState<Share[]>([])

  // Recarrega ao voltar de um colaborador ou de um convite de leitor
  const load = useCallback(() => {
    Promise.all([getCollaborators(), getContributions(), getShares()]).then(
      ([nextCollaborators, nextContributions, nextShares]) => {
        setCollaborators(nextCollaborators)
        setContributions(nextContributions)
        setShares(nextShares)
      }
    )
  }, [])

  useFocusEffect(load)

  if (!user) return null

  const reminder = user.emailReminder ?? DEFAULT_REMINDER
  const changeReminder = (enabled: boolean) => void updateUser({ emailReminder: { ...reminder, enabled } })

  const revoke = (share: Share) =>
    confirm(`Remover o acesso de ${share.name}?`, 'O link pessoal deixa de abrir o seu livro.', 'Remover acesso', () =>
      removeShare(share.id).then(load)
    )

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      <ListSection
        title='Pergunta da semana'
        footer={
          reminder.enabled
            ? `${everyDay(reminder.day)}, às ${formatTime(reminder.time)}, em ${user.email}. No e-mail, você escolhe responder a próxima pergunta do livro ou uma pergunta aleatória.`
            : 'Um e-mail com a próxima pergunta do seu livro, no dia e no horário que combinam com a sua rotina.'
        }
      >
        <ListRow
          label='Receber por e-mail'
          trailing={
            <Switch
              accessibilityLabel='Receber a pergunta da semana por e-mail'
              value={reminder.enabled}
              onValueChange={changeReminder}
              trackColor={{ true: colors.moss, false: colors.stone }}
            />
          }
        />
        {reminder.enabled ? (
          <ListRow
            label='Dia'
            value={capitalize(WEEKDAYS[reminder.day])}
            chevron
            onPress={() => router.push({ pathname: '/perfil/lembrete', params: { campo: 'dia' } })}
          />
        ) : null}
        {reminder.enabled ? (
          <ListRow
            label='Horário'
            value={formatTime(reminder.time)}
            chevron
            onPress={() => router.push({ pathname: '/perfil/lembrete', params: { campo: 'horario' } })}
          />
        ) : null}
        {reminder.enabled ? (
          <ListRow label='Ver como o e-mail chega' chevron onPress={() => router.push('/perfil/exemplo-email')} />
        ) : null}
      </ListSection>

      <ListSection
        title='Colaboradores'
        footer={
          collaborators.length
            ? 'Pessoas que respondem perguntas junto com você. Cada uma vê só as perguntas liberadas e nunca as suas respostas.'
            : 'Ninguém foi convidado ainda. Abra uma pergunta e use “Convidar alguém para responder”, no site.'
        }
      >
        {collaborators.length ? (
          collaborators.map(collaborator => {
            const answered = contributions.filter(
              item => item.collaboratorId === collaborator.id && item.text.trim()
            ).length

            return (
              <ListRow
                key={collaborator.id}
                label={collaborator.name}
                detail={`${answered} de ${collaborator.questionIds.length} respondidas`}
                chevron
                onPress={() => router.push({ pathname: '/perfil/colaborador/[id]', params: { id: collaborator.id } })}
              />
            )
          })
        ) : (
          <ListRow label='Nenhum colaborador' detail='Quem você convidar aparece aqui' />
        )}
      </ListSection>

      <ListSection title='Leitores do livro' footer='Quem pode ler o seu livro fechado, pelo link pessoal.'>
        {shares.map(share => (
          <ListRow key={share.id} label={share.name} detail={share.email} onPress={() => revoke(share)} />
        ))}
        <ListRow label='Convidar leitor' chevron onPress={() => router.push('/perfil/convidar-leitor')} />
      </ListSection>

      <ListSection title='Primeiros passos' footer='O guia do Início com os primeiros marcos da sua história.'>
        <ListRow
          label='Mostrar no Início'
          trailing={
            <Switch
              accessibilityLabel='Mostrar primeiros passos no Início'
              value={!user.checklistHidden}
              onValueChange={show => void updateUser({ checklistHidden: !show })}
              trackColor={{ true: colors.moss, false: colors.stone }}
            />
          }
        />
      </ListSection>

      <ListSection footer='Apaga a sua conta, o seu livro e tudo o que você e os seus convidados escreveram. Não dá para desfazer.'>
        <ListRow label='Excluir conta' destructive chevron onPress={() => router.push('/perfil/excluir-conta')} />
      </ListSection>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 32 }
})
