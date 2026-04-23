import { cn, getStatusStyles, PRIORITY_DOT, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/utils'
import type { Priority, TicketStatus } from '@/types'

// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string
  avatarUrl?: string
  size?: 'sm' | 'md'
}

export function Avatar({ name, avatarUrl, size = 'sm' }: AvatarProps) {
  const dim = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('rounded-full object-cover', dim)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        dim,
      )}
      style={{ background: 'var(--primary-container)', color: 'var(--on-primary-fixed)' }}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ── PriorityBadge ─────────────────────────────────────────────────────────────

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={cn('inline-block h-1.5 w-1.5 rounded-full', PRIORITY_DOT[priority])}
      />
      <span
        className="font-medium uppercase"
        style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', color: 'var(--on-surface)', opacity: 0.6 }}
      >
        {PRIORITY_LABELS[priority]}
      </span>
    </span>
  )
}

// ── StatusChip ────────────────────────────────────────────────────────────────

interface StatusChipProps {
  status: TicketStatus
  size?: 'sm' | 'md'
}

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        getStatusStyles(status),
        size === 'sm' ? 'px-2 py-0.5 text-[0.6875rem]' : 'px-2.5 py-1 text-xs',
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ── BlockedBadge ──────────────────────────────────────────────────────────────

export function BlockedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
      style={{
        background: 'var(--error-container)',
        color: 'var(--on-error-container)',
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
        <circle cx="4" cy="4" r="3.5" stroke="currentColor" strokeWidth="1" fill="none"/>
        <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      Bloqueado
    </span>
  )
}

// ── ConflictBanner ────────────────────────────────────────────────────────────

interface ConflictBannerProps {
  onReload: () => void
  onDiscard: () => void
}

export function ConflictBanner({ onReload, onDiscard }: ConflictBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-[var(--radius-md)] px-4 py-3"
      style={{ background: 'var(--primary-container)' }}
      role="alert"
    >
      <svg
        className="mt-0.5 shrink-0"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{ color: 'var(--on-primary-fixed)' }}
      >
        <path
          d="M7 1L13 12H1L7 1Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line x1="7" y1="5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="7" cy="10.5" r="0.7" fill="currentColor"/>
      </svg>
      <div className="flex-1 text-sm" style={{ color: 'var(--on-primary-fixed)' }}>
        <p className="font-medium">Conflicto de edición</p>
        <p className="mt-0.5 opacity-80">
          Alguien modificó este ticket mientras lo editabas. Recarga para ver los cambios o guarda los tuyos.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={onReload}
            className="text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100"
            style={{ color: 'var(--on-primary-fixed)' }}
          >
            Recargar versión actual
          </button>
          <span className="opacity-40">·</span>
          <button
            onClick={onDiscard}
            className="text-xs opacity-60 hover:opacity-90"
            style={{ color: 'var(--on-primary-fixed)' }}
          >
            Descartar mis cambios
          </button>
        </div>
      </div>
    </div>
  )
}
