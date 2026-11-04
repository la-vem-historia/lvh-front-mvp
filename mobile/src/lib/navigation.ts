// Cabeçalho nativo de cada aba: título grande em Fraunces que encolhe ao rolar, sobre o creme do app
import type { NativeStackNavigationOptions } from 'expo-router/native-stack'

import { colors, fonts } from '@/lib/theme'

export const tabStackOptions: NativeStackNavigationOptions = {
  headerLargeTitleEnabled: true,
  headerLargeTitleShadowVisible: false,
  headerShadowVisible: false,
  headerLargeTitleStyle: { fontFamily: fonts.headingSemibold, color: colors.ink },
  headerTitleStyle: { fontFamily: fonts.sansMedium, color: colors.ink },
  headerTintColor: colors.ink,
  contentStyle: { backgroundColor: colors.cream }
}
