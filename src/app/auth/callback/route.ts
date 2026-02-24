import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/calendario'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user is pending
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('status')
          .eq('id', user.id)
          .single()

        if (profile?.status === 'pending') {
          return NextResponse.redirect(`${origin}/in-attesa`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth code error — redirect to login with error
  return NextResponse.redirect(`${origin}/accedi?error=auth_callback`)
}
