import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { UserSummary, Role } from '@/types'
import UserRow from './UserRow'

interface Props {
  users: UserSummary[]
  onRoleChange: (id: string, role: Role) => void
  onToggleActive: (id: string) => void
}

export default function UsersTable({ users, onRoleChange, onToggleActive }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onRoleChange={onRoleChange}
            onToggleActive={onToggleActive}
          />
        ))}
      </TableBody>
    </Table>
  )
}
