import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types'

interface Props {
  requiredRole?: Role
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { token, user } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/board" replace />

  return <Outlet />
}
