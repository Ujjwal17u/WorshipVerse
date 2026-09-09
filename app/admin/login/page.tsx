'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandMark } from '@/components/brand-mark'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Unable to sign in.')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Unable to sign in.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-5 lg:px-8">
        <BrandMark />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-24">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Admin</span>
          <h1 className="mt-3 text-3xl text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage songs, lyrics, and CSV imports.</p>
          {error && <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    </div>
  )
}
