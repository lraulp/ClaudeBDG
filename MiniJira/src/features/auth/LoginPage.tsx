import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'
import { useAuthStore } from './authStore'
import { api } from '@/lib/api'
import type { User } from '@/types'

interface GoogleAuthResponse {
  accessToken: string
  user: User
}

export function LoginPage() {
  const navigate = useNavigate()
  const { user, setSession } = useAuthStore()

  // Already authenticated
  useEffect(() => {
    if (user) navigate('/board', { replace: true })
  }, [user, navigate])

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return

    try {
      const data = await api.post<GoogleAuthResponse>(
        '/api/auth/google',
        { credential: credentialResponse.credential },
        { skipAuth: true },
      )
      setSession(data.user, data.accessToken)
      navigate('/board', { replace: true })
    } catch {
      toast.error('No se pudo iniciar sesión. Verifica que tu cuenta esté aprovisionada.')
    }
  }

  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ background: 'var(--surface)' }}
    >
      <div
        className="flex flex-col items-center"
        style={{ padding: '3rem 3rem 2.5rem', gap: '2rem', maxWidth: '380px', width: '100%' }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xl)]"
            style={{
              background: 'linear-gradient(145deg, var(--primary), var(--primary-dim))',
              boxShadow: 'var(--shadow-ambient)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="16" rx="2" fill="white" opacity=".9"/>
              <rect x="11" y="2" width="7" height="9" rx="2" fill="white" opacity=".5"/>
              <rect x="11" y="13" width="7" height="5" rx="2" fill="white" opacity=".3"/>
            </svg>
          </div>
          <div className="text-center">
            <h1
              className="font-semibold tracking-tight"
              style={{ fontSize: '1.25rem', color: 'var(--on-surface)' }}
            >
              Mini<span style={{ color: 'var(--primary)' }}>Jira</span>
            </h1>
            <p
              className="mt-1"
              style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', opacity: 0.5 }}
            >
              Accede con tu cuenta corporativa
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-full"
          style={{ height: '1px', background: 'var(--surface-container-high)' }}
        />

        {/* Google login button */}
        <div className="w-full">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Error al conectar con Google. Intenta de nuevo.')}
            theme="outline"
            shape="rectangular"
            width="100%"
            text="signin_with"
            locale="es"
          />
        </div>

        <p
          className="text-center"
          style={{ fontSize: '0.75rem', color: 'var(--on-surface)', opacity: 0.35 }}
        >
          Solo cuentas aprovisionadas por un administrador pueden acceder.
        </p>
      </div>
    </div>
  )
}
