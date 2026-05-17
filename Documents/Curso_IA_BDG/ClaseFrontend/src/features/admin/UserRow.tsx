import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserSummary, Role } from '@/types'
import UserAvatar from '@/components/UserAvatar'

interface Props {
  user: UserSummary
  onRoleChange: (id: string, role: Role) => void
  onToggleActive: (id: string) => void
}

export default function UserRow({ user, onRoleChange, onToggleActive }: Props) {
  return (
    <TableRow className={!user.active ? 'opacity-50' : undefined}>
      <TableCell>
        <div className="flex items-center gap-2">
          <UserAvatar user={user} size="sm" />
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">@{user.handle}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{user.role === 'admin' ? 'Admin' : 'Usuario'}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.active ? 'default' : 'secondary'}>
          {user.active ? 'Activo' : 'Inactivo'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRoleChange(user.id, user.role === 'admin' ? 'usuario' : 'admin')}
          >
            {user.role === 'admin' ? '→ Usuario' : '→ Admin'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onToggleActive(user.id)}>
            {user.active ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
