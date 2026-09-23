import { formMetadata } from '@/lib/noindex'

export const metadata = formMetadata('New journal entry')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
