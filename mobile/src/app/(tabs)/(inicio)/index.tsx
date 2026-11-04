// Início: o painel do site (src/components/app/painel.tsx) sob o título grande nativo "Minha história"
import { router, useFocusEffect } from 'expo-router'
import { Bookmark, ChevronDown, CircleCheck, Image as ImageIcon, Mic, UserPlus } from 'lucide-react-native'
import { useCallback, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getAnswers, getBookmarks, getChapters, getCollaborators, isAnswered } from '@lvh/api'
import type { Answer, Chapter, Question } from '@lvh/types'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { PrimeirosPassos } from '@/components/primeiros-passos'
import { useSession } from '@/lib/session'
import { colors, fonts, type } from '@/lib/theme'

// Linha que abre e fecha, no lugar do Collapsible do site
function Collapsible({
  leading,
  title,
  count,
  defaultOpen = false,
  children
}: {
  leading: ReactNode
  title: string
  count: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <View style={styles.collapsible}>
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={styles.leading}>{leading}</View>
        <Text style={styles.chapterTitle}>{title}</Text>
        <Text style={styles.count}>{count}</Text>
        <ChevronDown size={16} color={colors.text} style={open ? styles.chevronOpen : undefined} />
      </Pressable>
      {open ? <View style={styles.panel}>{children}</View> : null}
    </View>
  )
}

