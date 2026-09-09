import { parse } from 'csv-parse/sync'
import type { SongCategory } from '@prisma/client'
import { normalizeTitle } from '@/lib/songs'
import { parseCategory, validateSongInput } from '@/lib/validation'
import type { SongInput } from '@/lib/validation'

export type CsvPreviewRow = {
  rowNumber: number
  title: string
  category: string
  lyrics: string
  status: 'valid' | 'invalid' | 'duplicate'
  errors: string[]
  duplicateOf?: 'file' | 'database'
}

export type CsvPreview = {
  total: number
  valid: number
  invalid: number
  duplicate: number
  rows: CsvPreviewRow[]
}

function getColumn(record: Record<string, unknown>, names: string[]) {
  const entries = Object.entries(record)
  for (const name of names) {
    const match = entries.find(([key]) => key.trim().toLowerCase() === name)
    if (match && typeof match[1] === 'string') return match[1]
    if (match && match[1] != null) return String(match[1])
  }
  return ''
}

export function parseSongsCsv(text: string): { records: Record<string, unknown>[]; error?: string } {
  const source = text.replace(/^\uFEFF/, '')
  if (!source.trim()) {
    return { records: [], error: 'The CSV file is empty.' }
  }

  try {
    const records = parse(source, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: false,
      bom: true,
    }) as Record<string, unknown>[]

    if (records.length === 0) {
      return { records: [], error: 'The CSV file has no data rows.' }
    }

    const headers = Object.keys(records[0]).map((key) => key.trim().toLowerCase())
    const hasTitle = headers.includes('title')
    const hasCategory = headers.includes('category')
    const hasLyrics = headers.includes('lyrics')
    if (!hasTitle || !hasCategory || !hasLyrics) {
      return {
        records: [],
        error: 'Missing required columns. Expected: Title, Category, Lyrics.',
      }
    }

    return { records }
  } catch {
    return { records: [], error: 'The CSV file could not be parsed. Check quoting and column headers.' }
  }
}

export function recordToDraft(record: Record<string, unknown>) {
  return {
    title: getColumn(record, ['title']),
    category: getColumn(record, ['category']),
    lyrics: getColumn(record, ['lyrics']).replace(/\r\n/g, '\n'),
    artist: getColumn(record, ['artist']) || 'WorshipVerse Originals',
  }
}

export function buildCsvPreview(
  records: Record<string, unknown>[],
  existing: Array<{ titleNorm: string; category: SongCategory }>,
): CsvPreview {
  const seen = new Map<string, number>()
  const existingKeys = new Set(existing.map((song) => `${song.titleNorm}::${song.category}`))
  const rows: CsvPreviewRow[] = records.map((record, index) => {
    const rowNumber = index + 2
    const draft = recordToDraft(record)
    const { data, errors } = validateSongInput(draft)
    const messages = errors.map((error) => error.message)
    const categoryLabel = draft.category.trim() || ''
    const title = draft.title.trim()

    if (!data) {
      return {
        rowNumber,
        title,
        category: categoryLabel,
        lyrics: draft.lyrics,
        status: 'invalid' as const,
        errors: messages.length > 0 ? messages : ['Invalid row.'],
      }
    }

    const key = `${data.titleNorm}::${data.category}`
    const fileDuplicate = seen.get(key)
    seen.set(key, rowNumber)

    if (fileDuplicate) {
      return {
        rowNumber,
        title: data.title,
        category: data.category === 'PRAISE' ? 'Praise' : 'Worship',
        lyrics: data.lyrics,
        status: 'duplicate' as const,
        errors: [`Duplicate song in this file (same as row ${fileDuplicate}).`],
        duplicateOf: 'file',
      }
    }

    if (existingKeys.has(key)) {
      return {
        rowNumber,
        title: data.title,
        category: data.category === 'PRAISE' ? 'Praise' : 'Worship',
        lyrics: data.lyrics,
        status: 'duplicate' as const,
        errors: ['Duplicate song. A song with this title and category already exists.'],
        duplicateOf: 'database',
      }
    }

    return {
      rowNumber,
      title: data.title,
      category: data.category === 'PRAISE' ? 'Praise' : 'Worship',
      lyrics: data.lyrics,
      status: 'valid' as const,
      errors: [],
    }
  })

  return {
    total: rows.length,
    valid: rows.filter((row) => row.status === 'valid').length,
    invalid: rows.filter((row) => row.status === 'invalid').length,
    duplicate: rows.filter((row) => row.status === 'duplicate').length,
    rows,
  }
}

export function previewRowToInput(row: CsvPreviewRow): SongInput | null {
  const category = parseCategory(row.category)
  if (!category) return null
  const { data } = validateSongInput({
    title: row.title,
    category: row.category,
    lyrics: row.lyrics,
  })
  return data
}

export function duplicateKey(title: string, category: SongCategory) {
  return `${normalizeTitle(title)}::${category}`
}
