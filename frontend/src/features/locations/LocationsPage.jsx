import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, MapPin, Trash2, Edit2, Sun, Cloud, Wind, Droplets, Navigation } from 'lucide-react'
import { locationsApi } from '../../api/locations'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const EMPTY_FORM = { name: '', latitude: '', longitude: '', category: '', description: '', address: '' }

function WeatherWidget({ lat, lon }) {
  const [weather, setWeather] = useState(null)
  const [solar, setSolar] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lat || !lon) return
    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,cloud_cover,wind_speed_10m,precipitation&timezone=auto`).then(r => r.json()),
      fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=${today}`).then(r => r.json()),
    ]).then(([w, s]) => {
      setWeather(w.current)
      setSolar(s.results)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [lat, lon])

  if (!lat || !lon) return null

  return (
    <div className="mt-3 rounded-lg p-3 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      {loading ? (
        <p className="text-[11px] text-[var(--text-muted)] text-center py-1">Cargando datos…</p>
      ) : (
        <>
          {weather && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <Sun size={12} className="text-yellow-400" />
                <span>{Math.round(weather.temperature_2m)}°C</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <Cloud size={12} className="text-blue-400" />
                <span>{weather.cloud_cover}% nubes</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <Wind size={12} className="text-[var(--text-muted)]" />
                <span>{Math.round(weather.wind_speed_10m)} km/h</span>
              </div>
              {weather.precipitation > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-400">
                  <Droplets size={12} />
                  <span>{weather.precipitation}mm</span>
                </div>
              )}
            </div>
          )}
          {solar && (
            <div className="flex items-center gap-4 flex-wrap pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-[10px] text-[var(--text-muted)]">🌅 {solar.sunrise}</span>
              <span className="text-[10px] text-[var(--text-muted)]">🌇 {solar.sunset}</span>
              <span className="text-[10px] text-yellow-400">✨ Golden: {solar.golden_hour}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function LocationsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.list({ per_page: 100 }).then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? locationsApi.update(editItem.id, d) : locationsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => locationsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); setDeleteTarget(null) },
  })

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (item) => { setEditItem(item); setForm({ ...item }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const items = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Localizaciones"
        description="Guarda y consulta tus escenarios favoritos con datos de luz y clima"
        action={<Button onClick={openCreate}><Plus size={14} /> Nueva localización</Button>}
      />

      {isLoading ? <Spinner /> : items.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="Sin localizaciones"
          description="Guarda tus escenarios de fotografía con coordenadas y consulta el clima y la hora dorada en tiempo real."
          action={<Button onClick={openCreate}><Plus size={14} /> Nueva localización</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <MapPin size={14} className="text-[var(--accent)] shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                    {item.category && (
                      <span className="text-[10px] text-[var(--text-muted)]">{item.category}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/8 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {item.address && (
                <p className="text-[11px] text-[var(--text-muted)] mb-2 truncate">{item.address}</p>
              )}

              {(item.latitude && item.longitude) && (
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded font-mono">
                    {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                  </code>
                  <a
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--accent)] hover:underline text-[10px] flex items-center gap-1"
                  >
                    <Navigation size={10} /> Maps
                  </a>
                </div>
              )}

              {item.description && (
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2 line-clamp-2">{item.description}</p>
              )}

              {/* Weather/solar toggle */}
              {item.latitude && item.longitude && (
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="text-[11px] text-[var(--accent)] hover:underline"
                >
                  {expanded === item.id ? 'Ocultar datos' : '🌤 Ver clima y luz'}
                </button>
              )}

              {expanded === item.id && (
                <WeatherWidget lat={item.latitude} lon={item.longitude} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Editar localización' : 'Nueva localización'} size="md">
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form) }} className="space-y-4">
          <Input label="Nombre *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Categoría (ej: Urbana, Montaña, Costa)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          <Input label="Dirección" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitud" type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="40.4168" />
            <Input label="Longitud" type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="-3.7038" />
          </div>
          <Textarea label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
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
        title="Eliminar localización"
        message={`¿Eliminar "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
