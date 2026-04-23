import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTicket, useUpdateTicket, useArchiveTicket } from '@/hooks'
import { useAuthStore } from '@/features/auth/authStore'
import { useTicketDraftStore } from './ticketDraftStore'
import { ConflictBanner, StatusChip, PriorityBadge, BlockedBadge, Avatar } from '@/components/common'
import { ApiError } from '@/lib/api'
import { STATUS_LABELS, PRIORITY_LABELS, KANBAN_COLUMNS } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import type { TicketStatus, Priority } from '@/types'

interface Props {
  ticketId: string
  onClose: () => void
}

export function TicketDetailPanel({ ticketId, onClose }: Props) {
  const { data: ticket, refetch } = useTicket(ticketId)
  const updateTicket = useUpdateTicket()
  const archiveTicket = useArchiveTicket()
  const { user } = useAuthStore()
  const { draft, conflictVersion, setDraft, setConflictVersion, clearDraft } = useTicketDraftStore()

  const [hasConflict, setHasConflict] = useState(false)

  // Init draft from fetched ticket
  useEffect(() => {
    if (ticket && !draft) {
      setDraft({ ...ticket })
    }
  }, [ticket, draft, setDraft])

  if (!ticket || !draft) return null

  const canEdit =
    user?.id === ticket.createdBy.id || user?.role === 'admin'

  const handleSave = () => {
    updateTicket.mutate(
      {
        id: ticket.id,
        title: draft.title,
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        isBlocked: draft.isBlocked,
        assignees: draft.assignees,
        labels: draft.labels,
        version: hasConflict && conflictVersion != null ? conflictVersion : ticket.version,
      },
      {
        onSuccess: () => {
          toast.success('Cambios guardados')
          setHasConflict(false)
          clearDraft()
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setHasConflict(true)
            setConflictVersion(ticket.version)
          } else {
            toast.error('Ocurrió un error. Intenta de nuevo.')
          }
        },
      },
    )
  }

  const handleReload = () => {
    refetch().then(({ data }) => {
      if (data) {
        setDraft(prev => ({
          ...prev,
          // Preserve user's edited fields; only update version
          version: data.version,
        }))
        setConflictVersion(data.version)
      }
    })
  }

  const handleDiscard = () => {
    setHasConflict(false)
    clearDraft()
    refetch()
  }

  const handleArchive = () => {
    if (!confirm('¿Eliminar este ticket? Esta acción no se puede deshacer.')) return
    archiveTicket.mutate(
      { id: ticket.id, version: ticket.version },
      {
        onSuccess: () => {
          toast.success('Ticket eliminado')
          onClose()
        },
        onError: () => toast.error('Ocurrió un error. Intenta de nuevo.'),
      },
    )
  }

  return (
    <aside
      className="flex h-full flex-col overflow-hidden"
      style={{
        width: '420px',
        minWidth: '420px',
        background: 'var(--surface-container-lowest)',
        boxShadow: '-4px 0 24px rgba(12,14,16,0.04)',
        padding: '1.5rem 1.5rem 0',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div>
          <span
            className="font-medium uppercase"
            style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.05em',
              color: 'var(--on-surface)',
              opacity: 0.4,
            }}
          >
            ISSUE-{ticket.id.slice(0, 6).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {ticket.isBlocked ? (
                <BlockedBadge />
              ) : null}
              <button
                onClick={() =>
                  setDraft(prev => ({ ...prev, isBlocked: !prev?.isBlocked }))
                }
                className="rounded px-2 py-1 text-xs transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--surface-container-high)',
                  color: 'var(--on-surface)',
                }}
                title={draft.isBlocked ? 'Desbloquear' : 'Marcar como bloqueado'}
              >
                {draft.isBlocked ? 'Desbloquear' : 'Bloquear'}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 opacity-40 hover:opacity-80"
            style={{ color: 'var(--on-surface)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-6" style={{ marginTop: '1rem' }}>

        {/* Conflict banner */}
        {hasConflict && (
          <ConflictBanner onReload={handleReload} onDiscard={handleDiscard} />
        )}

        {/* Title */}
        {canEdit ? (
          <textarea
            value={draft.title ?? ''}
            onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
            maxLength={120}
            rows={2}
            className="w-full resize-none font-semibold leading-snug outline-none"
            style={{
              fontSize: '1rem',
              color: 'var(--on-surface)',
              background: 'transparent',
            }}
            placeholder="Título del ticket"
          />
        ) : (
          <h2
            className="font-semibold leading-snug"
            style={{ fontSize: '1rem', color: 'var(--on-surface)' }}
          >
            {ticket.title}
          </h2>
        )}

        {/* Status + Priority row */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <select
              value={draft.status}
              onChange={e => setDraft(prev => ({ ...prev, status: e.target.value as TicketStatus }))}
              className="rounded-full px-2 py-0.5 text-xs font-medium outline-none"
              style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)' }}
            >
              {KANBAN_COLUMNS.map(col => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
          ) : (
            <StatusChip status={ticket.status} />
          )}

          {canEdit ? (
            <select
              value={draft.priority}
              onChange={e => setDraft(prev => ({ ...prev, priority: e.target.value as Priority }))}
              className="rounded px-2 py-0.5 text-xs outline-none"
              style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)' }}
            >
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          ) : (
            <PriorityBadge priority={ticket.priority} />
          )}
        </div>

        {/* Description */}
        <div>
          <label
            className="mb-1 block font-medium uppercase"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', color: 'var(--on-surface)', opacity: 0.45 }}
          >
            Descripción
          </label>
          {canEdit ? (
            <textarea
              value={draft.description ?? ''}
              onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full resize-none rounded-[var(--radius-md)] p-2 text-sm outline-none"
              style={{
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                lineHeight: 1.6,
              }}
              placeholder="Descripción (markdown)"
            />
          ) : (
            <p
              className="text-sm"
              style={{ color: 'var(--on-surface)', lineHeight: 1.6, opacity: ticket.description ? 1 : 0.4 }}
            >
              {ticket.description || 'Sin descripción'}
            </p>
          )}
        </div>

        {/* Assignees */}
        <div>
          <label
            className="mb-1.5 block font-medium uppercase"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', color: 'var(--on-surface)', opacity: 0.45 }}
          >
            Asignados
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ticket.assignees.length > 0 ? (
              ticket.assignees.map(u => (
                <div key={u.id} className="flex items-center gap-1.5">
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)' }}>{u.name}</span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', opacity: 0.4 }}>
                Sin asignar
              </span>
            )}
          </div>
        </div>

        {/* Labels */}
        {ticket.labels.length > 0 && (
          <div>
            <label
              className="mb-1.5 block font-medium uppercase"
              style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', color: 'var(--on-surface)', opacity: 0.45 }}
            >
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-1">
              {ticket.labels.map(l => (
                <span
                  key={l}
                  className="rounded px-2 py-0.5"
                  style={{ fontSize: '0.75rem', background: 'var(--surface-container-high)', color: 'var(--on-surface)' }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface)', opacity: 0.4, lineHeight: 1.8 }}>
          <p>Creado por <strong style={{ opacity: 1 }}>{ticket.createdBy.name}</strong></p>
          <p>{formatDateTime(ticket.createdAt)}</p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--surface-container-high)' }} />

        {/* Comments */}
        <CommentList ticketId={ticket.id} />
        <CommentForm ticketId={ticket.id} />
      </div>

      {/* Sticky footer actions */}
      {canEdit && (
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: '0.75rem 0 1rem',
            borderTop: 'none',
            background: 'var(--surface-container-lowest)',
          }}
        >
          <button
            onClick={handleArchive}
            className="text-xs opacity-40 transition-opacity hover:opacity-80"
            style={{ color: 'var(--on-error-container)' }}
          >
            Eliminar ticket
          </button>

          <button
            onClick={handleSave}
            disabled={updateTicket.isPending}
            className="btn-primary"
            style={{ fontSize: '0.8125rem' }}
          >
            {updateTicket.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </aside>
  )
}
