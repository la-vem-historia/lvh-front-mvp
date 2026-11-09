// Onboarding do site (src/components/app/boas-vindas.tsx): só o papel, que muda as perguntas
import { CircleCheck } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/button'
import { useSession } from '@/lib/session'
import { colors, fonts, radius, type } from '@/lib/theme'

// Cada perfil ganha uma cor dos cards de planos da landing quando é escolhido
const profiles = [
  {
    value: 'Pai',
    hint: 'As perguntas falam com você como pai.',
    background: colors.olive,
    foreground: colors.cream
  },
  {
    value: 'Mãe',
    hint: 'As perguntas falam com você como mãe.',
    background: colors.lilac,
    foreground: colors.ink
  }
]

export default function BoasVindas() {
  const { user, updateUser } = useSession()
  const [profile, setProfile] = useState(user?.profile ?? '')
  const [pending, setPending] = useState(false)

  if (!user) return null

  const start = async () => {
    setPending(true)
    // onboarded troca a guarda do layout e leva ao painel
    await updateUser({ profile, onboarded: true })
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.eyebrow}>Boas-vindas, {user.name}</Text>

        <View style={styles.fieldset}>
          <View style={styles.titleBlock}>
            <Text accessibilityRole='header' style={type.pageTitle}>
              Você vai escrever este livro como…
            </Text>
            <Text style={type.bodyMuted}>As perguntas se adaptam a quem está contando.</Text>
          </View>

          <View style={styles.options}>
            {profiles.map(option => {
              const isSelected = profile === option.value
              // Com um perfil escolhido, o outro recua: menor e mais apagado
              const isDimmed = profile !== '' && !isSelected

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole='radio'
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => setProfile(option.value)}
                  style={[
                    styles.option,
                    isSelected && {
                      backgroundColor: option.background,
                      borderColor: option.background
                    },
                    isDimmed && styles.dimmed
                  ]}
                >
                  {isSelected ? (
                    <CircleCheck size={20} color={option.background} fill={option.foreground} />
                  ) : (
                    <View style={styles.radio} />
                  )}
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, isSelected && { color: option.foreground }]}>{option.value}</Text>
                    <Text
                      style={[
                        type.smallMuted,
                        isSelected && {
                          color: option.foreground,
                          opacity: 0.85
                        }
                      ]}
                    >
                      {option.hint}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        </View>

        <Text style={type.smallMuted}>Em breve, mais papéis: avô, avó, tio, tia, amigo e amiga.</Text>

        <Button title='Começar o livro' disabled={!profile} loading={pending} onPress={start} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  // px-4 py-10 gap-10
  content: { paddingHorizontal: 16, paddingVertical: 40, gap: 40 },
  fieldset: { gap: 24 },
  titleBlock: { gap: 12 },
  options: { flexDirection: 'row', gap: 16 },
  option: {
    flex: 1,
    minHeight: 176,
    justifyContent: 'space-between',
    gap: 24,
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  dimmed: { transform: [{ scale: 0.95 }], opacity: 0.55 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  optionText: { gap: 8 },
  // text-display: 1.9375rem / 1.33
  optionLabel: {
    fontFamily: fonts.heading,
    fontSize: 31,
    lineHeight: 41,
    color: colors.text
  }
})
