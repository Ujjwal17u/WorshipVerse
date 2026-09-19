'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SongForm, type SongFormValue } from '@/components/admin/song-form'
import { Notice } from '@/components/admin/admin-shell'
import type { PublicSong } from '@/types/song'

export default function EditSongPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [song, setSong] = useState<PublicSong | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/songs/${params.id}`)
        const payload = (await response.json()) as { song?: PublicSong; error?: string }
        if (!response.ok || !payload.song) {
          setError(payload.error ?? 'Song not found.')
          return
        }
        setSong(payload.song)
      } catch {
        setError('Unable to load this song.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [params.id])

  const onSubmit = async (value: SongFormValue) => {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/songs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Unable to update this song.')
        return
      }
      router.push('/admin/songs')
      router.refresh()
    } catch {
      setError('Unable to update this song.')
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading lyrics…</p>
  }

  if (!song) {
    return <Notice tone="error">{error ?? 'Song not found.'}</Notice>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Edit song</h1>
      <SongForm
        initial={{ title: song.title, lyrics: song.lyrics.join('\n') }}
        submitLabel="Save changes"
        pending={pending}
        error={error}
        onSubmit={(value) => void onSubmit(value)}
      />
    </div>
  )
}
