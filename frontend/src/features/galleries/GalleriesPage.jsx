import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { galleriesApi } from '../../api/galleries'
import { sessionsApi } from '../../api/sessions'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'

function GalleryForm({ sessions, onSuccess, onCancel }) {
  const [form, setForm] = useState({ photo_session_id: '', name: '', description: '', is_active: true })
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (data) => galleriesApi.create(data),
    onSuccess: () => onSuccess(),
    onError: (err) => {
      if (err.response?.status === 422) {
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      }
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); mutation.mutate(form) }} className="space-y-4">
      <Select label="Sesión *" value={form.photo_session_id} onChange={(e) => setForm({ ...form, photo_session_id: e.target.value })} error={errors.photo_session_id} required>
        <option value="">Seleccionar sesión...</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>{s.name} — {s.client?.name}</option>
        ))}
      </Select>
      <Input label="Nombre de la galería *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} required placeholder="Ej: Boda María y Juan — Galería completa" />
      <Textarea label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mensaje para el cliente..." />
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={mutation.isPending}>Crear galería</Button>
      </div>
    </form>
  )
}

export default function GalleriesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => galleriesApi.list().then((r) => r.data),
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions-all'],
    queryFn: () => sessionsApi.list({ per_page: 100 }).then((r) => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => galleriesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['galleries'] }); setDeleting(null) },
  })

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div>
      <PageHeader
        title="Galerías"
        description="Comparte tus trabajos con los clientes"
        action={<Button onClick={() => setShowForm(true)}>+ Nueva galería</Button>}
      />

      {isLoading ? (
        <Spinner />
      ) : !data?.data?.length ? (
        <EmptyState
          icon="🖼️"
          title="Sin galerías"
          description="Crea una galería privada y comparte tus fotos con el cliente"
          action={<Button onClick={() => setShowForm(true)}>Crear galería</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((g) => (
            <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-zinc-200 leading-tight">{g.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{g.session?.name ?? '—'}</p>
                </div>
                <Badge className={g.is_active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-600/20 text-zinc-400'}>
                  {g.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>

              {g.description && <p className="text-xs text-zinc-500 line-clamp-2">{g.description}</p>}

              <p className="text-xs text-zinc-600">{g.images_count ?? 0} imágenes</p>

              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                <Button variant="secondary" size="sm" onClick={() => navigate('/galleries/' + g.id)}>
                  Gestionar galería
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(g.public_url)}
                  className="text-zinc-400"
                >
                  Copiar enlace cliente
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(g)} className="text-red-400 hover:bg-red-400/10">
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva galería">
        <GalleryForm
          sessions={sessions ?? []}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['galleries'] }); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        loading={deleteMutation.isPending}
        title="Eliminar galería"
        message={'¿Eliminar la galería "' + (deleting?.name ?? '') + '" y todas sus imágenes?'}
      />
    </div>
  )
}
