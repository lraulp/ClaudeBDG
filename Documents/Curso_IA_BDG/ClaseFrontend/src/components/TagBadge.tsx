import type { Tag } from '@/types'

interface Props {
  tag: Tag
}

export default function TagBadge({ tag }: Props) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium leading-4"
      style={{ backgroundColor: tag.color + '22', color: tag.color }}
    >
      {tag.name}
    </span>
  )
}
