import type { Metadata } from 'next'

// Forms and edit screens have no search value.
export function formMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false } }
}
