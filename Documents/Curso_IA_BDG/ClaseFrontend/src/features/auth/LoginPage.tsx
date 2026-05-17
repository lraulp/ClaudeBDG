import { Link } from 'react-router-dom'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
      </div>
      <LoginForm />
      <p className="text-sm text-center text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
