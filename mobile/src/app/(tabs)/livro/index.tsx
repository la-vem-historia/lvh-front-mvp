// O livro ainda não tem leitor no app: mostra quanto já está escrito e leva de volta às perguntas
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { getBook } from '@lvh/api'
import type { Book } from '@lvh/types'

import { Button } from '@/components/button'
import { useSession } from '@/lib/session'
import { type } from '@/lib/theme'

export default function Livro() {
  const { user } = useSession()
  const [book, setBook] = useState<Book>()

  useFocusEffect(
    useCallback(() => {
      if (user) getBook(user).then(setBook)
    }, [user])
  )

  if (!book) return null

  const entries = book.chapters.reduce((sum, chapter) => sum + chapter.entries.length, 0)

  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.page}>
      <View style={styles.intro}>
        <Text style={type.headingXl}>A história de {book.author}.</Text>
        <Text style={type.bodyMuted}>
          {entries
            ? `${entries} ${entries === 1 ? 'resposta já está' : 'respostas já estão'} no livro, em ${book.chapters.length} ${book.chapters.length === 1 ? 'capítulo' : 'capítulos'}. Para folhear, personalizar a capa e imprimir, abra o livro no site.`
            : 'Cada pergunta respondida vira um trecho do livro. Responda a primeira para ele começar.'}
        </Text>
      </View>
      <Button title='Voltar às perguntas' onPress={() => router.navigate('/')} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 32 },
  intro: { gap: 8 }
})
