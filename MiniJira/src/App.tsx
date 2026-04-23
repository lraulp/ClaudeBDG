import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import { router } from '@/router'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/features/auth/authStore'
import { api } from '@/lib/api'
import type { User } from '@/types'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// ── Session hydration on page load ────────────────────────────────────────────

function SessionHydrator() {
  const { accessToken, setSession, clearSession, setHydrating } = useAuthStore()

  useEffect(() => {
    if (!accessToken) {
      setHydrating(false)
      return
    }

    api
      .get<User>('/api/auth/me')
      .then(user => {
        setSession(user, accessToken)
      })
      .catch(() => {
        clearSession()
      })
      .finally(() => {
        setHydrating(false)
      })
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <SessionHydrator />
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              border: 'none',
              boxShadow: 'var(--shadow-ambient)',
              fontFamily: 'var(--font-family)',
              fontSize: '0.875rem',
            },
          }}
        />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
