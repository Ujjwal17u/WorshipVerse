import { normalizeTitle } from '@/lib/songs'

export type SongInput = {
  title: string
  titleNorm: string
  lyrics: string
}

export type ValidationError = {
  field?: string
  message: string
}

export function validateSongInput(body: unknown): { data: SongInput | null; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  const title = typeof source.title === 'string' ? source.title.trim().replace(/\s+/g, ' ') : ''
  const lyrics = typeof source.lyrics === 'string' ? source.lyrics.replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '') : ''
  if (!title) errors.push({ field: 'title', message: 'Title is required.' })
  if (!lyrics) errors.push({ field: 'lyrics', message: 'Lyrics are required.' })

  if (errors.length > 0) {
    return { data: null, errors }
  }

  return {
    data: {
      title,
      titleNorm: normalizeTitle(title),
      lyrics,
    },
    errors,
  }
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status })
}
