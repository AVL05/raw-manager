import api from './client'

export const moodboardsApi = {
  list:       (params)       => api.get('/moodboards', { params }),
  get:        (id)           => api.get(`/moodboards/${id}`),
  create:     (data)         => api.post('/moodboards', data),
  update:     (id, data)     => api.put(`/moodboards/${id}`, data),
  delete:     (id)           => api.delete(`/moodboards/${id}`),
  addItem:    (id, formData) => api.post(`/moodboards/${id}/items`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeItem: (id, itemId)   => api.delete(`/moodboards/${id}/items/${itemId}`),
}
