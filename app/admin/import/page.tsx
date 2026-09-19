'use client'

import { useRef, useState } from 'react'
import { EmptyState, Notice } from '@/components/admin/admin-shell'
import type { PdfPreview, PdfPreviewSong } from '@/lib/pdf'

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<PdfPreview | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'update'>('skip')
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null)

  const updateSong = (id: string, field: 'title' | 'lyrics', value: string) => {
    setPreview((current) => current && { ...current, songs: current.songs.map((song) => (song.id === id ? { ...song, [field]: value, status: 'valid', errors: [] } : song)) })
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError(null)
    setNotice(null)
    setResult(null)
    setPreview(null)
    setFileName(file.name)
    try {
      const body = new FormData()
      body.set('file', file)
      const response = await fetch('/api/songs/import', { method: 'POST', body })
      const payload = (await response.json()) as PdfPreview & { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Unable to read this PDF file.')
        return
      }
      setPreview(payload)
      setNotice(`${file.name} is ready. Review and correct the extracted songs before importing.`)
    } catch {
      setError('Unable to read this PDF file.')
    } finally {
      setUploading(false)
    }
  }

  const confirmImport = async () => {
    if (!preview) return
    setImporting(true)
    setError(null)
    setNotice(null)
    try {
      const response = await fetch('/api/songs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, duplicateMode, songs: preview.songs }),
      })
      const payload = (await response.json()) as { imported?: number; skipped?: number; failed?: number; error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Import failed.')
        return
      }
      setResult({ imported: payload.imported ?? 0, skipped: payload.skipped ?? 0, failed: payload.failed ?? 0 })
      setNotice('PDF import completed.')
    } catch {
      setError('Import failed.')
    } finally {
      setImporting(false)
    }
  }

  const removeSong = (id: string) => setPreview((current) => current && { ...current, songs: current.songs.filter((song) => song.id !== id) })

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Import PDF</h1>
      <p className="mt-2 text-sm text-muted-foreground">Extract multiple songs, review the text, and save only after confirmation.</p>
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg">Upload PDF</h2>
        <p className="mt-2 text-sm text-muted-foreground">Text-based PDFs are supported. Scanned image PDFs require OCR before import.</p>
        <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={(event) => { void onFile(event.target.files?.[0]); event.currentTarget.value = '' }} className="sr-only" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {uploading ? 'Reading PDF...' : 'Select PDF'}
        </button>
        {fileName && <p className="mt-3 text-sm text-muted-foreground">Selected: {fileName}</p>}
        {uploading && <p className="mt-3 text-sm text-muted-foreground">Extracting songs from the PDF...</p>}
      </section>
      {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}
      {notice && <div className="mt-6"><Notice tone="success">{notice}</Notice></div>}
      {preview && (
        <section className="mt-8">
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            {[['Total songs', preview.total], ['Valid', preview.valid], ['Needs review', preview.invalid], ['Duplicates', preview.duplicate]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></div>)}
          </div>
          <div className="mb-5 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium">Existing title duplicates</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" checked={duplicateMode === 'skip'} onChange={() => setDuplicateMode('skip')} /> Skip</label><label className="flex items-center gap-2"><input type="radio" checked={duplicateMode === 'update'} onChange={() => setDuplicateMode('update')} /> Update existing</label></div>
            <button onClick={() => void confirmImport()} disabled={importing || preview.songs.length === 0 || preview.invalid > 0} className="mt-5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">{importing ? 'Importing...' : 'Import Songs'}</button>
          </div>
          {preview.songs.length === 0 ? <EmptyState title="No songs available." /> : <div className="space-y-4">{preview.songs.map((song: PdfPreviewSong) => <article key={song.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{song.status === 'invalid' ? 'Needs review' : 'Extracted song'}</p><button onClick={() => removeSong(song.id)} className="text-sm text-muted-foreground hover:text-destructive">Remove</button></div><label className="mt-4 block"><span className="mb-2 block text-sm text-muted-foreground">Title</span><input value={song.title} onChange={(event) => updateSong(song.id, 'title', event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm" /></label><label className="mt-4 block"><span className="mb-2 block text-sm text-muted-foreground">Lyrics</span><textarea value={song.lyrics} onChange={(event) => updateSong(song.id, 'lyrics', event.target.value)} rows={8} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7" /></label>{song.errors.length > 0 && <p className="mt-3 text-sm text-destructive">{song.errors.join(' ')}</p>}</article>)}</div>}
        </section>
      )}
      {result && <div className="mt-8 rounded-2xl border border-border bg-card p-5"><h2 className="text-lg">Import result</h2><p className="mt-3 text-sm">Imported: {result.imported}</p><p className="text-sm">Skipped: {result.skipped}</p><p className="text-sm">Failed: {result.failed}</p></div>}
    </div>
  )
}
