'use client'

import { useState } from 'react'
import { EmptyState, Notice } from '@/components/admin/admin-shell'
import type { CsvPreview, CsvPreviewRow } from '@/lib/csv'
import type { DuplicateMode } from '@/types/song'

export default function ImportPage() {
  const [preview, setPreview] = useState<CsvPreview | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>('skip')
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ imported: number; skipped: number; failed: number; failures: Array<{ rowNumber?: number; title?: string; message: string }> } | null>(null)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError(null)
    setResult(null)
    setPreview(null)
    setFileName(file.name)
    try {
      const body = new FormData()
      body.set('file', file)
      const response = await fetch('/api/songs/import', { method: 'POST', body })
      const payload = (await response.json()) as CsvPreview & { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Unable to read this CSV file.')
        return
      }
      setPreview(payload)
    } catch {
      setError('Unable to read this CSV file.')
    } finally {
      setUploading(false)
    }
  }

  const confirmImport = async () => {
    if (!preview) return
    setImporting(true)
    setError(null)
    try {
      const response = await fetch('/api/songs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, duplicateMode, rows: preview.rows }),
      })
      const payload = (await response.json()) as {
        imported?: number
        skipped?: number
        failed?: number
        failures?: Array<{ rowNumber?: number; title?: string; message: string }>
        error?: string
      }
      if (!response.ok) {
        setError(payload.error ?? 'Import failed.')
        return
      }
      setResult({
        imported: payload.imported ?? 0,
        skipped: payload.skipped ?? 0,
        failed: payload.failed ?? 0,
        failures: payload.failures ?? [],
      })
    } catch {
      setError('Import failed.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Import CSV</h1>
      <p className="mt-2 text-sm text-muted-foreground">Upload, preview, and confirm before anything is saved.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg">Upload CSV</h2>
          <p className="mt-2 text-sm text-muted-foreground">Required columns: Title, Category, Lyrics. Lyrics may include commas, quotes, and multiple lines.</p>
          <label className="mt-5 block">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void onFile(event.target.files?.[0])}
              className="text-sm"
            />
          </label>
          {fileName && <p className="mt-3 text-sm text-muted-foreground">{fileName}</p>}
          {uploading && <p className="mt-3 text-sm text-muted-foreground">Uploading CSV…</p>}
        </section>
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl bg-secondary p-5">
            <h3 className="text-base">Expected format</h3>
            <pre className="mt-3 overflow-x-auto text-xs leading-6 text-muted-foreground">{`Title,Category,Lyrics
"Demo Praise Song","Praise","[Demo lyrics for development only]"
"Demo Worship Song","Worship","[Demo lyrics for development only]"`}</pre>
            <a href="/worshipverse-template.csv" download="worshipverse-template.csv" className="mt-4 inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-background">
              Download worshipverse-template.csv
            </a>
          </div>
        </aside>
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {preview && (
        <section className="mt-8">
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            {[
              ['Total rows', preview.total],
              ['Valid rows', preview.valid],
              ['Invalid rows', preview.invalid],
              ['Duplicate rows', preview.duplicate],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mb-5 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium">Duplicate songs</p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="radio" checked={duplicateMode === 'skip'} onChange={() => setDuplicateMode('skip')} />
              Skip duplicates (default)
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="radio" checked={duplicateMode === 'update'} onChange={() => setDuplicateMode('update')} />
              Update existing songs
            </label>
            <button
              onClick={() => void confirmImport()}
              disabled={importing || (preview.valid === 0 && !(duplicateMode === 'update' && preview.duplicate > 0))}
              className="mt-5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {importing ? 'Importing CSV…' : 'Confirm import'}
            </button>
          </div>
          {preview.rows.length === 0 ? (
            <EmptyState title="No songs available." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Row</th>
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.rows.map((row: CsvPreviewRow) => (
                    <tr key={row.rowNumber}>
                      <td className="px-5 py-3">{row.rowNumber}</td>
                      <td className="px-5 py-3">{row.title || '—'}</td>
                      <td className="px-5 py-3 capitalize">{row.status}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {row.errors.length > 0 ? (
                          <span>
                            Row {row.rowNumber}: {row.errors.join(' ')}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg">Import result</h2>
          <p className="mt-3 text-sm">Imported: {result.imported}</p>
          <p className="text-sm">Skipped: {result.skipped}</p>
          <p className="text-sm">Failed: {result.failed}</p>
          {result.failures.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {result.failures.map((failure, index) => (
                <li key={`${failure.rowNumber}-${index}`}>
                  {failure.rowNumber ? `Row ${failure.rowNumber}: ` : ''}
                  {failure.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
