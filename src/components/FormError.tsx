export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role="alert" className="text-xs px-3 py-2" style={{ color: 'var(--negative)', border: '0.5px solid var(--negative)' }}>
      {message}
    </p>
  )
}
