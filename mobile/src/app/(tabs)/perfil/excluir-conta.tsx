// Excluir conta, em dois passos como no site (src/components/app/excluir-conta.tsx): o que se perde e o backup,
// depois a palavra digitada. O backup é um arquivo JSON que sai pela folha de compartilhar (Arquivos, AirDrop, e-mail)
import { File, Paths } from 'expo-file-system'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native'

import { exportMyData, getAnswers, getCollaborators, getContributions, getShares, isAnswered } from '@lvh/api'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { TextField } from '@/components/text-field'
import { useSession } from '@/lib/session'
import { colors, fonts, radius, type } from '@/lib/theme'

const CONFIRMATION_WORD = 'EXCLUIR'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

export default function ExcluirConta() {
  const { deleteAccount } = useSession()
  const [step, setStep] = useState<'antes' | 'confirmar'>('antes')
  const [counts, setCounts] = useState({ answers: 0, readers: 0, collaborators: 0, contributions: 0 })
  const [saved, setSaved] = useState(false)
  const [ready, setReady] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([getAnswers(), getShares(), getCollaborators(), getContributions()]).then(
      ([answers, readers, collaborators, contributions]) =>
        setCounts({
          answers: Object.values(answers).filter(answer => isAnswered(answer)).length,
          readers: readers.length,
          collaborators: collaborators.length,
          contributions: contributions.filter(item => item.text.trim()).length
        })
    )
  }, [])

  const backup = async () => {
    const data = await exportMyData()
    const file = new File(Paths.cache, `la-vem-historia-meus-dados-${data.exportedAt.slice(0, 10)}.json`)

    if (file.exists) file.delete()
    file.create()
    file.write(JSON.stringify(data, null, 2))

    const result = await Share.share(Platform.OS === 'ios' ? { url: file.uri } : { message: JSON.stringify(data) })

    if (result.action === Share.sharedAction) setSaved(true)
  }

  const confirm = async () => {
    setDeleting(true)
    await deleteAccount()
  }

  const losses = [
    `${plural(counts.answers, 'resposta', 'respostas')}, com as fotos e os áudios`,
    'O seu livro, a capa e a dedicatória',
    `${plural(counts.contributions, 'lembrança', 'lembranças')} que os seus convidados escreveram`,
    `O acesso de ${plural(counts.readers, 'leitor', 'leitores')} e ${plural(counts.collaborators, 'colaborador', 'colaboradores')}: os links deixam de funcionar`
  ]

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: step === 'antes' ? 'Excluir conta · 1 de 2' : 'Excluir conta · 2 de 2' }} />
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={styles.page}
      >
        {step === 'antes' ? (
          <>
            <View style={styles.heading}>
              <Text accessibilityRole='header' style={type.pageTitle}>
                Antes de ir, guarde uma cópia.
              </Text>
              <Text style={type.bodyMuted}>
                Excluir a conta apaga tudo de uma vez, e não conseguimos recuperar depois. Isto é o que vai embora:
              </Text>
            </View>

            <View style={styles.losses}>
              {losses.map(loss => (
                <Text key={loss} style={[type.body, styles.loss]}>
                  {loss}
                </Text>
              ))}
            </View>

            <View style={styles.backup}>
              <Text style={styles.backupTitle}>Faça o backup dos seus dados</Text>
              <Text style={type.smallMuted}>
                Uma cópia completa das suas respostas, fotos, áudios e convidados, para guardar com você.
              </Text>
              <View style={styles.backupAction}>
                <Button title='Salvar meus dados' variant='outline' size='lg' onPress={backup} />
                {saved ? <Text style={type.small}>Cópia salva.</Text> : null}
              </View>
            </View>

            <Checkbox
              checked={ready}
              onChange={setReady}
              label='Já guardei uma cópia dos meus dados, ou não preciso dela.'
            />

            <Button title='Continuar' disabled={!ready} onPress={() => setStep('confirmar')} fullWidth />
          </>
        ) : (
          <>
            <View style={styles.heading}>
              <Text accessibilityRole='header' style={type.pageTitle}>
                Tem certeza?
              </Text>
              <Text style={type.bodyMuted}>
                Esta ação é <Text style={styles.strong}>definitiva e não pode ser desfeita</Text>. A sua conta e todas
                as suas histórias serão apagadas agora, e ninguém mais vai conseguir abrir o seu livro.
              </Text>
            </View>

            <TextField
              label={`Para confirmar, digite ${CONFIRMATION_WORD}`}
              value={typed}
              onChangeText={setTyped}
              autoCapitalize='characters'
              autoCorrect={false}
              autoFocus
            />

            <Button
              title='Excluir minha conta para sempre'
              variant='destructive'
              disabled={typed.trim().toUpperCase() !== CONFIRMATION_WORD || deleting}
              loading={deleting}
              onPress={confirm}
              fullWidth
            />
            <Button title='Voltar' variant='outline' onPress={() => setStep('antes')} fullWidth />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 32 },
  heading: { gap: 16 },
  losses: { borderBottomWidth: 1, borderBottomColor: colors.border },
  loss: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
  backup: { backgroundColor: colors.sand, borderRadius: radius.xl, padding: 20, gap: 12 },
  backupTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.text },
  backupAction: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 4 },
  strong: { fontFamily: fonts.sansMedium, color: colors.text }
})
