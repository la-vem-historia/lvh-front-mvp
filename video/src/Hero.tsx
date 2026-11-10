import { useCallback, useRef } from 'react'
import { AbsoluteFill, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion'

import greenBox from './green-bbox.json'
import { TelaDoSite } from './TelaDoSite'

// Vídeo da hero, 15s a 30 fps: quatro gerações digitando, a câmera indo até a tela, e o site
export const HERO_FRAMES = 450

const W = 1920
const H = 1080
const SRC_FPS = 24

// Takes escolhidos no Flow (public/flow): mãe→pai, pai→avô, avô→avó, e a câmera até a tela
const S1 = { src: 'flow/v8.mp4', from: 0, to: 62, trimBefore: 0, rate: 1.6 }
const S2 = { src: 'flow/v4.mp4', from: 58, to: 108, trimBefore: 27, rate: 1.6 }
const S3 = { src: 'flow/v2.mp4', from: 104, to: 170, trimBefore: 18, rate: 1.5 }
// Começa em ~1,9s do clipe, quando a tela do notebook já está toda verde (antes disso o recorte mancha)
const S4 = { src: 'flow/v0.mp4', from: 166, to: 343, trimBefore: 56, rate: 1.03 }

// A tela do site começa a rodar quando a câmera já está de frente para o notebook
const UI_START = 236
// Últimos frames do clipe 2: a câmera "entra" na tela até ela ocupar o quadro
const ZOOM_FROM = 313
// Passa um pouco do tamanho da tela verde, para a moldura sair do quadro antes do corte
const OVERSHOOT = 1.08
// Depois do corte, o site volta do excesso de zoom ao tamanho normal
const SETTLE = 14

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

type Box = [number, number, number, number]

// Caixa da tela verde no frame da composição, medida quadro a quadro e suavizada
const boxAt = (frame: number): Box => {
  const t = S4.trimBefore / 30 + (frame - S4.from) * (S4.rate / 30)
  const center = Math.round(t * SRC_FPS)
  const boxes = (greenBox as (number[] | null)[])
    .slice(Math.max(0, center - 4), center + 5)
    .filter((box): box is number[] => box !== null && box[4] > 0.01)

  if (!boxes.length) return [0.45, 0.3, 0.75, 0.6]

  const avg = (i: number) => boxes.reduce((sum, box) => sum + box[i], 0) / boxes.length

  return [avg(0), avg(1), avg(2), avg(3)]
}

const Clip = ({ clip, fadeIn }: { clip: typeof S1; fadeIn: boolean }) => {
  const frame = useCurrentFrame()
  const opacity = fadeIn ? interpolate(frame, [0, 4], [0, 1], clamp) : 1

  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={clip.trimBefore}
        playbackRate={clip.rate}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </AbsoluteFill>
  )
}

// Clipe 2 com o verde recortado: o que é verde vira transparente e deixa o site aparecer por trás
const ChromaClip = () => {
  const canvas = useRef<HTMLCanvasElement>(null)

  const onVideoFrame = useCallback((image: CanvasImageSource) => {
    const context = canvas.current?.getContext('2d', { willReadFrequently: true })

    if (!context) return

    context.drawImage(image, 0, 0, W, H)
    const pixels = context.getImageData(0, 0, W, H)
    const data = pixels.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const key = g - Math.max(r, b)

      if (g > 70 && key > 22) {
        // Borda macia entre o verde puro e a moldura
        data[i + 3] = Math.max(0, 255 - (key - 22) * 9)
        data[i + 1] = Math.max(r, b)
      } else if (key > 0) {
        // Tira o reflexo verde da moldura e das mãos
        data[i + 1] = Math.max(r, b) + key * 0.3
      }
    }

    context.putImageData(pixels, 0, 0)
  }, [])

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0 }}>
        <OffthreadVideo
          src={staticFile(S4.src)}
          trimBefore={S4.trimBefore}
          playbackRate={S4.rate}
          muted
          onVideoFrame={onVideoFrame}
          style={{ width: '100%', height: '100%' }}
        />
      </AbsoluteFill>
      <canvas ref={canvas} width={W} height={H} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  )
}

// Quanto o site encolhe para caber inteiro na tela (a caixa é retangular, a tela tem perspectiva)
const fitScale = ([x0, y0, x1, y1]: Box) => Math.min(((x1 - x0) * W) / W, ((y1 - y0) * H) / H) * 0.94

// O site rodando, encaixado inteiro dentro da caixa da tela, com o creme preenchendo as sobras
const Screen = ({ box }: { box: Box }) => {
  const frame = useCurrentFrame()
  const [x0, y0, x1, y1] = box
  const bw = (x1 - x0) * W
  const bh = (y1 - y0) * H
  const scale = fitScale(box)

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: x0 * W - 40, top: y0 * H - 40, width: bw + 80, height: bh + 80, background: '#fffef2' }} />
      <div
        style={{
          position: 'absolute',
          width: W,
          height: H,
          left: x0 * W + bw / 2 - W / 2,
          top: y0 * H + bh / 2 - H / 2,
          transform: `scale(${scale})`
        }}
      >
        <Freeze frame={Math.max(0, frame - UI_START)}>
          <TelaDoSite />
        </Freeze>
      </div>
    </AbsoluteFill>
  )
}

export const Hero = () => {
  const frame = useCurrentFrame()

  // Tamanho do site no último frame do zoom, para o corte para tela cheia não dar salto
  const last = boxAt(S4.to - 1)
  const lastZoom = Math.max(1 / (last[2] - last[0]), 1 / (last[3] - last[1])) * OVERSHOOT
  const cutScale = fitScale(last) * lastZoom

  if (frame >= S4.to) {
    const settle = interpolate(frame, [S4.to, S4.to + SETTLE], [cutScale, 1], { ...clamp, easing: t => 1 - (1 - t) ** 3 })

    return (
      <AbsoluteFill style={{ background: '#fffef2' }}>
        <AbsoluteFill style={{ transform: `scale(${settle})` }}>
          <Freeze frame={frame - UI_START}>
            <TelaDoSite />
          </Freeze>
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // Entrando na tela: escala o quadro todo até a caixa verde cobrir a imagem (com folga)
  const end = boxAt(S4.to - 1)
  const p = interpolate(frame, [ZOOM_FROM, S4.to - 1], [0, 1], { ...clamp, easing: t => t * t * (3 - 2 * t) })
  const zoom = 1 + (Math.max(1 / (end[2] - end[0]), 1 / (end[3] - end[1])) * OVERSHOOT - 1) * p
  const cx = ((end[0] + end[2]) / 2) * W
  const cy = ((end[1] + end[3]) / 2) * H
  const shift = `translate(${(W / 2 - cx) * p}px, ${(H / 2 - cy) * p}px)`

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={S1.from} durationInFrames={S1.to - S1.from}>
        <Clip clip={S1} fadeIn={false} />
      </Sequence>
      <Sequence from={S2.from} durationInFrames={S2.to - S2.from}>
        <Clip clip={S2} fadeIn />
      </Sequence>
      <Sequence from={S3.from} durationInFrames={S3.to - S3.from}>
        <Clip clip={S3} fadeIn />
      </Sequence>
      {frame >= S4.from && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [S4.from, S4.from + 4], [0, 1], clamp), transform: `${shift} scale(${zoom})`, transformOrigin: `${cx}px ${cy}px` }}>
          <Screen box={boxAt(frame)} />
          <Sequence from={S4.from} durationInFrames={S4.to - S4.from}>
            <ChromaClip />
          </Sequence>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
