import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { JournalClient } from './JournalClient'
import type { JournalEntry } from '@/lib/types'

export default async function JournalPage() {
  const { data: entries } = await supabase
    .from('journal')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return (
    <ThemeProvider>
      <Nav />
      <JournalClient entries={(entries ?? []) as JournalEntry[]} />
    </ThemeProvider>
  )
}
