'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Passo a passo para levar o EPUB até cada leitor. Os caminhos seguem os menus em português
// de cada serviço; se algum mudar de nome, é aqui que se ajusta
const LEITORES: { title: string; steps: string[] }[] = [
  {
    title: 'Kindle',
    steps: [
      'No computador, entre em amazon.com.br/sendtokindle com a mesma conta do seu Kindle.',
      'Arraste o arquivo EPUB para a página, ou clique em Selecionar arquivos do dispositivo.',
      'Em alguns minutos o livro aparece no Kindle e no app Kindle do celular, já no formato certo.'
    ]
  },
  {
    title: 'iPhone, iPad e Mac',
    steps: [
      'No iPhone ou iPad, toque no arquivo baixado (no app Arquivos ou no e-mail) e escolha Compartilhar e depois Livros.',
      'No Mac, basta dar dois cliques no arquivo: ele abre no app Livros.',
      'Com a mesma conta Apple, o livro fica em todos os seus aparelhos.'
    ]
  },
  {
    title: 'Android e Google Play Livros',
    steps: [
      'No celular, toque no arquivo baixado, escolha Abrir com e depois Play Livros (ou Fazer upload para Play Livros).',
      'O livro fica no app Play Livros, em Biblioteca, na aba Uploads.'
    ]
  },
  {
    title: 'Kobo e outros leitores',
    steps: [
      'Ligue o leitor ao computador com o cabo USB. Ele aparece como um pen drive.',
      'Copie o arquivo EPUB para dentro dele e desconecte com segurança.'
    ]
  }
]

type ComoLerEpubProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
}

const ComoLerEpub = ({ open, onOpenChange, onDownload }: ComoLerEpubProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className='bg-background w-full gap-0 overflow-y-auto sm:max-w-md'>
      <SheetHeader className='gap-3 p-6 pt-10'>
        <SheetTitle className='font-heading text-display font-normal'>Ler no leitor digital</SheetTitle>
        <SheetDescription className='text-base'>
          O EPUB é o formato dos livros digitais. Baixe o arquivo e mande para o aparelho em que você costuma ler.
        </SheetDescription>
      </SheetHeader>

      {LEITORES.map(leitor => (
        <section key={leitor.title} className='border-border flex flex-col gap-3 border-t p-6'>
          <h3 className='text-sm font-medium'>{leitor.title}</h3>
          <ol className='text-muted-foreground flex list-decimal flex-col gap-2 pl-5 text-sm text-pretty'>
            {leitor.steps.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ))}

      <div className='border-border flex flex-col gap-3 border-t p-6'>
        <p className='text-muted-foreground text-sm text-pretty'>
          As vozes gravadas não vão dentro do arquivo: cada resposta com áudio ganha um link para ouvir pelo celular.
        </p>
        <Button type='button' variant='honey' size='cta' className='w-full' onClick={onDownload}>
          Baixar o EPUB
        </Button>
      </div>
    </SheetContent>
  </Sheet>
)

export default ComoLerEpub
