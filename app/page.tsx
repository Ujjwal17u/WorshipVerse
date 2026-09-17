'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Compass,
  FileText,
  Heart,
  Home as HomeIcon,
  LayoutDashboard,
  Library,
  Menu,
  Music2,
  Plus,
  Search,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { ThemeToggle } from '@/components/theme-toggle'
import type { PublicSong as Song } from '@/types/song'

type Category = 'All' | 'Praise' | 'Worship'
type View = 'home' | 'praise' | 'worship' | 'favorites' | 'search' | 'admin'

const praiseCovers = [
  'linear-gradient(135deg,#ff6a3d 0%,#f88379 50%,#ffb56b 100%)',
  'linear-gradient(135deg,#ff5858 0%,#f09819 100%)',
  'linear-gradient(135deg,#fe8c00 0%,#f83600 100%)',
  'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)',
  'linear-gradient(135deg,#ee0979 0%,#ff6a00 100%)',
  'linear-gradient(135deg,#ff9966 0%,#ff5e62 100%)',
]
const worshipCovers = [
  'linear-gradient(135deg,#00b894 0%,#00cec9 50%,#5584ff 100%)',
  'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)',
  'linear-gradient(135deg,#02aab0 0%,#00cdac 100%)',
  'linear-gradient(135deg,#4776e6 0%,#8e54e9 100%)',
  'linear-gradient(135deg,#00c6ff 0%,#0072ff 100%)',
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
]
const neutralCovers = [
  'linear-gradient(135deg,#232526 0%,#414345 100%)',
  'linear-gradient(135deg,#3a1c71 0%,#d76d77 50%,#ffaf7b 100%)',
  'linear-gradient(135deg,#141e30 0%,#243b55 100%)',
  'linear-gradient(135deg,#3c3b3f 0%,#605c3c 100%)',
  'linear-gradient(135deg,#614385 0%,#516395 100%)',
  'linear-gradient(135deg,#373b44 0%,#4286f4 100%)',
]

function pickCover(song: Song): string {
  const hash = [...(song.title + song.id)].reduce((a, c) => a + c.charCodeAt(0), 0)
  const palette = song.category === 'Praise' ? praiseCovers : song.category === 'Worship' ? worshipCovers : neutralCovers
  return palette[hash % palette.length]
}

function AlbumCover({ song, size = 'md' }: { song: Song; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'size-28 sm:size-32' : size === 'sm' ? 'size-12' : 'aspect-square w-full'
  return (
    <div
      className={`relative ${sz} overflow-hidden rounded-2xl shadow-lg shadow-black/20 ring-1 ring-white/10`}
      style={{ background: pickCover(song) }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30" />
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay animate-stained-glass" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,212,74,0.35), transparent 45%), radial-gradient(circle at 50% 50%, rgba(120,255,220,0.25), transparent 50%)' }} aria-hidden />
      <div className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-xl bg-black/30 text-white backdrop-blur-sm">
        <Music2 size={16} strokeWidth={1.75} />
      </div>
      <svg className="absolute right-2 bottom-2 opacity-[0.12]" width="62%" height="62%" viewBox="0 0 100 100" fill="none" aria-hidden>
        <path d="M50 10 L50 90 M25 35 L75 35" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {song.featured && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
          <Sparkles size={11} />
          Trending
        </div>
      )}
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
        <div className="flex h-9 items-end gap-0.5">
          {[2, 5, 3, 7, 4, 6, 3, 5].map((h, i) => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-white/90"
              style={{ height: `${h * 12.5}%` }}
            />
          ))}
        </div>
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
          {song.category}
        </span>
      </div>
    </div>
  )
}

