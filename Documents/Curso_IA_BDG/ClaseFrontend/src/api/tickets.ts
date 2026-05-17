import { api } from '@/lib/axios'
import type { Ticket, TicketFilters, PaginatedResponse } from '@/types'
import type { TicketFormValues } from '@/features/tickets/ticketSchemas'

export const ticketsApi = {
  list: (filters?: TicketFilters) =>
    api.get<PaginatedResponse<Ticket>>('/tickets', { params: filters }).then((r) => r.data),

  get: (id: string) => api.get<Ticket>(`/tickets/${id}`).then((r) => r.data),

  create: (data: TicketFormValues) => api.post<Ticket>('/tickets', data).then((r) => r.data),

  update: (id: string, data: Partial<TicketFormValues> & { version: number }) =>
    api.patch<Ticket>(`/tickets/${id}`, data).then((r) => r.data),

  archive: (id: string) => api.post<Ticket>(`/tickets/${id}/archive`).then((r) => r.data),
}
