import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/auth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await authApi.login(credentials)
        localStorage.setItem('token', data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data.user
      },

      register: async (userData) => {
        const { data } = await authApi.register(userData)
        localStorage.setItem('token', data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data.user
      },

      logout: async () => {
        try { await authApi.logout() } catch {}
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        const { data } = await authApi.me()
        set({ user: data, isAuthenticated: true })
        return data
      },

      updateUser: (user) => set({ user }),
    }),
    { name: 'auth-store', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)