import { NextResponse } from 'next/server';

export async function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    '/((?!api|.well-known|_next/static|_next/image|.*\\.png$).*)',
  ],
};
