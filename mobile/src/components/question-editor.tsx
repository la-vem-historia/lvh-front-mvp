// Editor de uma pergunta, o do site (src/components/app/pergunta.tsx). Usado na aba Escrever e na pergunta aberta
// pela lista de capítulos. O cabeçalho é o nativo da pilha onde ele está: o capítulo no título e o marcador como
// botão da barra
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router, Stack } from 'expo-router'
import { useHeaderHeight } from 'expo-router/react-navigation'
import { ArrowLeft, ArrowRight, Bookmark, Check, ImagePlus, List, Mic, Square, X } from 'lucide-react-native'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { getAnswer, getBookmarks, getQuestionContext, saveAnswer, setBookmark } from '@lvh/api'
import type { AnswerChanges, AudioRecording, QuestionContext } from '@lvh/types'

import { Button } from '@/components/button'
import { ChaptersSheet } from '@/components/chapters-sheet'
import { useDictation } from '@/components/dictation'
import { AudioPlus } from '@/components/icons'
import { TextField } from '@/components/text-field'
import { useVoiceRecorder, VoicePlayer } from '@/components/voice'
import { deleteFile, fileUri, formatSeconds, keepFile } from '@/lib/media'
import { useSession } from '@/lib/session'
import { buttonShadow, colors, fonts, type } from '@/lib/theme'

// Uma foto por resposta: para trocar, a pessoa remove a atual
const MAX_PHOTOS = 1
const SAVE_DELAY = 700

type Status = 'idle' | 'saving' | 'saved' | 'error'

const statusLabel: Record<Status, string> = {
  idle: '',
  saving: 'Salvando…',
  saved: 'Salvo',
  error: 'Não foi possível salvar'
}

type Props = {
  questionId: number
  // Troca de pergunta (Anterior e Próxima). Quem usa o editor deve dar a ele key={questionId}, para que trocar
  // de pergunta o remonte e salve o texto pendente ao sair
  onGo: (id: number) => void
  // Fecha a escrita: o botão no topo esquerdo, no lugar do voltar
  onClose: () => void
}

// Botão redondo só com o ícone, para Anterior e Próxima
function NavButton({
  label,
  primary,
  onPress,
  children
}: {
  label: string
  primary?: boolean
  onPress: () => void
  children: ReactNode
}) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.navButton, primary && styles.navPrimary, pressed && styles.navPressed]}
    >
      {children}
    </Pressable>
  )
}

// Com o teclado aberto a barra de abas fica escondida atrás dele, então a margem de baixo some
function useKeyboardVisible() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setVisible(true)
    )
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setVisible(false)
    )

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return visible
}

