'use client'
import { useState } from 'react'
import { supabase, hasSupabase, NO_DB_MESSAGE } from '@/lib/supabase'

interface Props {
  ticker: string
  label: string
  field: 'thesis_text' | 'risks'
  initial: string | null
  placeholder: string
}

// Inline-editable free-text section (thesis / risks) that persists to the
// `theses` table. Click "edit", type, "save" — no navigation away.
export function EditableText({ ticker, label, field, initial, placeholder }: Props) {
  const [value, setValue] = useState(initial ?? '')
  const [draft, setDraft] = useState(initial ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!hasSupabase) { setError(NO_DB_MESSAGE); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('theses')
      .upsert({ ticker, [field]: draft, updated_at: new Date().toISOString() })
    setSaving(false)
    if (err) { setError(err.message); return }
    setValue(draft)
    setEditing(false)
  }

  return (
    <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>{label}</span>
        {editing ? (
          <div className="flex gap-3">
            <button onClick={() => { setDraft(value); setEditing(false); setError('') }} className="text-xs" style={{ color: 'var(--ink-muted)' }}>cancel</button>
            <button onClick={save} disabled={saving} className="link text-xs">{saving ? 'saving…' : 'save'}</button>
          </div>
        ) : (
          <button onClick={() => { setDraft(value); setEditing(true) }} className="link text-xs" aria-label={`Edit ${label.toLowerCase()}`}>edit</button>
        )}
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          aria-label={label}
          autoFocus
          placeholder={placeholder}
          rows={5}
          className="w-full px-3 py-2 font-serif text-sm leading-relaxed outline-none resize-y"
          style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
        />
      ) : value ? (
        <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>{value}</p>
      ) : (
        <p className="font-serif text-sm" style={{ color: 'var(--ink-faint)' }}>{placeholder}</p>
      )}
      {error && <p role="alert" className="text-2xs mt-2" style={{ color: 'var(--negative)' }}>{error}</p>}
    </div>
  )
}
