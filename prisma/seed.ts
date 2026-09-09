import { PrismaClient, SongCategory } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, ' ').toLowerCase()
}

const DEMO_LYRICS = `Verse 1

[Demo lyrics for development only]
Line two of this demo verse
Line three of this demo verse

Chorus

[Demo lyrics for development only]
This chorus is placeholder text

Verse 2

[Demo lyrics for development only]
`

const demoSongs = [
  { title: 'Demo Praise Song', category: SongCategory.PRAISE },
  { title: 'Demo Worship Song', category: SongCategory.WORSHIP },
  { title: 'Demo Morning Praise', category: SongCategory.PRAISE },
  { title: 'Demo Quiet Worship', category: SongCategory.WORSHIP },
  { title: 'Demo Gathering Song', category: SongCategory.PRAISE },
  { title: 'Demo Evening Worship', category: SongCategory.WORSHIP },
]

async function main() {
  for (const song of demoSongs) {
    await prisma.song.upsert({
      where: {
        titleNorm_category: {
          titleNorm: normalizeTitle(song.title),
          category: song.category,
        },
      },
      update: {},
      create: {
        title: song.title,
        titleNorm: normalizeTitle(song.title),
        category: song.category,
        lyrics: DEMO_LYRICS,
        artist: 'WorshipVerse Originals',
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
