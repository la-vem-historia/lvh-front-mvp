// Perfil: a conta do site (conta.tsx) numa lista agrupada, como nos ajustes do sistema. A engrenagem no
// cabeçalho abre as configurações
import { router, Stack } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { ListRow, ListSection } from '@/components/list'
import { useSession } from '@/lib/session'
import { colors, type } from '@/lib/theme'

export default function Perfil() {
  const { user, signOut } = useSession()

  if (!user) return null

  const confirmSignOut = () => {
    // O Alert não existe na web, onde o app só roda para testes
    if (Platform.OS === 'web') return signOut()

    Alert.alert('Sair da conta?', 'O que você escreveu fica guardado para quando voltar.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut }
    ])
  }

  const openSettings = () => router.push('/perfil/configuracoes')

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement='right'>
          <Stack.Toolbar.Button icon='gearshape' accessibilityLabel='Configurações' onPress={openSettings} />
        </Stack.Toolbar>
      ) : (
        <Stack.Screen
          options={{
            headerRight: () => (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Configurações'
                onPress={openSettings}
                style={styles.settings}
              >
                <Settings size={22} color={colors.ink} />
              </Pressable>
            )
          }}
        />
      )}

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{user.name.trim().charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={type.headingXl}>{user.name}</Text>
          <Text style={type.smallMuted}>{user.email}</Text>
        </View>
      </View>

      <ListSection title='Sua história' footer='Escolhido ao criar a conta. Define como as perguntas falam com você.'>
        <ListRow label='Quem conta' value={user.profile ?? 'Não escolhido'} />
      </ListSection>

      <ListSection footer='Você pode voltar quando quiser. O que você escreveu fica guardado.'>
        <ListRow label='Sair da conta' destructive onPress={confirmSignOut} />
      </ListSection>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 32 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center'
  },
  initial: { ...type.headingXl, fontSize: 26, lineHeight: 32, color: colors.ink },
  identity: { flex: 1, gap: 2 },
  settings: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }
})
