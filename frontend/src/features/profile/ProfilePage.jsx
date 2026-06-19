import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import PageHeader from '../../components/shared/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const profile = user?.profile ?? {}

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    business_name: profile.business_name ?? '',
    nif: profile.nif ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    postal_code: profile.postal_code ?? '',
    country: profile.country ?? '',
    bio: profile.bio ?? '',
    website: profile.website ?? '',
    instagram: profile.instagram ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      updateUser(data)
      setSaved(true)
      setErrors({})
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err) => {
      setErrors(err?.response?.data?.errors ?? {})
    },
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <div>
      <PageHeader title="Mi perfil" description="Datos del fotógrafo y tu estudio" />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Datos personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name} onChange={set('name')} error={errors.name?.[0]} />
            <Input label="Teléfono" value={form.phone} onChange={set('phone')} error={errors.phone?.[0]} />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Datos del estudio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre del estudio" value={form.business_name} onChange={set('business_name')} error={errors.business_name?.[0]} />
            <Input label="NIF / CIF" value={form.nif} onChange={set('nif')} error={errors.nif?.[0]} />
            <Input label="Dirección" value={form.address} onChange={set('address')} error={errors.address?.[0]} className="sm:col-span-2" />
            <Input label="Ciudad" value={form.city} onChange={set('city')} error={errors.city?.[0]} />
            <Input label="Código postal" value={form.postal_code} onChange={set('postal_code')} error={errors.postal_code?.[0]} />
            <Input label="País" value={form.country} onChange={set('country')} error={errors.country?.[0]} />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Presencia online</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Web" value={form.website} onChange={set('website')} error={errors.website?.[0]} placeholder="https://..." />
            <Input label="Instagram" value={form.instagram} onChange={set('instagram')} error={errors.instagram?.[0]} placeholder="@usuario" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              placeholder="Breve descripción sobre ti o tu estudio..."
            />
            {errors.bio && <p className="text-xs text-red-400 mt-1">{errors.bio[0]}</p>}
          </div>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" loading={mutation.isPending}>Guardar cambios</Button>
          {saved && <p className="text-sm text-green-400">¡Cambios guardados!</p>}
        </div>
      </form>
    </div>
  )
}
