export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount ?? 0)

export const formatDate = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

export const formatDateLong = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export const SESSION_TYPE_LABELS = {
  wedding: 'Boda',
  portrait: 'Retrato',
  product: 'Producto',
  event: 'Evento',
  car: 'Coche',
  landscape: 'Paisaje',
  other: 'Otro',
}

export const SESSION_STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  done: 'Realizada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
}

export const QUOTE_STATUS_LABELS = {
  draft: 'Borrador',
  sent: 'Enviado',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

export const INVOICE_STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagada',
  overdue: 'Vencida',
}

export const SESSION_STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  done: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export const QUOTE_STATUS_COLORS = {
  draft: 'bg-zinc-500/20 text-zinc-400',
  sent: 'bg-blue-500/20 text-blue-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

export const INVOICE_STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
}