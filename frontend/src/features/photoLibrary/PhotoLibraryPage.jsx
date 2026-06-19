import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, BookImage, Trash2, X, Tag, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { photoLibraryApi } from '../../api/photoLibrary'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

function Lightbox({ photos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const photo = photos[idx]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white">
        <X size={20} />
      </button>

      {idx > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setIdx(i => i - 1) }}
          className="absolute left-4 p-2 text-white/60 hover:text-white">
          <ChevronLeft size={24} />
        </button>
      )}
      {idx < photos.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setIdx(i => i + 1) }}
          className="absolute right-4 p-2 text-white/60 hover:text-white">
          <ChevronRight size={24} />
        </button>
      )}

      <motion.img
        key={idx}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        src={`/storage/${photo.path}`}
        alt={photo.filename}
        className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-white/60 text-xs">{photo.filename}</p>
        {photo.category && <p className="text-white/40 text-[11px]">{photo.category}</p>}
      </div>
    </motion.div>
  )
}

export default function PhotoLibraryPage() {
  const qc = useQueryClient()
  const inputRef = useRef(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['photo-library', filterCategory, search],
    queryFn: () => photoLibraryApi.list({
      category: filterCategory || undefined,
      search: search || undefined,
      per_page: 100,
    }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => photoLibraryApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['photo-library'] }); setDeleteTarget(null) },
  })

  const handleUpload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('photos[]', f))
    if (filterCategory) fd.append('category', filterCategory)
    try {
      await photoLibraryApi.upload(fd)
      qc.invalidateQueries({ queryKey: ['photo-library'] })
    } finally {
      setUploading(false)
    }
  }

  const items      = data?.data ?? []
  const categories = [...new Set(items.map(p => p.category).filter(Boolean))]

  return (
    <div>
      <PageHeader
        title="Biblioteca personal"
        description="Tu archivo fotográfico privado"
        action={
          <Button onClick={() => inputRef.current?.click()} loading={uploading}>
            <Upload size={14} /> Subir fotos
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleUpload(e.target.files)}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex-1 min-w-48 max-w-xs">
          <Search size={13} className="text-[var(--text-muted)] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-full"
          />
        </div>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterCategory === cat
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]'
            }`}
          >
            <Tag size={11} /> {cat}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : items.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title="Biblioteca vacía"
          description="Sube tus mejores fotos para tener un archivo personal organizado con categorías y etiquetas."
          action={<Button onClick={() => inputRef.current?.click()}><Upload size={14} /> Subir fotos</Button>}
        />
      ) : (
        <div className="columns-2 md:columns-3 xl:columns-4 gap-3 space-y-3">
          {items.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="group relative break-inside-avoid rounded-lg overflow-hidden cursor-pointer"
              style={{ border: '1px solid var(--border-subtle)' }}
              onClick={() => setLightbox(i)}
            >
              <img
                src={`/storage/${photo.path}`}
                alt={photo.filename}
                className="w-full block object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                  <div className="flex-1 min-w-0">
                    {photo.category && (
                      <span className="text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded">{photo.category}</span>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(photo) }}
                    className="p-1.5 bg-black/50 text-white/70 hover:text-red-400 rounded-md transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox photos={items} startIndex={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar foto"
        message="¿Eliminar esta foto de la biblioteca?"
      />
    </div>
  )
}
