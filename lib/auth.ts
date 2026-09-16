import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { jsonError } from '@/lib/validation'

const COOKIE_NAME = 'worshipverse_admin_session'
const MAX_AGE = 60 * 60 * 24 * 7

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured')
  }
  return new TextEncoder().encode(secret)
}

function timingSafeEqual(left: string, right: string) {
  const encoder = new TextEncoder()
  const a = encoder.encode(left)
  const b = encoder.encode(right)
  if (a.byteLength !== b.byteLength) {
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.byteLength; i += 1) {
    mismatch |= a[i] ^ b[i]
  }
  return mismatch === 0
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? ''
  const password = process.env.ADMIN_PASSWORD ?? ''
  return { email, password }
}

export function verifyCredentials(email: string, password: string) {
  const expected = getAdminCredentials()
  if (!expected.email || !expected.password) return false
  const emailOk = timingSafeEqual(email.trim().toLowerCase(), expected.email)
  const passwordOk = timingSafeEqual(password, expected.password)
  return emailOk && passwordOk
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret())

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function clearAdminSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function readAdminSession() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return false
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function requireAdmin() {
  const ok = await readAdminSession()
  if (!ok) {
    return jsonError('Unauthorized', 401)
  }
  return null
}

export function getSessionCookieName() {
  return COOKIE_NAME
}
