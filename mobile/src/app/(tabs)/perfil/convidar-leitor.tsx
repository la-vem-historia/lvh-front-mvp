// Convidar leitor (a folha "Quem pode ler" do site): nome e e-mail, e o link pessoal sai pela folha de
// compartilhar do sistema. Volta para as configurações, onde o leitor novo aparece na lista
import { router } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native'

import { addShare, getShares } from '@lvh/api'

import { Button } from '@/components/button'
import { TextField } from '@/components/text-field'
import { readerLink } from '@/lib/site'
import { colors, fonts, type } from '@/lib/theme'

export default function ConvidarLeitor() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const ready = name.trim() !== '' && /\S+@\S+\.\S+/.test(email)

  const invite = async () => {
    const shares = await getShares()

    if (shares.some(share => share.email === email.trim().toLowerCase())) {
      setError('Essa pessoa já tem acesso.')

      return
    }

    try {
      const share = await addShare({ name, email })

      router.back()
      Share.share({ message: `${share.name}, este é o seu link para ler o meu livro: ${readerLink(share.token)}` })
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={styles.page}
      >
        <Text style={type.bodyMuted}>
          O livro é fechado: só lê quem você convidar, pelo link pessoal. Você pode tirar o acesso quando quiser.
        </Text>
        <View style={styles.fields}>
          <TextField label='Nome' value={name} onChangeText={setName} autoFocus textContentType='name' />
          <TextField
            label='E-mail'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            textContentType='emailAddress'
            returnKeyType='send'
            onSubmitEditing={() => ready && invite()}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <Button title='Convidar e compartilhar link' disabled={!ready} onPress={invite} fullWidth />
        <Text style={type.xsMuted}>Protótipo: nenhum e-mail é enviado, e o link só abre neste aparelho.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 24 },
  fields: { gap: 16 },
  error: { fontFamily: fonts.sans, fontSize: 14, color: colors.destructive }
})
