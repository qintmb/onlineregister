import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  if (isDashboard && !adminSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoginPage && adminSession) {
    return NextResponse.redirect(new URL('/dashboard/daftar-hadir', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
