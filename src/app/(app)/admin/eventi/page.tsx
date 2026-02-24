import { Suspense } from 'react'
import { getAllEvents } from '@/features/events/queries'
import { AdminEventsView, AdminEventsViewSkeleton } from '@/components/events/admin-events-view'

export default function AdminEventiPage() {
  return (
    <Suspense fallback={<AdminEventsViewSkeleton />}>
      <AdminEventsContent />
    </Suspense>
  )
}

async function AdminEventsContent() {
  const events = await getAllEvents()

  return <AdminEventsView initialEvents={events} />
}
