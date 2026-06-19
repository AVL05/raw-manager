export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div className="flex justify-center items-center p-8">
      <div
        className={`${sizes[size]} border-2 rounded-full animate-spin`}
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  )
}
