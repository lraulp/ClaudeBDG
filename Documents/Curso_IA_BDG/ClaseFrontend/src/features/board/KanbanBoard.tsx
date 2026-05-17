import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Ticket, TicketStatus } from '@/types'
import KanbanColumn from './KanbanColumn'
import TicketCard from './TicketCard'

// User said to defer removing en_revision — keeping 4 columns until that task is scheduled
const COLUMNS: TicketStatus[] = ['backlog', 'en_progreso', 'en_revision', 'hecho']

interface Props {
  tickets: Ticket[]
  onTicketsChange: (tickets: Ticket[]) => void
}

export default function KanbanBoard({ tickets, onTicketsChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeTicket = activeId ? tickets.find((t) => t.id === activeId) : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeTicket = tickets.find((t) => t.id === activeId)
    if (!activeTicket) return

    // Resolve target column: either dragging over a column or over another card
    const targetStatus: TicketStatus | undefined = COLUMNS.includes(overId as TicketStatus)
      ? (overId as TicketStatus)
      : tickets.find((t) => t.id === overId)?.status

    if (!targetStatus || targetStatus === activeTicket.status) return

    // Move to new column, placing the card at the position of the over card
    const overIndex = tickets.findIndex((t) => t.id === overId)
    const activeIndex = tickets.findIndex((t) => t.id === activeId)

    const updated = tickets.map((t) =>
      t.id === activeId ? { ...t, status: targetStatus, version: t.version + 1 } : t
    )

    // If over a card (not a column drop zone), place after it
    if (!COLUMNS.includes(overId as TicketStatus) && overIndex !== -1) {
      onTicketsChange(arrayMove(updated, activeIndex, overIndex))
    } else {
      onTicketsChange(updated)
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeTicket = tickets.find((t) => t.id === activeId)
    if (!activeTicket) return

    // Reorder within the same column
    if (!COLUMNS.includes(overId as TicketStatus)) {
      const overTicket = tickets.find((t) => t.id === overId)
      if (overTicket && overTicket.status === activeTicket.status) {
        const oldIndex = tickets.findIndex((t) => t.id === activeId)
        const newIndex = tickets.findIndex((t) => t.id === overId)
        onTicketsChange(arrayMove(tickets, oldIndex, newIndex))
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-2">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={tickets.filter((t) => t.status === status)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeTicket && (
          <div className="rotate-1 scale-105 shadow-[0px_8px_24px_rgba(0,0,0,0.12)] rounded-md opacity-95">
            <TicketCard ticket={activeTicket} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
