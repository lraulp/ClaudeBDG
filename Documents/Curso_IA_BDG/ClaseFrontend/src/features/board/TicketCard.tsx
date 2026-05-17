import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Ticket } from '@/types'
import TaskCard from '@/components/TaskCard'

interface Props {
  ticket: Ticket
}

export default function TicketCard({ ticket }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  })

  function open() {
    const params = new URLSearchParams(searchParams)
    params.set('ticket', ticket.id)
    navigate(`/board?${params.toString()}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <TaskCard ticket={ticket} dragging={isDragging} onClick={open} />
    </div>
  )
}
