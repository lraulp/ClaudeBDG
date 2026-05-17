import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TicketStatus } from '@/types'

const options: { value: TicketStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'hecho', label: 'Hecho' },
]

interface Props {
  value: TicketStatus
  onChange: (value: TicketStatus) => void
}

export default function StatusSelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TicketStatus)}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
