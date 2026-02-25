import { Suspense } from 'react'
import { getAllEvents } from '@/features/events/queries'
import { getUserCategoryPermissions } from '@/features/users/queries'
import { requireAdmin } from '@/lib/auth'
import { EventCategories } from '@/types/enums'
import { AdminEventsView, AdminEventsViewSkeleton } from '@/components/events/admin-events-view'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default function AdminEventiPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<AdminEventsViewSkeleton />}>
        <AdminEventsContent />
      </Suspense>
    </div>
  )
}

async function AdminEventsContent() {
  const userId = await requireAdmin()

  // Determine allowed categories for this admin
  const user = await db
    .select({ adminLevel: users.adminLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => rows[0])

  let allowedCategories: string[] | undefined
  if (user?.adminLevel !== 'super_admin') {
    const perms = await getUserCategoryPermissions(userId)
    allowedCategories = perms.map((p) => p.category)
  }

  const events = await getAllEvents()

  return (
    <AdminEventsView
      initialEvents={events}
      allowedCategories={allowedCategories ?? [...EventCategories]}
    />
  )
}
