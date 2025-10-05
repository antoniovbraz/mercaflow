import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

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

  // Only run session update for protected routes and auth pages
  const protectedPaths = ['/dashboard', '/admin', '/profile', '/settings'];
  const authPaths = ['/login', '/register'];
  const needsSession = protectedPaths.some(path => pathname.startsWith(path)) ||
                      authPaths.includes(pathname);

  if (needsSession) {
    const response = await updateSession(request);

    // Handle protected routes
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath) {
      // Check if user is authenticated by looking for session cookie
      const sessionCookie = request.cookies.get('sb-localhost-auth-token') ||
                            request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`);

      if (!sessionCookie) {
        // Not authenticated, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Redirect authenticated users away from auth pages
    const isAuthPath = authPaths.includes(pathname);

    if (isAuthPath) {
      const sessionCookie = request.cookies.get('sb-localhost-auth-token') ||
                            request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`);

      if (sessionCookie) {
        // Authenticated user trying to access auth pages, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return response;
  }

  // For all other routes, just pass through
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
