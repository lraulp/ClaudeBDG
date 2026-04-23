import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { user, isHydrating } = useAuthStore()

  if (isHydrating) {
    // Hydration spinner — minimal, non-layout-shifting
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9f9fb]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#005bbf] border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
