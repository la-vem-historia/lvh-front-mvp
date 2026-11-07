// Mesma tela do site (src/components/app/entrar-form.tsx): logins sociais, e-mail com código e,
// em conta nova, o nome
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { sendLoginCode, signInWithProvider, updateUser, verifyLoginCode, type LoginProvider } from '@lvh/api'
import type { User } from '@lvh/types'

import { Button } from '@/components/button'
import { Logo } from '@/components/logo'
import { PageHeading } from '@/components/page-heading'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/social-icons'
import { TextField } from '@/components/text-field'
import { useSession } from '@/lib/session'
import { colors, fonts, type } from '@/lib/theme'

const RESEND_SECONDS = 30

const socialProviders = [
  { provider: 'google', label: 'Google', Icon: GoogleIcon },
  { provider: 'apple', label: 'Apple', Icon: AppleIcon },
  { provider: 'facebook', label: 'Facebook', Icon: FacebookIcon }
] satisfies { provider: LoginProvider; label: string; Icon: typeof GoogleIcon }[]

const PrototypeNote = ({ children }: { children: string }) => <Text style={styles.note}>{children}</Text>

export default function Entrar() {
  const { setUser } = useSession()
  const [step, setStep] = useState<'email' | 'codigo' | 'nome'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  // Conta nova fica aqui até a pessoa dizer o nome; só então a sessão abre
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return

    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000)

    return () => clearTimeout(timer)
  }, [resendIn])

  const address = email.trim()
  const validEmail = /^\S+@\S+\.\S+$/.test(address)

  const requestCode = async () => {
    await sendLoginCode(address)
    setResendIn(RESEND_SECONDS)
  }

  const handleEmail = async () => {
    setPending('email')
    await requestCode()
    setPending(null)
    setCode('')
    setError(null)
    setStep('codigo')
  }

  const verify = async (value: string) => {
    setPending('codigo')
    setError(null)

    try {
      const { user, isNew } = await verifyLoginCode(address, value)

      if (isNew) {
        setPendingUser(user)
        setPending(null)
        setStep('nome')
      } else {
        setUser(user)
      }
    } catch (reason) {
      setError((reason as Error).message)
      setPending(null)
    }
  }

  // Só números; ao completar os 6, confere sozinho
  const handleCode = (text: string) => {
    const value = text.replace(/\D/g, '').slice(0, 6)

    setCode(value)
    if (value.length === 6) verify(value)
  }

  const handleProvider = async (provider: LoginProvider) => {
    setPending(provider)
    setUser((await signInWithProvider(provider)).user)
  }

  const handleName = async () => {
    if (!pendingUser) return

    setPending('nome')
    setUser(await updateUser({ name: name.trim() }))
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.logo}>
            <Logo height={34} />
          </View>

          {step === 'email' ? (
            <View style={styles.block}>
              <PageHeading eyebrow='Bem-vindo de volta' title='Entre para continuar o livro.' />

              <View style={styles.form}>
                <View style={styles.social}>
                  {socialProviders.map(({ provider, label, Icon }) => (
                    <Button
                      key={provider}
                      title={`Continuar com ${label}`}
                      variant='social'
                      fullWidth
                      icon={<Icon size={20} />}
                      disabled={pending !== null}
                      loading={pending === provider}
                      onPress={() => handleProvider(provider)}
                    />
                  ))}
                </View>

                <View style={styles.divider}>
                  <View style={styles.rule} />
                  <Text style={type.smallMuted}>ou com o seu e-mail</Text>
                  <View style={styles.rule} />
                </View>

                <View style={styles.fields}>
                  <TextField
                    label='E-mail'
                    autoCapitalize='none'
                    autoComplete='email'
                    keyboardType='email-address'
                    returnKeyType='go'
                    value={email}
                    onChangeText={setEmail}
                    onSubmitEditing={() => validEmail && handleEmail()}
                  />
                  <Button
                    title='Continuar com e-mail'
                    fullWidth
                    disabled={!validEmail || pending !== null}
                    loading={pending === 'email'}
                    onPress={handleEmail}
                  />
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={type.smallMuted}>
                  Sem senha: mandamos um código para o seu e-mail. Se ainda não tiver conta, criamos uma para você.
                </Text>
                <PrototypeNote>
                  Protótipo: nada sai do seu celular, e Google, Apple e Facebook entram com uma conta de exemplo.
                </PrototypeNote>
              </View>
            </View>
          ) : null}

          {step === 'codigo' ? (
            <View style={styles.block}>
              <PageHeading eyebrow='Confira seu e-mail' title='Digite o código que enviamos.'>
                Mandamos um código de 6 números para <Text style={styles.strong}>{address}</Text>. Ele vale por 10
                minutos.
              </PageHeading>

              <View style={styles.fields}>
                <TextField
                  label='Código'
                  autoFocus
                  autoComplete='one-time-code'
                  keyboardType='number-pad'
                  maxLength={6}
                  placeholder='000000'
                  placeholderTextColor='rgba(102, 102, 102, 0.4)'
                  value={code}
                  onChangeText={handleCode}
                  style={styles.code}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button
                  title='Continuar'
                  fullWidth
                  style={styles.submit}
                  disabled={code.length < 6}
                  loading={pending === 'codigo'}
                  onPress={() => verify(code)}
                />
              </View>

              <View style={styles.footer}>
                <View style={styles.links}>
                  <Pressable disabled={resendIn > 0} onPress={requestCode}>
                    <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>
                      {resendIn > 0 ? `Reenviar código em ${resendIn}s` : 'Reenviar código'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setStep('email')}>
                    <Text style={styles.link}>Usar outro e-mail</Text>
                  </Pressable>
                </View>
                <PrototypeNote>Protótipo: nenhum e-mail é enviado, e qualquer código de 6 números funciona.</PrototypeNote>
              </View>
            </View>
          ) : null}

          {step === 'nome' ? (
            <View style={styles.block}>
              <PageHeading eyebrow='Conta criada' title='Como podemos te chamar?'>
                É o nome que aparece no seu livro e para quem você convidar. Dá para mudar depois.
              </PageHeading>

              <View style={styles.fields}>
                <TextField
                  label='Nome'
                  autoFocus
                  autoComplete='given-name'
                  textContentType='givenName'
                  returnKeyType='go'
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={() => name.trim() && handleName()}
                />
                <Button
                  title='Continuar'
                  fullWidth
                  style={styles.submit}
                  disabled={!name.trim()}
                  loading={pending === 'nome'}
                  onPress={handleName}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  logo: { height: 80, justifyContent: 'center', marginBottom: 32 },
  // max-w-md flex-col gap-10
  block: { gap: 40 },
  form: { gap: 24 },
  social: { gap: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  fields: { gap: 20 },
  submit: { marginTop: 8 },
  code: {
    height: 56,
    textAlign: 'center',
    fontFamily: fonts.sansMedium,
    fontSize: 24,
    letterSpacing: 12
  },
  error: { fontFamily: fonts.sans, fontSize: 14, color: colors.destructive },
  footer: { gap: 12 },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 8 },
  link: { fontFamily: fonts.sans, fontSize: 14, color: colors.text, textDecorationLine: 'underline' },
  linkDisabled: { textDecorationLine: 'none', opacity: 0.6 },
  strong: { fontFamily: fonts.sansMedium, color: colors.text },
  note: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 12
  }
})
