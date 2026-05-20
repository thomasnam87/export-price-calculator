import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/access', '/api/check-access', '/api/parse-forwarder', '/_next', '/favicon'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check access cookie
  const accessCookie = req.cookies.get('epc_access')?.value;
  const validCode = process.env.ACCESS_CODE;

  // If no ACCESS_CODE configured, allow all (dev mode)
  if (!validCode) return NextResponse.next();

  if (accessCookie !== validCode) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/access';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
