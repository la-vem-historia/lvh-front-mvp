import { useMemo } from 'react'

import QRCode from 'qrcode'

import { formatSeconds } from '@/lib/lvh/media'
import type { AudioRecording } from '@/lib/lvh/types'

// QR code em vetor, desenhado módulo a módulo: fica nítido em qualquer tamanho de impressão
const QrSvg = ({ value, size }: { value: string; size: number }) => {
  const { count, path } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' })
    let d = ''

    for (let row = 0; row < modules.size; row++) {
      for (let column = 0; column < modules.size; column++) {
        if (modules.get(row, column)) d += `M${column} ${row}h1v1h-1z`
      }
    }

    return { count: modules.size, path: d }
  }, [value])

  // Margem de 2 módulos em volta: o mínimo para a câmera achar o código no papel
  return (
    <svg
      width={size}
      height={size}
      viewBox={`-2 -2 ${count + 4} ${count + 4}`}
      shapeRendering='crispEdges'
      role='img'
      aria-label='QR code para ouvir o áudio'
    >
      <rect x={-2} y={-2} width={count + 4} height={count + 4} fill='#fff' />
      <path d={path} fill='#2a231c' />
    </svg>
  )
}

// Voz no livro impresso: no lugar do player, um QR code que abre o áudio no celular.
// O bloco todo é um link: no PDF lido na tela, tocar no código abre a voz (não dá para
// apontar a câmera para a própria tela). O motor da gráfica tira o link do arquivo de impressão
const AudioQr = ({
  audio,
  author,
  url,
  code
}: {
  audio: AudioRecording
  author: string
  url: string
  code: string
}) => (
  <a
    href={url}
    target='_blank'
    rel='noopener noreferrer'
    className='flex h-full items-center gap-3.5 border-y border-[#e5dccb] px-1'
  >
    <QrSvg value={url} size={60} />
    <div className='flex min-w-0 flex-col gap-1'>
      <span className='font-heading text-[11px] text-[#2a231c] italic'>
        A voz de {author} · {formatSeconds(audio.seconds)}
      </span>
      <span className='text-[8.5px] leading-[1.45] text-[#8a7f72]'>
        Aponte a câmera do celular para o código e ouça esta resposta contada por quem viveu.
      </span>
      {/* O mesmo nome do arquivo de áudio no ZIP do livro, para quem tiver só a pasta */}
      <span className='text-[8.5px] tracking-wide text-[#8a7f72]'>Arquivo de áudio {code}</span>
    </div>
  </a>
)

export default AudioQr
