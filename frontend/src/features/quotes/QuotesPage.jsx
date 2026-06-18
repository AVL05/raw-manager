import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quotesApi } from '../../api/quotes'
import { sessionsApi } from '../../api/sessions'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import QuoteForm from './QuoteForm'
import { formatDate, formatCurrency, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '../../utils/formatters'

export default function QuotesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', filterStatus],
    queryFn: () => quotesApi.list({ status: filterStatus }).then((r) => r.data),
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions-all'],
    queryFn: () => sessionsApi.list({ per_page: 100 }).then((r) => r.data.data),
  })

  const handlePdf = async (id) => {
    const res = await quotesApi.pdf(id)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'presupuesto-' + id + '.pdf'
    a.click()
  }

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        description="Gestiona tus presupuestos"
        action={<Button onClick={() => setShowForm(true)}>+ Nuevo presupuesto</Button>}
      />

      <div className="mb-6">
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-48">
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviado</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.data?.length ? (
        <EmptyState
          icon="📋"
          title="Sin presupuestos"
          description="Crea tu primer presupuesto para una sesion"
          action={<Button onClick={() => setShowForm(true)}>Crear presupuesto</Button>}
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Sesion</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Valido hasta</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((q) => (
                <tr key={q.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <button onClick={() => navigate('/quotes/' + q.id)} className="font-medium text-zinc-200 hover:text-white text-left">
                      {q.session?.name ?? 'Sesion #' + q.photo_session_id}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{q.session?.client?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{formatDate(q.valid_until)}</td>
                  <td className="px-4 py-3">
                    <Badge className={QUOTE_STATUS_COLORS[q.status]}>{QUOTE_STATUS_LABELS[q.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-100">{formatCurrency(q.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => navigate('/quotes/' + q.id)}>Ver</Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePdf(q.id)}>PDF</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo presupuesto" size="xl">
        <QuoteForm
          sessions={sessions ?? []}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['quotes'] }); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
