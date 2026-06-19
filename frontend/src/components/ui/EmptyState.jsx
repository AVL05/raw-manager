export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-4xl mb-4 opacity-20">{icon}</div>}
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--text-muted)] mb-6 max-w-xs leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}
