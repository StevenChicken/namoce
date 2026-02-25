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
    .select({ adminLevel: users.adminLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!result[0] || result[0].adminLevel !== 'super_admin') {
    throw new Error('Non autorizzato')
  }

  return userId
}

export async function requireAdmin() {
  const userId = await requireAuthenticated()

  const result = await db
    .select({ adminLevel: users.adminLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (
    !result[0] ||
    (result[0].adminLevel !== 'admin' && result[0].adminLevel !== 'super_admin')
  ) {
    throw new Error('Non autorizzato')
  }

  return userId
}

export async function requireVolunteerOrAdmin() {
  const userId = await requireAuthenticated()

  const result = await db
    .select({ userType: users.userType, adminLevel: users.adminLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!result[0]) {
    throw new Error('Non autorizzato')
  }

  const { userType, adminLevel } = result[0]
  const isVolunteer = userType === 'volontario'
  const isAdmin = adminLevel === 'admin' || adminLevel === 'super_admin'

  if (!isVolunteer && !isAdmin) {
    throw new Error('Non autorizzato')
  }

  return userId
}
