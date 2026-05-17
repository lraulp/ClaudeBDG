import { NavLink, useNavigate } from 'react-router-dom'
import { Kanban, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

const linkBase =
  'flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium tracking-[-0.006em] transition-colors'
const linkActive = 'text-primary bg-primary-fixed'
const linkIdle = 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'

export default function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-14 shrink-0 border-b border-outline-variant bg-surface-container-lowest flex items-center px-10">
      <span className="text-primary text-[15px] font-semibold tracking-[-0.012em] mr-8 select-none">
        MiniJira
      </span>

      <nav className="flex items-center gap-1 flex-1">
        <NavLink
          to="/board"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <Kanban size={15} />
          Tablero
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <Settings size={15} />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-[15px] text-on-surface-variant tracking-[-0.012em]">
          {user?.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container h-8 w-8"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  )
}
