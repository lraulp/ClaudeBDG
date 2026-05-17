import type { TicketStatus } from '@/types'
import { cn } from '@/lib/utils'

const LABELS: Record<TicketStatus, string> = {
  backlog:     'Por hacer',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  hecho:       'Listo',
}

const STYLES: Record<TicketStatus, string> = {
  backlog:     'bg-surface-container-high text-on-surface-variant',
  en_progreso: 'bg-primary-fixed text-on-primary-fixed-variant',
  en_revision: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  hecho:       'bg-primary-fixed-dim text-on-primary-fixed',
}

interface Props {
  status: TicketStatus
  className?: string
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium leading-4',
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  )
}
