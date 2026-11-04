// Caixa de seleção com o accent-foreground do site: quadrado escuro com check claro
import { Check } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, fonts } from '@/lib/theme'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  size?: number
  small?: boolean
}

export function Checkbox({ checked, onChange, label, size = 16, small }: Props) {
  return (
    <Pressable
      accessibilityRole='checkbox'
      accessibilityState={{ checked }}
      hitSlop={8}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={[styles.box, { width: size, height: size }, checked && styles.checked]}>
        {checked ? <Check size={size - 4} strokeWidth={3} color={colors.cream} /> : null}
      </View>
      <Text style={[styles.label, small && styles.small]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.muted,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checked: { backgroundColor: colors.text, borderColor: colors.text },
  label: { flexShrink: 1, fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
  small: { fontSize: 12 }
})
