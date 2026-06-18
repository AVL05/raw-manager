import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '../../api/invoices'
import { quotesApi } from '../../api/quotes'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { formatDate, formatCurrency, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '../../utils/formatters'

function CreateInvoiceForm({ quotes, onSuccess, onCancel }) {
  const [form, setForm] = useState({ quote_id: '', due_date: '', notes: '' })
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.create(data),
    onSuccess: () => onSuccess(),
    onError: (err) => {
      if (err.response?.status === 422) {
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      }
    },
  })

  const approvedQuotes = (quotes ?? []).filter((q) => q.status === 'approved')

  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); mutation.mutate(form) }} className="space-y-4">
      <Select label="Presupuesto aprobado *" value={form.quote_id} onChange={(e) => setForm({ ...form, quote_id: e.target.value })} error={errors.quote_id} required>
        <option value="">Seleccionar presupuesto...</option>
        {approvedQuotes.map((q) => (
          <option key={q.id} value={q.id}>
            {'#' + q.id + ' — ' + (q.session?.name ?? 'Sesion') + ' — ' + formatCurrency(q.total)}
          </option>
        ))}
      </Select>
      {approvedQuotes.length === 0 && (
        <p className="text-xs text-yellow-500">No hay presupuestos aprobados. Aprueba un presupuesto primero.</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-1.5">Fecha de vencimiento</label>
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={mutation.isPending}>Crear factura</Button>
      </div>
    </form>
  )
}

export default function InvoicesPage() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', filterStatus],
    queryFn: () => invoicesApi.list({ status: filterStatus }).then((r) => r.data),
  })

  const { data: quotes } = useQuery({
    queryKey: ['quotes-approved'],
    queryFn: () => quotesApi.list({ per_page: 100 }).then((r) => r.data.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => invoicesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })

  const handlePdf = async (id) => {
    const res = await invoicesApi.pdf(id)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'factura-' + id + '.pdf'
    a.click()
  }

  return (
    <div>
      <PageHeader
        title="Facturas"
        description="Gestiona tus facturas"
        action={<Button onClick={() => setShowForm(true)}>+ Nueva factura</Button>}
      />

      <div className="mb-6">
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-48">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="paid">Pagada</option>
          <option value="overdue">Vencida</option>
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.data?.length ? (
        <EmptyState
          icon="🧾"
          title="Sin facturas"
          description="Crea facturas desde presupuestos aprobados"
          action={<Button onClick={() => setShowForm(true)}>Crear factura</Button>}
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Numero</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Emision</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Vencimiento</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((inv) => (
                <tr key={inv.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-zinc-200">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-zinc-400">{inv.session?.client?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{formatDate(inv.issue_date)}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-3">
                    <Badge className={INVOICE_STATUS_COLORS[inv.status]}>{INVOICE_STATUS_LABELS[inv.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-100">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {inv.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => statusMutation.mutate({ id: inv.id, status: 'paid' })}
                          className="text-green-400 hover:bg-green-400/10"
                        >
                          Marcar pagada
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handlePdf(inv.id)}>PDF</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva factura">
        <CreateInvoiceForm
          quotes={quotes}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['invoices'] }); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
