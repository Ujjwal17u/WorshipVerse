import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'worshipverse_admin_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const secret = process.env.AUTH_SECRET
  if (!token || !secret) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.headers.set('Cache-Control', 'no-store')
    return response
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    if (payload.role !== 'admin') throw new Error('Invalid admin role')
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    return response
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
