import { create } from 'zustand'
import type { User } from '@/types'
import { setAccessToken, clearSession as clearApiSession } from '@/lib/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  isHydrating: boolean

  setSession: (user: User, accessToken: string) => void
  clearSession: () => void
  setHydrating: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: sessionStorage.getItem('access_token'),
  isHydrating: true,

  setSession: (user, accessToken) => {
    setAccessToken(accessToken)
    set({ user, accessToken })
  },

  clearSession: () => {
    clearApiSession()
    set({ user: null, accessToken: null })
  },

  setHydrating: (value) => set({ isHydrating: value }),
}))
