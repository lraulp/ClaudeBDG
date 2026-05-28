import { useState, useOptimistic, useTransition } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { Ticket, TicketStatus } from '@/types'
import { useBoardStore, simulateMoveApi } from '@/stores/boardStore'
import { toast } from 'sonner'
import TaskCard from '@/components/TaskCard'
import KanbanColumn from './KanbanColumn'

// User said to defer removing en_revision — keeping 4 columns until that task is scheduled
const COLUMN_CONFIG: { status: TicketStatus; label: string }[] = [
  { status: 'backlog',     label: 'Por hacer'   },
  { status: 'en_progreso', label: 'En progreso' },
  { status: 'en_revision', label: 'En revisión' },
  { status: 'hecho',       label: 'Listo'       },
]

const STATUSES = COLUMN_CONFIG.map((c) => c.status)

interface Props {
  tickets: Ticket[]
}

export default function KanbanBoard({ tickets }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { moveTicket, reorderInColumn } = useBoardStore()
  const [isPending, startTransition] = useTransition()

  const [optimisticTickets, addOptimistic] = useOptimistic(
    tickets,
    (state, action: { id: string; status: TicketStatus }) =>
      state.map((t) => (t.id === action.id ? { ...t, status: action.status } : t))
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeTicket = activeId ? optimisticTickets.find((t) => t.id === activeId) : null

  function openNewTicket() {
    const params = new URLSearchParams(searchParams)
    params.set('ticket', 'new')
    navigate(`/board?${params.toString()}`)
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeTicket = tickets.find((t) => t.id === activeId)
    if (!activeTicket) return

    const targetStatus: TicketStatus | undefined = STATUSES.includes(overId as TicketStatus)
      ? (overId as TicketStatus)
      : tickets.find((t) => t.id === overId)?.status

    if (!targetStatus) return

    if (targetStatus !== activeTicket.status) {
      // Cross-column move: optimistic update + simulated async backend
      startTransition(async () => {
        addOptimistic({ id: activeId, status: targetStatus })
        try {
          await simulateMoveApi(activeId, targetStatus)
          moveTicket(activeId, targetStatus)
        } catch {
          toast.error('No se pudo mover el ticket')
          // useOptimistic reverts automatically — store was not updated
        }
      })
    } else {
      // Same-column reorder: synchronous, no backend call needed
      const overTicket = tickets.find((t) => t.id === overId)
      if (overTicket) reorderInColumn(activeId, overId)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`flex gap-4 h-full overflow-x-auto pb-2 transition-opacity ${
          isPending ? 'opacity-75' : 'opacity-100'
        }`}
      >
        {COLUMN_CONFIG.map(({ status, label }) => (
          <KanbanColumn
            key={status}
            id={status}
            label={label}
            tickets={optimisticTickets.filter((t) => t.status === status)}
            onAddTicket={openNewTicket}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeTicket && (
          <div className="rotate-1 scale-105 shadow-[0px_8px_24px_rgba(0,0,0,0.12)] rounded-md opacity-95">
            <TaskCard ticket={activeTicket} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
