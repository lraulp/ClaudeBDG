import { Link } from 'react-router-dom'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Crear cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Completa los datos para registrarte</p>
      </div>
      <RegisterForm />
      <p className="text-sm text-center text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
