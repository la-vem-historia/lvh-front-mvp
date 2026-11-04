import AppHeader from '@/components/app/app-header'
import { SessionProvider } from '@/components/app/session'

export default function AppLayout({ children }: LayoutProps<'/app'>) {
  return (
    <SessionProvider>
      <div className='flex min-h-svh flex-col'>
        <AppHeader />
        <main className='flex flex-1 flex-col'>{children}</main>
      </div>
    </SessionProvider>
  )
}
