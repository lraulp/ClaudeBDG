import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginSchema, type LoginValues } from './authSchemas'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/axios'
import type { AuthResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MOCK_USERS } from '@/lib/mockAuth'

export default function LoginForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', values)
      setAuth(data.token, data.user)
      navigate('/board')
    } catch {
      toast.error('Credenciales incorrectas')
    }
  }

  function loginAsMock(index: number) {
    const { token, user } = MOCK_USERS[index]
    setAuth(token, user)
    navigate('/board')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">Acceso demo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MOCK_USERS.map((mock, i) => (
          <Button
            key={mock.user.id}
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={() => loginAsMock(i)}
          >
            <span className="truncate">
              {mock.user.name}
              <span className="ml-1 text-gray-400">({mock.user.role})</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
