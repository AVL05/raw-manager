import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'
import { quotesApi } from '../../api/quotes'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import QuoteForm from './QuoteForm'
import { useState } from 'react'
import { formatDate, formatCurrency, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '../../utils/formatters'

const STATUSES = ['draft', 'sent', 'approved', 'rejected']
const STATUS_LABELS = { draft: 'Borrador', sent: 'Enviado', approved: 'Aprobado', rejected: 'Rechazado' }

export default function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesApi.get(id).then((r) => r.data),
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions-all'],
    queryFn: () => sessionsApi.list({ per_page: 100 }).then((r) => r.data.data),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => quotesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quote', id] }),
  })

  const handlePdf = async () => {
    const res = await quotesApi.pdf(id)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'presupuesto-' + id + '.pdf'
    a.click()
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={'Presupuesto #' + quote?.id}
        description={quote?.session?.name}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handlePdf}>Exportar PDF</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>Editar</Button>
            <Button variant="secondary" onClick={() => navigate('/quotes')}>Volver</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-4">Estado</h3>
            <div className="flex flex-col gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => statusMutation.mutate(s)}
                  disabled={quote?.status === s}
                  className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ' +
                    (quote?.status === s
                      ? 'bg-white/10 text-white font-medium cursor-default'
                      : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                    )
                  }
                >
                  <span className={'h-2 w-2 rounded-full ' + (quote?.status === s ? 'bg-white' : 'bg-zinc-700')} />
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase">Detalles</h3>
            {quote?.session?.client && (
              <div>
                <p className="text-xs text-zinc-600">Cliente</p>
                <p className="text-sm text-zinc-200">{quote.session.client.name}</p>
              </div>
            )}
            {quote?.valid_until && (
              <div>
                <p className="text-xs text-zinc-600">Valido hasta</p>
                <p className="text-sm text-zinc-200">{formatDate(quote.valid_until)}</p>
              </div>
            )}
            {quote?.notes && (
              <div>
                <p className="text-xs text-zinc-600">Notas</p>
                <p className="text-sm text-zinc-400">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">Descripcion</th>
                  <th className="text-center px-4 py-3">Cantidad</th>
                  <th className="text-right px-4 py-3">Precio unit.</th>
                  <th className="text-right px-4 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {quote?.items?.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-3 text-zinc-300">{item.description}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right text-zinc-200">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-zinc-800 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Base imponible</span>
                <span>{formatCurrency(quote?.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>IVA ({quote?.tax_rate}%)</span>
                <span>{formatCurrency(quote?.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-100 text-lg border-t border-zinc-700 pt-3">
                <span>Total</span>
                <span>{formatCurrency(quote?.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar presupuesto" size="xl">
        <QuoteForm
          initial={quote}
          sessions={sessions ?? []}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['quote', id] }); setShowEdit(false) }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  )
}
