import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/calendario_eventi'
  const redirectEvent = searchParams.get('redirect_event')

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If redirect_event is present, redirect to public calendar with register param
      if (redirectEvent) {
        return NextResponse.redirect(
          `${origin}/calendario_eventi?register=${redirectEvent}`
        )
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth code error — redirect to login with error
  return NextResponse.redirect(`${origin}/accedi?error=auth_callback`)
}
