import api from './client'

export const locationsApi = {
  list:         (params)         => api.get('/locations', { params }),
  get:          (id)             => api.get(`/locations/${id}`),
  create:       (data)           => api.post('/locations', data),
  update:       (id, data)       => api.put(`/locations/${id}`, data),
  delete:       (id)             => api.delete(`/locations/${id}`),
  uploadPhoto:  (id, formData)   => api.post(`/locations/${id}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto:  (id, photoId)    => api.delete(`/locations/${id}/photos/${photoId}`),
}
