import api from './client'

export const sessionsApi = {
  list: (params) => api.get('/sessions', { params }),
  get: (id) => api.get(/sessions/${id}),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(/sessions/${id}, data),
  delete: (id) => api.delete(/sessions/${id}),
  updateStatus: (id, status) => api.patch(/sessions/${id}/status, { status }),
}