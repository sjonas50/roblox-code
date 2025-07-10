import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user has a saved project (using cookies since localStorage isn't available in middleware)
  const hasProject = request.cookies.get('roblox_has_project');
  
  // If accessing root with a project cookie, redirect to generator
  if (request.nextUrl.pathname === '/' && hasProject) {
    return NextResponse.redirect(new URL('/generator', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};