import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/features/events/queries'
import {
  getRegistrationsByEventId,
} from '@/features/registrations/queries'
import { getActiveVolunteers } from '@/features/users/queries'
import { getEventAttendanceSummary } from '@/features/attendance/queries'
import { AdminEventDetail } from '@/components/events/admin-event-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { eventId } = await params

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href="/admin/eventi"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-namo-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna agli eventi
      </Link>

      <Suspense fallback={<AdminEventDetailSkeleton />}>
        <AdminEventDetailContent eventId={eventId} />
      </Suspense>
    </div>
  )
}

async function AdminEventDetailContent({ eventId }: { eventId: string }) {
  const [event, internalRegs, volunteers, attendanceSummary] = await Promise.all([
    getEventById(eventId),
    getRegistrationsByEventId(eventId),
    getActiveVolunteers(),
    getEventAttendanceSummary(eventId),
  ])

  if (!event) {
    notFound()
  }

  const serializedInternalRegs = internalRegs.map((r) => ({
    ...r,
    registeredAt: r.registeredAt.toISOString(),
    cancelledAt: r.cancelledAt?.toISOString() ?? null,
  }))

  const totalConfirmed =
    internalRegs.filter((r) => r.status === 'confirmed').length

  const isFull = event.capacity !== null && totalConfirmed >= event.capacity

  return (
    <AdminEventDetail
      event={{
        id: event.id,
        title: event.title,
        type: event.type,
        status: event.status,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
        location: event.location,
        capacity: event.capacity,
        sectors: event.sectors,
        confirmedCount: event.confirmedCount,
        waitlistCount: event.waitlistCount,
        attendanceGracePeriodHours: event.attendanceGracePeriodHours,
      }}
      internalRegistrations={serializedInternalRegs}
      externalRegistrations={[]}
      volunteers={volunteers}
      isFull={isFull}
      attendanceSummary={attendanceSummary}
    />
  )
}

function AdminEventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
