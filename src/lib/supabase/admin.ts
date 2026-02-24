import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Service role client — ONLY use in server actions and API routes.
// This bypasses RLS and has full access to all data.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
