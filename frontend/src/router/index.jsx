import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

import AppLayout from '../components/shared/AppLayout'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ClientsPage from '../features/clients/ClientsPage'
import ClientDetailPage from '../features/clients/ClientDetailPage'
import SessionsPage from '../features/sessions/SessionsPage'
import SessionDetailPage from '../features/sessions/SessionDetailPage'
import QuotesPage from '../features/quotes/QuotesPage'
import QuoteDetailPage from '../features/quotes/QuoteDetailPage'
import InvoicesPage from '../features/invoices/InvoicesPage'
import GalleriesPage from '../features/galleries/GalleriesPage'
import GalleryDetailPage from '../features/galleries/GalleryDetailPage'
import PublicGalleryPage from '../features/galleries/PublicGalleryPage'
import ProfilePage from '../features/profile/ProfilePage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role && user.role !== 'photographer') return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user?.role === 'photographer') return <Navigate to="/dashboard" replace />
  return children
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: '/register',
    element: <GuestRoute><RegisterPage /></GuestRoute>,
  },
  {
    path: '/gallery/:token',
    element: <PublicGalleryPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'clients/:id', element: <ClientDetailPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'sessions/:id', element: <SessionDetailPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'quotes/:id', element: <QuoteDetailPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'galleries', element: <GalleriesPage /> },
      { path: 'galleries/:id', element: <GalleryDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])