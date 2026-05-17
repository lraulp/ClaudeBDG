import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { UserSummary } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  user: UserSummary
  size?: 'sm' | 'md'
  className?: string
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function UserAvatar({ user, size = 'md', className }: Props) {
  return (
    <Avatar
      className={cn(
        size === 'sm' ? 'h-6 w-6' : 'h-8 w-8',
        className
      )}
      title={user.name}
    >
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback
        className={cn(
          'bg-primary-fixed text-on-primary-fixed-variant font-medium',
          size === 'sm' ? 'text-[10px]' : 'text-[13px]'
        )}
      >
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}
