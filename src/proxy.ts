import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    // If the request comes from within our own application (e.g. clicking the Home button),
    // skip the startup redirect. We only want to redirect on fresh startup visits.
    const referer = request.headers.get('referer');
    if (referer && referer.startsWith(request.nextUrl.origin)) {
      return NextResponse.next();
    }

    const startupUrl = request.cookies.get('evalugence_startup_url')?.value;
    if (startupUrl && (startupUrl === '/lab' || startupUrl === '/dashboard')) {
      return NextResponse.redirect(new URL(startupUrl, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