function SongCard({ song, favorite, onFavorite, onOpen, size = 'md' }: { song: Song; favorite: boolean; onFavorite: () => void; onOpen: () => void; size?: 'md' | 'lg' }) {
  return (
    <article
      className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl p-3 transition animate-fade-in hover:bg-secondary/60 hover:[box-shadow:0_0_0_1px_rgba(255,212,74,0.15),0_20px_50px_-24px_rgba(255,212,74,0.35)] ${size === 'lg' ? 'sm:p-4' : ''}`}
      onClick={onOpen}
    >
      <div className="relative" aria-hidden>
        <div className="pointer-events-none absolute -inset-1 rounded-[22px] bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 opacity-0 blur-md transition duration-500 group-hover:from-accent/20 group-hover:via-[#ff9e3d]/10 group-hover:to-[#00b894]/15 group-hover:opacity-100" />
      </div>
      <div className="relative z-10">
        <AlbumCover song={song} />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
          }}
          aria-label={favorite ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`}
          className="absolute right-3 top-3 z-10 translate-y-1 rounded-full bg-card/90 p-2 text-muted-foreground opacity-0 shadow-md ring-1 ring-border backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100 hover:bg-secondary hover:text-accent focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Heart className={favorite ? 'fill-accent text-accent' : ''} size={16} />
        </button>
        <div className="absolute bottom-3 right-3 z-10 flex size-10 translate-y-2 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 shadow-2xl shadow-accent/30 ring-1 ring-accent-foreground/10 transition group-hover:translate-y-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:translate-y-0">
          <ChevronRight size={18} strokeWidth={2.25} />
        </div>
      </div>
      <div className="min-w-0 px-1 pb-1">
        <h3 className="truncate font-semibold text-foreground transition group-hover:text-accent">
          {song.title || 'Untitled song'}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{song.artist || 'Unknown artist'}</p>
      </div>
    </article>
  )
}

