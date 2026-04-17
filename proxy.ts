import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  // 1. Check for maintenance mode on chat routes
  if (pathname.startsWith('/chat')) {
    try {
      const origin = req.nextUrl.origin;
      if (origin && origin !== 'null') {
        const settingsRes = await fetch(`${origin}/api/admin/settings/status`);
        const settings = await settingsRes.json();
        
        if (settings.maintenanceMode && token?.role !== 'admin') {
          return NextResponse.redirect(new URL('/maintenance', req.url));
        }
      }
    } catch (e) {
      // Silent fail
    }
  }

  // 2. If user is authenticated and hits '/', '/login', or '/register', redirect to chat
  const isAuthPage = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // 3. If user is NOT authenticated and tries to access protected routes, redirect to login
  const isProtectedRoute = pathname.startsWith("/chat") || pathname.startsWith("/admin");
  if (!isAuth && isProtectedRoute) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
  }

  // 4. If user is authenticated but suspended
  if (isAuth && token.suspended && pathname !== '/suspended') {
     return NextResponse.redirect(new URL('/suspended', req.url));
  }

  // 5. Role-based protection for /admin
  if (isAuth && pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
