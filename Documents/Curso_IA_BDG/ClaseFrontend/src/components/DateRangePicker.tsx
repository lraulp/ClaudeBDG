import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  from?: string
  to?: string
  onChange: (from?: string, to?: string) => void
}

export default function DateRangePicker({ from, to, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[12px] font-medium leading-4 text-on-surface-variant">
          Desde
        </Label>
        <Input
          type="date"
          value={from ?? ''}
          onChange={(e) => onChange(e.target.value || undefined, to)}
          className="h-8 text-[13px] bg-surface-container border-outline-variant focus-visible:border-primary focus-visible:ring-0 text-on-surface"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[12px] font-medium leading-4 text-on-surface-variant">
          Hasta
        </Label>
        <Input
          type="date"
          value={to ?? ''}
          onChange={(e) => onChange(from, e.target.value || undefined)}
          className="h-8 text-[13px] bg-surface-container border-outline-variant focus-visible:border-primary focus-visible:ring-0 text-on-surface"
        />
      </div>
    </div>
  )
}
