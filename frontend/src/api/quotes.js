import api from './client'

export const quotesApi = {
  list: (params) => api.get('/quotes', { params }),
  get: (id) => api.get(/quotes/${id}),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(/quotes/${id}, data),
  delete: (id) => api.delete(/quotes/${id}),
  updateStatus: (id, status) => api.patch(/quotes/${id}/status, { status }),
  pdf: (id) => api.get(/quotes/${id}/pdf, { responseType: 'blob' }),
}