import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TicketFilters } from '@/types'

interface Props {
  filters: TicketFilters
  onFiltersChange: (f: TicketFilters) => void
  filterOpen: boolean
  onFilterToggle: () => void
}

export default function BoardToolbar({ filters, onFiltersChange, filterOpen, onFilterToggle }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  function openNewTicket() {
    const params = new URLSearchParams(searchParams)
    params.set('ticket', 'new')
    navigate(`/board?${params.toString()}`)
  }

  const activeFilters = [
    filters.status?.length,
    filters.priority?.length,
    filters.assigneeId,
    filters.tagIds?.length,
  ].filter(Boolean).length

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-outline-variant bg-surface-container-lowest">
      {/* Búsqueda */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
        <Input
          placeholder="Buscar tickets…"
          className="pl-9 h-8 text-[13px] bg-surface-container border-outline-variant focus-visible:border-primary focus-visible:ring-0 placeholder:text-on-surface-variant"
          value={filters.search ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Toggle filtros */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterToggle}
          className={[
            'h-8 gap-1.5 text-[13px] font-medium border-outline-variant',
            filterOpen
              ? 'bg-primary-fixed text-primary border-primary/30'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
          ].join(' ')}
        >
          <SlidersHorizontal size={14} />
          Filtros
          {activeFilters > 0 && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-semibold">
              {activeFilters}
            </span>
          )}
        </Button>

        {/* Crear ticket */}
        <Button
          size="sm"
          onClick={openNewTicket}
          className="h-8 gap-1.5 text-[13px] font-medium bg-primary text-on-primary hover:bg-primary-container"
        >
          <Plus size={14} />
          Nuevo ticket
        </Button>
      </div>
    </div>
  )
}
