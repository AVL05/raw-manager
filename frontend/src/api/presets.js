import api from './client'

export const presetsApi = {
  list:   (params) => api.get('/presets', { params }),
  get:    (id)     => api.get(`/presets/${id}`),
  create: (data)   => api.post('/presets', data),
  update: (id, data) => api.put(`/presets/${id}`, data),
  delete: (id)     => api.delete(`/presets/${id}`),
}
