import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas públicas (não requerem autenticação)
  const publicRoutes = [
    '/',
    '/login',
    '/register', 
    '/forgot-password',
    '/api/auth/ml/login',
    '/api/auth/ml/callback',
    '/api/webhooks/ml',
    '/api/test'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith('/api/auth/')
  )

  // Se não está logado e tenta acessar rota protegida
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se está logado e tenta acessar login/register, redirecionar para dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Proteção específica para rotas admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar se é super admin
    try {
      const { data: platformOwner } = await supabase
        .from('platform_owners')
        .select('role')
        .eq('email', session.user.email)
        .single()

      if (!platformOwner || platformOwner.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}