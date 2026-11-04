// Abas nativas do sistema: UITabBar no iOS (vidro no iOS 26) e a barra do Material no Android.
// Escrever não troca de aba: é um botão na barra que abre a próxima pergunta em tela cheia, subindo por cima
// de tudo, sem a barra, como a pergunta aberta pelo Início. Para isso a aba fica desativada (o sistema não a
// seleciona) e o toque nela abre a pergunta. No Android, onde a aba não pode ser desativada, ela abre a tela
// escrever/, que faz o mesmo papel com a barra escondida
import { router, usePathname } from 'expo-router'
import { NativeTabs } from 'expo-router/native-tabs'
import { Alert, Platform } from 'react-native'

import { colors, fonts } from '@/lib/theme'
import { useNextQuestion } from '@/lib/use-next-question'

export default function TabsLayout() {
  const next = useNextQuestion()
  const pathname = usePathname()
  const writeButton = Platform.OS === 'ios'

  const write = () => {
    if (next) router.push({ pathname: '/pergunta/[id]', params: { id: next.question.id } })
    else if (next === null) Alert.alert('Todas as perguntas respondidas', 'Releia e ajuste o que quiser pelo Início.')
  }

  return (
    <NativeTabs
      tintColor={colors.ink}
      iconColor={{ default: colors.muted, selected: colors.ink }}
      labelStyle={{ default: { fontFamily: fonts.sansMedium, color: colors.muted }, selected: { color: colors.ink } }}
      backgroundColor={colors.cream}
      indicatorColor={colors.honey}
      minimizeBehavior='onScrollDown'
      hidden={!writeButton && pathname === '/escrever'}
    >
      <NativeTabs.Trigger name='(inicio)'>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md='home' />
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name='escrever'
        disabled={writeButton}
        listeners={writeButton ? { tabPress: write } : undefined}
      >
        <NativeTabs.Trigger.Icon sf='square.and.pencil' md='edit' />
        <NativeTabs.Trigger.Label>Escrever</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='livro'>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md='menu_book' />
        <NativeTabs.Trigger.Label>O livro</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='perfil'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md='account_circle'
        />
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
