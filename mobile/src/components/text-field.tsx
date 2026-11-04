// Campo do site: pílula com borda (fieldClassName = 'bg-background h-12 px-5 text-base')
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

import { colors, fonts } from '@/lib/theme'

type Props = TextInputProps & { label?: string }

export function TextField({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor='rgba(102, 102, 102, 0.7)' style={[styles.input, style]} {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.text },
  input: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.text
  }
})
