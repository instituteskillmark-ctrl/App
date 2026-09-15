import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  // If env vars are placeholders, allow access in local developer mode so app renders
  const isPlaceholder = supabaseUrl.includes('YOUR_PROJECT_ID') || supabaseUrl.includes('placeholder');

  if (isPlaceholder) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect private application routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isPublicRoute = isAuthRoute || request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/api/health');

  if (!user && !isPublicRoute) {
    // Redirect to login if unauthenticated and trying to access private OS routes
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Redirect to dashboard if logged in
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
