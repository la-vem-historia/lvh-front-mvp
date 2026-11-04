// Título de página do site (src/components/app/page-heading.tsx): etiqueta, título e descrição
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { type } from '@/lib/theme'

type Props = {
  eyebrow?: ReactNode
  title: string
  children?: ReactNode
}

export function PageHeading({ eyebrow, title, children }: Props) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={type.eyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole='header' style={type.pageTitle}>
        {title}
      </Text>
      {children ? <Text style={type.bodyMuted}>{children}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  heading: { gap: 16 }
})
