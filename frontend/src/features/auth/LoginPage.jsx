import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="flex-1 hidden lg:flex flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white">RAW Manager</h1>
          <p className="text-zinc-500 text-sm mt-1">Gestión profesional para fotógrafos</p>
        </div>
        <div>
          <blockquote className="text-3xl font-light text-zinc-200 leading-relaxed">
            "Tu estudio digital.<br />Cada sesión, cada cliente,<br />cada historia."
          </blockquote>
        </div>
        <p className="text-xs text-zinc-600">RAW Manager &copy; {new Date().getFullYear()}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-100">Bienvenido de nuevo</h2>
            <p className="text-sm text-zinc-500 mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Iniciar sesión
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-zinc-300 hover:text-white transition-colors">
              Regístrate
            </Link>
          </p>

          <div className="mt-8 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1 font-medium">Demo</p>
            <p className="text-xs text-zinc-400">photographer@demo.com / password</p>
          </div>
        </div>
      </div>
    </div>
  )
}