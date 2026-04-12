import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect chat and admin routes
  if (pathname.startsWith('/chat') || pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based protection for /admin
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', req.url));
    }

    // Suspended check (from token)
    if (token.suspended && pathname !== '/suspended') {
      return NextResponse.redirect(new URL('/suspended', req.url));
    }
  }

  // Maintenance mode check
  // Since we can't easily query DB in Edge Middleware without a slow fetch,
  // we'll check it only on specific routes to minimize impact.
  if (pathname.startsWith('/chat')) {
    try {
      // In production, you might want to cache this or use an Edge-compatible DB / KV
      // For now, we fetch from an internal API that handles the DB connection
      const settingsRes = await fetch(`${req.nextUrl.origin}/api/admin/settings/status`);
      const settings = await settingsRes.json();
      
      if (settings.maintenanceMode && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
    } catch (e) {
      // Silent fail to not block users if status API is down
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*', '/suspended'],
};
