import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Camera, FileText, Receipt, Images,
  LogOut, ChevronLeft, User, Command,
  Aperture, MapPin, LayoutGrid, BookImage, Wrench,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { dashboardApi } from '../../api/dashboard'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',  label: 'Dashboard',      Icon: LayoutDashboard },
      { to: '/clients',    label: 'Clientes',        Icon: Users },
      { to: '/sessions',   label: 'Sesiones',        Icon: Camera },
      { to: '/quotes',     label: 'Presupuestos',    Icon: FileText },
      { to: '/invoices',   label: 'Facturas',        Icon: Receipt, badge: 'overdue' },
      { to: '/galleries',  label: 'Galerías',        Icon: Images },
    ],
  },
  {
    label: 'Estudio',
    items: [
      { to: '/equipment',     label: 'Equipamiento',    Icon: Wrench },
      { to: '/presets',       label: 'Presets',         Icon: Aperture },
      { to: '/locations',     label: 'Localizaciones',  Icon: MapPin },
      { to: '/moodboards',    label: 'Moodboards',      Icon: LayoutGrid },
      { to: '/photo-library', label: 'Biblioteca',      Icon: BookImage },
    ],
  },
]

function NavItem({ to, label, Icon, badge, overdueCount, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
          isActive
            ? 'bg-[var(--accent-subtle)] text-white font-medium'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-r-full"
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}

          <Icon size={15} className="shrink-0" strokeWidth={isActive ? 2 : 1.5} />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 overflow-hidden whitespace-nowrap text-xs"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {!collapsed && badge === 'overdue' && overdueCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shrink-0">
              {overdueCount > 9 ? '9+' : overdueCount}
            </span>
          )}

          {collapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
              {label}
              {badge === 'overdue' && overdueCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                  {overdueCount}
                </span>
              )}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar, openCommandPalette } = useUiStore()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
    staleTime: 2 * 60_000,
  })

  const overdueCount = stats?.overdue_invoices ?? 0

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 52 : 220 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col shrink-0 overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)', minHeight: 52 }}>
        <div className="shrink-0 w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <Camera size={14} className="text-white" strokeWidth={2} />
        </div>
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap tracking-tight">RAW Manager</p>
              <p className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">Photography OS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command palette */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-2.5 pt-2.5"
          >
            <button
              onClick={openCommandPalette}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)] transition-all"
            >
              <Command size={11} />
              <span className="flex-1 text-left">Buscar...</span>
              <span className="font-mono text-[10px] bg-[var(--border-subtle)] px-1 rounded">⌘K</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto p-2 pt-2.5 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  overdueCount={overdueCount}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 ${
              isActive ? 'bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg-hover)]'
            }`
          }
        >
          <div className="shrink-0 w-7 h-7 rounded-full bg-[var(--bg-active)] border border-[var(--border-default)] flex items-center justify-center text-xs font-semibold text-[var(--text-secondary)]">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarCollapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              {user?.name}
            </span>
          )}
        </NavLink>

        <button
          onClick={async () => { await logout(); navigate('/login') }}
          className="group relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/8 transition-all duration-150"
        >
          <LogOut size={15} className="shrink-0" strokeWidth={1.5} />
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs whitespace-nowrap overflow-hidden"
              >
                Cerrar sesión
              </motion.span>
            )}
          </AnimatePresence>
          {sidebarCollapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Cerrar sesión
            </span>
          )}
        </button>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-150"
          title={sidebarCollapsed ? 'Expandir' : 'Contraer'}
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.28 }}>
            <ChevronLeft size={14} />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  )
}
