import { NextRequest, NextResponse } from 'next/server';

export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected Admin Routes Check
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const authHeader = req.headers.get('authorization');
    const sessionCookie = req.cookies.get('better-auth.session_token');

    if (!authHeader && !sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), req.url));
    }
  }

  return NextResponse.next();
}