export default function Painel() {
  const { user } = useSession()
  const [chapters, setChapters] = useState<Chapter[] | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [hideAnswered, setHideAnswered] = useState(false)
  // Perguntas com convidado, para o ícone de convite na lista
  const [invitedQuestions, setInvitedQuestions] = useState<Set<number>>(new Set())
  const [bookmarks, setBookmarks] = useState<number[]>([])

  // Recarrega ao voltar da tela de resposta
  useFocusEffect(
    useCallback(() => {
      if (!user) return

      Promise.all([getChapters(user), getAnswers(), getCollaborators(), getBookmarks()]).then(
        ([nextChapters, nextAnswers, collaborators, nextBookmarks]) => {
          setChapters(nextChapters)
          setAnswers(nextAnswers)
          setBookmarks(nextBookmarks)
          setInvitedQuestions(new Set(collaborators.flatMap(collaborator => collaborator.questionIds)))
        }
      )
    }, [user])
  )

  if (!user || !chapters) return null

  const questions = chapters.flatMap(chapter => chapter.questions)
  const answered = questions.filter(question => isAnswered(answers[question.id])).length
  const progress = Math.round((answered / questions.length) * 100)
  const next = questions.find(question => !isAnswered(answers[question.id]))
  // Marcadas para depois, com o capítulo de cada uma; some quem saiu do roteiro ao trocar de perfil
  const marked = bookmarks.flatMap(id => {
    const chapter = chapters.find(item => item.questions.some(question => question.id === id))
    const question = chapter?.questions.find(item => item.id === id)

    return chapter && question ? [{ chapter, question }] : []
  })
  // Quem ainda não respondeu nada vê todos os capítulos fechados; depois, abre o capítulo em andamento
  const openChapter = answered
    ? chapters.find(chapter => chapter.questions.some(question => !isAnswered(answers[question.id])))?.id
    : undefined

  const open = (question: Question) => router.push({ pathname: '/pergunta/[id]', params: { id: question.id } })

  // Linha de pergunta, igual nos capítulos e nas marcadas; nas marcadas, diz de que capítulo ela vem
  const renderQuestion = (question: Question, index: number, chapterTitle?: string) => {
    const answer = answers[question.id]
    const isDone = isAnswered(answer)
    const extras = [
      bookmarks.includes(question.id) ? <Bookmark key='m' size={14} color={colors.poppy} fill={colors.poppy} /> : null,
      answer?.photos.length ? <ImageIcon key='f' size={14} strokeWidth={1.75} color={colors.muted} /> : null,
      answer?.audio ? <Mic key='v' size={14} strokeWidth={1.75} color={colors.muted} /> : null,
      invitedQuestions.has(question.id) ? <UserPlus key='c' size={14} strokeWidth={1.75} color={colors.muted} /> : null
    ].filter(Boolean)

    return (
      <Pressable
        key={question.id}
        accessibilityRole='link'
        onPress={() => open(question)}
        style={({ pressed }) => [styles.question, index > 0 && styles.questionBorder, pressed && styles.pressed]}
      >
        <View style={styles.questionText}>
          <Text style={[type.body, isDone && styles.done]}>{question.text}</Text>
          {chapterTitle ? <Text style={type.xsMuted}>{chapterTitle}</Text> : null}
        </View>
        <View style={styles.status}>
          {extras.length ? <View style={styles.extras}>{extras}</View> : null}
          <Text style={type.xsMuted}>{isDone ? 'Respondida' : 'Responder'}</Text>
          {/* Check sólido: círculo preenchido com o traço na cor do fundo */}
          <CircleCheck size={16} color={colors.cream} fill={colors.text} style={!isDone && styles.invisible} />
        </View>
      </Pressable>
    )
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      <View style={styles.intro}>
        <View style={styles.greeting}>
          <Text style={type.headingXl}>Olá, {user.name}.</Text>
          <Text style={type.bodyMuted}>
            Responda no seu tempo, na ordem que quiser. Cada resposta vira um trecho do seu livro.
          </Text>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>
              {answered} de {questions.length} perguntas respondidas
            </Text>
            <Text style={type.smallMuted}>{progress}%</Text>
          </View>
          <View
            accessibilityRole='progressbar'
            accessibilityLabel='Progresso da sua história'
            accessibilityValue={{ min: 0, max: 100, now: progress }}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
        </View>

        {next ? (
          <Button
            title={answered ? 'Continuar de onde parei' : 'Responder a primeira pergunta'}
            onPress={() => open(next)}
          />
        ) : null}
      </View>

      <PrimeirosPassos answers={answers} nextQuestionId={next?.id} />

      {/* Marcadas: mesmo visual de um capítulo, mas fora da lista deles. Começa sempre fechada */}
      <View style={styles.markedBox}>
        <Collapsible
          leading={<Bookmark size={16} color={colors.poppy} fill={colors.poppy} />}
          title='Marcadas'
          count={String(marked.length)}
        >
          {marked.map(({ chapter, question }, index) => renderQuestion(question, index, chapter.title))}
          {marked.length === 0 ? (
            <Text style={[type.smallMuted, styles.empty]}>
              Nenhuma pergunta marcada. Toque no marcador em uma pergunta para guardá-la aqui e voltar quando tiver a
              foto ou a lembrança.
            </Text>
          ) : null}
        </Collapsible>
      </View>

      <View>
        <View style={styles.chaptersHeader}>
          <Text style={type.eyebrow}>Capítulos</Text>
          <Checkbox checked={hideAnswered} onChange={setHideAnswered} label='Ocultar respondidas' />
        </View>

        {chapters.map((chapter, index) => {
          const done = chapter.questions.filter(question => isAnswered(answers[question.id])).length
          const visible = chapter.questions.filter(question => !hideAnswered || !isAnswered(answers[question.id]))

          return (
            <Collapsible
              key={chapter.id}
              defaultOpen={chapter.id === openChapter}
              leading={<Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>}
              title={chapter.title}
              count={`${done}/${chapter.questions.length}`}
            >
              {visible.map((question, position) => renderQuestion(question, position))}
              {visible.length === 0 ? (
                <Text style={[type.smallMuted, styles.empty]}>Todas as perguntas respondidas.</Text>
              ) : null}
            </Collapsible>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 48 },
  intro: { gap: 32 },
  greeting: { gap: 8 },
  progressBlock: { gap: 12 },
  progressText: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  progressLabel: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.text },
  track: { height: 2, backgroundColor: colors.border },
  fill: { height: '100%', backgroundColor: colors.text },
  markedBox: { borderBottomWidth: 1, borderBottomColor: colors.text },
  collapsible: { borderTopWidth: 1, borderTopColor: colors.text },
  // grid-cols-[2.5rem_1fr_auto_1rem] gap-4 py-5
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20, borderRadius: 14 },
  pressed: { backgroundColor: colors.sand },
  leading: { width: 40 },
  number: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.clay },
  chapterTitle: { ...type.headingXl, flex: 1 },
  count: { ...type.smallMuted, fontVariant: ['tabular-nums'] },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  panel: { paddingBottom: 24 },
  question: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    borderRadius: 14
  },
  questionBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  questionText: { flex: 1, gap: 2 },
  done: { color: colors.muted },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  extras: { flexDirection: 'row', gap: 6, marginRight: 4 },
  invisible: { opacity: 0 },
  empty: { paddingVertical: 12 },
  chaptersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }
})
