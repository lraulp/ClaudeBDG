import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isPast, isToday } from 'date-fns'
import type { Ticket } from '@/types'
import PriorityBadge from '@/components/PriorityBadge'
import TagBadge from '@/components/TagBadge'
import UserAvatar from '@/components/UserAvatar'
import DueDateLabel from '@/components/DueDateLabel'
import EditingIndicator from '@/components/EditingIndicator'
import { cn } from '@/lib/utils'

interface Props {
  ticket: Ticket
}

export default function TicketCard({ ticket }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  })

  const isOverdue =
    !!ticket.dueDate &&
    isPast(new Date(ticket.dueDate)) &&
    !isToday(new Date(ticket.dueDate)) &&
    ticket.status !== 'hecho'

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
      onClick={open}
      className={cn(
        'bg-surface-container-lowest rounded-md border border-outline-variant p-3 cursor-pointer',
        'shadow-[0px_4px_12px_rgba(0,0,0,0.05)]',
        'hover:border-primary/40 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all',
        isOverdue && 'border-l-2 border-l-error',
        isDragging && 'opacity-40'
      )}
    >
      {/* Indicador de edición activa */}
      {ticket.editingBy && (
        <div className="mb-2">
          <EditingIndicator user={ticket.editingBy} />
        </div>
      )}

      {/* Título */}
      <p className="text-[15px] font-normal leading-[22px] tracking-[-0.012em] text-on-surface mb-2">
        {ticket.title}
      </p>

      {/* Badges: prioridad + etiquetas */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        <PriorityBadge priority={ticket.priority} />
        {ticket.tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>

      {/* Footer: avatar + fecha */}
      <div className="flex items-center justify-between">
        {ticket.assignee ? (
          <UserAvatar user={ticket.assignee} size="sm" />
        ) : (
          <span className="text-[12px] leading-4 text-on-surface-variant">Sin asignar</span>
        )}
        {ticket.dueDate && <DueDateLabel dueDate={ticket.dueDate} />}
      </div>
    </div>
  )
}
