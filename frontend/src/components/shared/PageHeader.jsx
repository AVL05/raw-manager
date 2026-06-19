import { motion } from 'framer-motion'

export default function PageHeader({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex items-start justify-between mb-7"
    >
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  )
}
