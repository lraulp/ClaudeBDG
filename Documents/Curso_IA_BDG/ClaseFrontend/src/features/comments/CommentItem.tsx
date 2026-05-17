import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Comment } from '@/types'
import UserAvatar from '@/components/UserAvatar'
import MarkdownPreview from '@/components/MarkdownPreview'

interface Props {
  comment: Comment
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className="flex gap-3">
      <UserAvatar user={comment.author} size="sm" className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-on-surface">
            {comment.author.name}
          </span>
          <span className="text-[12px] leading-4 text-on-surface-variant">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
          </span>
        </div>
        <MarkdownPreview content={comment.body} />
      </div>
    </div>
  )
}
