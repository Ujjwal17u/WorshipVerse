'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, LayoutDashboard, LogOut, Music2, Plus, Upload } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { ThemeToggle } from '@/components/theme-toggle'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const linkClass = (href: string) =>
    `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
      pathname === href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/admin" className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Admin navigation">
            <Link href="/admin" className={linkClass('/admin')}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/admin/songs" className={linkClass('/admin/songs')}>
              <Music2 size={16} /> Manage Songs
            </Link>
            <Link href="/admin/songs/new" className={linkClass('/admin/songs/new')}>
              <Plus size={16} /> Add Song
            </Link>
            <Link href="/admin/import" className={linkClass('/admin/import')}>
              <Upload size={16} /> Import CSV
            </Link>
            <Link href="/" className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              View site
            </Link>
            <ThemeToggle />
            <button onClick={logout} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <LogOut size={16} /> Sign out
            </button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button onClick={logout} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-5 py-3 md:hidden">
          <Link href="/admin" className={linkClass('/admin')}>
            Dashboard
          </Link>
          <Link href="/admin/songs" className={linkClass('/admin/songs')}>
            Songs
          </Link>
          <Link href="/admin/songs/new" className={linkClass('/admin/songs/new')}>
            Add
          </Link>
          <Link href="/admin/import" className={linkClass('/admin/import')}>
            Import
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-12">{children}</main>
    </div>
  )
}

export function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'error' | 'success' }) {
  const classes =
    tone === 'error'
      ? 'border-destructive/30 bg-destructive/10 text-destructive'
      : tone === 'success'
        ? 'border-[#ead9a8] bg-[#fbf6ea] text-[#5c4a1f] dark:border-accent/30 dark:bg-secondary dark:text-accent'
        : 'border-border bg-card text-muted-foreground'
  return <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${classes}`}>{children}</div>
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <FileText className="mx-auto mb-4 text-muted-foreground" size={30} />
      <h2 className="text-xl">{title}</h2>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
    </div>
  )
}
