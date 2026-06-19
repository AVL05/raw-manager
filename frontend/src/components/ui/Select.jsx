export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-all duration-150 cursor-pointer ${className}`}
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border-default)'}`,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)' }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
