import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const isVerified = req.cookies.get('isVerified')?.value; // if you set it as cookie
  const hasPin = req.cookies.get('hasPin')?.value; // if you set it as cookie
  const { pathname } = req.nextUrl;

  // ✅ Allow static files & API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.png') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ Public: login
  if (pathname.startsWith('/login')) {
    if (accessToken && isVerified) {
      return NextResponse.redirect(new URL('/overview', req.url));
    }
    if (accessToken && hasPin && !isVerified) {
      return NextResponse.redirect(new URL('/pin', req.url));
    }
    if (accessToken && !hasPin && !isVerified) {
      return NextResponse.redirect(new URL('/reset-pin', req.url));
    }
    return NextResponse.next();
  }

  // ✅ Semi-protected: pin
  if (pathname.startsWith('/pin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (accessToken && hasPin && isVerified) {
      return NextResponse.redirect(new URL('/overview', req.url));
    }
    if (accessToken && !hasPin && isVerified) {
      return NextResponse.redirect(new URL('/reset-pin', req.url));
    }
    return NextResponse.next();
  }

  // ✅ Semi-protected: reset pin
  if (pathname.startsWith('/reset-pin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // ✅ Semi-protected: reset pin
  if (pathname.startsWith('/otp-reset-pin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // ✅ Root `/`
  if (pathname === '/') {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (accessToken && hasPin && isVerified) {
      return NextResponse.redirect(new URL('/overview', req.url));
    }
    if (accessToken && hasPin && !isVerified) {
      return NextResponse.redirect(new URL('/pin', req.url));
    }
    if (accessToken && !hasPin && !isVerified) {
      return NextResponse.redirect(new URL('/reset-pin', req.url));
    }
  }

  // ✅ Protected pages
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (accessToken && hasPin && !isVerified) {
    return NextResponse.redirect(new URL('/pin', req.url));
  }
  if (accessToken && !hasPin && !isVerified) {
    return NextResponse.redirect(new URL('/reset-pin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
