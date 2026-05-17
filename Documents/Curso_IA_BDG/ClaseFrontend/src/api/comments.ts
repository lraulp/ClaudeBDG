import { api } from '@/lib/axios'
import type { Comment } from '@/types'

export const commentsApi = {
  list: (ticketId: string) =>
    api.get<Comment[]>(`/tickets/${ticketId}/comments`).then((r) => r.data),

  create: (ticketId: string, body: string) =>
    api.post<Comment>(`/tickets/${ticketId}/comments`, { body }).then((r) => r.data),
}
