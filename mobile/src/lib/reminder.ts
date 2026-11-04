// Dia e horário da pergunta da semana, como no site (src/components/app/pergunta-da-semana.tsx)
import type { EmailReminder } from '@lvh/types'

export const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

// De meia em meia hora, das 6h às 22h
export const TIMES = Array.from({ length: 33 }, (_, index) => {
  const minutes = 6 * 60 + index * 30

  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

export const DEFAULT_REMINDER: EmailReminder = { enabled: false, day: 0, time: '09:00' }

// 09:00 vira 9h; 09:30 vira 9h30
export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')

  return `${Number(hours)}h${minutes === '00' ? '' : minutes}`
}

// Domingo e sábado pedem "todo"; os outros dias, "toda"
export const everyDay = (day: number) => `${day === 0 || day === 6 ? 'Todo' : 'Toda'} ${WEEKDAYS[day]}`

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
