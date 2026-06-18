import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '../../api/clients'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import ClientForm from './ClientForm'

export default function ClientsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.list({ search, per_page: 20 }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => clientsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setDeleting(null)
    },
  })

  const handleClose = () => { setShowForm(false); setEditing(null) }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestiona tu cartera de clientes"
        action={<Button onClick={() => setShowForm(true)}>+ Nuevo cliente</Button>}
      />
      <div className="mb-6">
        <Input
          placeholder="Buscar por nombre, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.data?.length ? (
        <EmptyState
          icon="👥"
          title="Sin clientes todavia"
          description="Anade tu primer cliente para empezar"
          action={<Button onClick={() => setShowForm(true)}>Crear cliente</Button>}
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Ciudad</th>
                <th className="text-center px-4 py-3">Sesiones</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((client) => (
                <tr key={client.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate('/clients/' + client.id)}
                      className="font-medium text-zinc-200 hover:text-white text-left"
                    >
                      {client.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{client.email || '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">{client.city || '—'}</td>
                  <td className="px-4 py-3 text-center text-zinc-400">{client.sessions_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(client); setShowForm(true) }}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleting(client)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={handleClose} title={editing ? 'Editar cliente' : 'Nuevo cliente'}>
        <ClientForm
          initial={editing}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['clients'] }); handleClose() }}
          onCancel={handleClose}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        loading={deleteMutation.isPending}
        title="Eliminar cliente"
        message={'Eliminar a ' + (deleting?.name ?? '') + '? Esta accion no se puede deshacer.'}
      />
    </div>
  )
}
