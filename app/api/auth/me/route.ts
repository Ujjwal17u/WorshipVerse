import { readAdminSession } from '@/lib/auth'

export async function GET() {
  const authenticated = await readAdminSession()
  if (!authenticated) {
    return Response.json({ authenticated: false }, { status: 401 })
  }
  return Response.json({ authenticated: true })
}
