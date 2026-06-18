import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { clientsApi } from '../../api/clients'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'

export default function ClientForm({ initial, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    postal_code: initial?.postal_code ?? '',
    nif: initial?.nif ?? '',
    notes: initial?.notes ?? '',
  })
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const mutation = useMutation({
    mutationFn: initial
      ? (data) => clientsApi.update(initial.id, data)
      : (data) => clientsApi.create(data),
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
          <Input label="Nombre *" value={form.name} onChange={set('name')} error={errors.name} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Telefono" value={form.phone} onChange={set('phone')} />
        <Input label="Direccion" value={form.address} onChange={set('address')} />
        <Input label="Ciudad" value={form.city} onChange={set('city')} />
        <Input label="Codigo postal" value={form.postal_code} onChange={set('postal_code')} />
        <Input label="NIF / CIF" value={form.nif} onChange={set('nif')} />
        <div className="col-span-2">
          <Textarea label="Notas" value={form.notes} onChange={set('notes')} placeholder="Notas internas..." />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={mutation.isPending}>
          {initial ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  )
}
