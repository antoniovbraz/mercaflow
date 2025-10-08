import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Role hierarchy levels
const ROLE_LEVELS = {
  user: 1,
  admin: 2,
  super_admin: 3,
} as const

export type UserRole = keyof typeof ROLE_LEVELS

// Helper function for middleware-specific role checking
async function hasRoleInMiddleware(supabase: ReturnType<typeof createServerClient>, requiredRole: UserRole): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Check JWT claims first
    const roleFromClaims = user.app_metadata?.app_role as UserRole
    if (roleFromClaims && roleFromClaims in ROLE_LEVELS) {
      return ROLE_LEVELS[roleFromClaims] >= ROLE_LEVELS[requiredRole]
    }
    
    // Check super admin emails
    if (user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com') {
      return ROLE_LEVELS['super_admin'] >= ROLE_LEVELS[requiredRole]
    }
    
    // Default to user role for authenticated users
    return ROLE_LEVELS['user'] >= ROLE_LEVELS[requiredRole]
  } catch (error) {
    console.error('Error checking role in middleware:', error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/super-admin'];
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/update-password', '/auth/callback'];

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  // For protected routes, check authentication
  if (isProtectedRoute) {
    // Create Supabase client for this request
    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For /admin routes, check if user has admin role (basic check)
    if (pathname.startsWith('/admin')) {
      try {
        const hasAdminRole = await hasRoleInMiddleware(supabase, 'admin');
        if (!hasAdminRole) {
          const dashboardUrl = new URL('/dashboard', request.url);
          dashboardUrl.searchParams.set('error', 'Você não tem permissão para acessar esta página');
          return NextResponse.redirect(dashboardUrl);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        // On error, allow access to dashboard but not admin
        const dashboardUrl = new URL('/dashboard', request.url);
        dashboardUrl.searchParams.set('error', 'Erro ao verificar permissões');
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // User is authenticated, proceed with session update
    return await updateSession(request);
  }

  // For auth pages, redirect authenticated users to dashboard
  const authPages = ['/login', '/register', '/forgot-password'];
  if (authPages.includes(pathname)) {
    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Authenticated user trying to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Proceed with session update for auth pages
    return await updateSession(request);
  }

  // For other routes, just update session if needed
  if (!isPublicRoute) {
    return await updateSession(request);
  }

  // For truly public routes, pass through
  return NextResponse.next();
}export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
