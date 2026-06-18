import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'
import { clientsApi } from '../../api/clients'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import SessionForm from './SessionForm'
import {
  formatDate, formatCurrency,
  SESSION_STATUS_COLORS, SESSION_STATUS_LABELS, SESSION_TYPE_LABELS,
} from '../../utils/formatters'

export default function SessionsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', search, filterStatus],
    queryFn: () => sessionsApi.list({ search, status: filterStatus, per_page: 20 }).then((r) => r.data),
  })

  const { data: clients } = useQuery({
    queryKey: ['clients-all'],
    queryFn: () => clientsApi.list({ per_page: 100 }).then((r) => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); setDeleting(null) },
  })

  const handleClose = () => { setShowForm(false); setEditing(null) }

  return (
    <div>
      <PageHeader
        title="Sesiones"
        description="Gestiona tus sesiones fotograficas"
        action={<Button onClick={() => setShowForm(true)}>+ Nueva sesion</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Buscar sesion o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-44">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmada</option>
          <option value="done">Realizada</option>
          <option value="delivered">Entregada</option>
          <option value="cancelled">Cancelada</option>
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.data?.length ? (
        <EmptyState
          icon="📷"
          title="Sin sesiones"
          description="Crea tu primera sesion fotografica"
          action={<Button onClick={() => setShowForm(true)}>Crear sesion</Button>}
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Sesion</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Tipo</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Precio</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((s) => (
                <tr key={s.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => navigate('/sessions/' + s.id)} className="font-medium text-zinc-200 hover:text-white text-left">
                      {s.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.client?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{formatDate(s.date)}</td>
                  <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">{SESSION_TYPE_LABELS[s.type] ?? s.type}</td>
                  <td className="px-4 py-3">
                    <Badge className={SESSION_STATUS_COLORS[s.status]}>{SESSION_STATUS_LABELS[s.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 hidden md:table-cell">
                    {s.price ? formatCurrency(s.price) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setShowForm(true) }}>Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} className="text-red-400 hover:bg-red-400/10">Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={handleClose} title={editing ? 'Editar sesion' : 'Nueva sesion'} size="lg">
        <SessionForm
          clients={clients ?? []}
          initial={editing}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['sessions'] }); handleClose() }}
          onCancel={handleClose}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        loading={deleteMutation.isPending}
        title="Eliminar sesion"
        message={'Eliminar sesion "' + (deleting?.name ?? '') + '"?'}
      />
    </div>
  )
}
