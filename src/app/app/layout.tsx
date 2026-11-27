import AppHeader from '@/components/app/app-header'
import { SessionProvider } from '@/components/app/session'
import { AccessProvider } from '@/components/app/assinatura/acesso'
import AvisoAssinatura from '@/components/app/assinatura/aviso'

export default function AppLayout({ children }: LayoutProps<'/app'>) {
  return (
    <SessionProvider>
      <AccessProvider>
        <div className='flex min-h-svh flex-col'>
          <AppHeader />
          {/* Aviso da assinatura (teste acabando, cartão recusado...), logo abaixo do header */}
          <AvisoAssinatura />
          <main className='flex flex-1 flex-col'>{children}</main>
        </div>
      </AccessProvider>
    </SessionProvider>
  )
}
