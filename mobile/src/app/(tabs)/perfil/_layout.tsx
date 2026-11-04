import { Stack } from 'expo-router'

import { tabStackOptions } from '@/lib/navigation'
import { colors } from '@/lib/theme'

// As telas das configurações abrem com título pequeno, cabeçalho opaco (o texto rola por baixo dele, sem
// aparecer através) e o voltar só com a seta
const detail = {
  headerLargeTitleEnabled: false,
  headerBackButtonDisplayMode: 'minimal',
  headerStyle: { backgroundColor: colors.cream }
} as const

export default function Layout() {
  return (
    <Stack screenOptions={tabStackOptions}>
      <Stack.Screen name='index' options={{ title: 'Perfil' }} />
      <Stack.Screen name='configuracoes' options={{ title: 'Configurações', headerBackButtonDisplayMode: 'minimal' }} />
      <Stack.Screen name='lembrete' options={detail} />
      <Stack.Screen name='exemplo-email' options={{ ...detail, title: 'Como o e-mail chega' }} />
      <Stack.Screen name='colaborador/[id]' options={detail} />
      <Stack.Screen name='convidar-leitor' options={{ ...detail, title: 'Convidar leitor' }} />
      <Stack.Screen name='excluir-conta' options={detail} />
    </Stack>
  )
}
