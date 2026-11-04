// Primeiros passos do site (src/components/app/primeiros-passos.tsx) em formato de celular: uma faixa baixa
// com cartões pequenos que rolam para o lado, e um × que pergunta se esconde só agora ou de vez
import { router, type Href } from 'expo-router'
import { ArrowRight, Check, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getCollaborators, isAnswered } from '@lvh/api'
import type { Answer } from '@lvh/types'

import { useSession } from '@/lib/session'
import { colors, fonts, radius, type } from '@/lib/theme'

type Step = { id: string; title: string; done: boolean; href: Href; action: string }

// "Só por agora" esconde enquanto o app está aberto
let dismissedThisSession = false

export function PrimeirosPassos({
  answers,
  nextQuestionId
}: {
  answers: Record<number, Answer>
  nextQuestionId?: number
}) {
  const { user, updateUser } = useSession()
  const [hasCollaborator, setHasCollaborator] = useState<boolean | null>(null)
  const [dismissed, setDismissed] = useState(dismissedThisSession)

  useEffect(() => {
    getCollaborators().then(collaborators => setHasCollaborator(collaborators.length > 0))
  }, [])

  if (!user || user.checklistHidden || dismissed || hasCollaborator === null) return null

  const answered = Object.values(answers).filter(answer => isAnswered(answer))
  const question: Href = nextQuestionId ? `/pergunta/${nextQuestionId}` : '/'
  // Convite e voz acontecem na tela de uma pergunta: leva para a última respondida, ou para a próxima
  const lastAnswered = answered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const workingQuestion: Href = lastAnswered ? `/pergunta/${lastAnswered.questionId}` : question

  const steps: Step[] = [
    {
      id: 'responder',
      title: 'Responda à primeira pergunta',
      done: answered.length > 0,
      href: question,
      action: 'Responder'
    },
    {
      id: 'voz',
      title: 'Grave a sua voz',
      done: answered.some(answer => answer.audio),
      href: workingQuestion,
      action: 'Gravar'
    },
    {
      id: 'convidar',
      title: 'Convide alguém',
      done: hasCollaborator,
      href: workingQuestion,
      action: 'Convidar'
    },
    {
      id: 'lembretes',
      title: 'Receba perguntas por e-mail',
      done: Boolean(user.emailReminder?.enabled),
      href: '/perfil/configuracoes',
      action: 'Escolher'
    }
  ]

  const completed = steps.filter(step => step.done).length

  if (completed === steps.length) return null

  const hideForNow = () => {
    dismissedThisSession = true
    setDismissed(true)
  }

  const dismiss = () => {
    // O Alert não existe na web, onde o app só roda para testes
    if (Platform.OS === 'web') return hideForNow()

    Alert.alert('Esconder primeiros passos?', 'Você pode mostrar de novo nas configurações do Perfil.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Só por agora', onPress: hideForNow },
      { text: 'Não mostrar mais', style: 'destructive', onPress: () => updateUser({ checklistHidden: true }) }
    ])
  }

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={type.eyebrow}>Primeiros passos</Text>
        <View style={styles.pills}>
          {steps.map(step => (
            <View key={step.id} style={[styles.pill, step.done && styles.pillDone]} />
          ))}
        </View>
        <Text style={styles.count}>
          {completed} de {steps.length}
        </Text>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Esconder primeiros passos'
          hitSlop={10}
          onPress={dismiss}
          style={styles.close}
        >
          <X size={16} color={colors.muted} />
        </Pressable>
      </View>

      {/* Cartões que rolam para o lado e param um a um; o próximo aparece cortado na borda */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate='fast'
        contentContainerStyle={styles.steps}
        style={styles.scroller}
      >
        {steps.map((step, index) => (
          <Pressable
            key={step.id}
            accessibilityRole='link'
            accessibilityLabel={`${step.title}${step.done ? ', feito' : ''}`}
            disabled={step.done}
            onPress={() => router.push(step.href)}
            style={({ pressed }) => [styles.step, step.done && styles.stepDone, pressed && styles.pressed]}
          >
            <View style={[styles.number, step.done && styles.numberDone]}>
              {step.done ? (
                <Check size={12} color={colors.cream} />
              ) : (
                <Text style={styles.numberLabel}>{index + 1}</Text>
              )}
            </View>
            <Text numberOfLines={2} style={[styles.stepTitle, step.done && styles.struck]}>
              {step.title}
            </Text>
            {step.done ? (
              <Text style={type.xsMuted}>Feito</Text>
            ) : (
              <View style={styles.action}>
                <Text style={styles.actionLabel}>{step.action}</Text>
                <ArrowRight size={12} color={colors.text} />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const CARD_WIDTH = 168
const CARD_GAP = 8

const styles = StyleSheet.create({
  box: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pills: { flex: 1, flexDirection: 'row', gap: 4, justifyContent: 'flex-end' },
  pill: { width: 16, height: 4, borderRadius: 2, backgroundColor: colors.stone },
  pillDone: { backgroundColor: colors.moss },
  count: { ...type.xsMuted, fontVariant: ['tabular-nums'] },
  close: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center'
  },
  // A faixa vai de borda a borda da tela, mas o primeiro cartão alinha com o texto
  scroller: { marginHorizontal: -16 },
  steps: { paddingHorizontal: 16, gap: CARD_GAP },
  step: {
    width: CARD_WIDTH,
    backgroundColor: colors.sand,
    borderRadius: radius.xl,
    padding: 12,
    gap: 8
  },
  stepDone: { opacity: 0.6 },
  pressed: { backgroundColor: colors.stone },
  number: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  numberDone: { backgroundColor: colors.moss, borderColor: colors.moss },
  numberLabel: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.clay },
  stepTitle: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 19, minHeight: 38, color: colors.text },
  struck: { textDecorationLine: 'line-through' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLabel: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.text, textDecorationLine: 'underline' }
})
