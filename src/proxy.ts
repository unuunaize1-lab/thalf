import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// THALF Proxy — Host-Based Routing Layer (Next.js 16)
// ---------------------------------------------------------------------------
// This is a ROUTING layer only. It does NOT perform authorization.
// All admin API endpoints continue enforcing requireSession(),
// requireRole(), and requirePermission() server-side.
// ---------------------------------------------------------------------------

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];
const PROTECTED_CUSTOMER_PAGES = ['/profile'];
const PROTECTED_ADMIN_PAGES = ['/admin'];

// Customer-only routes that should NOT be served on the admin subdomain
const CUSTOMER_ONLY_ROUTES = [
  '/shop',
  '/cart',
  '/checkout',
  '/about',
  '/returns-refunds',
];

/**
 * Detect if the request is coming from the admin subdomain.
 * Returns false for localhost (development) so both admin and customer work.
 */
function isAdminSubdomain(host: string): boolean {
  return host.startsWith('admin.');
}

/**
 * Detect if the request is coming from a production domain (not localhost).
 */
function isProductionHost(host: string): boolean {
  return !host.startsWith('localhost') && !host.startsWith('127.0.0.1');
}

/**
 * Get the customer storefront URL for redirects.
 */
function getCustomerUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get('host') || '';
  if (isProductionHost(host)) {
    // In production, redirect to the apex domain
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const apexDomain = host.replace(/^admin\./, '');
    return new URL(path, `${protocol}://${apexDomain}`);
  }
  // In development, just use the current origin
  return new URL(path, request.url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const sessionToken = request.cookies.get('thalf_session')?.value;

  // Always allow /admin-login on all domains without auto-redirecting (client page validates admin role)
  if (pathname === '/admin-login') {
    return NextResponse.next();
  }

  // -----------------------------------------------------------------------
  // 1. Production: www.thalf.store → thalf.store (canonical redirect)
  // -----------------------------------------------------------------------
  if (host.startsWith('www.') && isProductionHost(host)) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const apexDomain = host.replace(/^www\./, '');
    const canonicalUrl = new URL(pathname + request.nextUrl.search, `${protocol}://${apexDomain}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // -----------------------------------------------------------------------
  // 2. Admin subdomain: Block customer-only pages
  // -----------------------------------------------------------------------
  if (isAdminSubdomain(host)) {
    // Block customer-only routes on admin subdomain → redirect to storefront
    const isCustomerOnlyRoute = CUSTOMER_ONLY_ROUTES.some(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    if (isCustomerOnlyRoute) {
      return NextResponse.redirect(getCustomerUrl(request, pathname));
    }

    // Redirect root to admin dashboard on admin subdomain
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin/dashboard', request.url));
    }
  }

  // -----------------------------------------------------------------------
  // 3. Customer domain (production): Block /admin/* pages (except /admin-login)
  // -----------------------------------------------------------------------
  if (!isAdminSubdomain(host) && isProductionHost(host)) {
    if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
      // Allow /admin routes if user has session or is accessing /admin
      if (!sessionToken) {
        const loginUrl = new URL('/admin-login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // -----------------------------------------------------------------------
  // 4. Guard protected routes — session cookie presence check
  // -----------------------------------------------------------------------

  // Guard customer profile pages
  const isProtectedCustomerRoute = PROTECTED_CUSTOMER_PAGES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedCustomerRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Guard admin dashboard pages
  const isProtectedAdminRoute = PROTECTED_ADMIN_PAGES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedAdminRoute && !sessionToken) {
    const loginUrl = new URL('/admin-login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // -----------------------------------------------------------------------
  // 5. Prevent logged-in users from visiting login/register pages
  // -----------------------------------------------------------------------
  const isAuthPageRoute = AUTH_PAGES.some(route => pathname.startsWith(route));
  if (isAuthPageRoute && sessionToken) {
    if (isAdminSubdomain(host)) {
      return NextResponse.redirect(new URL('/admin/orders', request.url));
    }
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
    '/admin-login',
    '/login',
    '/register',
    '/forgot-password',
    '/shop/:path*',
    '/shop',
    '/cart/:path*',
    '/cart',
    '/checkout/:path*',
    '/checkout',
    '/about/:path*',
    '/about',
    '/returns-refunds/:path*',
    '/returns-refunds',
    '/',
  ],
};
