import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasRole, UserRole } from "@/utils/supabase/roles";

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

  // Define route protection rules
  const routeProtection = {
    // Public routes (no auth required)
    public: ['/', '/login', '/register', '/forgot-password', '/update-password', '/auth/callback'],

    // Protected routes by minimum role
    protected: {
      '/dashboard': 'user',
      '/admin': 'admin',
      '/super-admin': 'super_admin',
    }
  };

  // Check if route is public
  const isPublicRoute = routeProtection.public.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // Check if route is protected
  const protectedRoute = Object.entries(routeProtection.protected).find(([path]) =>
    pathname.startsWith(path)
  );

  // For protected routes, check authentication and authorization
  if (protectedRoute) {
    const [, requiredRole] = protectedRoute;

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

    // Check if user has required role
    try {
      const hasRequiredRole = await hasRole(requiredRole as UserRole);
      if (!hasRequiredRole) {
        // Insufficient permissions, redirect to dashboard with error
        const dashboardUrl = new URL('/dashboard', request.url);
        dashboardUrl.searchParams.set('error', 'Você não tem permissão para acessar esta página');
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (error) {
      console.error('Error checking role:', error);
      // On error, redirect to dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'Erro ao verificar permissões');
      return NextResponse.redirect(dashboardUrl);
    }

    // User is authenticated and authorized, proceed with session update
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
