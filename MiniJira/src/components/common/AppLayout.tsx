import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    to: '/board',
    label: 'Tablero',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="14" rx="1.5" fill="currentColor" opacity=".9"/>
        <rect x="9" y="1" width="6" height="8" rx="1.5" fill="currentColor" opacity=".5"/>
        <rect x="9" y="11" width="6" height="4" rx="1.5" fill="currentColor" opacity=".3"/>
      </svg>
    ),
  },
  {
    to: '/metrics',
    label: 'Métricas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 12 L4 8 L7 10 L10 5 L13 7 L15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="15" cy="3" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
]

export function AppLayout() {
  const { user, clearSession } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface)' }}>
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className="flex w-[220px] shrink-0 flex-col"
        style={{ background: 'var(--surface-container-low)', borderRight: 'none' }}
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <span
            className="font-semibold tracking-tight"
            style={{ fontSize: '1rem', color: 'var(--on-surface)' }}
          >
            Mini<span style={{ color: 'var(--primary)' }}>Jira</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5" style={{ padding: '0 0.75rem' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--on-surface)] opacity-60 hover:opacity-100',
                )
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--primary-container)' }
                  : { background: 'transparent' }
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info */}
        {user && (
          <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: 'var(--primary-container)',
                  color: 'var(--on-primary-fixed)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-medium"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {user.name}
                </p>
                <p
                  className="truncate"
                  style={{ fontSize: '0.6875rem', color: 'var(--on-surface)', opacity: 0.5 }}
                >
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </p>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="shrink-0 rounded p-1 opacity-40 transition-opacity hover:opacity-80"
                style={{ color: 'var(--on-surface)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Content area ───────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
