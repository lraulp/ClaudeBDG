import { cn } from '@/lib/utils'
import { PriorityBadge, BlockedBadge, Avatar } from '@/components/common'
import type { Ticket } from '@/types'

interface Props {
  ticket: Ticket
  isDragging?: boolean
  onClick?: () => void
  style?: React.CSSProperties
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function TicketCard({
  ticket,
  isDragging = false,
  onClick,
  style,
  dragHandleProps,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem',
        boxShadow: isDragging ? '0px 16px 40px rgba(12, 14, 16, 0.10)' : 'var(--shadow-ambient)',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isDragging ? 0.95 : 1,
        transform: isDragging ? 'rotate(1.5deg)' : undefined,
        transition: 'box-shadow 0.15s ease',
        ...style,
      }}
      className={cn(
        'group flex flex-col gap-2',
        !isDragging && onClick && 'hover:shadow-[0px_8px_24px_rgba(12,14,16,0.07)]',
      )}
      {...dragHandleProps}
    >
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={ticket.priority} />
        {ticket.isBlocked && <BlockedBadge />}
      </div>

      {/* Title */}
      <p
        className="font-medium leading-snug"
        style={{ fontSize: '0.8125rem', color: 'var(--on-surface)' }}
      >
        {ticket.title}
      </p>

      {/* Labels */}
      {ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ticket.labels.slice(0, 3).map(label => (
            <span
              key={label}
              className="rounded px-1.5 py-0.5"
              style={{
                fontSize: '0.625rem',
                background: 'var(--surface-container-high)',
                color: 'var(--on-surface)',
                opacity: 0.8,
              }}
            >
              {label}
            </span>
          ))}
          {ticket.labels.length > 3 && (
            <span
              className="rounded px-1.5 py-0.5"
              style={{
                fontSize: '0.625rem',
                background: 'var(--surface-container-high)',
                color: 'var(--on-surface)',
                opacity: 0.5,
              }}
            >
              +{ticket.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: ticket ID + assignees */}
      <div className="flex items-center justify-between">
        <span
          className="font-medium uppercase"
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.05em',
            color: 'var(--on-surface)',
            opacity: 0.35,
          }}
        >
          ISSUE-{ticket.id.slice(0, 6).toUpperCase()}
        </span>

        {ticket.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {ticket.assignees.slice(0, 3).map(user => (
              <Avatar key={user.id} name={user.name} avatarUrl={user.avatarUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
