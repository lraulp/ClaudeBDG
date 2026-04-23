import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Ticket, Comment, MetricsSummary, User, BoardFilters, ExportFilters } from '@/types'

// ── Query keys ────────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  tickets: (filters?: BoardFilters) => ['tickets', filters] as const,
  ticket: (id: string) => ['ticket', id] as const,
  comments: (ticketId: string) => ['comments', ticketId] as const,
  metrics: (filters?: ExportFilters) => ['metrics', filters] as const,
  users: () => ['users'] as const,
  me: () => ['me'] as const,
}

// ── Current user ──────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => api.get<User>('/api/auth/me'),
    staleTime: Infinity,
  })
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export function useTickets(filters?: BoardFilters) {
  const params = new URLSearchParams()
  if (filters?.status)     filters.status.forEach(s => params.append('status', s))
  if (filters?.priority)   filters.priority.forEach(p => params.append('priority', p))
  if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId)
  if (filters?.labelIds)   filters.labelIds.forEach(l => params.append('labelIds', l))
  if (filters?.dateFrom)   params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo)     params.set('dateTo', filters.dateTo)

  const qs = params.toString()

  return useQuery({
    queryKey: QUERY_KEYS.tickets(filters),
    queryFn: () => api.get<Ticket[]>(`/api/tickets${qs ? `?${qs}` : ''}`),
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ticket(id),
    queryFn: () => api.get<Ticket>(`/api/tickets/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Ticket>) =>
      api.post<Ticket>('/api/tickets', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Ticket> & { id: string }) =>
      api.patch<Ticket>(`/api/tickets/${id}`, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
      qc.setQueryData(QUERY_KEYS.ticket(updated.id), updated)
      qc.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

export function useArchiveTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      api.patch<Ticket>(`/api/tickets/${id}`, {
        archivedAt: new Date().toISOString(),
        version,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
      qc.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

// ── Comments ──────────────────────────────────────────────────────────────────

export function useComments(ticketId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.comments(ticketId),
    queryFn: () => api.get<Comment[]>(`/api/tickets/${ticketId}/comments`),
    enabled: Boolean(ticketId),
  })
}

export function useCreateComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, body }: { ticketId: string; body: string }) =>
      api.post<Comment>(`/api/tickets/${ticketId}/comments`, { body }),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.comments(ticketId) })
    },
  })
}

export function useArchiveComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, commentId }: { ticketId: string; commentId: string }) =>
      api.patch<Comment>(`/api/tickets/${ticketId}/comments/${commentId}`, {
        archivedAt: new Date().toISOString(),
      }),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.comments(ticketId) })
    },
  })
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export function useMetrics(filters?: ExportFilters) {
  const params = new URLSearchParams()
  if (filters?.from)       params.set('from', filters.from)
  if (filters?.to)         params.set('to', filters.to)
  if (filters?.assigneeId) params.set('assignee_id', filters.assigneeId)
  filters?.status?.forEach(s => params.append('status', s))

  const qs = params.toString()

  return useQuery({
    queryKey: QUERY_KEYS.metrics(filters),
    queryFn: () =>
      api.get<MetricsSummary>(`/api/metrics${qs ? `?${qs}` : ''}`),
    // Poll every 30 seconds as per spec
    refetchInterval: 30_000,
  })
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users(),
    queryFn: () => api.get<User[]>('/api/users'),
    staleTime: 5 * 60_000, // 5 min; user list changes rarely
  })
}
