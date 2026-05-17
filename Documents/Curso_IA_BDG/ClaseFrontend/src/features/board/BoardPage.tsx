import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mockTickets, mockUsers } from './mockTickets'
import type { Tag, Ticket } from '@/types'
import type { TicketFormValues } from '@/features/tickets/ticketSchemas'
import { useBoardFilters } from './useBoardFilters'
import KanbanBoard from './KanbanBoard'
import BoardToolbar from './BoardToolbar'
import FilterPanel from './FilterPanel'
import TicketDrawer from '@/features/tickets/TicketDrawer'

export default function BoardPage() {
  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [filterOpen, setFilterOpen] = useState(false)
  const { filters, setFilters, filtered } = useBoardFilters(tickets)

  const ticketId = searchParams.get('ticket')

  const allTags = useMemo<Tag[]>(() => {
    const map = new Map<string, Tag>()
    tickets.forEach((t) => t.tags.forEach((tag) => map.set(tag.id, tag)))
    return Array.from(map.values())
  }, [tickets])

  function handleTicketsChange(updatedVisible: Ticket[]) {
    const updatedMap = new Map(updatedVisible.map((t) => [t.id, t]))
    setTickets((prev) => prev.map((t) => updatedMap.get(t.id) ?? t))
  }

  function handleUpdate(id: string, values: TicketFormValues) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: values.title,
              description: values.description ?? '',
              status: values.status,
              priority: values.priority,
              dueDate: values.dueDate ?? null,
              assignee: values.assigneeId
                ? mockUsers.find((u) => u.id === values.assigneeId)
                : undefined,
              tags: allTags.filter((tag) => values.tagIds?.includes(tag.id)),
              version: t.version + 1,
            }
          : t
      )
    )
  }

  function handleArchive(id: string) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, archived: true } : t)))
  }

  function handleCreate(values: TicketFormValues) {
    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      title: values.title,
      description: values.description ?? '',
      status: values.status,
      priority: values.priority,
      reporter: mockUsers[0],
      assignee: values.assigneeId ? mockUsers.find((u) => u.id === values.assigneeId) : undefined,
      tags: allTags.filter((tag) => values.tagIds?.includes(tag.id)),
      dueDate: values.dueDate ?? null,
      archived: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTickets((prev) => [newTicket, ...prev])
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BoardToolbar
        filters={filters}
        onFiltersChange={setFilters}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen((o) => !o)}
      />

      <div className="flex flex-1 overflow-hidden">
        {filterOpen && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            users={mockUsers}
            tags={allTags}
          />
        )}

        <div className="flex-1 overflow-auto p-6">
          <KanbanBoard tickets={filtered} onTicketsChange={handleTicketsChange} />
        </div>
      </div>

      {ticketId && (
        <TicketDrawer
          ticketId={ticketId}
          ticket={tickets.find((t) => t.id === ticketId)}
          open={!!ticketId}
          users={mockUsers}
          tags={allTags}
          onUpdate={handleUpdate}
          onArchive={handleArchive}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
