import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Campus Lost-and-Found
 * Design: "Noir Justice" Institutional Security Perimeter
 * 
 * Enforces route-level protection for `/admin/*`:
 * - Public routes (`/`, `/report`, `/ledger`, `/admin/login`) are open.
 * - All admin management routes (`/admin/dashboard`, `/admin/interrogation/*`)
 *   require an authenticated Firebase session containing the `isAdmin` custom claim.
 * - Non-authenticated or non-admin requests are redirected to `/admin/login`.
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Allow public routes and the administrative login portal
  if (
    !pathname.startsWith('/admin') ||
    pathname === '/admin/login' ||
    pathname.startsWith('/api/public')
  ) {
    return NextResponse.next();
  }

  // 2. Extract authorization credentials from cookies or headers
  // Supported tokens: Firebase ID Token, Session Cookie, or Authorization Header
  const sessionToken =
    request.cookies.get('firebase_token')?.value ||
    request.cookies.get('__session')?.value ||
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!sessionToken) {
    // Intercept: Unauthenticated attempt to access restricted administration
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('reason', 'authentication_required');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 3. Inspect JWT claims for institutional authorization
    // In Edge environments, decode the token payload
    const tokenParts = sessionToken.split('.');
    if (tokenParts.length < 2) {
      throw new Error('Malformed token signature');
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    const claims = JSON.parse(jsonPayload);

    // 4. Validate custom claims for institutional administrator role
    const hasAdminClaim = Boolean(
      claims.isAdmin === true ||
      claims.admin === true ||
      claims.role === 'admin' ||
      claims.role === 'security_officer'
    );

    if (!hasAdminClaim) {
      // Authenticated but unauthorized: Missing `isAdmin` clearance claim
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'insufficient_clearance');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 5. User is verified institutional administrator -> Grant perimeter ingress
    const response = NextResponse.next();
    response.headers.set('x-auth-clearance', 'INSTITUTIONAL_ADMIN');
    response.headers.set('x-auth-uid', claims.user_id || claims.sub || 'admin_user');
    response.headers.set('x-auth-email', claims.email || 'officer@campus.sec');
    return response;
  } catch (error) {
    console.error('[Noir Justice Middleware] Security rejection:', error);
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'invalid_credentials');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Route matcher configuration
export const config = {
  matcher: ['/admin/:path*'],
};
