import { useState } from 'react'
import type { Comment } from '@/types'
import { mockUsers } from '@/features/board/mockTickets'
import CommentItem from './CommentItem'
import NewCommentForm from './NewCommentForm'

interface Props {
  ticketId: string
}

export default function CommentSection({ ticketId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])

  function handleNewComment(body: string) {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      ticketId,
      author: mockUsers[0],
      body,
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [...prev, newComment])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-t border-outline-variant" />

      <h4 className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-on-surface-variant uppercase tracking-[0.06em]">
        Comentarios
        {comments.length > 0 && (
          <span className="ml-1.5 normal-case tracking-normal">({comments.length})</span>
        )}
      </h4>

      {comments.length === 0 ? (
        <p className="text-[15px] leading-[22px] text-on-surface-variant">
          Sin comentarios aún.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}

      <NewCommentForm ticketId={ticketId} onSubmit={handleNewComment} />
    </div>
  )
}
