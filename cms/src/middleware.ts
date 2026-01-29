import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Define protected or global subdomains
  const protectedSubdomains = ['admin', 'www', 'api', 'dev', 'postiz', 'mail', 'system']

  // Extract subdomain (e.g., nebula.smmhub.localhost -> nebula)
  // This handles both smmhub.localhost and tenant.smmhub.localhost
  const hostnameParts = hostname.split('.')
  let subdomain = ''

  if (hostnameParts.length >= 3) {
    subdomain = hostnameParts[0].toLowerCase()
  }

  // If no subdomain or it's a protected one, proceed normally
  if (!subdomain || protectedSubdomains.includes(subdomain)) {
    return NextResponse.next()
  }

  // Inject the tenant subdomain into headers so Payload can access it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('X-Tenant-Subdomain', subdomain)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Only run middleware on admin and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
