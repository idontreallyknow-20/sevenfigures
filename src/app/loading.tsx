export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-9 w-48 mb-3" />
      <div className="skeleton h-4 w-80 max-w-full mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10" />)}
      </div>
    </main>
  )
}
