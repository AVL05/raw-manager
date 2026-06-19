import { useQuery } from '@tanstack/react-query'

function greeting() {
  const h = new Date().getHours()
  if (h < 13) return 'Buenos días'
  if (h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}
import { dashboardApi } from '../../api/dashboard'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDate, SESSION_STATUS_COLORS, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, SESSION_STATUS_LABELS } from '../../utils/formatters'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

function StatCard({ label, value, sub, accent }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-3xl font-bold ${accent || 'text-zinc-100'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600">{sub}</p>}
    </Card>
  )
}

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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">{greeting()}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-zinc-500 mt-1">Aquí tienes el resumen de tu estudio</p>
      </div>

      {loadingStats ? <Spinner /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Ingresos totales" value={formatCurrency(stats?.total_revenue)} sub="Facturas pagadas" accent="text-green-400" />
          <StatCard label="Por cobrar" value={formatCurrency(stats?.pending_revenue)} sub="Facturas pendientes" accent="text-yellow-400" />
          <StatCard label="Sesiones pendientes" value={stats?.pending_sessions ?? 0} />
          <StatCard label="Clientes activos" value={stats?.active_clients ?? 0} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Próximas sesiones</h2>
          {!upcoming?.data?.length ? (
            <p className="text-sm text-zinc-600 py-4 text-center">No hay sesiones próximas</p>
          ) : (
            <div className="space-y-3">
              {upcoming.data.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.client?.name} · {formatDate(s.date)}</p>
                  </div>
                  <Badge className={SESSION_STATUS_COLORS[s.status]}>{SESSION_STATUS_LABELS[s.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Facturas recientes</h2>
          {!recentInvoices?.data?.length ? (
            <p className="text-sm text-zinc-600 py-4 text-center">No hay facturas</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.data.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{inv.invoice_number}</p>
                    <p className="text-xs text-zinc-500">{inv.session?.client?.name} · {formatCurrency(inv.total)}</p>
                  </div>
                  <Badge className={INVOICE_STATUS_COLORS[inv.status]}>{INVOICE_STATUS_LABELS[inv.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}