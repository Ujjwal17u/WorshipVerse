export type PublicSong = {
  id: string
  title: string
  lyrics: string[]
}

export type AdminSong = PublicSong & {
  createdAt: string
  updatedAt: string
}

export type DuplicateMode = 'skip' | 'update'
