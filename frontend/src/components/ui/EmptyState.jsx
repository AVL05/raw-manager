export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-5xl mb-4 opacity-30">{icon}</div>}
      <h3 className="text-lg font-medium text-zinc-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}