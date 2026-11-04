// Tokens do site (src/app/globals.css e src/components/app/page-heading.tsx)
import { StyleSheet } from 'react-native'

export const colors = {
  paper: '#fcf9ee',
  sand: '#f2efe3',
  stone: '#dad9cd',
  ink: '#222222',
  cream: '#fffef2',
  text: '#333333',
  muted: '#666666',
  earth: '#945c26',
  green: '#124e20',
  moss: '#455843',
  honey: '#f5be4e',
  clay: '#6f473d',
  lilac: '#bcb1e4',
  olive: '#849539',
  poppy: '#e0533d',
  destructive: '#d4183d',
  border: 'rgba(51, 51, 51, 0.2)'
}

// Fraunces nos títulos, Inter no texto. No React Native cada peso é uma família
export const fonts = {
  heading: 'Fraunces_400Regular',
  headingSemibold: 'Fraunces_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold'
}

// Cantos: caixas 14px (radius do site), cards grandes 24px; botões e campos são pílulas
export const radius = { lg: 14, xl: 20, card: 24, pill: 999 }

export const type = StyleSheet.create({
  // pageTitleClassName: Fraunces semibold 2rem, leading 1.1, tracking -0.01em
  pageTitle: { fontFamily: fonts.headingSemibold, fontSize: 32, lineHeight: 35, letterSpacing: -0.32, color: colors.text },
  // eyebrowClassName: text-sm font-medium uppercase
  eyebrow: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, textTransform: 'uppercase', color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.text },
  bodyMuted: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.muted },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.text },
  smallMuted: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
  xsMuted: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  heading2xl: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 32, color: colors.text },
  headingXl: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 28, color: colors.text }
})

// Sombra dos botões no hover do site (--shadow-button), usada aqui quando pressiona
export const buttonShadow = {
  shadowColor: '#221e1a',
  shadowOpacity: 0.22,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 }
}
