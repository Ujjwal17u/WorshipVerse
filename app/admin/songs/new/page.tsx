'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SongForm, type SongFormValue } from '@/components/admin/song-form'
import { Notice } from '@/components/admin/admin-shell'

export default function NewSongPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (value: SongFormValue) => {
    setPending(true)
    setError(null)
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Unable to save this song.')
        return
      }
      router.push('/admin/songs?created=1')
      router.refresh()
    } catch {
      setError('Unable to save this song.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Add Song</h1>
      <Notice>New songs are saved to the library and appear immediately in Praise or Worship.</Notice>
      <SongForm submitLabel="Save song" pending={pending} error={error} onSubmit={(value) => void onSubmit(value)} />
    </div>
  )
}
