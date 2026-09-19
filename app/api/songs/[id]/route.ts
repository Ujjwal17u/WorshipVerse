import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSongById, handlePrismaError, isValidSongId } from '@/lib/song-service'
import { toAdminSong, toPublicSong } from '@/lib/songs'
import { jsonError, validateSongInput } from '@/lib/validation'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!isValidSongId(id)) return jsonError('Invalid song id.', 400)

  try {
    const song = await getSongById(id)
    if (!song) return jsonError('Song not found.', 404)
    return Response.json({ song: toPublicSong(song) })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  if (!isValidSongId(id)) return jsonError('Invalid song id.', 400)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const { data, errors } = validateSongInput(body)
  if (!data || errors.length > 0) {
    return jsonError('Please fix the highlighted fields.', 400, { errors })
  }

  try {
    const existing = await getSongById(id)
    if (!existing) return jsonError('Song not found.', 404)

    const song = await prisma.song.update({
      where: { id },
      data: {
        title: data.title,
        titleNorm: data.titleNorm,
        lyrics: data.lyrics,
      },
    })
    return Response.json({ song: toAdminSong(song) })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  if (!isValidSongId(id)) return jsonError('Invalid song id.', 400)

  try {
    const existing = await getSongById(id)
    if (!existing) return jsonError('Song not found.', 404)
    await prisma.song.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch (error) {
    return handlePrismaError(error)
  }
}
