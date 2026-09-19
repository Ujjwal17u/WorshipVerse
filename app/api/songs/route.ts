import { NextRequest } from 'next/server'
import { listSongs, getSongCounts, handlePrismaError } from '@/lib/song-service'
import { jsonError, validateSongInput } from '@/lib/validation'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toAdminSong, toPublicSong } from '@/lib/songs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    if (searchParams.get('stats') === '1') {
      const counts = await getSongCounts()
      return Response.json(counts)
    }

    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '200')
    const result = await listSongs({
      search: searchParams.get('search'),
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 200,
      admin: searchParams.get('admin') === '1',
    })
    return Response.json(result)
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

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
    const song = await prisma.song.create({
      data: {
        title: data.title,
        titleNorm: data.titleNorm,
        lyrics: data.lyrics,
      },
    })
    return Response.json({ song: toAdminSong(song) }, { status: 201 })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export { toPublicSong }
