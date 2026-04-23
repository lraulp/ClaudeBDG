import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableTicketCard } from './DraggableTicketCard'
import { cn } from '@/lib/utils'
import type { KanbanColumn as KanbanColumnType, Ticket } from '@/types'

interface Props {
  column: KanbanColumnType
  tickets: Ticket[]
  onTicketClick: (id: string) => void
}

export function KanbanColumn({ column, tickets, onTicketClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{ width: '280px', minWidth: '280px' }}
    >
      {/* Column header */}
      <div
        className="mb-2 flex items-center justify-between"
        style={{ padding: '0 0.25rem' }}
      >
        <span
          className="font-medium uppercase"
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.05em',
            color: 'var(--on-surface)',
            opacity: 0.5,
          }}
        >
          {column.label}
        </span>
        <span
          className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
          style={{
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
          }}
        >
          {tickets.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-2 rounded-[var(--radius-xl)] p-2 transition-colors',
          isOver
            ? 'bg-[var(--primary-container)]'
            : 'bg-[var(--surface-container-low)]',
        )}
        style={{ minHeight: '120px' }}
      >
        <SortableContext
          items={tickets.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map(ticket => (
            <DraggableTicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket.id)}
            />
          ))}
        </SortableContext>

        {tickets.length === 0 && (
          <div
            className="flex flex-1 items-center justify-center rounded-[var(--radius-md)]"
            style={{
              border: '1.5px dashed var(--outline-variant)',
              opacity: 0.35,
              minHeight: '64px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--on-surface)' }}>
              Sin tickets
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
