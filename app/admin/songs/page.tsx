'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { EmptyState, Notice } from '@/components/admin/admin-shell'
import type { AdminSong, PublicCategory } from '@/types/song'

const PAGE_SIZE = 20

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ManageSongsPage() {
  const [songs, setSongs] = useState<AdminSong[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All' | PublicCategory>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminSong | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (nextPage = page, nextQuery = query, nextCategory = category) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        admin: '1',
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
      })
      if (nextQuery.trim()) params.set('search', nextQuery.trim())
      if (nextCategory !== 'All') params.set('category', nextCategory)
      const response = await fetch(`/api/songs?${params}`)
      if (!response.ok) {
        setError('Unable to load songs.')
        return
      }
      const payload = (await response.json()) as { songs: AdminSong[]; total: number }
      setSongs(payload.songs)
      setTotal(payload.total)
    } catch {
      setError('Unable to load songs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(1, query, category)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const rangeLabel = useMemo(() => {
    if (total === 0) return '0 songs'
    const start = (page - 1) * PAGE_SIZE + 1
    const end = Math.min(total, page * PAGE_SIZE)
    return `${start}–${end} of ${total}`
  }, [page, total])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/songs/${pendingDelete.id}`, { method: 'DELETE' })
      if (!response.ok) {
        setError('Unable to delete this song.')
        return
      }
      setNotice(`“${pendingDelete.title}” was deleted.`)
      setPendingDelete(null)
      await load(page, query, category)
    } catch {
      setError('Unable to delete this song.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Manage songs</h1>
          <p className="mt-2 text-sm text-muted-foreground">{rangeLabel}</p>
        </div>
        <Link href="/admin/songs/new" className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
          Add Song
        </Link>
      </div>
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex w-full max-w-md items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setPage(1)
                void load(1, query, category)
              }
            }}
            placeholder="Search songs by title or lyrics..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as 'All' | PublicCategory)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm"
        >
          <option value="All">All categories</option>
          <option value="Praise">Praise</option>
          <option value="Worship">Worship</option>
        </select>
        <button
          onClick={() => {
            setPage(1)
            void load(1, query, category)
          }}
          className="rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          Search
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading songs…</p>
      ) : songs.length === 0 ? (
        <EmptyState title="No songs available." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Song title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {songs.map((song) => (
                <tr key={song.id}>
                  <td className="px-5 py-4 font-medium">{song.title}</td>
                  <td className="px-5 py-4 text-muted-foreground">{song.category}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(song.createdAt)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(song.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/songs/${song.id}/edit`} className="text-foreground hover:text-accent">
                        Edit
                      </Link>
                      <button onClick={() => setPendingDelete(song)} className="text-muted-foreground hover:text-destructive">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1
              setPage(next)
              void load(next, query, category)
            }}
            className="rounded-full border border-border px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <button
            disabled={page >= pageCount}
            onClick={() => {
              const next = page + 1
              setPage(next)
              void load(next, query, category)
            }}
            className="rounded-full border border-border px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl">Delete song</h2>
            <p className="mt-3 text-sm text-muted-foreground">Are you sure you want to delete this song?</p>
            <p className="mt-2 text-sm font-medium">{pendingDelete.title}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
