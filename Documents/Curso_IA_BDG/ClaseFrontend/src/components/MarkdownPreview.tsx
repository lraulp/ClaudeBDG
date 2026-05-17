import { parseMarkdown } from '@/lib/markdown'
import { cn } from '@/lib/utils'

interface Props {
  content: string
  className?: string
}

export default function MarkdownPreview({ content, className }: Props) {
  return (
    <div
      className={cn('prose prose-sm max-w-none text-gray-700', className)}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  )
}
