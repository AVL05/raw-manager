import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import {
  formatDate, formatCurrency,
  SESSION_STATUS_COLORS, SESSION_STATUS_LABELS, SESSION_TYPE_LABELS,
  QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS,
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
} from '../../utils/formatters'

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'done', done: 'delivered' }
const NEXT_LABEL = { pending: 'Confirmar sesion', confirmed: 'Marcar como realizada', done: 'Marcar como entregada' }

export default function SessionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.get(id).then((r) => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => sessionsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session', id] }),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={session?.name}
        description={(SESSION_TYPE_LABELS[session?.type] ?? session?.type) + ' · ' + formatDate(session?.date)}
        action={
          <div className="flex gap-2">
            {NEXT_STATUS[session?.status] && (
              <Button
                onClick={() => statusMutation.mutate(NEXT_STATUS[session.status])}
                loading={statusMutation.isPending}
              >
                {NEXT_LABEL[session.status]}
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/sessions')}>Volver</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Detalles</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Estado</span>
              <Badge className={SESSION_STATUS_COLORS[session?.status]}>{SESSION_STATUS_LABELS[session?.status]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Cliente</span>
              <button onClick={() => navigate('/clients/' + session?.client?.id)} className="text-sm text-zinc-200 hover:text-white">
                {session?.client?.name}
              </button>
            </div>
            {session?.location && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Lugar</span>
                <span className="text-sm text-zinc-300">{session.location}</span>
              </div>
            )}
            {session?.price && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Precio</span>
                <span className="text-sm font-semibold text-zinc-100">{formatCurrency(session.price)}</span>
              </div>
            )}
          </div>

          {session?.internal_notes && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Notas internas</h3>
              <p className="text-sm text-zinc-400">{session.internal_notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Presupuesto</h3>
              {!session?.quote && (
                <Button size="sm" onClick={() => navigate('/quotes')}>Crear presupuesto</Button>
              )}
            </div>
            {session?.quote ? (
              <div className="flex items-center justify-between">
                <Badge className={QUOTE_STATUS_COLORS[session.quote.status]}>
                  {QUOTE_STATUS_LABELS[session.quote.status]}
                </Badge>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-zinc-100">{formatCurrency(session.quote.total)}</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/quotes/' + session.quote.id)}>Ver</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600">Sin presupuesto creado</p>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Factura</h3>
              {session?.quote?.status === 'approved' && !session?.invoice && (
                <Button size="sm" onClick={() => navigate('/invoices')}>Crear factura</Button>
              )}
            </div>
            {session?.invoice ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{session.invoice.invoice_number}</p>
                  <p className="text-lg font-bold text-zinc-100">{formatCurrency(session.invoice.total)}</p>
                </div>
                <Badge className={INVOICE_STATUS_COLORS[session.invoice.status]}>
                  {INVOICE_STATUS_LABELS[session.invoice.status]}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-zinc-600">Sin factura</p>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Galeria privada</h3>
              {!session?.gallery && (
                <Button size="sm" onClick={() => navigate('/galleries')}>Crear galeria</Button>
              )}
            </div>
            {session?.gallery ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-300">{session.gallery.name}</p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/galleries/' + session.gallery.id)}>
                  Ver galeria
                </Button>
              </div>
            ) : (
              <p className="text-sm text-zinc-600">Sin galeria</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
