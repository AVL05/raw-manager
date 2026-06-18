import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = error?.response?.status
        if (status === 401 || status === 403 || status === 404 || status === 422) return false
        return failureCount < 1
      },
      staleTime: 60_000,        // 1 min — no refetch si los datos son recientes
      gcTime: 5 * 60_000,       // 5 min en caché antes de borrar
      refetchOnWindowFocus: false, // no refetch al volver a la pestaña
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)