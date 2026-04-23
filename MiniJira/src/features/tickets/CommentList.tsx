import { toast } from 'sonner'
import { useComments, useArchiveComment } from '@/hooks'
import { useAuthStore } from '@/features/auth/authStore'
import { Avatar } from '@/components/common'
import { formatDateTime } from '@/lib/utils'
import type { Comment } from '@/types'

// ── CommentItem ───────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment
  ticketId: string
}

export function CommentItem({ comment, ticketId }: CommentItemProps) {
  const { user } = useAuthStore()
  const archiveComment = useArchiveComment()

  const canArchive = user?.id === comment.author.id || user?.role === 'admin'

  const handleArchive = () => {
    archiveComment.mutate(
      { ticketId, commentId: comment.id },
      {
        onSuccess: () => toast.success('Comentario eliminado'),
        onError: () => toast.error('Ocurrió un error. Intenta de nuevo.'),
      },
    )
  }

  return (
    <div className="group flex gap-2.5">
      <Avatar name={comment.author.name} avatarUrl={comment.author.avatarUrl} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-medium"
            style={{ fontSize: '0.8125rem', color: 'var(--on-surface)' }}
          >
            {comment.author.name}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface)', opacity: 0.4 }}>
            {formatDateTime(comment.createdAt)}
          </span>
        </div>
        <p
          className="mt-0.5"
          style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', lineHeight: 1.6, opacity: 0.85 }}
        >
          {comment.body}
        </p>
      </div>
      {canArchive && (
        <button
          onClick={handleArchive}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-80"
          title="Eliminar comentario"
          style={{ color: 'var(--on-surface)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}

// ── CommentList ───────────────────────────────────────────────────────────────

interface CommentListProps {
  ticketId: string
}

export function CommentList({ ticketId }: CommentListProps) {
  const { data: comments = [], isLoading } = useComments(ticketId)

  // Filter archived comments
  const visible = comments.filter(c => !c.archivedAt)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2" style={{ opacity: 0.4 }}>
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#005bbf] border-t-transparent" />
        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface)' }}>Cargando comentarios…</span>
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', opacity: 0.35 }}>
        Sin comentarios todavía.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        className="block font-medium uppercase"
        style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', color: 'var(--on-surface)', opacity: 0.45 }}
      >
        Comentarios ({visible.length})
      </label>
      {visible.map(comment => (
        <CommentItem key={comment.id} comment={comment} ticketId={ticketId} />
      ))}
    </div>
  )
}
