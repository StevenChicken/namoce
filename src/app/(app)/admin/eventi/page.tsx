import { Suspense } from 'react'
import { getAllEvents } from '@/features/events/queries'
import { AdminEventsView, AdminEventsViewSkeleton } from '@/components/events/admin-events-view'

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
  const events = await getAllEvents()

  return <AdminEventsView initialEvents={events} />
}
