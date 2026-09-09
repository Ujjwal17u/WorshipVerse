import { NextRequest } from 'next/server'
import { createAdminSession, verifyCredentials } from '@/lib/auth'
import { jsonError } from '@/lib/validation'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const email = typeof source.email === 'string' ? source.email : ''
  const password = typeof source.password === 'string' ? source.password : ''

  if (!email || !password) {
    return jsonError('Email and password are required.', 400)
  }

  if (!verifyCredentials(email, password)) {
    return jsonError('Invalid email or password.', 401)
  }

  await createAdminSession()
  return Response.json({ ok: true })
}
