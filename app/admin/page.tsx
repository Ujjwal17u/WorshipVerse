'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Music2, Plus, Settings, Upload } from 'lucide-react'
import { EmptyState, Notice } from '@/components/admin/admin-shell'
import type { AdminSong } from '@/types/song'

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ total: 0, praise: 0, worship: 0 })
  const [songs, setSongs] = useState<AdminSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsResponse, songsResponse] = await Promise.all([
          fetch('/api/songs?stats=1'),
          fetch('/api/songs?admin=1&pageSize=8'),
        ])
        if (!statsResponse.ok || !songsResponse.ok) {
          setError('Unable to load dashboard data.')
          return
        }
        setCounts((await statsResponse.json()) as { total: number; praise: number; worship: number })
        const payload = (await songsResponse.json()) as { songs: AdminSong[] }
        setSongs(payload.songs)
      } catch {
        setError('Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const stats = [
    { label: 'Total songs', value: String(counts.total) },
    { label: 'Praise songs', value: String(counts.praise) },
    { label: 'Worship songs', value: String(counts.worship) },
  ]

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Content management</span>
          <h1 className="mt-3 text-4xl text-foreground">Admin dashboard</h1>
          <p className="mt-3 text-muted-foreground">Manage your song library and keep lyrics organized.</p>
        </div>
        <Link href="/admin/songs/new" className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus size={17} /> Add new song
        </Link>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{loading ? '…' : stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2.5">
        <Link href="/admin/songs/new" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Plus size={15} /> Add Song
        </Link>
        <Link href="/admin/import" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Upload size={15} /> Import CSV
        </Link>
        <Link href="/admin/songs" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Music2 size={15} /> Manage Songs
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg">Song library</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your current collection</p>
            </div>
            <span className="rounded-full p-2 text-muted-foreground" aria-hidden>
              <Settings size={18} />
            </span>
          </div>
          {loading ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">Loading songs…</p>
          ) : songs.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No songs available." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                      <Music2 size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{song.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {song.category} · {song.artist}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/songs/${song.id}/edit`} className="text-sm text-muted-foreground hover:text-foreground">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Upload className="mb-4 text-accent" size={23} />
            <h2 className="text-lg">Import songs</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Upload a CSV file to add multiple songs at once.</p>
            <Link href="/admin/import" className="mt-5 block w-full rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-secondary">
              Choose CSV file
            </Link>
          </div>
          <div className="rounded-2xl bg-secondary p-5">
            <FileText className="mb-4 text-foreground" size={21} />
            <h3 className="text-base">CSV format</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Use columns for Title, Category, and Lyrics.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
