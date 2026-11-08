// Som de página virando, sintetizado na hora. Uma folha virando é um sopro de ar macio que cresce,
// atravessa da direita para a esquerda e termina num toque leve quando a folha deita.
// Ruído grave e filtrado (nada de agudos nem estalos, que soam como papel rasgando).
// O contexto de áudio só nasce depois de um clique, como os navegadores exigem
let context: AudioContext | null = null
let air: AudioBuffer | null = null

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

// Ruído marrom: o branco integrado, que tem quase só graves e soa como ar passando, não como chiado
const getAir = (audio: AudioContext) => {
  if (air) return air

  const length = Math.round(audio.sampleRate * 0.8)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0

  for (let index = 0; index < length; index++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[index] = last * 3.5
  }

  air = buffer

  return buffer
}

export function playPageTurn() {
  const audio = getContext()

  if (!audio) return
  if (audio.state === 'suspended') audio.resume().catch(() => {})

  const now = audio.currentTime
  // Uma pequena variação a cada virada, para não soar como gravação repetida
  const pitch = 0.92 + Math.random() * 0.16
  const length = 0.48 + Math.random() * 0.08

  // O sopro: cresce devagar, passa pelo meio e vai sumindo
  const sweep = audio.createBufferSource()
  const sweepLow = audio.createBiquadFilter()
  const sweepHigh = audio.createBiquadFilter()
  const sweepGain = audio.createGain()
  const pan = audio.createStereoPanner()

  sweep.buffer = getAir(audio)
  sweep.playbackRate.value = pitch

  sweepLow.type = 'lowpass'
  sweepLow.Q.value = 0.4
  sweepLow.frequency.setValueAtTime(900, now)
  sweepLow.frequency.linearRampToValueAtTime(1600, now + length * 0.45)
  sweepLow.frequency.linearRampToValueAtTime(700, now + length)

  sweepHigh.type = 'highpass'
  sweepHigh.frequency.value = 120

  sweepGain.gain.setValueAtTime(0.0001, now)
  sweepGain.gain.linearRampToValueAtTime(0.5, now + length * 0.4)
  sweepGain.gain.linearRampToValueAtTime(0.0001, now + length)

  // A folha atravessa o livro: o som vai da direita para a esquerda
  pan.pan.setValueAtTime(0.35, now)
  pan.pan.linearRampToValueAtTime(-0.35, now + length)

  sweep.connect(sweepHigh).connect(sweepLow).connect(sweepGain).connect(pan).connect(audio.destination)
  sweep.start(now)
  sweep.stop(now + length + 0.05)

  // O toque final, bem grave e curto, de quando a folha encosta na outra
  const land = audio.createBufferSource()
  const landLow = audio.createBiquadFilter()
  const landGain = audio.createGain()
  const landAt = now + length * 0.82

  land.buffer = getAir(audio)
  landLow.type = 'lowpass'
  landLow.frequency.value = 450
  landGain.gain.setValueAtTime(0.0001, landAt)
  landGain.gain.linearRampToValueAtTime(0.35, landAt + 0.015)
  landGain.gain.exponentialRampToValueAtTime(0.0001, landAt + 0.12)

  land.connect(landLow).connect(landGain).connect(audio.destination)
  land.start(landAt, 0.2)
  land.stop(landAt + 0.14)
}
