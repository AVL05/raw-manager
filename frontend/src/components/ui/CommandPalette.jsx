import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Camera, FileText, Receipt,
  Images, User, Search, ArrowRight, Plus, Command,
  UserPlus, CalendarPlus, FileSignature,
} from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { clientsApi } from '../../api/clients'
import { sessionsApi } from '../../api/sessions'

const STATIC_COMMANDS = [
  {
    group: 'Navegar',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
      { id: 'nav-clients',   label: 'Clientes',   Icon: Users,           path: '/clients' },
      { id: 'nav-sessions',  label: 'Sesiones',   Icon: Camera,          path: '/sessions' },
      { id: 'nav-quotes',    label: 'Presupuestos', Icon: FileText,      path: '/quotes' },
      { id: 'nav-invoices',  label: 'Facturas',   Icon: Receipt,         path: '/invoices' },
      { id: 'nav-galleries', label: 'Galerías',   Icon: Images,          path: '/galleries' },
      { id: 'nav-profile',   label: 'Mi perfil',  Icon: User,            path: '/profile' },
    ],
  },
  {
    group: 'Crear',
    items: [
      { id: 'create-client',  label: 'Nuevo cliente',      Icon: UserPlus,        path: '/clients',   action: 'create' },
      { id: 'create-session', label: 'Nueva sesión',       Icon: CalendarPlus,    path: '/sessions',  action: 'create' },
      { id: 'create-quote',   label: 'Nuevo presupuesto',  Icon: FileSignature,   path: '/quotes',    action: 'create' },
    ],
  },
]

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[var(--accent-subtle)] text-[var(--accent)] rounded-sm font-semibold not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function CommandPalette() {
  const navigate = useNavigate()
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette } = useUiStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [clientResults, setClientResults] = useState([])
  const [sessionResults, setSessionResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  /* Open on Ctrl+K / Cmd+K */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (commandPaletteOpen) closeCommandPalette()
        else openCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, openCommandPalette, closeCommandPalette])

  /* Focus input when opens */
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelected(0)
      setClientResults([])
      setSessionResults([])
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [commandPaletteOpen])

  /* Search API with debounce */
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setClientResults([])
      setSessionResults([])
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const [c, s] = await Promise.all([
          clientsApi.list({ search: query, per_page: 5 }).then(r => r.data?.data ?? []),
          sessionsApi.list({ search: query, per_page: 5 }).then(r => r.data?.data ?? []),
        ])
        setClientResults(c)
        setSessionResults(s)
      } catch {
        setClientResults([])
        setSessionResults([])
      } finally {
        setSearching(false)
      }
    }, 250)
  }, [query])

  /* Build filtered command list */
  const filtered = query.length < 2
    ? STATIC_COMMANDS
    : (() => {
        const q = query.toLowerCase()
        const groups = []

        const staticFiltered = STATIC_COMMANDS.map(g => ({
          ...g,
          items: g.items.filter(i => i.label.toLowerCase().includes(q)),
        })).filter(g => g.items.length > 0)

        groups.push(...staticFiltered)

        if (clientResults.length) {
          groups.push({
            group: 'Clientes',
            items: clientResults.map(c => ({
              id: `client-${c.id}`,
              label: c.name,
              sub: c.email,
              Icon: Users,
              path: `/clients/${c.id}`,
            })),
          })
        }
        if (sessionResults.length) {
          groups.push({
            group: 'Sesiones',
            items: sessionResults.map(s => ({
              id: `session-${s.id}`,
              label: s.name,
              sub: s.client?.name,
              Icon: Camera,
              path: `/sessions/${s.id}`,
            })),
          })
        }

        return groups
      })()

  const allItems = filtered.flatMap(g => g.items)

  const handleSelect = useCallback((item) => {
    closeCommandPalette()
    navigate(item.path)
  }, [closeCommandPalette, navigate])

  /* Keyboard navigation */
  useEffect(() => {
    if (!commandPaletteOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') { closeCommandPalette(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(s => Math.min(s + 1, allItems.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(s => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (allItems[selected]) handleSelect(allItems[selected])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, allItems, selected, handleSelect, closeCommandPalette])

  useEffect(() => { setSelected(0) }, [query])

  let globalIndex = 0

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && closeCommandPalette()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[560px] rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(94,106,210,0.08)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <Search size={16} className="text-[var(--text-muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar o ir a..."
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm outline-none"
              />
              {searching && (
                <div className="h-4 w-4 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin shrink-0" />
              )}
              <kbd className="shrink-0 text-[10px] text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded font-mono">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-[var(--text-muted)] py-10">
                  Sin resultados para "{query}"
                </p>
              )}

              {filtered.map((group) => (
                <div key={group.group}>
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    {group.group}
                  </p>
                  {group.items.map((item) => {
                    const idx = globalIndex++
                    const isSelected = idx === selected
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelected(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-75 ${
                          isSelected
                            ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <item.Icon size={15} className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <span>{highlight(item.label, query)}</span>
                          {item.sub && (
                            <span className="ml-2 text-[11px] text-[var(--text-muted)]">{item.sub}</span>
                          )}
                        </div>
                        {isSelected && (
                          <ArrowRight size={13} className="text-[var(--text-muted)] shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 text-[10px] text-[var(--text-muted)]" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="flex items-center gap-3">
                <span><kbd className="font-mono bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-1 rounded">↑↓</kbd> navegar</span>
                <span><kbd className="font-mono bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-1 rounded">↵</kbd> abrir</span>
              </span>
              <span className="flex items-center gap-1">
                <Command size={10} /> K
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
