import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, ArrowRight } from 'lucide-react'
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

  const fillDemo = () => setForm({ email: 'photographer@demo.com', password: 'password' })

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left panel */}
      <div
        className="flex-1 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Decorative gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 30% 60%, var(--accent-glow), transparent)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <Camera size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">RAW Manager</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <blockquote className="text-2xl font-light text-[var(--text-primary)] leading-relaxed tracking-tight">
            "Tu estudio digital.<br />Cada sesión, cada cliente,<br />cada historia."
          </blockquote>
          <div className="space-y-3">
            {['Gestión de clientes y sesiones', 'Presupuestos y facturas en PDF', 'Galerías privadas para clientes'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] relative">
          RAW Manager &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <Camera size={14} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">RAW Manager</span>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Bienvenido de nuevo</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg text-sm text-red-400 flex items-center gap-2"
              style={{ background: 'var(--red-subtle)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </motion.div>
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

          <p className="text-center text-xs text-[var(--text-muted)] mt-5">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Regístrate
            </Link>
          </p>

          {/* Demo access */}
          <button
            onClick={fillDemo}
            type="button"
            className="w-full mt-5 flex items-center justify-between px-3.5 py-3 rounded-lg transition-all duration-150 group"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div className="text-left">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Acceso demo</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">photographer@demo.com</p>
            </div>
            <ArrowRight size={13} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
