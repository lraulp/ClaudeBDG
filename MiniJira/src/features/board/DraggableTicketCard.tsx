import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TicketCard } from './TicketCard'
import type { Ticket } from '@/types'

interface Props {
  ticket: Ticket
  onClick: () => void
}

export function DraggableTicketCard({ ticket, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'none',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TicketCard
        ticket={ticket}
        onClick={isDragging ? undefined : onClick}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
