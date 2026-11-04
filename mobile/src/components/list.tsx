// Lista agrupada dos ajustes do sistema: seções em cartão com linhas separadas por um fio
import { Check, ChevronRight } from 'lucide-react-native'
import { Children, Fragment, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, fonts, type } from '@/lib/theme'

export function ListSection({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const rows = Children.toArray(children)

  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={styles.separator} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  )
}

export function ListRow({
  label,
  detail,
  value,
  trailing,
  destructive,
  chevron,
  checked,
  onPress
}: {
  label: string
  detail?: string
  value?: string
  trailing?: ReactNode
  destructive?: boolean
  // Seta de "abre outra tela" e ✓ de opção escolhida, como nos ajustes do sistema
  chevron?: boolean
  checked?: boolean
  onPress?: () => void
}) {
  const content = (
    <>
      <View style={styles.text}>
        <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
        {detail ? <Text style={type.smallMuted}>{detail}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing}
      {checked ? <Check size={18} color={colors.moss} /> : null}
      {chevron ? <ChevronRight size={18} color={colors.muted} /> : null}
    </>
  )

  if (!onPress) return <View style={styles.row}>{content}</View>

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={checked === undefined ? undefined : { selected: checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: { ...type.eyebrow, color: colors.muted, paddingHorizontal: 16 },
  card: { backgroundColor: colors.sand, borderRadius: 16, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 16 },
  footer: { ...type.smallMuted, paddingHorizontal: 16 },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  pressed: { backgroundColor: colors.stone },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 22, color: colors.text },
  destructive: { color: colors.destructive },
  value: { fontFamily: fonts.sans, fontSize: 16, color: colors.muted }
})
