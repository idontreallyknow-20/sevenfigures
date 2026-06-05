import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { ScoreEditorClient } from './ScoreEditorClient'

export default async function EditScorePage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  const { data: score } = await supabase.from('scores').select('*').eq('ticker', ticker).single()
  return (
    <ThemeProvider>
      <Nav />
      <ScoreEditorClient ticker={ticker} initialScore={score} />
    </ThemeProvider>
  )
}
