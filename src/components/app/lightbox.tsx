'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { XIcon } from 'lucide-react'

// Foto ampliada no centro da tela, sobre um fundo escuro e levemente borrado.
// Vai para o body por portal: dentro das páginas do livro há transform, que quebraria o fixed
const Lightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const overflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={alt}
      onClick={onClose}
      className='animate-in fade-in-0 fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm duration-200 sm:p-10'
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={event => event.stopPropagation()}
        className='animate-in zoom-in-95 max-h-full max-w-full object-contain shadow-2xl duration-200'
      />
      <button
        type='button'
        onClick={onClose}
        aria-label='Fechar foto'
        className='absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center text-white/80 transition-colors hover:text-white'
      >
        <XIcon className='size-6' strokeWidth={1.5} />
      </button>
    </div>,
    document.body
  )
}

export default Lightbox
