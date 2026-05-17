import { api } from '@/lib/axios'
import type { UserSummary, Role } from '@/types'

export const usersApi = {
  list: () => api.get<UserSummary[]>('/users').then((r) => r.data),

  updateRole: (id: string, role: Role) =>
    api.patch<UserSummary>(`/users/${id}`, { role }).then((r) => r.data),

  setActive: (id: string, active: boolean) =>
    api.patch<UserSummary>(`/users/${id}`, { active }).then((r) => r.data),
}
