import '@/lib/setup'

import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces'
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

import { SessionProvider, useSession } from '@/lib/session'
import { colors, fonts } from '@/lib/theme'

SplashScreen.preventAutoHideAsync()

function RootStack() {
  const { user, loading } = useSession()
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold
  })
  const ready = !loading && fontsLoaded

  useEffect(() => {
    if (ready) SplashScreen.hide()
  }, [ready])

  if (!ready) return null

  return (
    // As abas têm cada uma o seu cabeçalho; a pergunta abre por cima delas, em tela cheia, para escrever sem distração
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Protected guard={!!user?.onboarded}>
        <Stack.Screen name='(tabs)' />
        <Stack.Screen
          name='pergunta/[id]'
          options={{
            headerShown: true,
            title: '',
            presentation: 'fullScreenModal',
            headerBackVisible: false,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.cream },
            headerTitleStyle: { fontFamily: fonts.sansMedium, color: colors.ink },
            headerTintColor: colors.ink
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!!user && !user.onboarded}>
        <Stack.Screen name='boas-vindas' />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name='entrar' />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style='dark' />
      <RootStack />
    </SessionProvider>
  )
}
