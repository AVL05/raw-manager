import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'

const SESSION_TYPES = [
  { value: 'wedding', label: 'Boda' },
  { value: 'portrait', label: 'Retrato' },
  { value: 'product', label: 'Producto' },
  { value: 'event', label: 'Evento' },
  { value: 'car', label: 'Coche' },
  { value: 'landscape', label: 'Paisaje' },
  { value: 'other', label: 'Otro' },
]

const SESSION_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'done', label: 'Realizada' },
  { value: 'delivered', label: 'Entregada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export default function SessionForm({ initial, clients, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    client_id: initial?.client?.id ?? initial?.client_id ?? '',
    name: initial?.name ?? '',
    date: initial?.date ?? '',
    time: initial?.time ?? '',
    location: initial?.location ?? '',
    type: initial?.type ?? 'portrait',
    status: initial?.status ?? 'pending',
    price: initial?.price ?? '',
    internal_notes: initial?.internal_notes ?? '',
  })
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const mutation = useMutation({
    mutationFn: initial
      ? (data) => sessionsApi.update(initial.id, data)
      : (data) => sessionsApi.create(data),
    onSuccess: () => onSuccess(),
    onError: (err) => {
      if (err.response?.status === 422) {
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      }
    },
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setErrors({}); mutation.mutate(form) }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Select label="Cliente *" value={form.client_id} onChange={set('client_id')} error={errors.client_id} required>
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="col-span-2">
          <Input label="Nombre de la sesion *" value={form.name} onChange={set('name')} error={errors.name} required />
        </div>
        <Input label="Fecha *" type="date" value={form.date} onChange={set('date')} error={errors.date} required />
        <Input label="Hora" type="time" value={form.time} onChange={set('time')} />
        <div className="col-span-2">
          <Input label="Ubicacion" value={form.location} onChange={set('location')} placeholder="Lugar de la sesion..." />
        </div>
        <Select label="Tipo" value={form.type} onChange={set('type')}>
          {SESSION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
        <Select label="Estado" value={form.status} onChange={set('status')}>
          {SESSION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <div className="col-span-2">
          <Input label="Precio (EUR)" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} placeholder="0.00" />
        </div>
        <div className="col-span-2">
          <Textarea label="Notas internas" value={form.internal_notes} onChange={set('internal_notes')} placeholder="Notas que no vera el cliente..." rows={3} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={mutation.isPending}>
          {initial ? 'Guardar cambios' : 'Crear sesion'}
        </Button>
      </div>
    </form>
  )
}
