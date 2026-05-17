import { Check } from 'lucide-react'
import type { Tag, TicketFilters, TicketPriority, TicketStatus, UserSummary } from '@/types'
import UserAvatar from '@/components/UserAvatar'
import DateRangePicker from '@/components/DateRangePicker'
import { cn } from '@/lib/utils'

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'backlog',     label: 'Por hacer'   },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'hecho',       label: 'Listo'       },
]

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'critica', label: 'Crítica' },
  { value: 'alta',    label: 'Alta'    },
  { value: 'media',   label: 'Media'   },
  { value: 'baja',    label: 'Baja'    },
]

interface Props {
  filters: TicketFilters
  onFiltersChange: (f: TicketFilters) => void
  users?: UserSummary[]
  tags?: Tag[]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium leading-4 tracking-[0.06em] uppercase text-on-surface-variant mb-2">
      {children}
    </p>
  )
}

function CheckRow({
  active,
  onToggle,
  children,
}: {
  active: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2.5 w-full text-left px-1 py-1 rounded hover:bg-surface-container-high transition-colors"
    >
      <div
        className={cn(
          'h-4 w-4 flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors',
          active ? 'bg-primary border-primary' : 'border-outline bg-surface-container-lowest'
        )}
      >
        {active && <Check size={10} className="text-on-primary stroke-[3]" />}
      </div>
      <span className="text-[15px] font-normal leading-[22px] tracking-[-0.012em] text-on-surface">
        {children}
      </span>
    </button>
  )
}

function toggle<T>(arr: T[] | undefined, value: T): T[] | undefined {
  const current = arr ?? []
  const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value]
  return next.length ? next : undefined
}

export default function FilterPanel({ filters, onFiltersChange, users = [], tags = [] }: Props) {
  const activeCount = [
    filters.status?.length,
    filters.priority?.length,
    filters.assigneeId,
    filters.tagIds?.length,
    filters.dueDateFrom,
    filters.dueDateTo,
  ].filter(Boolean).length

  function clearAll() {
    onFiltersChange({ search: filters.search })
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-outline-variant bg-surface-container-low overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
        <span className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-on-surface">
          Filtros
          {activeCount > 0 && (
            <span className="ml-1.5 text-on-surface-variant">({activeCount})</span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-primary hover:text-primary-container transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Secciones */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        {/* Estado */}
        <section>
          <SectionTitle>Estado</SectionTitle>
          <div className="flex flex-col gap-0.5">
            {STATUSES.map((s) => (
              <CheckRow
                key={s.value}
                active={filters.status?.includes(s.value) ?? false}
                onToggle={() => onFiltersChange({ ...filters, status: toggle(filters.status, s.value) })}
              >
                {s.label}
              </CheckRow>
            ))}
          </div>
        </section>

        <div className="border-t border-outline-variant" />

        {/* Prioridad */}
        <section>
          <SectionTitle>Prioridad</SectionTitle>
          <div className="flex flex-col gap-0.5">
            {PRIORITIES.map((p) => (
              <CheckRow
                key={p.value}
                active={filters.priority?.includes(p.value) ?? false}
                onToggle={() => onFiltersChange({ ...filters, priority: toggle(filters.priority, p.value) })}
              >
                {p.label}
              </CheckRow>
            ))}
          </div>
        </section>

        {users.length > 0 && (
          <>
            <div className="border-t border-outline-variant" />

            {/* Asignado */}
            <section>
              <SectionTitle>Asignado a</SectionTitle>
              <div className="flex flex-col gap-0.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        assigneeId: filters.assigneeId === u.id ? undefined : u.id,
                      })
                    }
                    className="flex items-center gap-2.5 w-full text-left px-1 py-1 rounded hover:bg-surface-container-high transition-colors"
                  >
                    <div
                      className={cn(
                        'h-4 w-4 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors',
                        filters.assigneeId === u.id
                          ? 'bg-primary border-primary'
                          : 'border-outline bg-surface-container-lowest'
                      )}
                    >
                      {filters.assigneeId === u.id && (
                        <div className="h-2 w-2 rounded-full bg-on-primary" />
                      )}
                    </div>
                    <UserAvatar user={u} size="sm" />
                    <span className="text-[15px] font-normal leading-[22px] tracking-[-0.012em] text-on-surface truncate">
                      {u.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {tags.length > 0 && (
          <>
            <div className="border-t border-outline-variant" />

            {/* Etiquetas */}
            <section>
              <SectionTitle>Etiquetas</SectionTitle>
              <div className="flex flex-col gap-0.5">
                {tags.map((tag) => (
                  <CheckRow
                    key={tag.id}
                    active={filters.tagIds?.includes(tag.id) ?? false}
                    onToggle={() =>
                      onFiltersChange({ ...filters, tagIds: toggle(filters.tagIds, tag.id) })
                    }
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                  </CheckRow>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="border-t border-outline-variant" />

        {/* Fecha de vencimiento */}
        <section>
          <SectionTitle>Fecha de vencimiento</SectionTitle>
          <DateRangePicker
            from={filters.dueDateFrom}
            to={filters.dueDateTo}
            onChange={(from, to) => onFiltersChange({ ...filters, dueDateFrom: from, dueDateTo: to })}
          />
        </section>
      </div>
    </aside>
  )
}
