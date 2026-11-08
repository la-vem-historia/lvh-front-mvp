// Som de página virando, sintetizado na hora: um sopro de ruído de papel que sobe de tom e some.
// Nada para baixar; o contexto de áudio só nasce depois de um clique, como os navegadores exigem
let context: AudioContext | null = null
let paper: AudioBuffer | null = null

const getContext = () => {
  if (typeof window === 'undefined') return null

  if (!context) {
    const Context =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!Context) return null
    context = new Context()
  }

  return context
}

// Ruído com mais grão no começo, como a folha raspando na de baixo
const getPaper = (audio: AudioContext) => {
  if (paper) return paper

  const length = Math.round(audio.sampleRate * 0.5)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < length; index++) {
    const crackle = Math.random() < 0.004 ? (Math.random() - 0.5) * 3 : 0
    data[index] = (Math.random() * 2 - 1) * 0.6 + crackle
  }

  paper = buffer

  return buffer
}

export function playPageTurn() {
  const audio = getContext()

  if (!audio) return
  if (audio.state === 'suspended') audio.resume().catch(() => {})

  const now = audio.currentTime
  const source = audio.createBufferSource()
  const band = audio.createBiquadFilter()
  const air = audio.createBiquadFilter()
  const gain = audio.createGain()

  source.buffer = getPaper(audio)
  // Uma pequena variação a cada virada, para não soar como gravação repetida
  source.playbackRate.value = 0.9 + Math.random() * 0.2

  band.type = 'bandpass'
  band.Q.value = 0.8
  band.frequency.setValueAtTime(700, now)
  band.frequency.exponentialRampToValueAtTime(3200, now + 0.28)

  air.type = 'highpass'
  air.frequency.value = 350

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.2)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

  source.connect(band).connect(air).connect(gain).connect(audio.destination)
  source.start(now)
  source.stop(now + 0.5)
}
