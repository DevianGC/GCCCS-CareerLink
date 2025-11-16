import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Protect dashboard routes using presence of session cookie.
export function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isProtected = pathname.startsWith('/dashboard');
  if (!isProtected) return NextResponse.next();

  // Temporarily allow access to faculty-mentor dashboard without authentication
  if (pathname.startsWith('/dashboard/faculty-mentor')) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;
  if (!session) {
    // Redirect to appropriate login based on dashboard type
    if (pathname.startsWith('/dashboard/alumni')) {
      return NextResponse.redirect(new URL('/alumni/login', request.url));
    } else if (pathname.startsWith('/dashboard/employer')) {
      return NextResponse.redirect(new URL('/employer/login', request.url));
    } else if (pathname.startsWith('/dashboard/career-office')) {
      return NextResponse.redirect(new URL('/career-office/login', request.url));
    } else {
      // Redirect to role selection page for students and other roles
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};


