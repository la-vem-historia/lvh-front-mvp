import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import {
  deleteAccount as apiDeleteAccount,
  getCurrentUser,
  signOut as apiSignOut,
  updateUser as apiUpdateUser
} from '@lvh/api'
import type { User, UserChanges } from '@lvh/types'

import { deleteAllMedia } from '@/lib/media'

type Session = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  updateUser: (changes: UserChanges) => Promise<User>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  const updateUser = async (changes: UserChanges) => {
    const next = await apiUpdateUser(changes)

    setUser(next)

    return next
  }

  const signOut = async () => {
    await apiSignOut()
    setUser(null)
  }

  // A exclusão da API percorre as chaves com Object.keys, que o localStorage do app não lista. Aqui elas são
  // apagadas uma a uma, junto com as fotos e os áudios guardados no aparelho
  const deleteAccount = async () => {
    await apiDeleteAccount()

    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))

    keys.filter(key => key?.startsWith('lvh:')).forEach(key => localStorage.removeItem(key as string))
    deleteAllMedia()
    setUser(null)
  }

  return (
    <SessionContext value={{ user, loading, setUser, updateUser, signOut, deleteAccount }}>{children}</SessionContext>
  )
}

export function useSession() {
  const session = useContext(SessionContext)

  if (!session) throw new Error('useSession fora do SessionProvider')

  return session
}
