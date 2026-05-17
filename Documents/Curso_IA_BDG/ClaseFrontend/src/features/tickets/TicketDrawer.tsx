import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Tag, Ticket, UserSummary } from '@/types'
import type { TicketFormValues } from './ticketSchemas'
import StatusBadge from '@/components/StatusBadge'
import EditingIndicator from '@/components/EditingIndicator'
import TicketForm from './TicketForm'
import CommentSection from '@/features/comments/CommentSection'

interface Props {
  ticketId: string
  ticket?: Ticket
  open: boolean
  users?: UserSummary[]
  tags?: Tag[]
  onUpdate?: (ticketId: string, values: TicketFormValues) => void
  onArchive?: (ticketId: string) => void
  onCreate?: (values: TicketFormValues) => void
}

export default function TicketDrawer({
  ticketId,
  ticket,
  open,
  users = [],
  tags = [],
  onUpdate,
  onArchive,
  onCreate,
}: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isNew = ticketId === 'new'

  function handleClose() {
    const params = new URLSearchParams(searchParams)
    params.delete('ticket')
    const qs = params.toString()
    navigate(qs ? `/board?${qs}` : '/board', { replace: true })
  }

  function handleSubmit(values: TicketFormValues) {
    if (isNew) {
      onCreate?.(values)
    } else if (ticket) {
      onUpdate?.(ticket.id, values)
    }
    handleClose()
  }

  function handleArchive() {
    if (ticket) {
      onArchive?.(ticket.id)
      handleClose()
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] flex flex-col p-0 bg-surface-container-lowest border-l border-outline-variant gap-0"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 px-6 py-4 border-b border-outline-variant flex-shrink-0">
          {!isNew && ticket && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-medium leading-4 text-on-surface-variant">
                #{ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
          )}
          <h2 className="text-[20px] font-semibold leading-[25px] tracking-[-0.017em] text-on-surface">
            {isNew ? 'Nuevo ticket' : (ticket?.title ?? 'Ticket')}
          </h2>

          {ticket?.editingBy && (
            <EditingIndicator user={ticket.editingBy} />
          )}
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5 flex flex-col gap-6">
            {isNew ? (
              <TicketForm
                isNew
                users={users}
                tags={tags}
                onSubmit={handleSubmit}
                onCancel={handleClose}
              />
            ) : ticket ? (
              <>
                <TicketForm
                  ticket={ticket}
                  users={users}
                  tags={tags}
                  onSubmit={handleSubmit}
                  onArchive={handleArchive}
                  onCancel={handleClose}
                />
                <CommentSection ticketId={ticket.id} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-[15px] leading-[22px] text-on-surface-variant">
                  Ticket no encontrado
                </p>
                <button
                  onClick={handleClose}
                  className="text-[13px] font-medium text-primary hover:text-primary-container transition-colors"
                >
                  Volver al tablero
                </button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
