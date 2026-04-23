import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateComment } from '@/hooks'
import { useAuthStore } from '@/features/auth/authStore'
import { Avatar } from '@/components/common'

interface Props {
  ticketId: string
}

export function CommentForm({ ticketId }: Props) {
  const { user } = useAuthStore()
  const createComment = useCreateComment()
  const [body, setBody] = useState('')

  const handleSubmit = () => {
    const trimmed = body.trim()
    if (!trimmed) return

    createComment.mutate(
      { ticketId, body: trimmed },
      {
        onSuccess: () => {
          setBody('')
          toast.success('Comentario añadido')
        },
        onError: () => toast.error('Ocurrió un error. Intenta de nuevo.'),
      },
    )
  }

  if (!user) return null

  return (
    <div className="flex gap-2.5">
      <Avatar name={user.name} avatarUrl={user.avatarUrl} />
      <div className="flex flex-1 flex-col gap-2">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
          rows={2}
          placeholder="Escribe un comentario… (⌘↵ para enviar)"
          className="w-full resize-none rounded-[var(--radius-md)] p-2.5 text-sm outline-none transition-shadow"
          style={{
            background: 'var(--surface-container-low)',
            color: 'var(--on-surface)',
            lineHeight: 1.6,
          }}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!body.trim() || createComment.isPending}
            className="btn-primary"
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
          >
            {createComment.isPending ? 'Enviando…' : 'Comentar'}
          </button>
        </div>
      </div>
    </div>
  )
}
