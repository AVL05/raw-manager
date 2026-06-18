import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../../api/clients'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { formatDate, formatCurrency, SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '../../utils/formatters'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.get(id).then((r) => r.data),
  })

  const { data: sessions } = useQuery({
    queryKey: ['client-sessions', id],
    queryFn: () => clientsApi.sessions(id).then((r) => r.data),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={client?.name}
        description="Detalle del cliente"
        action={<Button variant="secondary" onClick={() => navigate('/clients')}>Volver</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contacto</h2>
          {client?.email && (
            <div>
              <p className="text-xs text-zinc-600">Email</p>
              <p className="text-sm text-zinc-200">{client.email}</p>
            </div>
          )}
          {client?.phone && (
            <div>
              <p className="text-xs text-zinc-600">Telefono</p>
              <p className="text-sm text-zinc-200">{client.phone}</p>
            </div>
          )}
          {client?.city && (
            <div>
              <p className="text-xs text-zinc-600">Ciudad</p>
              <p className="text-sm text-zinc-200">{client.city}</p>
            </div>
          )}
          {client?.nif && (
            <div>
              <p className="text-xs text-zinc-600">NIF</p>
              <p className="text-sm text-zinc-200">{client.nif}</p>
            </div>
          )}
        </div>

        {client?.notes && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Notas</h2>
            <p className="text-sm text-zinc-300">{client.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">Historial de sesiones</h2>
        </div>
        {!sessions?.data?.length ? (
          <p className="text-sm text-zinc-600 text-center py-8">Sin sesiones registradas</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                <th className="text-left px-4 py-3">Sesion</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Precio</th>
              </tr>
            </thead>
            <tbody>
              {sessions.data.map((s) => (
                <tr key={s.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate('/sessions/' + s.id)}
                      className="text-zinc-200 hover:text-white font-medium"
                    >
                      {s.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(s.date)}</td>
                  <td className="px-4 py-3">
                    <Badge className={SESSION_STATUS_COLORS[s.status]}>
                      {SESSION_STATUS_LABELS[s.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">
                    {s.price ? formatCurrency(s.price) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
