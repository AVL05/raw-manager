import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Wrench, Camera, Aperture, Zap, Package, Trash2, Edit2, ChevronDown } from 'lucide-react'
import { equipmentApi } from '../../api/equipment'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const TYPE_ICONS = {
  camera:    Camera,
  lens:      Aperture,
  lighting:  Zap,
  tripod:    Package,
  bag:       Package,
  accessory: Package,
  other:     Wrench,
}

const TYPE_LABELS = {
  camera:    'Cámara',
  lens:      'Objetivo',
  lighting:  'Iluminación',
  tripod:    'Trípode',
  bag:       'Bolsa',
  accessory: 'Accesorio',
  other:     'Otro',
}

const CONDITION_LABELS = {
  excellent: 'Excelente',
  good:      'Bueno',
  fair:      'Regular',
  poor:      'Malo',
}

const CONDITION_COLORS = {
  excellent: 'text-green-400',
  good:      'text-blue-400',
  fair:      'text-yellow-400',
  poor:      'text-red-400',
}

const EMPTY_FORM = {
  name: '', brand: '', model: '', type: 'camera',
  serial_number: '', purchase_date: '', purchase_price: '',
  condition: 'good', notes: '', is_active: true,
}

export default function EquipmentPage() {
  const qc = useQueryClient()
  const [filterType, setFilterType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', filterType],
    queryFn: () => equipmentApi.list({ type: filterType || undefined, per_page: 100 }).then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? equipmentApi.update(editItem.id, d) : equipmentApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => equipmentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); setDeleteTarget(null) },
  })

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (item) => { setEditItem(item); setForm({ ...item, purchase_date: item.purchase_date ?? '', purchase_price: item.purchase_price ?? '' }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const items = data?.data ?? []

  const grouped = items.reduce((acc, item) => {
    const key = item.type
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Equipamiento"
        description="Gestiona tu equipo fotográfico"
        action={<Button onClick={openCreate}><Plus size={14} /> Añadir equipo</Button>}
      />

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...Object.keys(TYPE_LABELS)].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === type
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {type ? TYPE_LABELS[type] : 'Todo'}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : items.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Sin equipamiento"
          description="Añade tu cámara, objetivos y accesorios para tener un inventario de tu equipo."
          action={<Button onClick={openCreate}><Plus size={14} /> Añadir equipo</Button>}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, typeItems]) => {
            const Icon = TYPE_ICONS[type] ?? Wrench
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} className="text-[var(--text-muted)]" strokeWidth={1.5} />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{TYPE_LABELS[type]}</p>
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)]">{typeItems.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {typeItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl p-4 flex flex-col gap-3"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                          {(item.brand || item.model) && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{[item.brand, item.model].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/8 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {item.condition && (
                          <span className={`text-[11px] font-medium ${CONDITION_COLORS[item.condition]}`}>
                            {CONDITION_LABELS[item.condition]}
                          </span>
                        )}
                        {item.purchase_price && (
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {Number(item.purchase_price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                        )}
                      </div>

                      {!item.is_active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700/40 text-zinc-500 self-start">Inactivo</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal form */}
      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Editar equipo' : 'Añadir equipo'} size="md">
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Nombre *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <Input label="Marca" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            <Input label="Modelo" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
            <Select label="Tipo *" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select label="Estado" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
              {Object.entries(CONDITION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Input label="Número de serie" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
            <Input label="Precio de compra (€)" type="number" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} />
            <div className="col-span-2">
              <Input label="Fecha de compra" type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Textarea label="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Añadir'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar equipo"
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
