import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Botões da Aesop (escuro sólido e contorno que inverte no hover): sem sombra parados,
        // ganham sombra no hover enquanto sobem 1px
        default:
          'bg-primary text-primary-foreground transition-[color,background-color,box-shadow,translate] duration-250 ease-out hover:-translate-y-px hover:bg-[#252525] hover:shadow-button-hover disabled:shadow-none',
        inverse:
          // Sobre fundo escuro: botão claro e sólido, sem borda
          'bg-primary-foreground text-primary transition-[color,background-color,box-shadow,translate] duration-250 ease-out hover:-translate-y-px hover:bg-[#f2efe3] hover:shadow-[0_12px_24px_-10px_rgb(0_0_0/0.75)] disabled:shadow-none',
        // Acentos da landing: verde no Entrar do header, mel no cadastro do hero
        moss: 'bg-moss text-cream transition-[color,background-color,box-shadow,translate] duration-250 ease-out hover:-translate-y-px hover:bg-[#3c4d3a] hover:shadow-button-hover disabled:shadow-none',
        honey:
          'bg-honey text-ink transition-[color,background-color,box-shadow,translate] duration-250 ease-out hover:-translate-y-px hover:bg-[#f0b43c] hover:shadow-button-hover disabled:shadow-none',
        // Contorno verde-musgo, como o Entrar da landing: sobe e ganha sombra no hover, sem inverter a cor
        outline:
          'border-moss bg-transparent text-ink transition-[color,background-color,box-shadow,translate] duration-250 ease-out hover:-translate-y-px hover:shadow-button-hover aria-expanded:bg-muted aria-expanded:text-foreground disabled:shadow-none',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-full px-2 text-xs in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-full px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs': "size-6 rounded-full in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-7 rounded-full in-data-[slot=button-group]:rounded-full',
        'icon-lg': 'size-9',
        cta: 'h-12 min-w-57.5 gap-10 px-6 text-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot='button' className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
