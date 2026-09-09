import { SongCategory } from '@prisma/client'
import { normalizeTitle } from '@/lib/songs'

export type SongInput = {
  title: string
  titleNorm: string
  category: SongCategory
  lyrics: string
  artist: string
}

export type ValidationError = {
  field?: string
  message: string
}

const CATEGORY_MAP: Record<string, SongCategory> = {
  praise: 'PRAISE',
  worship: 'WORSHIP',
  PRAISE: 'PRAISE',
  WORSHIP: 'WORSHIP',
}

export function parseCategory(value: unknown): SongCategory | null {
  if (typeof value !== 'string') return null
  const key = value.trim()
  return CATEGORY_MAP[key] ?? CATEGORY_MAP[key.toLowerCase()] ?? null
}

export function validateSongInput(body: unknown): { data: SongInput | null; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  const title = typeof source.title === 'string' ? source.title.trim().replace(/\s+/g, ' ') : ''
  const lyrics = typeof source.lyrics === 'string' ? source.lyrics.replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '') : ''
  const category = parseCategory(source.category)
  const artist =
    typeof source.artist === 'string' && source.artist.trim()
      ? source.artist.trim()
      : 'WorshipVerse Originals'

  if (!title) errors.push({ field: 'title', message: 'Title is required.' })
  if (!category) errors.push({ field: 'category', message: 'Category must be Praise or Worship.' })
  if (!lyrics) errors.push({ field: 'lyrics', message: 'Lyrics are required.' })

  if (errors.length > 0 || !category) {
    return { data: null, errors }
  }

  return {
    data: {
      title,
      titleNorm: normalizeTitle(title),
      category,
      lyrics,
      artist,
    },
    errors,
  }
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status })
}
