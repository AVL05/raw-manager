import api from './client'

export const galleriesApi = {
  list: (params) => api.get('/galleries', { params }),
  get: (id) => api.get(/galleries/${id}),
  create: (data) => api.post('/galleries', data),
  update: (id, data) => api.put(/galleries/${id}, data),
  delete: (id) => api.delete(/galleries/${id}),
  uploadImages: (id, files) => {
    const form = new FormData()
    files.forEach((f) => form.append('images[]', f))
    return api.post(/galleries/${id}/images, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteImage: (galleryId, imageId) => api.delete(/galleries/${galleryId}/images/${imageId}),
  getPublic: (token) => api.get(/public/gallery/${token}),
  toggleFavorite: (token, imageId, clientEmail) =>
    api.post(/public/gallery/${token}/favorite/${imageId}, { client_email: clientEmail }),
}