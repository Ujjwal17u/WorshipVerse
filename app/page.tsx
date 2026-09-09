'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  Heart,
  Menu,
  Music2,
  Plus,
  Search,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'

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

const songs: Song[] = [
  {
    id: 1,
    title: 'Great Is Your Faithfulness',
    artist: 'WorshipVerse Originals',
    category: 'Worship',
    featured: true,
    lyrics: ['Morning by morning, new mercies I see', 'All I have needed, Your hand has provided', 'Great is Your faithfulness, Lord unto me', '', 'You never let go, You never grow weary', 'Your promise is steady, Your presence is near', 'Great is Your faithfulness, Lord unto me'],
  },
  {
    id: 2,
    title: 'Joy in the Morning',
    artist: 'WorshipVerse Originals',
    category: 'Praise',
    featured: true,
    lyrics: ['You turn my mourning into dancing', 'You place a song within my heart', 'Your joy is new with every morning', 'Your faithful love will never part', '', 'I will lift my voice and sing', 'You are good in everything'],
  },
  {
    id: 3,
    title: 'Here in Your Presence',
    artist: 'WorshipVerse Originals',
    category: 'Worship',
    lyrics: ['Here in Your presence, I am made whole', 'Quiet my spirit, awaken my soul', 'There is no striving, there is no fear', 'Only Your goodness is drawing me near'],
  },
  {
    id: 4,
    title: 'Lift Every Voice',
    artist: 'WorshipVerse Originals',
    category: 'Praise',
    lyrics: ['Lift every voice, let the heavens hear', 'Tell of the grace that has brought us here', 'With every breath, with every choice', 'We will praise You and lift our voice'],
  },
  {
    id: 5,
    title: 'Be Still and Know',
    artist: 'WorshipVerse Originals',
    category: 'Worship',
    lyrics: ['Be still and know that I am God', 'Lay down the weight you carry', 'My peace will be your covering', 'My arms are strong and steady'],
  },
  {
    id: 6,
    title: 'Sing a New Song',
    artist: 'WorshipVerse Originals',
    category: 'Praise',
    lyrics: ['Sing a new song to the One who saves', 'Let every nation know Your name', 'Your love is wider than the sea', 'Your grace has set us free'],
  },
]

