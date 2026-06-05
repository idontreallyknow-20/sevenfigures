import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { ThesisEditorClient } from './ThesisEditorClient'

export default async function EditThesisPage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  const { data: thesis } = await supabase.from('theses').select('*').eq('ticker', ticker).single()
  return (
    <ThemeProvider>
      <Nav />
      <ThesisEditorClient ticker={ticker} initialThesis={thesis} />
    </ThemeProvider>
  )
}
