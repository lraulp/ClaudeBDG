import { useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { toast } from 'sonner'
import { useBoardFilterStore } from './boardFilterStore'
import { KanbanColumn } from './KanbanColumn'
import { TicketCard } from './TicketCard'
import { TicketDetailPanel } from '@/features/tickets/TicketDetailPanel'
import { useTickets, useUpdateTicket } from '@/hooks'
import { ApiError } from '@/lib/api'
import { KANBAN_COLUMNS } from '@/types'
import type { Ticket, TicketStatus } from '@/types'

export function BoardPage() {
  const { ticketId } = useParams<{ ticketId?: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { filters, initFromSearchParams, toSearchParams } = useBoardFilterStore()

  // Init filters from URL on mount
  useEffect(() => {
    initFromSearchParams(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync filter changes back to URL
  const syncToUrl = useCallback(() => {
    setSearchParams(toSearchParams(), { replace: true })
  }, [toSearchParams, setSearchParams])

  useEffect(() => {
    syncToUrl()
  }, [filters, syncToUrl])

  const { data: tickets = [], isLoading } = useTickets(filters)
  const updateTicket = useUpdateTicket()

  // Active drag state
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find(t => t.id === event.active.id)
    setActiveTicket(ticket ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTicket(null)
    const { active, over } = event
    if (!over) return

    const ticket = tickets.find(t => t.id === active.id)
    const newStatus = over.id as TicketStatus

    if (!ticket || ticket.status === newStatus) return

    updateTicket.mutate(
      { id: ticket.id, status: newStatus, version: ticket.version },
      {
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            toast.error('Conflicto: el ticket fue modificado por otro usuario.')
          } else {
            toast.error('Ocurrió un error. Intenta de nuevo.')
          }
        },
      },
    )
  }

  // Group tickets by status (exclude archived)
  const ticketsByStatus = KANBAN_COLUMNS.reduce<Record<TicketStatus, Ticket[]>>(
    (acc, col) => {
      acc[col.id] = tickets.filter(t => t.status === col.id && !t.archivedAt)
      return acc
    },
    {} as Record<TicketStatus, Ticket[]>,
  )

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Page header ────────────────────────────────────── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', borderBottom: 'none' }}
      >
        <div>
          <h1
            className="font-semibold tracking-tight"
            style={{ fontSize: '1.125rem', color: 'var(--on-surface)' }}
          >
            Tablero
          </h1>
          <p
            style={{ fontSize: '0.75rem', color: 'var(--on-surface)', opacity: 0.45, marginTop: '0.125rem' }}
          >
            {tickets.filter(t => !t.archivedAt).length} tickets activos
          </p>
        </div>

        <button
          onClick={() => navigate('/board/new')}
          className="btn-primary flex items-center gap-1.5"
          style={{ fontSize: '0.8125rem' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Nuevo ticket
        </button>
      </div>

      {/* ── Board ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#005bbf] border-t-transparent" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Scrollable columns */}
            <div
              className="flex gap-4 overflow-x-auto p-4"
              style={{ flex: 1, alignItems: 'flex-start', paddingLeft: '1.5rem' }}
            >
              {KANBAN_COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tickets={ticketsByStatus[col.id]}
                  onTicketClick={(id) => navigate(`/board/${id}`)}
                />
              ))}
            </div>

            {/* Drag overlay — floating clone */}
            <DragOverlay>
              {activeTicket ? (
                <TicketCard ticket={activeTicket} isDragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* ── Ticket detail panel ─────────────────────────── */}
        {ticketId && ticketId !== 'new' && (
          <TicketDetailPanel
            ticketId={ticketId}
            onClose={() => navigate('/board')}
          />
        )}
      </div>
    </div>
  )
}
