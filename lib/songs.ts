import type { Song } from '@prisma/client'
import type { AdminSong, PublicSong } from '@/types/song'

export function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function lyricsToLines(lyrics: string) {
  return lyrics.replace(/\r\n/g, '\n').split('\n')
}

export function toPublicSong(song: Song): PublicSong {
  return {
    id: song.id,
    title: song.title,
    lyrics: lyricsToLines(song.lyrics),
  }
}

export function toAdminSong(song: Song): AdminSong {
  return {
    ...toPublicSong(song),
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
  }
}
