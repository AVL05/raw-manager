import api from './client'

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  upcomingSessions: () => api.get('/dashboard/upcoming-sessions'),
  recentInvoices: () => api.get('/dashboard/recent-invoices'),
}