import api from './client'

export const photoLibraryApi = {
  list:   (params)       => api.get('/photo-library', { params }),
  get:    (id)           => api.get(`/photo-library/${id}`),
  upload: (formData)     => api.post('/photo-library/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data)     => api.put(`/photo-library/${id}`, data),
  delete: (id)           => api.delete(`/photo-library/${id}`),
}
