import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cleanTicker } from '@/lib/ticker'
import { formMetadata } from '@/lib/noindex'
import { ThesisEditorClient } from './ThesisEditorClient'

export function generateMetadata({ params }: { params: { ticker: string } }) {
  return formMetadata(`Edit thesis: ${params.ticker.toUpperCase()}`)
}

export default async function EditThesisPage({ params }: { params: { ticker: string } }) {
  const ticker = cleanTicker(params.ticker)
  if (!ticker) notFound()
  const { data: thesis } = await supabase.from('theses').select('*').eq('ticker', ticker).maybeSingle()
  return <ThesisEditorClient ticker={ticker} initialThesis={thesis} />
}
