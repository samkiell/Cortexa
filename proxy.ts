import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  // 1. If user is authenticated and hits '/', '/login', or '/register', redirect to chat
  const isAuthPage = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // 2. If user is NOT authenticated and tries to access protected routes, redirect to login
  const isProtectedRoute = pathname.startsWith("/chat") || pathname.startsWith("/admin");
  if (!isAuth && isProtectedRoute) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
  }

  // 3. If user is authenticated but tries to access admin routes without admin role
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
