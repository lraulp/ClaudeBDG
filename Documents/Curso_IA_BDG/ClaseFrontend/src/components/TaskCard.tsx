import { cva } from 'class-variance-authority'
import { isPast, isToday } from 'date-fns'
import type { Ticket } from '@/types'
import { cn } from '@/lib/utils'
import PriorityBadge from './PriorityBadge'
import TagBadge from './TagBadge'
import UserAvatar from './UserAvatar'
import DueDateLabel from './DueDateLabel'
import EditingIndicator from './EditingIndicator'

const cardVariants = cva(
  [
    'bg-surface-container-lowest rounded-md border border-outline-variant p-3',
    'shadow-[0px_4px_12px_rgba(0,0,0,0.05)]',
    'hover:border-primary/40 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)]',
    'transition-all select-none',
  ].join(' '),
  {
    variants: {
      priority: {
        baja:    'cursor-pointer',
        media:   'cursor-pointer',
        alta:    'cursor-pointer border-l-2 border-l-tertiary',
        critica: 'cursor-pointer border-l-2 border-l-error',
      },
      dragging: {
        true:  'opacity-40 cursor-grabbing',
        false: '',
      },
    },
    defaultVariants: { priority: 'baja', dragging: false },
  }
)

interface Props {
  ticket: Ticket
  dragging?: boolean
  onClick?: () => void
}

export default function TaskCard({ ticket, dragging = false, onClick }: Props) {
  const isOverdue =
    !!ticket.dueDate &&
    isPast(new Date(ticket.dueDate)) &&
    !isToday(new Date(ticket.dueDate)) &&
    ticket.status !== 'hecho'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        cardVariants({ priority: ticket.priority, dragging }),
        isOverdue && 'border-l-2 border-l-error'
      )}
    >
      {ticket.editingBy && (
        <div className="mb-2">
          <EditingIndicator user={ticket.editingBy} />
        </div>
      )}

      <p className="text-[15px] font-normal leading-[22px] tracking-[-0.012em] text-on-surface mb-2">
        {ticket.title}
      </p>

      <div className="flex items-center gap-1 flex-wrap mb-3">
        <PriorityBadge priority={ticket.priority} />
        {ticket.tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>

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
