import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/site'
import { supabase } from '@/lib/supabase'
import { JournalClient } from './JournalClient'
import type { JournalEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Personal decision log: kept out of search results.
export const metadata: Metadata = {
  ...pageMetadata({ title: 'Decision journal', description: 'A running log of every buy, sell and note, with conviction and reasoning.', path: '/journal' }),
  robots: { index: false, follow: true },
}

export default async function JournalPage() {
  const { data: entries } = await supabase
    .from('journal')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return <JournalClient entries={(entries ?? []) as JournalEntry[]} />
}
