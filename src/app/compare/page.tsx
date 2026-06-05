import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { CompareClient } from './CompareClient'
import type { Security, Score } from '@/lib/types'

export default async function ComparePage() {
  const [secRes, scoreRes] = await Promise.all([
    supabase.from('securities').select('*'),
    supabase.from('scores').select('*'),
  ])
  return (
    <ThemeProvider>
      <Nav />
      <CompareClient securities={(secRes.data ?? []) as Security[]} scores={(scoreRes.data ?? []) as Score[]} />
    </ThemeProvider>
  )
}
