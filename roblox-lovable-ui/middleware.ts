import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const currentPath = request.nextUrl.pathname;
  
  // Skip middleware for auth pages and API routes
  if (currentPath.startsWith('/auth/') || currentPath.startsWith('/api/')) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Use getSession instead of getUser for better performance in middleware
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  // Protected routes
  const protectedRoutes = ['/generator', '/projects', '/settings', '/profile'];

  // If user is not authenticated and trying to access protected route
  if (!user && protectedRoutes.some(route => currentPath.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Legacy project cookie check - still redirect authenticated users with projects
  const hasProject = request.cookies.get('roblox_has_project');
  if (currentPath === '/' && user && hasProject) {
    return NextResponse.redirect(new URL('/generator', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|test-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};