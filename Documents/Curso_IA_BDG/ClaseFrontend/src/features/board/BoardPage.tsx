import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mockUsers } from './mockTickets'
import type { Tag } from '@/types'
import { useBoardFilters } from './useBoardFilters'
import { useBoardStore } from '@/stores/boardStore'
import KanbanBoard from './KanbanBoard'
import BoardToolbar from './BoardToolbar'
import FilterPanel from './FilterPanel'
import TicketDrawer from '@/features/tickets/TicketDrawer'

export default function BoardPage() {
  const [searchParams] = useSearchParams()
  const tickets = useBoardStore((s) => s.tickets)
  const { updateTicket, archiveTicket, createTicket } = useBoardStore()
  const [filterOpen, setFilterOpen] = useState(false)
  const { filters, setFilters, filtered } = useBoardFilters(tickets)

  const ticketId = searchParams.get('ticket')

  const allTags = useMemo<Tag[]>(() => {
    const map = new Map<string, Tag>()
    tickets.forEach((t) => t.tags.forEach((tag) => map.set(tag.id, tag)))
    return Array.from(map.values())
  }, [tickets])

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
          <KanbanBoard tickets={filtered} />
        </div>
      </div>

      {ticketId && (
        <TicketDrawer
          ticketId={ticketId}
          ticket={tickets.find((t) => t.id === ticketId)}
          open={!!ticketId}
          users={mockUsers}
          tags={allTags}
          onUpdate={(id, values) => updateTicket(id, values, mockUsers, allTags)}
          onArchive={archiveTicket}
          onCreate={(values) => createTicket(values, mockUsers, allTags)}
        />
      )}
    </div>
  )
}
