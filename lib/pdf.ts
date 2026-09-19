import { PDFParse } from 'pdf-parse'
import { normalizeTitle } from '@/lib/songs'
import { validateSongInput } from '@/lib/validation'

export type PdfPreviewSong = {
  id: string
  title: string
  lyrics: string
  status: 'valid' | 'invalid' | 'duplicate'
  errors: string[]
}

export type PdfPreview = {
  songs: PdfPreviewSong[]
  total: number
  valid: number
  invalid: number
  duplicate: number
  ocrRequired?: boolean
}

function cleanLine(line: string) {
  const cleaned = line.replace(/\s+$/g, '').replace(/^\s+/g, '')
  if (/^(?:--\s*)?\d+\s+of\s+\d+(?:\s*--)?$/i.test(cleaned)) return ''
  return cleaned.replace(/^\d+\s*$/, '')
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map(cleanLine)
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1] !== ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitSongs(text: string) {
  const pages = text.split(/\f+/).map(cleanText).filter(Boolean)
  const chunks = pages.flatMap((page) => page.split(/\n{3,}/).map((chunk) => chunk.trim()).filter(Boolean))
  return chunks.length > 0 ? chunks : pages
}

function toSong(chunk: string, index: number): PdfPreviewSong {
  const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean)
  const title = lines.shift() ?? ''
  const lyrics = lines.join('\n').trim()
  const { data, errors } = validateSongInput({ title, lyrics })
  return {
    id: `pdf-${index + 1}`,
    title: data?.title ?? title,
    lyrics: data?.lyrics ?? lyrics,
    status: data ? 'valid' : 'invalid',
    errors: errors.map((error) => error.message),
  }
}

export async function parseSongsPdf(buffer: Buffer): Promise<{ preview?: PdfPreview; error?: string }> {
  try {
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()
    const text = cleanText(result.text)
    if (!text) {
      return { error: 'This PDF appears to be scanned or image-only. OCR is required before songs can be extracted.' }
    }
    const songs = splitSongs(text)
      .map(toSong)
      .filter((song) => song.title || song.lyrics)
    const seen = new Set<string>()
    for (const song of songs) {
      const key = normalizeTitle(song.title)
      if (song.status === 'valid' && seen.has(key)) {
        song.status = 'duplicate'
        song.errors = ['Duplicate song title in this PDF.']
      }
      seen.add(key)
    }
    return {
      preview: {
        songs,
        total: songs.length,
        valid: songs.filter((song) => song.status === 'valid').length,
        invalid: songs.filter((song) => song.status === 'invalid').length,
        duplicate: songs.filter((song) => song.status === 'duplicate').length,
      },
    }
  } catch {
    return { error: 'The PDF could not be read. Please upload a valid, text-based PDF file.' }
  }
}