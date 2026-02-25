import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't need auth
  const isPublicRoute =
    pathname.startsWith('/calendario_eventi') ||
    pathname.startsWith('/eventi') ||
    pathname.startsWith('/donazioni') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/accedi') ||
    pathname.startsWith('/registrati') ||
    pathname.startsWith('/recupera-password') ||
    pathname.startsWith('/reimposta-password') ||
    pathname.startsWith('/auth')

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/accedi'
    return NextResponse.redirect(url)
  }

  // If authenticated, check user status and role from public.users
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('status, admin_level')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Suspended users get logged out
      if (profile.status === 'suspended') {
        await supabase.auth.signOut()
        const url = request.nextUrl.clone()
        url.pathname = '/accedi'
        url.searchParams.set('error', 'account_suspended')
        return NextResponse.redirect(url)
      }

      // Non-admins cannot access /admin routes
      if (
        pathname.startsWith('/admin') &&
        profile.admin_level !== 'admin' &&
        profile.admin_level !== 'super_admin'
      ) {
        const url = request.nextUrl.clone()
        url.pathname = '/calendario_eventi'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
