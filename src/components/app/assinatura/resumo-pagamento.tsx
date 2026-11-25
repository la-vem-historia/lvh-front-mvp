import type { ReactNode } from 'react'

import { ArrowUpRightIcon, HomeIcon, RadioTowerIcon, ShieldCheckIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { GRACE_DAYS } from '@/lib/lvh/assinatura'

const Block = ({ Icon, title, children }: { Icon: LucideIcon; title: string; children: ReactNode }) => (
  <section className='border-border flex flex-col gap-3 border-t pt-5 first:border-t-0 first:pt-0'>
    <h3 className='flex items-center gap-2 text-sm font-medium'>
      <Icon aria-hidden='true' className='size-4' strokeWidth={1.75} />
      {title}
    </h3>
    {children}
  </section>
)

const Item = ({ label, children }: { label: string; children: ReactNode }) => (
  <li className='flex flex-col gap-0.5'>
    <span className='font-medium'>{label}</span>
    <span className='text-muted-foreground text-pretty'>{children}</span>
  </li>
)

// O resumo de como o pagamento funciona, ao lado dos estados: quando vai ao provedor, o que não sai do app,
// quem muda o estado e os cuidados. Mudou a regra no código, muda aqui
const ResumoPagamento = () => (
  <div className='bg-sand flex flex-col gap-5 rounded-2xl p-6 text-sm'>
    <div className='flex flex-col gap-1'>
      <span className='text-xs font-medium uppercase'>Resumo</span>
      <h2 className='font-heading text-2xl'>Como o pagamento funciona</h2>
    </div>

    <Block Icon={ArrowUpRightIcon} title='Quando vamos ao provedor'>
      <ul className='flex flex-col gap-3'>
        <Item label='Assinar'>
          “Assinar o anual / o mensal”, na página Assinatura ou no paywall. Vai para o checkout e volta para
          /app/assinatura.
        </Item>
        <Item label='Cartão recusado'>“Usar outro cartão” abre o portal do provedor para trocar o cartão.</Item>
        <Item label='Comprar presente'>Pagamento único em /presente. Aceita cartão e Pix.</Item>
      </ul>
      <p className='text-muted-foreground text-pretty'>
        O plano é escolhido no app. Só vamos ao provedor no clique de pagar.
      </p>
    </Block>

    <Block Icon={HomeIcon} title='Sem sair do app'>
      <ul className='text-muted-foreground flex list-disc flex-col gap-1 pl-5'>
        <li>Mudar para o anual (vale na renovação)</li>
        <li>Cancelar e manter a assinatura</li>
        <li>Adicionar vaga (cobra no cartão salvo)</li>
      </ul>
    </Block>

    <Block Icon={RadioTowerIcon} title='Quem muda o estado: o webhook'>
      <ul className='flex flex-col gap-1.5'>
        <li>
          Pagamento aprovado → <strong className='font-medium'>Ativa</strong>
        </li>
        <li>
          Pagamento recusado → <strong className='font-medium'>Cartão recusado</strong> ({GRACE_DAYS} dias de novas
          tentativas)
        </li>
        <li>
          Assinatura encerrada → <strong className='font-medium'>Encerrada</strong>
        </li>
      </ul>
      <p className='text-muted-foreground text-pretty'>
        A volta do checkout só mostra “confirmando o pagamento…”. Quem muda o estado é o aviso do provedor.
      </p>
    </Block>

    <Block Icon={ShieldCheckIcon} title='Cuidados'>
      <ul className='flex flex-col gap-3'>
        <Item label='Teste sem cartão'>
          A assinatura no provedor só nasce no Assinar. Assinou no teste: primeira cobrança no dia em que o teste
          acabaria (trial_end). As 14 respostas são regra só nossa.
        </Item>
        <Item label='Checkout hospedado'>
          O cartão é digitado na página do provedor e nunca passa pelo nosso servidor. Quase nada de PCI do nosso lado.
        </Item>
        <Item label='CPF para a nota fiscal'>
          Pedido no checkout, obrigatório, com os dígitos conferidos. Volta no webhook e fica na conta: o próximo
          checkout vem preenchido e dá para corrigir em Assinatura. No presente, a nota sai para quem comprou. No
          Stripe, ligar o tax_id_collection; Pagar.me e Mercado Pago já pedem.
        </Item>
        <Item label='Pix e boleto'>
          Pix serve para o que é pago de uma vez (anual, presente). O mensal recorrente fica no cartão, a menos que o
          provedor tenha Pix Automático.
        </Item>
      </ul>
    </Block>

    <p className='text-muted-foreground border-border border-t pt-5 text-xs text-pretty'>
      Provedor ainda não escolhido (Stone/Pagar.me, Mercado Pago, Stripe). No protótipo, o checkout é simulado em
      /checkout e o webhook é uma fila no navegador: src/lib/lvh/pagamento.ts.
    </p>
  </div>
)

export default ResumoPagamento
