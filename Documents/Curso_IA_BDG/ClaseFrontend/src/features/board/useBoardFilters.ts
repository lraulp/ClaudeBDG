import { useState, useMemo } from 'react'
import type { Ticket, TicketFilters } from '@/types'

export function useBoardFilters(tickets: Ticket[]) {
  const [filters, setFilters] = useState<TicketFilters>({})

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (t.archived) return false
      if (filters.status?.length && !filters.status.includes(t.status)) return false
      if (filters.priority?.length && !filters.priority.includes(t.priority)) return false
      if (filters.assigneeId && t.assignee?.id !== filters.assigneeId) return false
      if (filters.tagIds?.length && !filters.tagIds.some((id) => t.tags.some((tag) => tag.id === id)))
        return false
      if (filters.dueDateFrom) {
        const from = new Date(filters.dueDateFrom)
        if (!t.dueDate || new Date(t.dueDate) < from) return false
      }
      if (filters.dueDateTo) {
        const to = new Date(filters.dueDateTo)
        to.setHours(23, 59, 59, 999)
        if (!t.dueDate || new Date(t.dueDate) > to) return false
      }
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q))
          return false
      }
      return true
    })
  }, [tickets, filters])

  return { filters, setFilters, filtered }
}
