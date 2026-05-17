import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/board" replace />
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <h1 className="text-[24px] font-semibold tracking-[-0.019em] leading-[30px] text-center mb-8 text-on-surface">
          MiniJira
        </h1>
        <Outlet />
      </div>
    </div>
  )
}
