export type PublicCategory = 'Praise' | 'Worship'

export type PublicSong = {
  id: string
  title: string
  artist: string
  category: PublicCategory
  lyrics: string[]
  featured?: boolean
}

export type AdminSong = PublicSong & {
  createdAt: string
  updatedAt: string
}

export type DuplicateMode = 'skip' | 'update'
