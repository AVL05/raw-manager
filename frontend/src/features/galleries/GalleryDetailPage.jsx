import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { galleriesApi } from '../../api/galleries'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useState } from 'react'

export default function GalleryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileInputRef = useRef()
  const [deletingImg, setDeletingImg] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: () => galleriesApi.get(id).then((r) => r.data),
  })

  const deleteImgMutation = useMutation({
    mutationFn: (imgId) => galleriesApi.deleteImage(id, imgId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery', id] }); setDeletingImg(null) },
  })

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      await galleriesApi.uploadImages(id, files)
      qc.invalidateQueries({ queryKey: ['gallery', id] })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(gallery?.public_url ?? '')
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={gallery?.name}
        description={gallery?.session?.name}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={copyLink}>Copiar enlace cliente</Button>
            <Button onClick={() => fileInputRef.current.click()} loading={uploading}>
              Subir imagenes
            </Button>
            <Button variant="secondary" onClick={() => navigate('/galleries')}>Volver</Button>
          </div>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-4">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Enlace privado del cliente</p>
          <p className="text-sm font-mono text-zinc-300 break-all">{gallery?.public_url}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={copyLink} className="shrink-0">Copiar</Button>
      </div>

      {!gallery?.images?.length ? (
        <EmptyState
          icon="📸"
          title="Sin imagenes todavia"
          description="Sube las fotos de la sesion para compartirlas con el cliente"
          action={
            <Button onClick={() => fileInputRef.current.click()} loading={uploading}>
              Subir imagenes
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {gallery.images.map((img) => (
            <div key={img.id} className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden">
              <img src={img.thumbnail_url} alt={img.filename} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => setDeletingImg(img)}
                  className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingImg}
        onClose={() => setDeletingImg(null)}
        onConfirm={() => deleteImgMutation.mutate(deletingImg.id)}
        loading={deleteImgMutation.isPending}
        title="Eliminar imagen"
        message="Se eliminara esta imagen de la galeria."
      />
    </div>
  )
}