export function QuestionEditor({ questionId, onGo, onClose }: Props) {
  const { user } = useSession()
  const keyboardVisible = useKeyboardVisible()
  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()
  const [context, setContext] = useState<QuestionContext | null>()
  const [text, setText] = useState('')
  const [audio, setAudio] = useState<AudioRecording>()
  const [photos, setPhotos] = useState<string[]>([])
  const [captions, setCaptions] = useState<string[]>([])
  const [bookmarked, setBookmarked] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingText = useRef<string | null>(null)
  // Texto mais recente, para o ditado acrescentar ao fim sem depender do estado da última renderização
  const textRef = useRef('')
  const textTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const captionTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!user) return

    Promise.all([getQuestionContext(user, questionId), getAnswer(questionId), getBookmarks()]).then(
      ([nextContext, answer, bookmarks]) => {
        setContext(nextContext)
        textRef.current = answer?.text ?? ''
        setText(textRef.current)
        setAudio(answer?.audio)
        setPhotos(answer?.photos ?? [])
        setCaptions(answer?.photoCaptions ?? [])
        setBookmarked(bookmarks.includes(questionId))
      }
    )
  }, [user, questionId])

  // saveAnswer grava antes do primeiro await, então salvar o texto pendente aqui mantém a ordem
  const flushText = () => {
    clearTimeout(textTimer.current)

    if (pendingText.current === null) return

    const value = pendingText.current

    pendingText.current = null
    saveAnswer(questionId, { text: value })
  }

  const persist = async (changes: AnswerChanges) => {
    flushText()
    setStatus('saving')

    try {
      await saveAnswer(questionId, changes)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  // Só ao sair da tela. flushText lê refs, e questionId não muda (o editor tem key por pergunta)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => flushText, [])

  const changeText = (value: string) => {
    textRef.current = value
    setText(value)
    setStatus('saving')
    pendingText.current = value
    clearTimeout(textTimer.current)
    textTimer.current = setTimeout(() => {
      pendingText.current = null
      persist({ text: value })
    }, SAVE_DELAY)
  }

  // Cada frase ditada entra no fim do texto, separada por um espaço
  const dictation = useDictation(spoken => {
    const current = textRef.current

    changeText(current ? `${current.replace(/\s*$/, '')} ${spoken}` : spoken)
  })

  const recorder = useVoiceRecorder(recording => {
    setAudio(recording)
    persist({ audio: recording })
  })

  const removeAudio = () => {
    if (audio) deleteFile(audio.url)
    setAudio(undefined)
    persist({ audio: undefined })
  }

  const addPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 })

    if (result.canceled) return

    setError(null)

    try {
      const next = [...photos, await keepFile(result.assets[0].uri, 'fotos')].slice(0, MAX_PHOTOS)
      const nextCaptions = next.map((_, index) => captions[index] ?? '')

      setPhotos(next)
      setCaptions(nextCaptions)
      persist({ photos: next, photoCaptions: nextCaptions })
    } catch {
      setError('Não foi possível adicionar a foto.')
    }
  }

  const removePhoto = (index: number) => {
    deleteFile(photos[index])

    const next = photos.filter((_, photoIndex) => photoIndex !== index)
    const nextCaptions = captions.filter((_, photoIndex) => photoIndex !== index)

    setPhotos(next)
    setCaptions(nextCaptions)
    persist({ photos: next, photoCaptions: nextCaptions })
  }

  const changeCaption = (index: number, value: string) => {
    const next = photos.map((_, photoIndex) => (photoIndex === index ? value : (captions[photoIndex] ?? '')))

    setCaptions(next)
    setStatus('saving')
    clearTimeout(captionTimer.current)
    captionTimer.current = setTimeout(() => persist({ photoCaptions: next }), SAVE_DELAY)
  }

  const toggleBookmark = async () => {
    setBookmarked(!bookmarked)
    await setBookmark(questionId, !bookmarked)
  }

  const close = () => {
    flushText()
    onClose()
  }

  const go = (id: number) => {
    flushText()
    onGo(id)
  }

  if (context === undefined) return null

  if (context === null) {
    return (
      <View style={styles.missing}>
        <Text style={type.pageTitle}>Pergunta não encontrada.</Text>
        <Button title='Voltar aos capítulos' onPress={() => router.navigate('/')} />
      </View>
    )
  }

  const { question, chapter, position, previous, next, nextChapter } = context
  const photoFull = photos.length >= MAX_PHOTOS

  const nav = (
    <>
      {previous ? (
        <NavButton label='Pergunta anterior' onPress={() => go(previous.id)}>
          <ArrowLeft size={20} color={colors.ink} />
        </NavButton>
      ) : (
        <View />
      )}
      {next ? (
        <NavButton
          primary
          label={nextChapter ? `Próximo capítulo: ${nextChapter.title}` : 'Próxima pergunta'}
          onPress={() => go(next.id)}
        >
          <ArrowRight size={20} color={colors.ink} />
        </NavButton>
      ) : (
        <NavButton primary label='Voltar aos capítulos' onPress={() => router.navigate('/')}>
          <Check size={20} color={colors.ink} />
        </NavButton>
      )}
    </>
  )

  const bookmarkLabel = bookmarked ? 'Desmarcar a pergunta' : 'Marcar para voltar depois'

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <Stack.Screen options={{ title: chapter.title }} />
      {/* Capítulos, para pular para outra pergunta, e o marcador de livro: separa a pergunta para voltar depois,
          com uma foto ou uma lembrança melhor */}
      {/* Fechar, no topo esquerdo */}
      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement='left'>
          <Stack.Toolbar.Button icon='xmark' tintColor={colors.ink} accessibilityLabel='Fechar' onPress={close} />
        </Stack.Toolbar>
      ) : (
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable accessibilityRole='button' accessibilityLabel='Fechar' onPress={close} style={styles.bookmark}>
                <X size={24} color={colors.ink} />
              </Pressable>
            )
          }}
        />
      )}
      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement='right'>
          <Stack.Toolbar.Button
            icon='list.bullet'
            tintColor={colors.ink}
            accessibilityLabel='Capítulos'
            onPress={() => setChaptersOpen(true)}
          />
          {/* Funções diferentes, botões separados: navegar pelas perguntas e marcar esta */}
          <Stack.Toolbar.Spacer width={8} />
          <Stack.Toolbar.Button
            separateBackground
            icon={bookmarked ? 'bookmark.fill' : 'bookmark'}
            tintColor={bookmarked ? colors.poppy : colors.ink}
            accessibilityLabel={bookmarkLabel}
            selected={bookmarked}
            onPress={toggleBookmark}
          />
        </Stack.Toolbar>
      ) : (
        <Stack.Screen
          options={{
            headerRight: () => (
              <View style={styles.headerButtons}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Capítulos'
                  onPress={() => setChaptersOpen(true)}
                  style={styles.bookmark}
                >
                  <List size={22} color={colors.ink} />
                </Pressable>
                <Pressable
                  accessibilityRole='button'
                  accessibilityState={{ selected: bookmarked }}
                  accessibilityLabel={bookmarkLabel}
                  onPress={toggleBookmark}
                  style={styles.bookmark}
                >
                  <Bookmark
                    size={22}
                    color={bookmarked ? colors.poppy : colors.ink}
                    fill={bookmarked ? colors.poppy : 'none'}
                  />
                </Pressable>
              </View>
            )
          }}
        />
      )}
      <ChaptersSheet
        visible={chaptersOpen}
        currentId={questionId}
        onClose={() => setChaptersOpen(false)}
        onSelect={id => {
          setChaptersOpen(false)
          if (id !== questionId) go(id)
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={styles.content}
        keyboardDismissMode='interactive'
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.heading}>
          <View style={styles.meta}>
            <Text style={type.eyebrow}>
              Pergunta {position + 1} de {chapter.questions.length}
            </Text>
            <Text accessibilityLiveRegion='polite' style={type.xsMuted}>
              {statusLabel[status]}
            </Text>
          </View>
          <Text accessibilityRole='header' style={type.pageTitle}>
            {question.text}
          </Text>
        </View>

        <View style={styles.answer}>
          {/* Campo de texto com o fio embaixo, separando a escrita das ações. O ditado fica dentro do campo, no canto:
              é um jeito de escrever, não um anexo */}
          <View style={styles.field}>
            <TextInput
              multiline
              accessibilityLabel='Sua resposta'
              placeholder='Escreva aqui, do seu jeito. Não precisa ser perfeito.'
              placeholderTextColor='rgba(102, 102, 102, 0.7)'
              textAlignVertical='top'
              scrollEnabled={false}
              value={text}
              onChangeText={changeText}
              onBlur={flushText}
              style={styles.input}
            />
            {dictation.supported ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={dictation.listening ? 'Parar ditado' : 'Ditar: falar e virar texto'}
                accessibilityState={{ selected: dictation.listening, disabled: recorder.recording }}
                disabled={recorder.recording}
                hitSlop={8}
                onPress={dictation.listening ? dictation.stop : dictation.start}
                style={({ pressed }) => [
                  styles.dictate,
                  dictation.listening && styles.dictating,
                  (pressed || recorder.recording) && styles.dimmed
                ]}
              >
                <Mic size={22} color={dictation.listening ? colors.cream : colors.ink} />
              </Pressable>
            ) : null}
          </View>

          {/* Anexos, só com ícone: o áudio (ondas com +) e a foto (imagem com +). Gravar e ditar usam o microfone,
              então um fica desativado enquanto o outro está ligado */}
          <View style={styles.tools}>
            {!audio ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={recorder.recording ? 'Parar gravação' : 'Gravar sua voz'}
                accessibilityState={{ disabled: dictation.listening }}
                disabled={dictation.listening}
                onPress={recorder.recording ? recorder.stop : recorder.start}
                style={({ pressed }) => [
                  styles.tool,
                  recorder.recording && styles.toolActive,
                  (pressed || dictation.listening) && styles.dimmed
                ]}
              >
                {recorder.recording ? (
                  <Square size={16} color={colors.cream} fill={colors.cream} />
                ) : (
                  <AudioPlus size={20} color={colors.ink} />
                )}
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Adicionar foto'
              accessibilityState={{ disabled: photoFull }}
              disabled={photoFull}
              onPress={addPhoto}
              style={({ pressed }) => [styles.tool, (pressed || photoFull) && styles.dimmed]}
            >
              <ImagePlus size={20} color={colors.ink} />
            </Pressable>
            {recorder.recording ? (
              <Text style={styles.recordingTime}>
                Gravando · {formatSeconds(recorder.seconds)} / {formatSeconds(recorder.maxSeconds)}
              </Text>
            ) : null}
          </View>

          {dictation.listening ? (
            <Text style={type.smallMuted}>Ouvindo… fale naturalmente. O texto aparece no fim de cada frase.</Text>
          ) : null}
          {(dictation.error ?? error) ? <Text style={styles.error}>{dictation.error ?? error}</Text> : null}
        </View>

        {audio ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sua voz · {formatSeconds(audio.seconds)}</Text>
              <Pressable hitSlop={8} onPress={removeAudio}>
                <Text style={styles.underline}>Remover</Text>
              </Pressable>
            </View>
            <VoicePlayer audio={audio} />
          </View>
        ) : null}

        {photos.length ? (
          <View style={styles.section}>
            {photos.map((photo, index) => (
              <View key={photo} style={styles.photoBlock}>
                <View style={styles.photoFrame}>
                  <Image source={fileUri(photo)} style={styles.photo} contentFit='cover' />
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel={`Remover foto ${index + 1}`}
                    onPress={() => removePhoto(index)}
                    style={styles.removePhoto}
                  >
                    <X size={16} color={colors.text} />
                  </Pressable>
                </View>
                <TextField
                  label='Legenda (opcional)'
                  placeholder='Ex.: O casamento dos meus pais, 1958'
                  returnKeyType='done'
                  value={captions[index] ?? ''}
                  onChangeText={value => changeCaption(index, value)}
                  style={styles.caption}
                />
              </View>
            ))}
            <Text style={type.xsMuted}>
              Uma foto por resposta. Para usar outra, remova esta no ×. Sem legenda, a foto entra no livro sem texto.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Barra fixa no rodapé: Anterior e Próxima ficam sempre no mesmo lugar */}
      {/* Anterior e Próxima no rodapé, acima da barra de início do sistema e longe dos cantos arredondados da tela
          (a escrita abre sem a barra de abas). Com o teclado aberto, ficam logo acima dele */}
      <View style={[styles.navBar, { paddingBottom: keyboardVisible ? 8 : insets.bottom + 8 }]}>{nav}</View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  // px-4 pt-10 gap-10
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48, gap: 32 },
  missing: { flex: 1, paddingHorizontal: 16, paddingTop: 96, gap: 24 },
  headerButtons: { flexDirection: 'row' },
  bookmark: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heading: { gap: 16 },
  meta: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 },
  answer: { gap: 16 },
  // border-t pt-6 text-lg leading-relaxed h-64
  field: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 },
  input: {
    minHeight: 256,
    // Espaço para o microfone no canto de baixo
    paddingBottom: 48,
    fontFamily: fonts.sans,
    fontSize: 18,
    lineHeight: 29,
    color: colors.text
  },
  dictate: {
    position: 'absolute',
    right: 0,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dictating: { backgroundColor: colors.poppy },
  dimmed: { opacity: 0.4 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tool: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toolActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  recordingTime: { ...type.smallMuted, fontVariant: ['tabular-nums'], marginLeft: 4 },
  error: { fontFamily: fonts.sans, fontSize: 14, color: colors.destructive },
  section: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.text },
  underline: { ...type.smallMuted, textDecorationLine: 'underline' },
  photoBlock: { gap: 12 },
  photoFrame: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    shadowColor: '#3c2d1e',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }
  },
  photo: { width: 260, height: 224, borderRadius: 12 },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 254, 242, 0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  caption: { height: 44, fontSize: 14 },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.moss,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navPrimary: { backgroundColor: colors.honey, borderColor: colors.honey, ...buttonShadow },
  navPressed: { opacity: 0.7 }
})
