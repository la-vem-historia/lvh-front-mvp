import * as React from 'react'

import { cn } from '@/lib/utils'

// Caixa de texto padrão: o mesmo fundo, borda e foco do Input, com cantos de cartão e espaço para escrever.
// Não vale para a resposta da pergunta, que é uma folha de escrita com tipografia própria
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'border-input bg-field placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-2xl border px-5 py-4 text-base leading-relaxed outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
