// Escolha do dia ou do horário da pergunta da semana: lista com ✓, como "Repetir" no Despertador. Salva ao tocar
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet } from 'react-native'

import { ListRow, ListSection } from '@/components/list'
import { capitalize, DEFAULT_REMINDER, formatTime, TIMES, WEEKDAYS } from '@/lib/reminder'
import { useSession } from '@/lib/session'

export default function Lembrete() {
  const { campo } = useLocalSearchParams<{ campo: 'dia' | 'horario' }>()
  const { user, updateUser } = useSession()

  if (!user) return null

  const reminder = user.emailReminder ?? DEFAULT_REMINDER
  const choose = async (changes: Partial<typeof reminder>) => {
    await updateUser({ emailReminder: { ...reminder, ...changes } })
    router.back()
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: campo === 'dia' ? 'Dia' : 'Horário' }} />
      <ListSection>
        {campo === 'dia'
          ? WEEKDAYS.map((weekday, day) => (
              <ListRow
                key={weekday}
                label={capitalize(weekday)}
                checked={reminder.day === day}
                onPress={() => choose({ day })}
              />
            ))
          : TIMES.map(time => (
              <ListRow
                key={time}
                label={formatTime(time)}
                checked={reminder.time === time}
                onPress={() => choose({ time })}
              />
            ))}
      </ListSection>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 }
})
