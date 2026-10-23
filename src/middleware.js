import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract hostname without port (e.g., "pulmocare.in:3000" -> "pulmocare.in")
  const currentHost = hostname.replace(/:\d+$/, '').toLowerCase();

  // 1. Pass through static files, Next internals, API routes, and direct admin/preview URLs
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/preview') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Subdomain check: if accessed via admin.rajbiosis.com, route to /admin
  if (currentHost.startsWith('admin.')) {
    const adminUrl = new URL(`/admin${url.pathname === '/' ? '' : url.pathname}`, request.url);
    return NextResponse.rewrite(adminUrl);
  }

  // 3. Multi-Tenant Domain Routing:
  // If request has a query param ?domain=... or ?site=..., or is an actual domain on VPS
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
  const queryDomain = url.searchParams.get('domain') || url.searchParams.get('site');
  const targetDomain = queryDomain || (!isLocalhost ? currentHost : null);

  if (targetDomain) {
    // Seamless server-side rewrite: URL bar stays "https://pulmocare.in/"
    const rewriteUrl = new URL(`/preview/${encodeURIComponent(targetDomain)}`, request.url);
    // Forward the original query parameters
    url.searchParams.forEach((val, key) => rewriteUrl.searchParams.set(key, val));
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};
