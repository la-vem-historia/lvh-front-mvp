// Botões do site (src/components/ui/button.tsx): pílulas, Inter medium 14px
import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'

import { buttonShadow, colors, fonts } from '@/lib/theme'

type Variant = 'honey' | 'default' | 'outline' | 'social' | 'destructive'
type Size = 'cta' | 'lg' | 'tool'

type Props = Omit<PressableProps, 'children' | 'style'> & {
  title: string
  variant?: Variant
  size?: Size
  loading?: boolean
  // Ícones antes e depois do texto, como o [&_svg] do site
  icon?: ReactNode
  iconAfter?: ReactNode
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
}

const foreground: Record<Variant, string> = {
  honey: colors.ink,
  default: colors.cream,
  outline: colors.ink,
  social: '#1f1f1f',
  destructive: '#ffffff'
}

export function Button({
  title,
  variant = 'honey',
  size = 'cta',
  loading,
  disabled,
  icon,
  iconAfter,
  fullWidth,
  style,
  ...props
}: Props) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ disabled: !!isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        fullWidth ? styles.fullWidth : styles.fit,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={foreground[variant]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, size === 'tool' && styles.toolLabel, { color: foreground[variant] }]}>{title}</Text>
          {iconAfter}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  // size='cta': h-12 min-w-57.5 px-6
  cta: { height: 48, minWidth: 230, paddingHorizontal: 24 },
  lg: { height: 48, paddingHorizontal: 20 },
  // Ferramentas da pergunta: h-10 px-4
  tool: { height: 40, paddingHorizontal: 16 },
  honey: { backgroundColor: colors.honey },
  default: { backgroundColor: colors.text },
  outline: { borderColor: colors.moss, backgroundColor: 'transparent' },
  social: { borderColor: '#dadce0', backgroundColor: '#ffffff' },
  // Exclusão da conta: bg-destructive text-white
  destructive: { backgroundColor: colors.destructive },
  fit: { alignSelf: 'flex-start' },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { transform: [{ translateY: 1 }], ...buttonShadow },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.sansMedium, fontSize: 14 },
  toolLabel: { fontSize: 14 }
})
