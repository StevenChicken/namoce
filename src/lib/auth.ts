import 'server-only'

import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function requireAuthenticated() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Non autenticato')
  }

  return user.id
}

export async function requireSuperAdmin() {
  const userId = await requireAuthenticated()

  const result = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!result[0] || result[0].role !== 'super_admin') {
    throw new Error('Non autorizzato')
  }

  return userId
}
