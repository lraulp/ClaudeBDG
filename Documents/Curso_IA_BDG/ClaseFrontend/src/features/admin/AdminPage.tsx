import { useState } from 'react'
import type { UserSummary, Role } from '@/types'
import { mockUsers } from '@/features/board/mockTickets'
import UsersTable from './UsersTable'
import InviteUserForm from './InviteUserForm'
import { Separator } from '@/components/ui/separator'

export default function AdminPage() {
  const [users, setUsers] = useState<UserSummary[]>(mockUsers)

  function handleRoleChange(id: string, role: Role) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  function handleToggleActive(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))
  }

  function handleInvite(user: UserSummary) {
    setUsers((prev) => [...prev, user])
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Administración de usuarios</h1>
      <InviteUserForm onInvite={handleInvite} />
      <Separator />
      <UsersTable users={users} onRoleChange={handleRoleChange} onToggleActive={handleToggleActive} />
    </div>
  )
}
