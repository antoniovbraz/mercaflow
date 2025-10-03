import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/private']
// Rotas que requerem role específico
const adminRoutes = ['/admin']
// Rotas públicas (não precisam autenticação)
const publicRoutes = ['/', '/login', '/register', '/auth', '/error']

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Bloquear rotas de desenvolvimento em produção
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/(development)')) {
    return NextResponse.rewrite(new URL('/', request.url))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Refresh session only - Server Components handle authentication logic
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificação básica de autenticação (sem redirects - delegado aos Server Components)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // Log da verificação (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - User: ${user ? 'authenticated' : 'anonymous'}`)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: NextResponse.next({ request })
  // 2. Copy over the cookies, like so: response.cookies.getAll().forEach(...)
  // 3. Change the response's status code if needed, like so: response.status = 200
  // 4. Set headers, if needed, like so: response.headers.set(...)

  return supabaseResponse
}