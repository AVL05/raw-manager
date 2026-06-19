import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 422) {
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      } else {
        setErrors({ general: err.response?.data?.message || 'Error al registrarse' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">RAW Manager</h1>
          <p className="text-zinc-500 text-sm mt-1">Crea tu cuenta de fotógrafo</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" placeholder="Tu nombre" value={form.name} onChange={set('name')} error={errors.name} required />
          <Input label="Correo" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} error={errors.email} required />
          <Input label="Contraseña" type="password" placeholder="Mín. 8 caracteres" value={form.password} onChange={set('password')} error={errors.password} required />
          <Input label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} required />
          <Button type="submit" className="w-full" loading={loading}>Crear cuenta</Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-zinc-300 hover:text-white transition-colors">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}