function SectionRow({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12 animate-fade-in">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function ChipButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-foreground text-background hover:bg-foreground/90'
          : 'bg-secondary/70 text-foreground hover:bg-secondary ring-1 ring-border/70'
      }`}
    >
      {children}
    </button>
  )
}

function readFavoriteIds(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => String(item))
  } catch {
    return []
  }
}

function LightSpecks({ count = 24, seed = 0 }: { count?: number; seed?: number }) {
  const specks = useMemo(() => {
    const result: {
      left: string
      size: string
      height: string
      animationDuration: string
      animationDelay: string
      transform: string
    }[] = []
    const toFixed = (n: number, d = 4) => {
      const p = Math.pow(10, d)
      return (Math.round(n * p) / p).toString()
    }
    const rand = (n: number, i: number) => {
      const x = Math.sin((seed + i + 1) * 9999 + n * 17) * 10000
      return x - Math.floor(x)
    }
    for (let i = 0; i < count; i++) {
      const left = toFixed(rand(1, i) * 100, 4) + '%'
      const sizeInt = 2 + Math.floor(rand(2, i) * 5)
      const size = sizeInt.toString() + 'px'
      const duration = toFixed(14 + rand(3, i) * 22, 3) + 's'
      const delay = toFixed(rand(4, i) * -28, 3) + 's'
      const jitterPx = toFixed((rand(5, i) * 0.8 - 0.4) * 20, 3) + 'px'
      result.push({
        left,
        size,
        height: size,
        animationDuration: duration,
        animationDelay: delay,
        transform: `translateX(${jitterPx})`,
      })
    }
    return result
  }, [count, seed])
  return (
    <div className="wv-light-specks wv-light-specks-light dark:wv-light-specks">
      {specks.map((s, i) => (
        <span key={i} className="speck" style={s} />
      ))}
    </div>
  )
}

function WorshipHands({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.0" />
            <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <g transform="translate(0,20)" style={{ filter: 'drop-shadow(0 8px 24px rgba(255,212,74,0.15))' }}>
          <path d="M50 140 L48 90 Q48 70 58 58 Q60 54 64 56 Q68 58 68 64 L68 108 Q68 120 78 124 L70 140 Z" fill="url(#wg)" stroke="var(--accent)" strokeOpacity="0.75" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M62 62 Q64 52 68 48 Q70 48 71 52 L71 92" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M68 58 Q74 48 78 48 Q80 50 80 54 L80 94" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M73 58 Q82 46 86 48 Q88 52 87 56 L86 94" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="47" y="138" width="28" height="3" rx="1.5" fill="url(#wg2)" />
        </g>
        <g transform="translate(100,20) scale(-1 1)" style={{ filter: 'drop-shadow(0 8px 24px rgba(255,212,74,0.15))' }}>
          <path d="M50 140 L48 90 Q48 70 58 58 Q60 54 64 56 Q68 58 68 64 L68 108 Q68 120 78 124 L70 140 Z" fill="url(#wg)" stroke="var(--accent)" strokeOpacity="0.75" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M62 62 Q64 52 68 48 Q70 48 71 52 L71 92" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M68 58 Q74 48 78 48 Q80 50 80 54 L80 94" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M73 58 Q82 46 86 48 Q88 52 87 56 L86 94" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="47" y="138" width="28" height="3" rx="1.5" fill="url(#wg2)" />
        </g>
        <g transform="translate(100 8)">
          <path d="M-6 30 L0 2 L6 30 M-14 40 L0 20 L14 40" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="14" r="3" fill="var(--accent)" fillOpacity="0.85" />
        </g>
      </svg>
    </div>
  )
}

const bibleVerses = [
  { verse: 'Be still, and know that I am God.', reference: 'Psalm 46:10' },
  { verse: 'The Lord is my shepherd; I shall not want.', reference: 'Psalm 23:1' },
  { verse: 'I can do all things through Christ who strengthens me.', reference: 'Philippians 4:13' },
  { verse: 'For God so loved the world that He gave His only Son.', reference: 'John 3:16' },
  { verse: 'Trust in the Lord with all your heart.', reference: 'Proverbs 3:5' },
]

export default function Page() {
  const [view, setView] = useState<View>('home')
  const [category, setCategory] = useState<Category>('All')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [loadingSongs, setLoadingSongs] = useState(true)
  const [songsError, setSongsError] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [mobileNav, setMobileNav] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const heroVerse = useMemo(() => {
    const seed = (typeof window !== 'undefined' ? 0 : 20240917) + bibleVerses.length
    const pick = Math.floor(Math.abs(Math.sin(seed * 999) * 10000)) % bibleVerses.length
    return bibleVerses[pick]
  }, [])

  const BUILD_YEAR = 2026

  useEffect(() => {
    if (typeof window === 'undefined') return
    setFavorites(readFavoriteIds(window.localStorage.getItem('worshipverse-favorites')))
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingSongs(true)
      setSongsError(null)
      try {
        const response = await fetch('/api/songs?pageSize=200')
        if (!response.ok) {
          setSongsError('The song library is temporarily unavailable.')
          return
        }
        const payload = (await response.json()) as { songs?: Song[] }
        setSongs(payload.songs ?? [])
      } catch {
        setSongsError('The song library is temporarily unavailable.')
      } finally {
        setLoadingSongs(false)
      }
    }
    void load()
  }, [])

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setFavorites(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('worshipverse-favorites', JSON.stringify(next))
    }
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
    if (next === 'search' && typeof window !== 'undefined') {
      window.setTimeout(() => searchRef.current?.focus(), 50)
    }
  }

  const toggleAdmin = () => {
    setView((prev) => (prev === 'admin' ? 'home' : 'admin'))
    setMobileNav(false)
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
  }, [category, favorites, query, view, songs])

  const featuredSongs = useMemo(() => {
    const featured = songs.filter((s) => s.featured)
    if (featured.length >= 6) return featured.slice(0, 6)
    const seen = new Set(featured.map((s) => s.id))
    const rest = songs.filter((s) => !seen.has(s.id)).slice(0, 6 - featured.length)
    return [...featured, ...rest]
  }, [songs])
  const praiseSongs = useMemo(() => songs.filter((s) => s.category === 'Praise').slice(0, 8), [songs])
  const worshipSongs = useMemo(() => songs.filter((s) => s.category === 'Worship').slice(0, 8), [songs])
  const favoriteSongs = useMemo(() => songs.filter((s) => favorites.includes(s.id)), [songs, favorites])

  const pageTitle =
    view === 'favorites'
      ? 'Your favorites'
      : view === 'admin'
        ? 'Admin dashboard'
        : view === 'search'
          ? 'Search songs'
          : view === 'praise'
            ? 'Praise songs'
            : view === 'worship'
              ? 'Worship songs'
              : 'Home'

  const sidebarNavItems: { label: string; view?: View; action?: () => void; icon: typeof HomeIcon; badge?: string; hint?: string }[] = [
    { label: 'Home', view: 'home', icon: HomeIcon, hint: 'Start here' },
    { label: 'Explore', view: 'search', icon: Compass, hint: 'Discover songs' },
    { label: 'Library', view: 'home', icon: Library, hint: 'Your collection' },
  ]

  if (selectedSong) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
            <button onClick={() => setSelectedSong(null)} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <ArrowLeft size={18} /> Back
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => toggleFavorite(selectedSong.id)}
                className={`flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-secondary ${
                  favorites.includes(selectedSong.id) ? 'border-accent/40 bg-accent/10 text-accent' : ''
                }`}
                aria-label="Toggle favorite"
              >
                <Heart size={16} className={favorites.includes(selectedSong.id) ? 'fill-accent text-accent' : ''} />
                {favorites.includes(selectedSong.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end">
            <AlbumCover song={selectedSong} size="lg" />
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{selectedSong.category}</span>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{selectedSong.title || 'Untitled'}</h1>
              <p className="mt-2 text-base text-muted-foreground">{selectedSong.artist || 'Unknown artist'}</p>
              <div className="mt-5 flex flex-wrap gap-2 sm:justify-start justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <FileText size={12} /> {selectedSong.lyrics.length} lines
                </span>
                {selectedSong.featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    <Sparkles size={12} /> Featured
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Music2 size={12} /> {selectedSong.category}
                </span>
              </div>
            </div>
          </div>
          <div className="my-10 flex items-center justify-between border-y border-border py-3">
            <span className="text-sm font-medium text-muted-foreground">Lyrics</span>
            <div className="flex items-center gap-1 rounded-full bg-secondary p-1" aria-label="Change text size">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    fontSize === size ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className={`flex flex-col gap-6 whitespace-pre-line text-foreground ${fontSize === 'sm' ? 'text-base' : fontSize === 'lg' ? 'text-2xl' : 'text-xl'} leading-relaxed`}>
            {selectedSong.lyrics.length > 0 ? (
              selectedSong.lyrics.map((line, index) => (
                <p key={`${line}-${index}`} className={!line ? 'h-2' : ''}>
                  {line}
                </p>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
                <FileText className="mx-auto mb-4 text-muted-foreground" size={30} />
                <p className="text-lg font-semibold text-foreground">No lyrics yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Lyrics for this song will appear here once added.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  const sidebar = (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center justify-between px-5 py-5">
        <button onClick={goHome} className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
          <BrandMark />
        </button>
      </div>

      <nav className="mt-1 flex flex-col gap-1 px-3" aria-label="Primary">
        {sidebarNavItems.map((item) => {
          const active = item.view ? view === item.view : false
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => (item.action ? item.action() : item.view && goTo(item.view))}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-secondary text-sidebar-foreground ring-1 ring-sidebar-border'
                  : 'text-sidebar-foreground/70 hover:bg-secondary/70 hover:text-sidebar-foreground'
              }`}
              title={item.hint}
            >
              <Icon size={19} strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <nav className="mt-3 flex flex-col gap-1 px-3 pb-3" aria-label="Your library">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">Your library</p>
        {[
          { label: 'Praise songs', view: 'praise' as View, icon: Sparkles },
          { label: 'Worship songs', view: 'worship' as View, icon: Music2 },
          { label: 'Saved songs', view: 'favorites' as View, icon: Heart, badge: String(favorites.length || 0) },
        ].map((item) => {
          const active = view === item.view
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => goTo(item.view)}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? 'bg-secondary text-sidebar-foreground ring-1 ring-sidebar-border' : 'text-sidebar-foreground/70 hover:bg-secondary/70 hover:text-sidebar-foreground'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[11px] text-sidebar-foreground/60 group-hover:bg-card group-hover:text-sidebar-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mx-3 my-2 h-px bg-sidebar-border" />

      <nav className="mt-1 flex flex-col gap-1 px-3" aria-label="Management">
        <button
          onClick={toggleAdmin}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            view === 'admin' ? 'bg-secondary text-sidebar-foreground ring-1 ring-sidebar-border' : 'text-sidebar-foreground/70 hover:bg-secondary/70 hover:text-sidebar-foreground'
          }`}
        >
          <LayoutDashboard size={18} strokeWidth={1.75} />
          Admin dashboard
        </button>
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="rounded-2xl border border-sidebar-border bg-secondary/60 p-4">
          <p className="text-xs font-semibold text-sidebar-foreground">Verse of the moment</p>
          <p className="mt-2 text-sm leading-6 text-sidebar-foreground/80">&ldquo;{heroVerse.verse}&rdquo;</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-accent">{heroVerse.reference}</p>
        </div>
      </div>
    </aside>
  )

  const mobileDrawer = (
    <>
      {mobileNav && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileNav(false)} aria-hidden />}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:hidden ${
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => {
              goHome()
              setMobileNav(false)
            }}
            className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
          >
            <BrandMark compact />
          </button>
          <button onClick={() => setMobileNav(false)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="px-3 pb-6">{sidebar.props.children}</div>
        </div>
      </div>
    </>
  )

  const topBar = (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => setMobileNav(true)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <button onClick={goHome} className="mr-2 rounded-xl focus-visible:outline-2 focus-visible:outline-ring lg:hidden">
          <BrandMark compact />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <label className="relative flex w-full max-w-2xl items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10">
            <Search size={18} className="shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                if (event.target.value) setView('search')
              }}
              onFocus={() => {
                if (query.trim()) setView('search')
              }}
              placeholder="Search songs, albums, artists, lyrics..."
              className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Search songs"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  searchRef.current?.focus()
                }}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <button
            onClick={toggleAdmin}
            className={`hidden rounded-full p-2 transition sm:block ${
              view === 'admin' ? 'bg-secondary text-foreground ring-1 ring-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            aria-label="Admin dashboard"
            title="Admin dashboard"
          >
            <LayoutDashboard size={19} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )

  const contentShell = (children: React.ReactNode) => (
    <div className="flex min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 wv-page-bg-light dark:wv-page-bg" aria-hidden />
      {sidebar}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {mobileDrawer}
        {topBar}
        <div className="relative min-w-0 flex-1">
          <LightSpecks count={18} seed={42} />
          {children}
        </div>
      </div>
    </div>
  )

  const emptyState = (title: string, description: string, action?: { label: string; onClick: () => void }) => (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
      <FileText className="mx-auto mb-4 text-muted-foreground" size={36} />
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
        >
          {action.label}
        </button>
      )}
    </div>
  )

  const HomeView = () => (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-60" aria-hidden>
        <div className="wv-cross-pattern wv-cross-pattern::before" />
      </div>
      <section className="relative overflow-hidden">
        <div className="ytm-hero-gradient-light dark:ytm-hero-gradient animate-gradient relative overflow-hidden">
          <div className="wv-divine-rays-light dark:wv-divine-rays" aria-hidden />
          <div className="wv-stained-glass-edge" aria-hidden />
          <LightSpecks count={32} seed={7} />
          <div className="wv-holy-spirit-dove-light dark:wv-holy-spirit-dove absolute -rotate-6 right-[8%] top-[14%] hidden sm:block" style={{ animationDelay: '-3s' }} aria-hidden />
          <WorshipHands className="absolute -bottom-8 right-[6%] hidden w-[260px] opacity-70 md:block" />
          <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-6 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80 ring-1 ring-border backdrop-blur">
                  <BookOpen size={13} strokeWidth={1.75} />
                  Praise • Worship • Lyrics
                </span>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-[56px] md:leading-[1.05]">
                  Find the right words
                  <br />
                  <span className="bg-gradient-to-r from-accent via-[#ff9e3d] to-[#00b894] bg-clip-text text-transparent">for every moment.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                  A quiet, polished sanctuary for church lyrics. Browse curated praise and worship collections, save your favorites, and open lyrics instantly during services or personal devotion.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => goTo('praise')}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-foreground/90"
                  >
                    <Sparkles size={16} /> Start with Praise
                  </button>
                  <button
                    onClick={() => goTo('worship')}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                  >
                    <Music2 size={16} /> Explore Worship
                  </button>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-4 sm:max-w-md">
                  <div><p className="text-2xl font-semibold tracking-tight text-foreground">{songs.length || '—'}</p><p className="text-xs text-muted-foreground">Songs</p></div>
                  <div><p className="text-2xl font-semibold tracking-tight text-foreground">{praiseSongs.length || '—'}</p><p className="text-xs text-muted-foreground">Praise</p></div>
                  <div><p className="text-2xl font-semibold tracking-tight text-foreground">{favorites.length || 0}</p><p className="text-xs text-muted-foreground">Saved</p></div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-accent/20 via-transparent to-[#00b894]/20 blur-2xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  {[...featuredSongs, ...praiseSongs.slice(0, 2)].slice(0, 4).map((s, i) => (
                    <div key={s.id} className="animate-fade-in" style={{ animationDelay: `${i * 70}ms` }}>
                      <AlbumCover song={s} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        {loadingSongs ? (
          <div className="space-y-10">
            {[0, 1, 2].map((g) => (
              <div key={g}>
                <div className="mb-5 h-8 w-64 animate-pulse rounded-xl bg-secondary" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-3">
                      <div className="aspect-square w-full animate-pulse rounded-2xl bg-secondary" />
                      <div className="mt-4 h-4 w-3/4 animate-pulse rounded-lg bg-secondary" />
                      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-secondary" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : songsError ? (
          emptyState('Library unavailable', songsError)
        ) : (
          <>
            <SectionRow title="Featured right now" subtitle="Curated songs for this season">
              {featuredSongs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {featuredSongs.map((s) => (
                    <SongCard key={s.id} song={s} favorite={favorites.includes(s.id)} onFavorite={() => toggleFavorite(s.id)} onOpen={() => openSong(s)} />
                  ))}
                </div>
              ) : (
                emptyState('No featured songs yet', 'Mark a few songs as featured in the admin dashboard to pin them here.')
              )}
            </SectionRow>

            <SectionRow title="Praise songs" subtitle="Lift up the name of Jesus">
              {praiseSongs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {praiseSongs.map((s) => (
                    <SongCard key={s.id} song={s} favorite={favorites.includes(s.id)} onFavorite={() => toggleFavorite(s.id)} onOpen={() => openSong(s)} />
                  ))}
                </div>
              ) : (
                emptyState('No praise songs yet', 'Add upbeat praise songs to the library in Admin to see them here.')
              )}
            </SectionRow>

            <SectionRow title="Worship songs" subtitle="Tender songs for intimate moments">
              {worshipSongs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {worshipSongs.map((s) => (
                    <SongCard key={s.id} song={s} favorite={favorites.includes(s.id)} onFavorite={() => toggleFavorite(s.id)} onOpen={() => openSong(s)} />
                  ))}
                </div>
              ) : (
                emptyState('No worship songs yet', 'Add intimate worship songs to the library in Admin to see them here.')
              )}
            </SectionRow>

            {favoriteSongs.length > 0 && (
              <SectionRow title="Saved by you" subtitle={`${favoriteSongs.length} ${favoriteSongs.length === 1 ? 'favorite' : 'favorites'}`}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteSongs.slice(0, 8).map((s) => (
                    <SongCard key={s.id} song={s} favorite onFavorite={() => toggleFavorite(s.id)} onOpen={() => openSong(s)} />
                  ))}
                </div>
              </SectionRow>
            )}
          </>
        )}
      </div>
    </div>
  )

  const SongsListView = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-12">
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loadingSongs ? 'Loading songs…' : `${filteredSongs.length} ${filteredSongs.length === 1 ? 'song' : 'songs'}${subtitle ? ' · ' + subtitle : ''}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', 'Praise', 'Worship'] as Category[]).map((c) => (
            <ChipButton key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </ChipButton>
          ))}
        </div>
      </section>
      {loadingSongs ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-3">
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-secondary" />
              <div className="mt-4 h-4 w-3/4 animate-pulse rounded-lg bg-secondary" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-secondary" />
            </div>
          ))}
        </div>
      ) : songsError ? (
        emptyState('Library unavailable', songsError)
      ) : filteredSongs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSongs.map((s) => (
            <SongCard key={s.id} song={s} favorite={favorites.includes(s.id)} onFavorite={() => toggleFavorite(s.id)} onOpen={() => openSong(s)} />
          ))}
        </div>
      ) : view === 'favorites' ? (
        emptyState('No saved songs yet', 'Tap the heart icon on any song to save it here for quick access.', { label: 'Explore songs', onClick: goHome })
      ) : view === 'search' ? (
        emptyState('No songs match your search', 'Try a different keyword, or browse by category below.')
      ) : (
        emptyState('No songs in this category', 'Add songs in the Admin dashboard to see them here.')
      )}
    </div>
  )

  const openSong = (song: Song) => setSelectedSong(song)

  return contentShell(
    <>
      {view === 'admin' ? (
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-12">
          <AdminPreview songs={songs} favorites={favorites} />
        </div>
      ) : view === 'home' ? (
        <HomeView />
      ) : (
        <SongsListView title={pageTitle} />
      )}

      <footer className="border-t border-border/60 px-5 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>© {BUILD_YEAR} WorshipVerse · A simple place for songs of faith.</span>
          <span className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent" /> Made by ANIKET with devotion for the global church.
          </span>
        </div>
      </footer>
    </>,
  )
}

function AdminPreview({ songs, favorites }: { songs: Song[]; favorites: string[] }) {
  const stats = [
    { label: 'Total songs', value: String(songs.length) },
    { label: 'Praise songs', value: String(songs.filter((s) => s.category === 'Praise').length) },
    { label: 'Worship songs', value: String(songs.filter((s) => s.category === 'Worship').length) },
    { label: 'Favorites', value: String(favorites.length) },
  ]
  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Content management</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Admin dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your song library and keep lyrics organized.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-foreground/90">
          <Plus size={17} /> Add new song
        </button>
      </div>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Song library</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your current collection</p>
            </div>
            <button className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Settings" title="Settings">
              <Settings size={18} />
            </button>
          </div>
          {songs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 text-muted-foreground" size={28} />
              <p className="font-medium text-foreground">No songs added yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add songs individually or import a CSV.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <AlbumCover song={song} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{song.title || '(Untitled)'}</p>
                      <p className="text-xs text-muted-foreground">
                        {song.category} · {song.artist || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">Edit</button>
                </div>
              ))}
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Upload className="mb-4 text-accent" size={23} />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Import songs</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Upload a CSV file to add multiple songs at once.</p>
            <button className="mt-5 w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">Choose CSV file</button>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-5 ring-1 ring-border">
            <FileText className="mb-4 text-foreground" size={21} />
            <h3 className="text-base font-semibold tracking-tight text-foreground">CSV format</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use columns: <code className="rounded bg-background px-1.5 py-0.5 text-[11px] ring-1 ring-border">title, artist, category, lyrics, featured</code>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
