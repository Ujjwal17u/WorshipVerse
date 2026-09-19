import { PrismaClient } from '@prisma/client'

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
  { title: 'Demo Praise Song' },
  { title: 'Demo Worship Song' },
  { title: 'Demo Morning Praise' },
  { title: 'Demo Quiet Worship' },
  { title: 'Demo Gathering Song' },
  { title: 'Demo Evening Worship' },
]

async function main() {
  for (const song of demoSongs) {
    await prisma.song.upsert({
      where: {
        titleNorm: normalizeTitle(song.title),
      },
      update: {},
      create: {
        title: song.title,
        titleNorm: normalizeTitle(song.title),
        lyrics: DEMO_LYRICS,
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
