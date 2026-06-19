import api from './client'

export const equipmentApi = {
  list:    (params) => api.get('/equipment', { params }),
  get:     (id)    => api.get(`/equipment/${id}`),
  create:  (data)  => api.post('/equipment', data),
  update:  (id, data) => api.put(`/equipment/${id}`, data),
  delete:  (id)    => api.delete(`/equipment/${id}`),
}
