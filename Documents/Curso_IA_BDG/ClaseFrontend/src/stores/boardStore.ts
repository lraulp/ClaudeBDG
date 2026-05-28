import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import { mockTickets } from '@/features/board/mockTickets'
import type { Tag, Ticket, TicketStatus, UserSummary } from '@/types'
import type { TicketFormValues } from '@/features/tickets/ticketSchemas'

export function simulateMoveApi(_id: string, _status: TicketStatus): Promise<void> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (Math.random() < 0.2 ? reject(new Error('error')) : resolve()), 1200)
  )
}

interface BoardState {
  tickets: Ticket[]
  moveTicket: (id: string, status: TicketStatus) => void
  reorderInColumn: (fromId: string, toId: string) => void
  updateTicket: (id: string, values: TicketFormValues, users: UserSummary[], tags: Tag[]) => void
  archiveTicket: (id: string) => void
  createTicket: (values: TicketFormValues, users: UserSummary[], tags: Tag[]) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  tickets: mockTickets,

  moveTicket: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, status, version: t.version + 1 } : t
      ),
    })),

  reorderInColumn: (fromId, toId) =>
    set((state) => {
      const from = state.tickets.findIndex((t) => t.id === fromId)
      const to = state.tickets.findIndex((t) => t.id === toId)
      if (from === -1 || to === -1) return state
      return { tickets: arrayMove(state.tickets, from, to) }
    }),

  updateTicket: (id, values, users, tags) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              title: values.title,
              description: values.description ?? '',
              status: values.status,
              priority: values.priority,
              dueDate: values.dueDate ?? undefined,
              assignee: values.assigneeId
                ? users.find((u) => u.id === values.assigneeId)
                : undefined,
              tags: tags.filter((tag) => values.tagIds?.includes(tag.id)),
              version: t.version + 1,
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    })),

  archiveTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, archived: true } : t)),
    })),

  createTicket: (values, users, tags) => {
    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      title: values.title,
      description: values.description ?? '',
      status: values.status,
      priority: values.priority,
      reporter: users[0],
      assignee: values.assigneeId
        ? users.find((u) => u.id === values.assigneeId)
        : undefined,
      tags: tags.filter((tag) => values.tagIds?.includes(tag.id)),
      dueDate: values.dueDate ?? undefined,
      archived: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({ tickets: [newTicket, ...state.tickets] }))
  },
}))
