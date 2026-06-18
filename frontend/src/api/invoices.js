import api from './client'

export const invoicesApi = {
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(/invoices/${id}),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, status) => api.patch(/invoices/${id}/status, { status }),
  pdf: (id) => api.get(/invoices/${id}/pdf, { responseType: 'blob' }),
}