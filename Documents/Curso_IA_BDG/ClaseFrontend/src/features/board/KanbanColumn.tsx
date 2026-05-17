import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Ticket, TicketStatus } from '@/types'
import TicketCard from './TicketCard'
import { cn } from '@/lib/utils'

const COLUMN_LABELS: Record<TicketStatus, string> = {
  backlog: 'Por hacer',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  hecho: 'Listo',
}

interface Props {
  status: TicketStatus
  tickets: Ticket[]
}

export default function KanbanColumn({ status, tickets }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  function openNewTicket() {
    const params = new URLSearchParams(searchParams)
    params.set('ticket', 'new')
    navigate(`/board?${params.toString()}`)
  }

  return (
    <div className="flex flex-col w-72 flex-shrink-0 rounded-lg overflow-hidden border border-outline-variant">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-surface-container">
        <h3 className="text-[20px] font-semibold leading-[25px] tracking-[-0.017em] text-on-surface">
          {COLUMN_LABELS[status]}
        </h3>
        <span className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full tabular-nums">
          {tickets.length}
        </span>
      </div>

      {/* Drop zone */}
      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2 flex-1 min-h-32 p-2 transition-colors',
            isOver ? 'bg-primary-fixed' : 'bg-surface-container-low'
          )}
        >
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </SortableContext>

      {/* Agregar ticket inline */}
      <button
        onClick={openNewTicket}
        className="flex items-center gap-1.5 w-full px-3 py-2 bg-surface-container-low border-t border-outline-variant text-[13px] font-medium tracking-[-0.006em] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
      >
        <Plus size={14} />
        Agregar ticket
      </button>
    </div>
  )
}
