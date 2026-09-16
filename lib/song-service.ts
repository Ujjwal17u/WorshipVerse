import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { toAdminSong, toPublicSong } from '@/lib/songs'
import { jsonError, parseCategory } from '@/lib/validation'
import type { SongCategory } from '@prisma/client'

type ListOptions = {
  search?: string | null
  category?: string | null
  page?: number
  pageSize?: number
  admin?: boolean
}

export async function listSongs(options: ListOptions = {}) {
  const search = options.search?.trim()
  const category = options.category ? parseCategory(options.category) : null
  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 100))

  const where: Prisma.SongWhereInput = {}
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { lyrics: { contains: search } },
      { artist: { contains: search } },
    ]
  }

  const [total, songs] = await prisma.$transaction([
    prisma.song.count({ where }),
    prisma.song.findMany({
      where,
      orderBy: [{ title: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    total,
    page,
    pageSize,
    songs: options.admin ? songs.map(toAdminSong) : songs.map(toPublicSong),
  }
}

export async function getSongById(id: string) {
  if (!id) return null
  return prisma.song.findUnique({ where: { id } })
}

export async function getSongCounts() {
  const [total, praise, worship] = await prisma.$transaction([
    prisma.song.count(),
    prisma.song.count({ where: { category: 'PRAISE' } }),
    prisma.song.count({ where: { category: 'WORSHIP' } }),
  ])
  return { total, praise, worship }
}

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return jsonError('A song with this title and category already exists.', 409)
    }
    if (error.code === 'P2025') {
      return jsonError('Song not found.', 404)
    }
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return jsonError('The song library is temporarily unavailable.', 503)
  }
  return jsonError('Something went wrong. Please try again.', 500)
}

export function isValidSongId(id: string) {
  return typeof id === 'string' && id.length > 0 && id.length < 64
}

export type { SongCategory }
