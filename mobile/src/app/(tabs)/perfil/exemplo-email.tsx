// Como o e-mail da pergunta da semana chega (EmailPreview do site): cabeçalho do e-mail e o corpo com a pergunta
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { getNextQuestion } from '@lvh/api'
import type { Question } from '@lvh/types'

import { Button } from '@/components/button'
import { DEFAULT_REMINDER, everyDay, formatTime } from '@/lib/reminder'
import { useSession } from '@/lib/session'
import { colors, fonts, radius, type } from '@/lib/theme'

export default function ExemploEmail() {
  const { user } = useSession()
  const [question, setQuestion] = useState<Question | null>()

  useEffect(() => {
    if (user) getNextQuestion(user).then(next => setQuestion(next ?? null))
  }, [user])

  if (!user || question === undefined) return null

  const reminder = user.emailReminder ?? DEFAULT_REMINDER
  const fields = [
    ['De', 'Lá Vem História'],
    ['Para', user.email],
    ['Assunto', 'A pergunta da semana chegou']
  ]

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      <View style={styles.email}>
        <View style={styles.headers}>
          {fields.map(([label, value]) => (
            <View key={label} style={styles.field}>
              <Text style={[type.xsMuted, styles.fieldLabel]}>{label}</Text>
              <Text style={[styles.fieldValue, label === 'Assunto' && styles.subject]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.body}>
          {question ? (
            <>
              <Text style={type.body}>Oi, {user.name.split(' ')[0]}. A pergunta desta semana é:</Text>
              <Text style={type.heading2xl}>{question.text}</Text>
              <View style={styles.actions}>
                <Button
                  title='Responder esta pergunta'
                  onPress={() => router.push({ pathname: '/pergunta/[id]', params: { id: question.id } })}
                />
              </View>
            </>
          ) : (
            <Text style={type.body}>Você respondeu todas as perguntas. Que tal reler o seu livro?</Text>
          )}
          <Text style={[type.xsMuted, styles.footer]}>
            Você recebe este e-mail {everyDay(reminder.day).toLowerCase()}, às {formatTime(reminder.time)}.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 },
  email: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden' },
  headers: { backgroundColor: colors.sand, paddingHorizontal: 20, paddingVertical: 14, gap: 4 },
  field: { flexDirection: 'row', gap: 12 },
  fieldLabel: { width: 56 },
  fieldValue: { flex: 1, fontFamily: fonts.sans, fontSize: 12, color: colors.text },
  subject: { fontFamily: fonts.sansMedium },
  body: { backgroundColor: colors.cream, padding: 20, gap: 20 },
  actions: { alignItems: 'flex-start' },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }
})
