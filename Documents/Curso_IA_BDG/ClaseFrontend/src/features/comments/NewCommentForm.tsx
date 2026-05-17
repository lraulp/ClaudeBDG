import { useState } from 'react'
import { toast } from 'sonner'
import MentionTextarea from '@/components/MentionTextarea'
import { Button } from '@/components/ui/button'
import { mockUsers } from '@/features/board/mockTickets'

interface Props {
  ticketId: string
  onSubmit: (body: string) => void
}

export default function NewCommentForm({ ticketId: _ticketId, onSubmit }: Props) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    try {
      await onSubmit(body.trim())
      setBody('')
    } catch {
      toast.error('No se pudo publicar el comentario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <MentionTextarea
        value={body}
        onChange={setBody}
        users={mockUsers}
        placeholder="Escribe un comentario... (@handle para mencionar)"
        className="min-h-20"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !body.trim()}>
          {loading ? 'Publicando...' : 'Comentar'}
        </Button>
      </div>
    </form>
  )
}
