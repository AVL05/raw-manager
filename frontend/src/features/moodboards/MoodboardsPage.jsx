import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, LayoutGrid, Trash2, Edit2, ArrowRight, FolderOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { moodboardsApi } from '../../api/moodboards'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const EMPTY_FORM = { name: '', folder: '', description: '' }

export default function MoodboardsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [filterFolder, setFilterFolder] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['moodboards'],
    queryFn: () => moodboardsApi.list({ per_page: 100 }).then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? moodboardsApi.update(editItem.id, d) : moodboardsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['moodboards'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => moodboardsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['moodboards'] }); setDeleteTarget(null) },
  })

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (item, e) => { e.stopPropagation(); setEditItem(item); setForm({ ...item }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const items   = data?.data ?? []
  const folders = [...new Set(items.map(m => m.folder).filter(Boolean))]

  const grouped = filterFolder
    ? { [filterFolder]: items.filter(m => m.folder === filterFolder) }
    : items.reduce((acc, m) => {
        const key = m.folder || '—'
        if (!acc[key]) acc[key] = []
        acc[key].push(m)
        return acc
      }, {})

  return (
    <div>
      <PageHeader
        title="Moodboards"
        description="Referencias visuales e inspiración para tus sesiones"
        action={<Button onClick={openCreate}><Plus size={14} /> Nuevo moodboard</Button>}
      />

      {/* Folder filter */}
      {folders.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', ...folders].map((f) => (
            <button
              key={f}
              onClick={() => setFilterFolder(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterFolder === f
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                  : 'text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {f ? <><FolderOpen size={11} /> {f}</> : 'Todos'}
            </button>
          ))}
        </div>
      )}

      {isLoading ? <Spinner /> : items.length === 0 ? (
        <EmptyState
          icon="🎨"
          title="Sin moodboards"
          description="Crea colecciones de referencias visuales para inspirarte en tus sesiones."
          action={<Button onClick={openCreate}><Plus size={14} /> Nuevo moodboard</Button>}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([folder, folderItems]) => (
            <div key={folder}>
              {Object.keys(grouped).length > 1 && (
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen size={13} className="text-[var(--text-muted)]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{folder}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {folderItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/moodboards/${item.id}`)}
                    className="rounded-xl p-4 cursor-pointer group"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    {/* Preview grid placeholder */}
                    <div className="grid grid-cols-3 gap-1 mb-3 rounded-lg overflow-hidden h-20"
                         style={{ background: 'var(--bg-elevated)' }}>
                      {[0,1,2].map(idx => (
                        <div key={idx} className="flex items-center justify-center text-[var(--text-muted)]"
                             style={{ background: `hsl(${(item.id * 47 + idx * 30) % 360}, 15%, 12%)` }}>
                          {idx === 1 && <LayoutGrid size={16} strokeWidth={1} />}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.items_count ?? 0} elementos</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => openEdit(item, e)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item) }} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/8 transition-colors">
                          <Trash2 size={13} />
                        </button>
                        <ArrowRight size={14} className="text-[var(--text-muted)] ml-1" />
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Editar moodboard' : 'Nuevo moodboard'}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form) }} className="space-y-4">
          <Input label="Nombre *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Carpeta (agrupa tus moodboards)" value={form.folder} onChange={e => setForm(f => ({ ...f, folder: e.target.value }))} placeholder="Bodas, Retratos, Proyectos…" />
          <Textarea label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar moodboard"
        message={`¿Eliminar "${deleteTarget?.name}" y todo su contenido?`}
      />
    </div>
  )
}
