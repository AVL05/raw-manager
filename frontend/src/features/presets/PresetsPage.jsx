import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Copy, Check, Camera, ChevronRight } from 'lucide-react'
import { presetsApi } from '../../api/presets'
import { equipmentApi } from '../../api/equipment'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const EMPTY_FORM = {
  name: '', equipment_id: '', category: '', iso: '', aperture: '',
  shutter_speed: '', white_balance: '', exposure_compensation: '', notes: '',
}

function PresetParam({ label, value }) {
  if (!value && value !== 0) return null
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <button
      onClick={handleClick}
      title="Copiar"
      className="flex flex-col gap-0.5 text-left p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] group"
    >
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono font-semibold text-[var(--text-primary)] flex items-center gap-1">
        {value}
        {copied
          ? <Check size={10} className="text-green-400 shrink-0" />
          : <Copy size={10} className="opacity-0 group-hover:opacity-40 shrink-0 transition-opacity" />
        }
      </span>
    </button>
  )
}

function CameraSelector({ cameras, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      {/* "Todas" pill */}
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
          selectedId === null
            ? 'text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-subtle)]'
            : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]'
        }`}
      >
        <Camera size={14} />
        Todas las cámaras
      </button>

      {cameras.map((cam) => (
        <button
          key={cam.id}
          onClick={() => onSelect(cam.id)}
          className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
            selectedId === cam.id
              ? 'text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-subtle)]'
              : 'text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
          }`}
          style={{ background: selectedId === cam.id ? undefined : 'var(--bg-surface)' }}
        >
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: selectedId === cam.id ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
              color: selectedId === cam.id ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {cam.brand?.[0] ?? '?'}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold leading-tight">{cam.name}</p>
            {cam.model && (
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">{cam.model}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

export default function PresetsPage() {
  const qc = useQueryClient()
  const [selectedCamera, setSelectedCamera] = useState(null) // null = todas
  const [filterCategory, setFilterCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Cámaras del inventario
  const { data: equipmentData } = useQuery({
    queryKey: ['equipment', 'cameras'],
    queryFn: () => equipmentApi.list({ type: 'camera', per_page: 50 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const cameras = equipmentData?.data ?? []

  // Presets filtrados por cámara seleccionada
  const { data, isLoading } = useQuery({
    queryKey: ['presets', selectedCamera, filterCategory],
    queryFn: () => presetsApi.list({
      equipment_id: selectedCamera ?? undefined,
      category: filterCategory || undefined,
      per_page: 100,
    }).then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? presetsApi.update(editItem.id, d) : presetsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presets'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => presetsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presets'] }); setDeleteTarget(null) },
  })

  const openCreate = () => {
    setEditItem(null)
    setForm({ ...EMPTY_FORM, equipment_id: selectedCamera ?? '' })
    setModalOpen(true)
  }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      ...item,
      equipment_id: item.equipment_id ?? '',
      exposure_compensation: item.exposure_compensation ?? '',
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const handleSelectCamera = (id) => {
    setSelectedCamera(id)
    setFilterCategory('')
  }

  const items = data?.data ?? []
  const categories = [...new Set(items.map(p => p.category).filter(Boolean))]
  const filtered = filterCategory ? items.filter(p => p.category === filterCategory) : items

  const cameraOptions = [
    { value: '', label: 'Sin cámara asignada' },
    ...cameras.map(c => ({ value: c.id, label: `${c.name}${c.model ? ` — ${c.model}` : ''}` })),
  ]

  // Nombre de la cámara activa para el header
  const activeCameraName = selectedCamera
    ? cameras.find(c => c.id === selectedCamera)?.name
    : null

  return (
    <div>
      <PageHeader
        title={activeCameraName ? `Presets — ${activeCameraName}` : 'Presets fotográficos'}
        description={
          activeCameraName
            ? 'Configuraciones guardadas para esta cámara'
            : 'Selecciona una cámara o ve todos los presets'
        }
        action={<Button onClick={openCreate}><Plus size={14} /> Nuevo preset</Button>}
      />

      {/* Selector de cámara */}
      {cameras.length > 0 && (
        <CameraSelector
          cameras={cameras}
          selectedId={selectedCamera}
          onSelect={handleSelectCamera}
        />
      )}

      {/* Filtro por categoría */}
      <AnimatePresence>
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mb-6 flex-wrap overflow-hidden"
          >
            {['', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                    : 'text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {cat || 'Todas las categorías'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⚙️"
          title={selectedCamera ? 'Sin presets para esta cámara' : 'Sin presets'}
          description={
            selectedCamera
              ? 'Crea tu primer preset para esta cámara con sus ajustes de exposición e ISO habituales.'
              : 'Guarda tus configuraciones de exposición, balance de blancos e ISO para reutilizarlas.'
          }
          action={<Button onClick={openCreate}><Plus size={14} /> Nuevo preset</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              {/* Cabecera */}
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.category && (
                      <span className="text-[10px] text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                    {item.equipment && !selectedCamera && (
                      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                        <Camera size={9} />
                        {item.equipment.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Parámetros — cada uno es copiable individualmente */}
              <div className="grid grid-cols-3 gap-1 rounded-lg p-1" style={{ background: 'var(--bg-elevated)' }}>
                <PresetParam label="ISO" value={item.iso} />
                <PresetParam label="Apertura" value={item.aperture ? `f/${item.aperture}` : null} />
                <PresetParam label="Velocidad" value={item.shutter_speed} />
                <PresetParam label="WB" value={item.white_balance} />
                <PresetParam
                  label="Exp. comp."
                  value={
                    item.exposure_compensation != null
                      ? (item.exposure_compensation >= 0 ? `+${item.exposure_compensation}` : item.exposure_compensation)
                      : null
                  }
                />
              </div>

              {item.notes && (
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.notes}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Editar preset' : 'Nuevo preset'} size="md">
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Nombre *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            {/* Selector de cámara — el paso clave */}
            <div className="col-span-2">
              <Select
                label="Cámara"
                value={form.equipment_id}
                onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}
                options={cameraOptions}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Categoría (ej: Paisaje, Retrato, Boda)"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              />
            </div>

            <Input
              label="ISO"
              value={form.iso}
              onChange={e => setForm(f => ({ ...f, iso: e.target.value }))}
              placeholder="100, 400, 3200…"
            />
            <Input
              label="Apertura (f/)"
              value={form.aperture}
              onChange={e => setForm(f => ({ ...f, aperture: e.target.value }))}
              placeholder="1.8, 2.8, 5.6…"
            />
            <Input
              label="Velocidad"
              value={form.shutter_speed}
              onChange={e => setForm(f => ({ ...f, shutter_speed: e.target.value }))}
              placeholder="1/250, 1/60…"
            />
            <Input
              label="Balance de blancos"
              value={form.white_balance}
              onChange={e => setForm(f => ({ ...f, white_balance: e.target.value }))}
              placeholder="Auto, 5500K…"
            />
            <div className="col-span-2">
              <Input
                label="Compensación de exposición"
                type="number"
                min="-5"
                max="5"
                step="0.3"
                value={form.exposure_compensation}
                onChange={e => setForm(f => ({ ...f, exposure_compensation: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="Notas"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
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
        title="Eliminar preset"
        message={`¿Eliminar "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
