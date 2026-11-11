'use client'

import { Popover } from '@base-ui/react/popover'
import { ChevronDownIcon } from 'lucide-react'

// Selo sobre a foto do livro impresso: o encadernado ainda não existe, e quem clica entende por quê.
// Hoje dá para baixar o PDF e levar a uma gráfica; o "em breve" é o livro impresso e entregue por nós
const EmBreve = () => (
  <Popover.Root>
    <Popover.Trigger className='bg-cream/95 text-foreground hover:bg-cream data-popup-open:bg-cream group absolute top-4 left-4 z-10 flex h-9 cursor-pointer items-center gap-2 rounded-full pr-3 pl-4 text-sm font-medium shadow-[0_6px_18px_-8px_rgb(40_30_20/0.45)] backdrop-blur-sm transition-colors'>
      <span className='bg-honey size-2 rounded-full' aria-hidden='true' />
      Em breve
      <span className='text-muted-foreground'>· Por quê?</span>
      <ChevronDownIcon
        aria-hidden='true'
        className='size-4 transition-transform duration-200 group-data-popup-open:rotate-180'
      />
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner side='bottom' align='start' sideOffset={8} className='z-50'>
        <Popover.Popup className='bg-cream data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 flex w-80 max-w-[calc(100vw-2rem)] origin-(--transform-origin) flex-col gap-2 rounded-2xl p-5 shadow-[0_24px_48px_-20px_rgb(40_30_20/0.5)] ring-1 ring-black/5'>
          <Popover.Title className='font-heading text-lg'>Por quê?</Popover.Title>
          <Popover.Description className='text-muted-foreground text-sm text-pretty'>
            Queremos que o livro impresso seja uma experiência excelente, do papel à entrega. Ainda não encontramos a
            gráfica parceira certa para imprimir um livro com a qualidade que a sua história merece. Enquanto isso, você
            já pode baixar o PDF pronto e levar a uma gráfica de confiança.
          </Popover.Description>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
)

export default EmBreve
