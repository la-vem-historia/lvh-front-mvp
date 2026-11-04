import { Stack } from 'expo-router'

import { tabStackOptions } from '@/lib/navigation'
import { colors } from '@/lib/theme'

export default function Layout() {
  return (
    <Stack screenOptions={tabStackOptions}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Escrever',
          // Cabeçalho opaco, como na pergunta aberta pelos capítulos: o editor começa abaixo dele
          headerLargeTitleEnabled: false,
          headerStyle: { backgroundColor: colors.cream }
        }}
      />
    </Stack>
  )
}
