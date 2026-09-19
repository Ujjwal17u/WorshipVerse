import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { parseSongsPdf } from '@/lib/pdf'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/song-service'
import { jsonError, validateSongInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const contentType = request.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return jsonError('Please choose a PDF file.', 400)
      }
      if (!file.name.toLowerCase().endsWith('.pdf') || file.type && file.type !== 'application/pdf') {
        return jsonError('Unsupported file. Please upload a PDF file.', 400)
      }
      if (file.size === 0 || file.size > 20 * 1024 * 1024) {
        return jsonError('PDF files must be between 1 byte and 20 MB.', 400)
      }
      const parsed = await parseSongsPdf(Buffer.from(await file.arrayBuffer()))
      if (parsed.error) return jsonError(parsed.error, 400)
      return Response.json(parsed.preview)
      if (parsed.error) return jsonError(parsed.error, 400)

      const existing = await prisma.song.findMany({
        select: { titleNorm: true, category: true },
      })
      const preview = buildCsvPreview(parsed.records, existing)
      return Response.json(preview)
    }

    const body = (await request.json()) as { confirm?: boolean; duplicateMode?: 'skip' | 'update'; songs?: unknown }
    if (!body.confirm || !Array.isArray(body.songs)) {
      return jsonError('Import confirmation payload is invalid.', 400)
    }

    let imported = 0
    let skipped = 0
    let failed = 0
    const failures: Array<{ title?: string; message: string }> = []
    for (const rawSong of body.songs) {
      if (!rawSong || typeof rawSong !== 'object') {
        failed += 1
        failures.push({ message: 'An extracted song is invalid.' })
        continue
      }
      const source = rawSong as { title?: unknown; lyrics?: unknown; status?: string }
      const { data } = validateSongInput({ title: source.title, lyrics: source.lyrics })
      if (!data || source.status === 'invalid') {
        failed += 1
        failures.push({ title: typeof source.title === 'string' ? source.title : undefined, message: 'Title and lyrics are required.' })
        continue
      }
      try {
        const existing = await prisma.song.findUnique({ where: { titleNorm: data.titleNorm }, select: { id: true } })
        if (existing) {
          if (body.duplicateMode === 'update') {
            await prisma.song.update({ where: { id: existing.id }, data })
            imported += 1
          } else skipped += 1
        } else {
          await prisma.song.create({ data })
          imported += 1
        }
      } catch {
        failed += 1
        failures.push({ title: data.title, message: 'This song could not be saved.' })
      }
    }

    return Response.json({ imported, skipped, failed, failures })
  } catch (error) {
    return handlePrismaError(error)
  }
}
