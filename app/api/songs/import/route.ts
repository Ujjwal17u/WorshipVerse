import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildCsvPreview, parseSongsCsv, previewRowToInput } from '@/lib/csv'
import { handlePrismaError } from '@/lib/song-service'
import { jsonError } from '@/lib/validation'
import type { DuplicateMode } from '@/types/song'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const contentType = request.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return jsonError('Please choose a CSV file.', 400)
      }
      if (!file.name.toLowerCase().endsWith('.csv')) {
        return jsonError('Please upload a .csv file.', 400)
      }

      const text = await file.text()
      const parsed = parseSongsCsv(text)
      if (parsed.error) return jsonError(parsed.error, 400)

      const existing = await prisma.song.findMany({
        select: { titleNorm: true, category: true },
      })
      const preview = buildCsvPreview(parsed.records, existing)
      return Response.json(preview)
    }

    const body = (await request.json()) as {
      confirm?: boolean
      duplicateMode?: DuplicateMode
      rows?: unknown
    }

    if (!body.confirm || !Array.isArray(body.rows)) {
      return jsonError('Import confirmation payload is invalid.', 400)
    }

    const duplicateMode: DuplicateMode = body.duplicateMode === 'update' ? 'update' : 'skip'
    const existing = await prisma.song.findMany({
      select: { id: true, titleNorm: true, category: true },
    })
    const existingMap = new Map(existing.map((song) => [`${song.titleNorm}::${song.category}`, song.id]))

    let imported = 0
    let skipped = 0
    let failed = 0
    const failures: Array<{ rowNumber?: number; title?: string; message: string }> = []

    const prepared = body.rows.flatMap((row, index) => {
      if (!row || typeof row !== 'object') {
        failed += 1
        failures.push({ message: `Row ${index + 1} is invalid.` })
        return []
      }
      const source = row as {
        rowNumber?: number
        title?: string
        category?: string
        lyrics?: string
        status?: string
        duplicateOf?: 'file' | 'database'
      }
      if (source.status === 'duplicate' && source.duplicateOf === 'file') {
        skipped += 1
        return []
      }
      const input = previewRowToInput({
        rowNumber: source.rowNumber ?? index + 2,
        title: String(source.title ?? ''),
        category: String(source.category ?? ''),
        lyrics: String(source.lyrics ?? ''),
        status: 'valid',
        errors: [],
      })
      if (!input) {
        failed += 1
        failures.push({
          rowNumber: source.rowNumber,
          title: source.title,
          message: 'Invalid title, category, or lyrics.',
        })
        return []
      }
      return [{ input, rowNumber: source.rowNumber }]
    })

    const chunkSize = 50
    for (let i = 0; i < prepared.length; i += chunkSize) {
      const chunk = prepared.slice(i, i + chunkSize)
      try {
        await prisma.$transaction(async (tx) => {
          for (const item of chunk) {
            const key = `${item.input.titleNorm}::${item.input.category}`
            const existingId = existingMap.get(key)
            if (existingId) {
              if (duplicateMode === 'update') {
                await tx.song.update({
                  where: { id: existingId },
                  data: {
                    title: item.input.title,
                    titleNorm: item.input.titleNorm,
                    lyrics: item.input.lyrics,
                    artist: item.input.artist,
                  },
                })
                imported += 1
              } else {
                skipped += 1
              }
              continue
            }

            const created = await tx.song.create({
              data: {
                title: item.input.title,
                titleNorm: item.input.titleNorm,
                category: item.input.category,
                lyrics: item.input.lyrics,
                artist: item.input.artist,
              },
            })
            existingMap.set(key, created.id)
            imported += 1
          }
        })
      } catch {
        failed += chunk.length
        failures.push({ message: 'A batch of songs could not be imported.' })
      }
    }

    return Response.json({ imported, skipped, failed, failures })
  } catch (error) {
    return handlePrismaError(error)
  }
}
