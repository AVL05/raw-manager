import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { galleriesApi } from '../../api/galleries'
import Spinner from '../../components/ui/Spinner'

export default function PublicGalleryPage() {
  const { token } = useParams()
  const [clientEmail, setClientEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  const { data: gallery, isLoading, error } = useQuery({
    queryKey: ['public-gallery', token],
    queryFn: () => galleriesApi.getPublic(token).then((r) => r.data),
  })

  const favMutation = useMutation({
    mutationFn: (imageId) =>
      galleriesApi.toggleFavorite(token, imageId, clientEmail),
    onSuccess: (res, imageId) => {
      setFavorites((prev) => {
        const next = new Set(prev)
        if (res.data.favorited) next.add(imageId)
        else next.delete(imageId)
        return next
      })
    },
  })

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (error || !gallery) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-xl font-semibold text-zinc-200 mb-2">Galeria no disponible</h1>
        <p className="text-sm text-zinc-500">Este enlace no es valido o ha expirado.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">{gallery.name}</h1>
          {gallery.description && <p className="text-zinc-400 max-w-lg mx-auto">{gallery.description}</p>}
          <p className="text-xs text-zinc-600 mt-2">{gallery.images?.length ?? 0} fotos</p>
        </div>

        {!emailSubmitted ? (
          <div className="max-w-sm mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-10">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Identificate para marcar favoritas</h2>
            <p className="text-xs text-zinc-500 mb-4">Introduce tu email para guardar tus fotos favoritas (opcional)</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                onClick={() => { if (clientEmail) setEmailSubmitted(true) }}
                className="bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                OK
              </button>
            </div>
            <button onClick={() => setEmailSubmitted(true)} className="text-xs text-zinc-600 hover:text-zinc-400 mt-3 w-full">
              Continuar sin identificarme
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gallery.images?.map((img) => (
            <div key={img.id} className="group relative aspect-square bg-zinc-900 rounded-lg overflow-hidden">
              <img
                src={img.thumbnail_url}
                alt={img.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {emailSubmitted && clientEmail && (
                <button
                  onClick={() => favMutation.mutate(img.id)}
                  className={'absolute top-2 right-2 p-1.5 rounded-full transition-all ' +
                    (favorites.has(img.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-black/50 text-white/60 opacity-0 group-hover:opacity-100'
                    )
                  }
                >
                  <svg className="h-4 w-4" fill={favorites.has(img.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-xs text-zinc-700">Galeria creada con RAW Manager</p>
        </div>
      </div>
    </div>
  )
}
