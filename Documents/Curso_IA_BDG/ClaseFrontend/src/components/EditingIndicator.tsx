import type { UserSummary } from '@/types'
import UserAvatar from './UserAvatar'

interface Props {
  user: UserSummary
}

export default function EditingIndicator({ user }: Props) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-tertiary-fixed border border-tertiary-fixed-dim text-[12px] font-medium leading-4 text-on-tertiary-fixed-variant">
      <UserAvatar user={user} size="sm" />
      <span>{user.name} está editando</span>
      <span className="animate-pulse ml-0.5">•</span>
    </div>
  )
}
