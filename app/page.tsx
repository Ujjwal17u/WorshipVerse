'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  Music2,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  Upload,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

type Category = 'All' | 'Praise' | 'Worship'
type View = 'home' | 'praise' | 'worship' | 'favorites' | 'search' | 'admin'

type Song = {
  id: number
  title: string
  artist: string
  category: Exclude<Category, 'All'>
  featured?: boolean
  lyrics: string[]
}

// Bible verses for hero section - random on refresh
const bibleVerses = [
  { verse: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  { verse: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { verse: "For God so loved the world that He gave His only Son.", reference: "John 3:16" },
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { verse: "The Lord is good, a stronghold in the day of trouble.", reference: "Nahum 1:7" },
  { verse: "Cast all your anxiety on Him because He cares for you.", reference: "1 Peter 5:7" },
  { verse: "The peace of God, which transcends all understanding, will guard your hearts.", reference: "Philippians 4:7" },
]

const initialSongs: Song[] = [
  {
    id: 1,
    title: '',
    artist: '',
    category: 'Worship',
    featured: true,
    lyrics: [],
  },
  {
    id: 2,
    title: '',
    artist: '',
    category: 'Praise',
    featured: true,
    lyrics: [],
  },
  {
    id: 3,
    title: '',
    artist: '',
    category: 'Worship',
    lyrics: [],
  },
  {
    id: 4,
    title: '',
    artist: '',
    category: 'Praise',
    lyrics: [],
  },
  {
    id: 5,
    title: '',
    artist: '',
    category: 'Worship',
    lyrics: [],
  },
  {
    id: 6,
    title: '',
    artist: '',
    category: 'Praise',
    lyrics: [],
  },
]

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result.map((v) => v.trim())
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
  const rows = lines.slice(1).map(parseCSVLine)
  return { headers, rows }
}

function csvRowsToSongs(headers: string[], rows: string[][]): Song[] {
  const titleIdx = headers.findIndex((h) => h === 'title' || h === 'name')
  const artistIdx = headers.findIndex((h) => h === 'artist' || h === 'author' || h === 'singer')
  const categoryIdx = headers.findIndex((h) => h === 'category' || h === 'type' || h === 'genre')
  const lyricsIdx = headers.findIndex((h) => h === 'lyrics' || h === 'lyric' || h === 'words')
  const featuredIdx = headers.findIndex((h) => h === 'featured' || h === 'is_featured')
  return rows
    .map((row, idx) => {
      const title = titleIdx >= 0 ? (row[titleIdx] ?? '').trim() : ''
      const artist = artistIdx >= 0 ? (row[artistIdx] ?? '').trim() : ''
      const rawCategory = categoryIdx >= 0 ? (row[categoryIdx] ?? '').trim().toLowerCase() : ''
      const category: 'Praise' | 'Worship' = rawCategory === 'praise' ? 'Praise' : 'Worship'
      const rawLyrics = lyricsIdx >= 0 ? (row[lyricsIdx] ?? '').trim() : ''
      const lyrics = rawLyrics ? rawLyrics.split(/\s*\\n\s*|\s*\|\s*/).map((l) => l.trim()).filter(Boolean) : []
      const featuredRaw = featuredIdx >= 0 ? (row[featuredIdx] ?? '').trim().toLowerCase() : ''
      const featured = featuredRaw === 'true' || featuredRaw === 'yes' || featuredRaw === '1'
      return { id: -1 - idx, title, artist, category, featured, lyrics }
    })
    .filter((s) => s.title || s.artist)
}

const navItems: { label: string; view: View; icon: typeof Home }[] = [
  { label: 'Home', view: 'home', icon: Home },
  { label: 'Praise', view: 'praise', icon: Music2 },
  { label: 'Worship', view: 'worship', icon: BookOpen },
  { label: 'Favorites', view: 'favorites', icon: Heart },
]

function SongCard({ song, favorite, onFavorite, onOpen }: { song: Song; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return (
    <article className="group flex min-h-44 flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">{song.category}</span>
          <button onClick={onFavorite} aria-label={favorite ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`} className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-accent focus-visible:outline-2 focus-visible:outline-ring">
            <Heart className={favorite ? 'fill-accent text-accent' : ''} size={18} />
          </button>
        </div>
        <button onClick={onOpen} className="text-left focus-visible:outline-2 focus-visible:outline-ring">
          <h3 className="mb-1 text-lg text-foreground transition group-hover:text-accent">{song.title}</h3>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
        </button>
      </div>
      <button onClick={onOpen} className="mt-6 flex items-center gap-1 text-sm font-medium text-primary hover:text-accent focus-visible:outline-2 focus-visible:outline-ring">Read lyrics <ChevronRight size={15} /></button>
    </article>
  )
}

export default function Page() {
  const [view, setView] = useState<View>('home')
  const [category, setCategory] = useState<Category>('All')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [mobileNav, setMobileNav] = useState(false)
  const [randomVerse, setRandomVerse] = useState(bibleVerses[0])
  const [songs, setSongs] = useState<Song[]>(initialSongs)

  useEffect(() => {
    const saved = window.localStorage.getItem('worshipverse-favorites')
    if (saved) setFavorites(JSON.parse(saved))
    const savedSongs = window.localStorage.getItem('worshipverse-songs')
    if (savedSongs) {
      try {
        const parsed = JSON.parse(savedSongs)
        if (Array.isArray(parsed) && parsed.length > 0) setSongs(parsed)
      } catch {
        // ignore
      }
    }
    setRandomVerse(bibleVerses[Math.floor(Math.random() * bibleVerses.length)])
  }, [])

  useEffect(() => {
    window.localStorage.setItem('worshipverse-songs', JSON.stringify(songs))
  }, [songs])

  const toggleFavorite = (id: number) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setFavorites(next)
    window.localStorage.setItem('worshipverse-favorites', JSON.stringify(next))
  }

  const importSongs = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const { headers, rows } = parseCSV(text)
      const parsed = csvRowsToSongs(headers, rows)
      if (parsed.length === 0) return
      const maxId = songs.reduce((m, s) => Math.max(m, s.id), 0)
      const withIds = parsed.map((s, i) => ({ ...s, id: maxId + 1 + i }))
      setSongs((prev) => [...prev, ...withIds])
    }
    reader.readAsText(file)
  }

  const addNewSong = () => {
    const maxId = songs.reduce((m, s) => Math.max(m, s.id), 0)
    const newSong: Song = { id: maxId + 1, title: '', artist: '', category: 'Praise', lyrics: [] }
    setSongs((prev) => [...prev, newSong])
  }

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return songs.filter((song) => {
      const matchesCategory = category === 'All' || song.category === category
      const matchesView = view !== 'praise' && view !== 'worship' || song.category.toLowerCase() === view
      const matchesFavorites = view !== 'favorites' || favorites.includes(song.id)
      const matchesQuery = !normalized || `${song.title} ${song.artist} ${song.lyrics.join(' ')}`.toLowerCase().includes(normalized)
      return matchesCategory && matchesView && matchesFavorites && matchesQuery
    })
  }, [category, favorites, query, songs, view])

  const openSong = (song: Song) => setSelectedSong(song)
  const pageTitle = view === 'home' ? 'Find a song to worship with' : view === 'favorites' ? 'Your favorites' : view === 'admin' ? 'Admin dashboard' : view === 'search' ? 'Search songs' : `${view[0].toUpperCase()}${view.slice(1)} songs`

  if (selectedSong) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
            <button onClick={() => setSelectedSong(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft size={18} /> Back to library</button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => toggleFavorite(selectedSong.id)} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary" aria-label="Toggle favorite">
                <Heart size={16} className={favorites.includes(selectedSong.id) ? 'fill-accent text-accent' : ''} /> {favorites.includes(selectedSong.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">{selectedSong.category}</span>
          <h1 className="mt-3 text-balance text-4xl text-primary md:text-5xl">{selectedSong.title}</h1>
          <p className="mt-3 text-muted-foreground">{selectedSong.artist}</p>
          <div className="my-8 flex items-center justify-between border-y border-border py-3">
            <span className="text-sm text-muted-foreground">Lyrics</span>
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-1" aria-label="Change text size">
              {(['sm', 'md', 'lg'] as const).map((size) => <button key={size} onClick={() => setFontSize(size)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${fontSize === size ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{size.toUpperCase()}</button>)}
            </div>
          </div>
          <div className={`flex flex-col gap-6 whitespace-pre-line text-primary ${fontSize === 'sm' ? 'text-base' : fontSize === 'lg' ? 'text-2xl' : 'text-xl'} leading-relaxed`}>
            {selectedSong.lyrics.map((line, index) => <p key={`${line}-${index}`} className={!line ? 'h-2' : ''}>{line}</p>)}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => { setView('home'); setCategory('All'); setMobileNav(false) }} className="flex items-center gap-3 text-left">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Music2 size={19} /></span>
            <span><strong className="block text-base text-primary">WorshipVerse</strong><span className="hidden text-xs text-muted-foreground sm:block">Lyrics for your journey</span></span>
          </button>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map(({ label, view: itemView, icon: Icon }) => <button key={itemView} onClick={() => { setView(itemView); setCategory('All') }} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${view === itemView ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}><Icon size={16} /> {label}</button>)}
            <button onClick={() => setView('admin')} className={`ml-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${view === 'admin' ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-secondary'}`}><LayoutDashboard size={16} /> Admin</button>
            <ThemeToggle />
          </nav>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileNav(!mobileNav)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Toggle navigation">{mobileNav ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        {mobileNav && <nav className="flex flex-col gap-1 border-t border-border px-5 py-3 md:hidden">{navItems.map(({ label, view: itemView, icon: Icon }) => <button key={itemView} onClick={() => { setView(itemView); setMobileNav(false) }} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary"><Icon size={17} /> {label}</button>)}<button onClick={() => { setView('admin'); setMobileNav(false) }} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary"><LayoutDashboard size={17} /> Admin dashboard</button></nav>}
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {view === 'admin' ? <AdminPreview songs={songs} onAddSong={addNewSong} onImportCSV={importSongs} favorites={favorites} /> : <>
          <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl"><span className="text-sm font-semibold uppercase tracking-wider text-accent">WorshipVerse Library</span><h1 className="mt-3 text-balance text-4xl text-primary md:text-5xl">{pageTitle}</h1><p className="mt-4 text-pretty text-muted-foreground">A quiet place to find words that turn your heart toward God.</p></div>
            <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20"><Search size={18} className="shrink-0 text-muted-foreground" /><input value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value) setView('search') }} placeholder="Search songs, lyrics, artists..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" aria-label="Search songs" /></div>
          </section>

          {view === 'home' && <section className="mb-10 grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-primary p-6 text-primary-foreground md:col-span-2"><p className="text-sm font-medium text-primary-foreground/70">A moment to reflect</p><h2 className="mt-3 max-w-md text-2xl text-primary-foreground">"{randomVerse.verse}"</h2><p className="mt-4 text-sm text-primary-foreground/70">{randomVerse.reference}</p></div><div className="rounded-xl border border-border bg-card p-6"><BookOpen className="mb-5 text-accent" size={25} /><h3 className="text-lg">Explore the collection</h3><p className="mt-2 text-sm text-muted-foreground">Browse {songs.length} songs for moments of praise and worship.</p></div></section>}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-muted-foreground" /><span className="text-sm font-medium">Browse by</span>{(['All', 'Praise', 'Worship'] as Category[]).map((item) => <button key={item} onClick={() => { setCategory(item); setView(item === 'All' ? 'home' : item.toLowerCase() as View) }} className={`rounded-full px-3 py-1.5 text-sm ${category === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>{item}</button>)}</div><span className="text-sm text-muted-foreground">{filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}</span></div>

          {filteredSongs.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredSongs.map((song) => <SongCard key={song.id} song={song} favorite={favorites.includes(song.id)} onFavorite={() => toggleFavorite(song.id)} onOpen={() => openSong(song)} />)}</div> : <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center"><FileText className="mx-auto mb-4 text-muted-foreground" size={30} /><h2 className="text-xl">No songs found</h2><p className="mt-2 text-sm text-muted-foreground">{view === 'favorites' ? 'Songs you save will appear here.' : 'Try another search or browse a different category.'}</p>{view === 'favorites' && <button onClick={() => setView('home')} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Explore songs</button>}</div>}
        </>}
      </main>
      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground"><p>WorshipVerse · A simple place for songs of faith</p></footer>
    </div>
  )
}

function AdminPreview({ songs, onAddSong, onImportCSV, favorites }: { songs: Song[]; onAddSong: () => void; onImportCSV: (file: File) => void; favorites: number[] }) {
  const stats = [
    { label: 'Total songs', value: String(songs.length) },
    { label: 'Praise songs', value: String(songs.filter((s) => s.category === 'Praise').length) },
    { label: 'Worship songs', value: String(songs.filter((s) => s.category === 'Worship').length) },
    { label: 'Favorites', value: String(favorites.length) },
  ]
  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><span className="text-sm font-semibold uppercase tracking-wider text-accent">Content management</span><h1 className="mt-3 text-4xl text-primary">Admin dashboard</h1><p className="mt-3 text-muted-foreground">Manage your song library and keep lyrics organized.</p></div>
        <button onClick={onAddSong} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"><Plus size={17} /> Add new song</button>
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-3 text-3xl font-semibold text-primary">{stat.value}</p></div>)}</div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-lg">Song library</h2><p className="mt-1 text-sm text-muted-foreground">Your current collection</p></div><button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Settings"><Settings size={18} /></button></div>
          <div className="divide-y divide-border">{songs.map((song) => <div key={song.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Music2 size={16} /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{song.title || '(Untitled)'}</p><p className="text-xs text-muted-foreground">{song.category} · {song.artist || 'Unknown'}</p></div></div><button className="text-sm text-muted-foreground hover:text-primary">Edit</button></div>)}</div>
        </section>
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <Upload className="mb-4 text-accent" size={23} />
            <h2 className="text-lg">Import songs</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Upload a CSV file to add multiple songs at once.</p>
            <label className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary hover:bg-secondary">
              <Upload size={16} /> Choose CSV file
              <input type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportCSV(f); e.target.value = '' }} className="hidden" />
            </label>
          </div>
          <div className="rounded-xl bg-secondary p-5">
            <FileText className="mb-4 text-primary" size={21} />
            <h3 className="text-base">CSV format</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Use columns: <code className="rounded bg-background px-1.5 py-0.5 text-xs">title,artist,category,lyrics,featured</code><br />Category: Praise or Worship<br />Separate lyrics lines with <code className="rounded bg-background px-1 py-0.5 text-xs">\n</code> or <code className="rounded bg-background px-1 py-0.5 text-xs">|</code></p>
          </div>
        </aside>
      </div>
    </div>
  )
}
