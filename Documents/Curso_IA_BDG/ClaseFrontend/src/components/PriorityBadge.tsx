import type { TicketPriority } from '@/types'
import { cn } from '@/lib/utils'

const LABELS: Record<TicketPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

const STYLES: Record<TicketPriority, string> = {
  baja:    'bg-secondary-container text-on-secondary-container',
  media:   'bg-secondary-fixed text-on-secondary-fixed-variant',
  alta:    'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  critica: 'bg-error-container text-on-error-container',
}

interface Props {
  priority: TicketPriority
  className?: string
}

export default function PriorityBadge({ priority, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium leading-4',
        STYLES[priority],
        className
      )}
    >
      {LABELS[priority]}
    </span>
  )
}
