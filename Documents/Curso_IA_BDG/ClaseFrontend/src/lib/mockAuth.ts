import type { UserSummary } from '@/types'

export const MOCK_USERS: { user: UserSummary; token: string }[] = [
  {
    token: 'mock-token-admin',
    user: {
      id: 'user-1',
      name: 'Ana Gómez',
      handle: 'ana',
      role: 'admin',
      active: true,
    },
  },
  {
    token: 'mock-token-usuario',
    user: {
      id: 'user-2',
      name: 'Carlos Ruiz',
      handle: 'carlos',
      role: 'usuario',
      active: true,
    },
  },
]