function SongCard({ song, favorite, onFavorite, onOpen }: { song: Song; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return (
    <article className="group flex min-h-44 flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md">
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
      <button onClick={onOpen} className="mt-6 flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-ring">Read lyrics <ChevronRight size={15} /></button>
    </article>
  )
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3 text-left">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#f3ead8] text-[#8a6a28]">
        <BookOpen size={20} strokeWidth={1.75} />
      </span>
      <span>
        <strong className="block text-[17px] font-semibold tracking-tight text-foreground">WorshipVerse</strong>
        {!compact && (
          <span className="mt-0.5 block text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Praise • Worship • Lyrics
          </span>
        )}
      </span>
    </span>
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
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('worshipverse-favorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  const toggleFavorite = (id: number) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setFavorites(next)
    window.localStorage.setItem('worshipverse-favorites', JSON.stringify(next))
  }

  const goHome = () => {
    setView('home')
    setCategory('All')
    setQuery('')
    setMobileNav(false)
  }

  const goTo = (next: View) => {
    setView(next)
    setCategory(next === 'praise' ? 'Praise' : next === 'worship' ? 'Worship' : 'All')
    setMobileNav(false)
    if (next !== 'search') setQuery('')
  }

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return songs.filter((song) => {
      const matchesCategory = category === 'All' || song.category === category
      const matchesView = (view !== 'praise' && view !== 'worship') || song.category.toLowerCase() === view
      const matchesFavorites = view !== 'favorites' || favorites.includes(song.id)
      const matchesQuery = !normalized || `${song.title} ${song.artist} ${song.lyrics.join(' ')}`.toLowerCase().includes(normalized)
      return matchesCategory && matchesView && matchesFavorites && matchesQuery
    })
  }, [category, favorites, query, view])

  const openSong = (song: Song) => setSelectedSong(song)
  const pageTitle =
    view === 'favorites'
      ? 'Your favorites'
      : view === 'admin'
        ? 'Admin dashboard'
        : view === 'search'
          ? 'Search songs'
          : view === 'praise'
            ? 'Praise songs'
            : 'Worship songs'

  const header = (
    <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
        <button onClick={goHome} className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
          <BrandMark />
        </button>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <button
            onClick={() => goTo('praise')}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${view === 'praise' ? 'text-foreground' : 'text-neutral-700 hover:text-foreground'}`}
          >
            <Sparkles size={16} strokeWidth={1.75} />
            <span className="relative pb-1">
              Praise
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
            </span>
          </button>
          <button
            onClick={() => goTo('worship')}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${view === 'worship' ? 'text-foreground' : 'text-neutral-700 hover:text-foreground'}`}
          >
            <Music2 size={16} strokeWidth={1.75} />
            <span className="relative pb-1">
              Worship
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
            </span>
          </button>
          <button
            onClick={() => goTo('favorites')}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${view === 'favorites' ? 'text-foreground' : 'text-neutral-700 hover:text-foreground'}`}
          >
            <Heart size={16} strokeWidth={1.75} /> Favorites
          </button>
          <button
            onClick={() => {
              goTo('search')
              window.setTimeout(() => searchRef.current?.focus(), 0)
            }}
            className="ml-1 rounded-full p-2 text-neutral-700 transition hover:bg-secondary hover:text-foreground"
            aria-label="Search songs"
          >
            <Search size={18} strokeWidth={1.75} />
          </button>
        </nav>
        <button onClick={() => setMobileNav(!mobileNav)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary md:hidden" aria-label="Toggle navigation">
          {mobileNav ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileNav && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 py-3 md:hidden">
          <button onClick={() => goTo('praise')} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">
            <Sparkles size={17} /> Praise
          </button>
          <button onClick={() => goTo('worship')} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">
            <Music2 size={17} /> Worship
          </button>
          <button onClick={() => goTo('favorites')} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">
            <Heart size={17} /> Favorites
          </button>
          <button onClick={() => goTo('search')} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">
            <Search size={17} /> Search
          </button>
        </nav>
      )}
    </header>
  )

  if (selectedSong) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
            <button onClick={() => setSelectedSong(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} /> Back to library
            </button>
            <button onClick={() => toggleFavorite(selectedSong.id)} className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-secondary" aria-label="Toggle favorite">
              <Heart size={16} className={favorites.includes(selectedSong.id) ? 'fill-accent text-accent' : ''} /> {favorites.includes(selectedSong.id) ? 'Saved' : 'Save'}
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">{selectedSong.category}</span>
          <h1 className="mt-3 text-balance text-4xl text-foreground md:text-5xl">{selectedSong.title}</h1>
          <p className="mt-3 text-muted-foreground">{selectedSong.artist}</p>
          <div className="my-8 flex items-center justify-between border-y border-border py-3">
            <span className="text-sm text-muted-foreground">Lyrics</span>
            <div className="flex items-center gap-1 rounded-full bg-secondary p-1" aria-label="Change text size">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button key={size} onClick={() => setFontSize(size)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${fontSize === size ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className={`flex flex-col gap-6 whitespace-pre-line text-foreground ${fontSize === 'sm' ? 'text-base' : fontSize === 'lg' ? 'text-2xl' : 'text-xl'} leading-relaxed`}>
            {selectedSong.lyrics.map((line, index) => (
              <p key={`${line}-${index}`} className={!line ? 'h-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (view === 'home') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {header}
        <main className="flex flex-1 flex-col items-center justify-center px-5 pb-24 pt-8">
          <div className="flex w-full max-w-2xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ead9a8] bg-[#fbf6ea] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] text-[#9a7a32] uppercase">
              <BookOpen size={13} strokeWidth={1.75} />
              Praise • Worship • Lyrics
            </span>
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-[4.25rem]">WorshipVerse</h1>
            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-7 text-muted-foreground sm:text-base">
              A simple, serene sanctuary for church lyrics. Quickly find, open, and read praise and worship song lyrics during church services and personal devotion.
            </p>
            <label className="mt-9 flex w-full max-w-xl items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
              <Search size={18} className="shrink-0 text-neutral-400" strokeWidth={1.75} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  if (event.target.value) setView('search')
                }}
                placeholder="Search songs by title or lyrics..."
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-neutral-400"
                aria-label="Search songs"
              />
            </label>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="mr-1 text-sm text-muted-foreground">Quick explore:</span>
              <button
                onClick={() => goTo('praise')}
                className="inline-flex items-center gap-2 rounded-full border border-[#ead9a8] bg-[#fbf6ea] px-4 py-2 text-sm font-medium text-[#5c4a1f] transition hover:bg-[#f3ead8]"
              >
                <Sparkles size={15} strokeWidth={1.75} />
                Praise Songs
              </button>
              <button
                onClick={() => goTo('worship')}
                className="inline-flex items-center gap-2 rounded-full border border-[#d7dcef] bg-[#eef0f8] px-4 py-2 text-sm font-medium text-[#3d4566] transition hover:bg-[#e4e8f4]"
              >
                <Music2 size={15} strokeWidth={1.75} />
                Worship Songs
              </button>
              <button
                onClick={() => goTo('favorites')}
                className="inline-flex items-center gap-2 rounded-full border border-[#f0d4d4] bg-[#f8ecec] px-4 py-2 text-sm font-medium text-[#6b3b3b] transition hover:bg-[#f3e0e0]"
              >
                <Heart size={15} strokeWidth={1.75} />
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {header}
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-12">
        {view === 'admin' ? (
          <AdminPreview />
        ) : (
          <>
            <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{pageTitle}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
              <label className="flex w-full max-w-md items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2.5 focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
                <Search size={16} className="shrink-0 text-neutral-400" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    if (event.target.value) setView('search')
                  }}
                  placeholder="Search songs by title or lyrics..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  aria-label="Search songs"
                />
              </label>
            </section>
            {filteredSongs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSongs.map((song) => (
                  <SongCard key={song.id} song={song} favorite={favorites.includes(song.id)} onFavorite={() => toggleFavorite(song.id)} onOpen={() => openSong(song)} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <FileText className="mx-auto mb-4 text-muted-foreground" size={30} />
                <h2 className="text-xl">No songs found</h2>
                <p className="mt-2 text-sm text-muted-foreground">{view === 'favorites' ? 'Songs you save will appear here.' : 'Try another search or browse a different category.'}</p>
                {view === 'favorites' && (
                  <button onClick={goHome} className="mt-5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    Explore songs
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function AdminPreview() {
  const stats = [
    { label: 'Total songs', value: '6' },
    { label: 'Praise songs', value: '3' },
    { label: 'Worship songs', value: '3' },
    { label: 'Favorites', value: '0' },
  ]
  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Content management</span>
          <h1 className="mt-3 text-4xl text-foreground">Admin dashboard</h1>
          <p className="mt-3 text-muted-foreground">Manage your song library and keep lyrics organized.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus size={17} /> Add new song
        </button>
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg">Song library</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your current collection</p>
            </div>
            <button className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Settings">
              <Settings size={18} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Music2 size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{song.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {song.category} · {song.artist}
                    </p>
                  </div>
                </div>
                <button className="text-sm text-muted-foreground hover:text-foreground">Edit</button>
              </div>
            ))}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Upload className="mb-4 text-accent" size={23} />
            <h2 className="text-lg">Import songs</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Upload a CSV file to add multiple songs at once.</p>
            <button className="mt-5 w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">Choose CSV file</button>
          </div>
          <div className="rounded-2xl bg-secondary p-5">
            <FileText className="mb-4 text-foreground" size={21} />
            <h3 className="text-base">CSV format</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Use columns for title, artist, category, and lyrics.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
