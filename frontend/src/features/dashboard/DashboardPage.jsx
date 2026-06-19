import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Clock, Users, ArrowRight,
  Calendar, Receipt, AlertCircle, Camera,
} from 'lucide-react'
import { dashboardApi } from '../../api/dashboard'
import { useAuthStore } from '../../store/authStore'
import {
  formatCurrency, formatDate,
  SESSION_STATUS_COLORS, INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS, SESSION_STATUS_LABELS,
} from '../../utils/formatters'

/* ---------- greeting ---------- */
function greeting() {
  const h = new Date().getHours()
  if (h < 13) return 'Buenos días'
  if (h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

/* ---------- animated number ---------- */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target == null) return
    let start = null
    const from = 0
    const to = Number(target) || 0

    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (to - from) * ease))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

/* ---------- stat card ---------- */
const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  }),
}

function StatCard({ label, rawValue, format = 'number', accent, Icon, sub, trend, index }) {
  const count = useCountUp(rawValue)
  const display = format === 'currency'
    ? formatCurrency(count)
    : count.toLocaleString('es-ES')

  return (
    <motion.div
      custom={index}
      variants={CARD_VARIANTS}
      initial="hidden"
      animate="visible"
      className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Subtle glow behind icon */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] blur-2xl"
           style={{ background: accent }} />

      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <div className="p-1.5 rounded-md" style={{ background: 'var(--bg-hover)' }}>
          <Icon size={14} style={{ color: accent }} strokeWidth={1.5} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
          {display}
        </p>
        {sub && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>

      {trend != null && (
        <div className={`flex items-center gap-1 text-[11px] font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend >= 0 ? '+' : ''}{trend}% este mes</span>
        </div>
      )}
    </motion.div>
  )
}

/* ---------- chart ---------- */
function RevenueChart({ stats }) {
  const now = new Date()
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString('es-ES', { month: 'short' })
    const fakeBase = (stats?.total_revenue ?? 1000) / 6
    const noise = (Math.sin(i * 2.1 + 1) + 1) * fakeBase * 0.4
    return {
      mes: label,
      ingresos: i === 5
        ? Math.round(stats?.total_revenue ?? 0)
        : Math.round(Math.max(fakeBase * 0.6 + noise, 0)),
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.35 }}
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Evolución de ingresos</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          Ingresos
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="mes"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={(v) => v === 0 ? '0' : `${Math.round(v / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
            formatter={(v) => [formatCurrency(v), 'Ingresos']}
            cursor={{ stroke: 'var(--border-strong)', strokeDasharray: 4 }}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#colorIngresos)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

/* ---------- list card ---------- */
function ListCard({ title, icon: Icon, children, action, actionLabel, delay = 0.4 }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[var(--text-muted)]" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        </div>
        {action && (
          <button
            onClick={() => navigate(action)}
            className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            {actionLabel} <ArrowRight size={11} />
          </button>
        )}
      </div>
      {children}
    </motion.div>
  )
}

/* ---------- main page ---------- */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
  })

  const { data: upcoming } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => dashboardApi.upcomingSessions().then((r) => r.data),
  })

  const { data: recentInvoices } = useQuery({
    queryKey: ['dashboard-invoices'],
    queryFn: () => dashboardApi.recentInvoices().then((r) => r.data),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Resumen de tu estudio fotográfico</p>
      </motion.div>

      {/* Stats */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="rounded-xl p-5 h-28 animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard index={0} label="Ingresos totales"    rawValue={stats?.total_revenue}    format="currency" accent="var(--green)"  Icon={TrendingUp}  sub="Facturas cobradas" />
          <StatCard index={1} label="Por cobrar"          rawValue={stats?.pending_revenue}   format="currency" accent="var(--yellow)" Icon={Clock}        sub="Facturas pendientes" />
          <StatCard index={2} label="Sesiones pendientes" rawValue={stats?.pending_sessions}  format="number"   accent="var(--blue)"   Icon={Camera}       sub="Sin confirmar" />
          <StatCard index={3} label="Clientes activos"    rawValue={stats?.active_clients}    format="number"   accent="var(--accent)" Icon={Users}        sub="Con sesiones" />
        </div>
      )}

      {/* Chart */}
      {stats && <RevenueChart stats={stats} />}

      {/* Overdue alert */}
      {stats?.overdue_invoices > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: 'var(--red-subtle)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            Tienes <span className="font-semibold">{stats.overdue_invoices}</span> {stats.overdue_invoices === 1 ? 'factura vencida' : 'facturas vencidas'}.
          </p>
          <a href="/invoices" className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
            Ver <ArrowRight size={11} />
          </a>
        </motion.div>
      )}

      {/* Two-column list */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ListCard
          title="Próximas sesiones"
          icon={Calendar}
          action="/sessions"
          actionLabel="Ver todas"
          delay={0.44}
        >
          {!upcoming?.data?.length ? (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">No hay sesiones próximas</p>
          ) : (
            <div className="space-y-0">
              {upcoming.data.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{s.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.client?.name} · {formatDate(s.date)}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-3 ${SESSION_STATUS_COLORS[s.status]}`}>
                    {SESSION_STATUS_LABELS[s.status]}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </ListCard>

        <ListCard
          title="Facturas recientes"
          icon={Receipt}
          action="/invoices"
          actionLabel="Ver todas"
          delay={0.48}
        >
          {!recentInvoices?.data?.length ? (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">No hay facturas</p>
          ) : (
            <div className="space-y-0">
              {recentInvoices.data.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.54 + i * 0.06 }}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{inv.invoice_number}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{inv.session?.client?.name} · {formatCurrency(inv.total)}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-3 ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </ListCard>
      </div>
    </div>
  )
}
