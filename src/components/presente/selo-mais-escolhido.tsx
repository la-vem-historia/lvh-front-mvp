import { cn } from '@/lib/utils'

// Selo da opção que mais sai: fica no canto de cima do cartão da opção, metade para fora
const SeloMaisEscolhido = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'bg-honey text-foreground absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_6px_14px_-8px_rgb(40_30_20/0.5)]',
      className
    )}
  >
    Mais escolhido
  </span>
)

export default SeloMaisEscolhido
