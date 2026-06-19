import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { quotesApi } from '../../api/quotes'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import { formatCurrency } from '../../utils/formatters'

function newItem() {
  return { description: '', quantity: 1, unit_price: '' }
}

export default function QuoteForm({ initial, sessions, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    photo_session_id: initial?.photo_session_id ?? '',
    tax_rate: initial?.tax_rate ?? 21,
    valid_until: initial?.valid_until ?? '',
    notes: initial?.notes ?? '',
    items: initial?.items?.length
      ? initial.items.map((i) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price }))
      : [newItem()],
  })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const setItem = (idx, field) => (e) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, [field]: e.target.value } : it)),
    }))

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, newItem()] }))
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  const subtotal = form.items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0)
  const tax = subtotal * ((parseFloat(form.tax_rate) || 0) / 100)
  const total = subtotal + tax

  const mutation = useMutation({
    mutationFn: initial
      ? (data) => quotesApi.update(initial.id, data)
      : (data) => quotesApi.create(data),
    onSuccess: () => onSuccess(),
    onError: (err) => {
      if (err.response?.status === 422) {
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      }
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); mutation.mutate(form) }} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Select label="Sesión *" value={form.photo_session_id} onChange={set('photo_session_id')} error={errors.photo_session_id} required>
            <option value="">Seleccionar sesión...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.client?.name}</option>
            ))}
          </Select>
        </div>
        <Input label="IVA (%)" type="number" min="0" max="100" step="0.1" value={form.tax_rate} onChange={set('tax_rate')} />
        <Input label="Valido hasta" type="date" value={form.valid_until} onChange={set('valid_until')} className="col-span-1" />
        <div className="col-span-2">
          <Textarea label="Notas" value={form.notes} onChange={set('notes')} placeholder="Condiciones, observaciones..." rows={2} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-300">Conceptos</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>+ Anadir concepto</Button>
        </div>

        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                {idx === 0 && <label className="text-xs text-zinc-500 mb-1 block">Descripcion</label>}
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Descripcion del concepto"
                  value={item.description}
                  onChange={setItem(idx, 'description')}
                  required
                />
              </div>
              <div className="col-span-2">
                {idx === 0 && <label className="text-xs text-zinc-500 mb-1 block">Cantidad</label>}
                <input
                  type="number" min="0.01" step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={item.quantity}
                  onChange={setItem(idx, 'quantity')}
                  required
                />
              </div>
              <div className="col-span-3">
                {idx === 0 && <label className="text-xs text-zinc-500 mb-1 block">Precio unit. (EUR)</label>}
                <input
                  type="number" min="0" step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="0.00"
                  value={item.unit_price}
                  onChange={setItem(idx, 'unit_price')}
                  required
                />
              </div>
              <div className="col-span-1 text-right">
                {idx === 0 && <div className="text-xs text-zinc-500 mb-1">Subtotal</div>}
                <span className="text-sm text-zinc-300">
                  {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-zinc-800 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Base imponible</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>IVA ({form.tax_rate}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-zinc-100 text-base border-t border-zinc-700 pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={mutation.isPending}>
          {initial ? 'Guardar cambios' : 'Crear presupuesto'}
        </Button>
      </div>
    </form>
  )
}
