'use client'

import { createContext, use, useEffect, useState, type ReactNode } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { getCurrentUser, updateUser } from '@/lib/lvh/api'
import type { User, UserChanges } from '@/lib/lvh/types'

const ONBOARDING_PATH = '/app/boas-vindas'

type Session = {
  user: User
  update: (changes: UserChanges) => Promise<User>
  // Relê a conta depois de criar, abrir ou excluir um livro
  refresh: () => Promise<User | null>
}

const SessionContext = createContext<Session | null>(null)

// Guarda das páginas do app: sem sessão, volta para /entrar; sem onboarding, vai para ele
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true

    getCurrentUser().then(current => {
      if (!active) return
      if (current) setUser(current)
      else router.replace('/entrar')
    })

    return () => {
      active = false
    }
  }, [router])

  const needsOnboarding = Boolean(user && !user.onboarded && pathname !== ONBOARDING_PATH)

  useEffect(() => {
    if (needsOnboarding) router.replace(ONBOARDING_PATH)
  }, [needsOnboarding, router])

  if (!user || needsOnboarding) return null

  const update = async (changes: UserChanges) => {
    const next = await updateUser(changes)

    setUser(next)

    return next
  }

  const refresh = async () => {
    const next = await getCurrentUser()

    if (next) setUser(next)

    return next
  }

  return <SessionContext value={{ user, update, refresh }}>{children}</SessionContext>
}

const useSession = () => {
  const session = use(SessionContext)

  if (!session) throw new Error('useSession precisa estar dentro do SessionProvider')

  return session
}

export const useUser = () => useSession().user

export const useUpdateUser = () => useSession().update

export const useRefreshUser = () => useSession().refresh
