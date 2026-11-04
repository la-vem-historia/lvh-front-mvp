// Folha dos capítulos, aberta pelo botão de lista no cabeçalho da escrita: sobe de baixo (page sheet no iOS,
// arrastar para baixo fecha). Como no painel do site, as Marcadas vêm antes dos capítulos, sempre fechadas;
// o capítulo da pergunta atual já vem aberto
import { Bookmark, Check, ChevronDown, X } from 'lucide-react-native'
import { useEffect, useState, type ReactNode } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getAnswers, getBookmarks, getChapters, isAnswered } from '@lvh/api'
import type { Answer, Chapter, Question } from '@lvh/types'

import { useSession } from '@/lib/session'
import { colors, fonts, type } from '@/lib/theme'

const MARKED = 'marcadas'

// Grupo que abre e fecha, no lugar do Collapsible do site
function Group({
  leading,
  title,
  count,
  open,
  onToggle,
  style,
  children
}: {
  leading: ReactNode
  title: string
  count: string
  open: boolean
  onToggle: () => void
  style?: object
  children: ReactNode
}) {
  return (
    <View style={[styles.chapter, style]}>
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={({ pressed }) => [styles.chapterRow, pressed && styles.pressed]}
      >
        <View style={styles.leading}>{leading}</View>
        <Text style={styles.chapterTitle}>{title}</Text>
        <Text style={styles.count}>{count}</Text>
        <ChevronDown size={16} color={colors.text} style={open ? styles.chevronOpen : undefined} />
      </Pressable>
      {open ? children : null}
    </View>
  )
}

type Props = {
  visible: boolean
  currentId: number
  onClose: () => void
  onSelect: (id: number) => void
}

export function ChaptersSheet({ visible, currentId, onClose, onSelect }: Props) {
  const { user } = useSession()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [bookmarks, setBookmarks] = useState<number[]>([])
  // Grupo aberto: o id de um capítulo, ou MARKED para as marcadas
  const [open, setOpen] = useState<string | null>(null)

  // Recarrega a cada abertura: respostas salvas desde a última vez aparecem marcadas
  useEffect(() => {
    if (!visible || !user) return

    Promise.all([getChapters(user), getAnswers(), getBookmarks()]).then(
      ([nextChapters, nextAnswers, nextBookmarks]) => {
        setChapters(nextChapters)
        setAnswers(nextAnswers)
        setBookmarks(nextBookmarks)
        setOpen(nextChapters.find(chapter => chapter.questions.some(question => question.id === currentId))?.id ?? null)
      }
    )
  }, [visible, user, currentId])

  const toggle = (id: string) => setOpen(open === id ? null : id)

  // Marcadas para depois, com o capítulo de cada uma; some quem saiu do roteiro ao trocar de perfil
  const marked = bookmarks.flatMap(id => {
    const chapter = chapters.find(item => item.questions.some(question => question.id === id))
    const question = chapter?.questions.find(item => item.id === id)

    return chapter && question ? [{ chapter, question }] : []
  })

  // Linha de pergunta, igual nas marcadas e nos capítulos; nas marcadas, diz de que capítulo ela vem
  const renderQuestion = (question: Question, chapterTitle?: string) => {
    const isCurrent = question.id === currentId
    const isDone = isAnswered(answers[question.id])

    return (
      <Pressable
        key={question.id}
        accessibilityRole='button'
        accessibilityState={{ selected: isCurrent }}
        onPress={() => onSelect(question.id)}
        style={({ pressed }) => [styles.question, isCurrent && styles.current, pressed && styles.pressed]}
      >
        <View style={[styles.mark, isDone && styles.markDone]}>
          {isDone ? <Check size={11} color={colors.cream} /> : null}
        </View>
        <View style={styles.questionText}>
          <Text style={[type.body, isDone && !isCurrent && styles.muted]}>{question.text}</Text>
          {chapterTitle ? <Text style={type.xsMuted}>{chapterTitle}</Text> : null}
        </View>
      </Pressable>
    )
  }

  return (
    <Modal visible={visible} animationType='slide' presentationStyle='pageSheet' onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text accessibilityRole='header' style={styles.title}>
            Capítulos
          </Text>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Fechar'
            hitSlop={8}
            onPress={onClose}
            style={styles.close}
          >
            <X size={18} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          <Group
            leading={<Bookmark size={16} color={colors.poppy} fill={colors.poppy} />}
            title='Marcadas'
            count={String(marked.length)}
            open={open === MARKED}
            onToggle={() => toggle(MARKED)}
            style={styles.markedGroup}
          >
            {marked.map(({ chapter, question }) => renderQuestion(question, chapter.title))}
            {marked.length === 0 ? (
              <Text style={[type.smallMuted, styles.empty]}>
                Nenhuma pergunta marcada. Toque no marcador em uma pergunta para guardá-la aqui e voltar quando tiver a
                foto ou a lembrança.
              </Text>
            ) : null}
          </Group>

          <Text style={[type.eyebrow, styles.chaptersLabel]}>Capítulos</Text>
          {chapters.map((chapter, index) => (
            <Group
              key={chapter.id}
              leading={<Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>}
              title={chapter.title}
              count={`${chapter.questions.filter(question => isAnswered(answers[question.id])).length}/${chapter.questions.length}`}
              open={open === chapter.id}
              onToggle={() => toggle(chapter.id)}
            >
              {chapter.questions.map(question => renderQuestion(question))}
            </Group>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12
  },
  title: { fontFamily: fonts.headingSemibold, fontSize: 24, lineHeight: 30, color: colors.ink },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center'
  },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  chapter: { borderTopWidth: 1, borderTopColor: colors.text, paddingBottom: 4 },
  chapterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderRadius: 12 },
  pressed: { backgroundColor: colors.sand },
  leading: { width: 24 },
  number: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.clay },
  // Marcadas fecham com fio embaixo, separadas da lista de capítulos
  markedGroup: { borderBottomWidth: 1, borderBottomColor: colors.text, marginBottom: 32 },
  chaptersLabel: { paddingBottom: 16 },
  empty: { paddingVertical: 12, marginLeft: 36 },
  chapterTitle: { ...type.headingXl, flex: 1 },
  count: { ...type.smallMuted, fontVariant: ['tabular-nums'] },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  question: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginLeft: 28,
    borderRadius: 12
  },
  current: { backgroundColor: colors.sand },
  mark: {
    width: 18,
    height: 18,
    marginTop: 3,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markDone: { backgroundColor: colors.moss, borderColor: colors.moss },
  questionText: { flex: 1, gap: 2 },
  muted: { color: colors.muted }
})
