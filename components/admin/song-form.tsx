'use client'

import { useState } from 'react'
import type { PublicCategory } from '@/types/song'

export type SongFormValue = {
  title: string
  category: PublicCategory
  lyrics: string
}

export function SongForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  initial?: SongFormValue
  submitLabel: string
  pending: boolean
  error: string | null
  onSubmit: (value: SongFormValue) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState<PublicCategory>(initial?.category ?? 'Praise')
  const [lyrics, setLyrics] = useState(initial?.lyrics ?? '')

  return (
    <form
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ title, category, lyrics })
      }}
    >
      {error && (
        <p className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium text-foreground">Song Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
        />
      </label>
      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium text-foreground">Category</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as PublicCategory)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
        >
          <option value="Praise">Praise</option>
          <option value="Worship">Worship</option>
        </select>
      </label>
      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium text-foreground">Lyrics</span>
        <textarea
          value={lyrics}
          onChange={(event) => setLyrics(event.target.value)}
          required
          rows={18}
          className="w-full whitespace-pre-wrap rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
