// Gravação da resposta na própria voz, como o use-recorder do site (limite de 3 minutos),
// e o player da voz já gravada
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState
} from 'expo-audio'
import { Pause, Play } from 'lucide-react-native'
import { useEffect } from 'react'
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import type { AudioRecording } from '@lvh/types'

import { fileUri, formatSeconds, keepFile } from '@/lib/media'
import { colors, fonts } from '@/lib/theme'

const MAX_SECONDS = 180

export function useVoiceRecorder(onDone: (recording: AudioRecording) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const state = useAudioRecorderState(recorder)
  const seconds = Math.floor(state.durationMillis / 1000)

  const start = async () => {
    const permission = await requestRecordingPermissionsAsync()

    if (!permission.granted) {
      Alert.alert('Microfone bloqueado', 'Para gravar, libere o microfone para o Lá Vem História nos Ajustes.', [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }
      ])
      return
    }

    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
    await recorder.prepareToRecordAsync()
    recorder.record()
  }

  const stop = async () => {
    const duration = Math.max(1, Math.round(state.durationMillis / 1000))

    await recorder.stop()
    // Sem isso o iOS toca a gravação pelo alto-falante do ouvido
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false })

    if (recorder.uri) onDone({ url: await keepFile(recorder.uri, 'audio'), seconds: duration })
  }

  // Para sozinho no limite, como no site
  useEffect(() => {
    if (state.isRecording && seconds >= MAX_SECONDS) stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRecording, seconds])

  return { recording: state.isRecording, seconds, maxSeconds: MAX_SECONDS, start, stop }
}

// No lugar do <audio controls> do site: tocar/pausar, barra de progresso e tempo
export function VoicePlayer({ audio }: { audio: AudioRecording }) {
  const player = useAudioPlayer(fileUri(audio.url))
  const status = useAudioPlayerStatus(player)
  const duration = status.duration || audio.seconds
  const progress = duration ? Math.min(1, status.currentTime / duration) : 0

  const toggle = async () => {
    if (status.playing) return player.pause()

    if (status.currentTime >= duration - 0.1) await player.seekTo(0)

    player.play()
  }

  return (
    <View style={styles.player}>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={status.playing ? 'Pausar' : 'Ouvir'}
        onPress={toggle}
        style={styles.play}
      >
        {status.playing ? (
          <Pause size={16} color={colors.cream} fill={colors.cream} />
        ) : (
          <Play size={16} color={colors.cream} fill={colors.cream} />
        )}
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.time}>
        {formatSeconds(Math.floor(status.currentTime))} / {formatSeconds(audio.seconds)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    paddingHorizontal: 6,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: colors.sand
  },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center'
  },
  track: { flex: 1, height: 2, backgroundColor: colors.border },
  fill: { height: '100%', backgroundColor: colors.text },
  time: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] }
})
