import { api } from '@/lib/axios'
import type { AuthResponse, LoginCredentials, RegisterPayload } from '@/types'

export const authApi = {
  login: (data: LoginCredentials) => api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  me: () => api.get<AuthResponse['user']>('/auth/me').then((r) => r.data),
}
