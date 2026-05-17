import { format, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Props {
  dueDate: string
  className?: string
}

export default function DueDateLabel({ dueDate, className }: Props) {
  const date = new Date(dueDate)
  const overdue = isPast(date) && !isToday(date)
  const dueSoon = isToday(date)

  return (
    <span
      className={cn(
        'text-[12px] font-medium leading-4',
        overdue  && 'text-error',
        dueSoon  && 'text-tertiary',
        !overdue && !dueSoon && 'text-on-surface-variant',
        className
      )}
    >
      {format(date, 'd MMM', { locale: es })}
    </span>
  )
}
