import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/features/events/queries'
import {
  getRegistrationsByEventId,
  getExternalRegistrationsByEventId,
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
    <div className="space-y-6">
      <Link
        href="/admin/eventi"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-namo-charcoal"
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
  const [event, internalRegs, externalRegs, volunteers, attendanceSummary] = await Promise.all([
    getEventById(eventId),
    getRegistrationsByEventId(eventId),
    getExternalRegistrationsByEventId(eventId),
    getActiveVolunteers(),
    getEventAttendanceSummary(eventId),
  ])

  if (!event) {
    notFound()
  }

  // Serialize dates for client components
  const serializedInternalRegs = internalRegs.map((r) => ({
    ...r,
    registeredAt: r.registeredAt.toISOString(),
    cancelledAt: r.cancelledAt?.toISOString() ?? null,
  }))

  const serializedExternalRegs = externalRegs.map((r) => ({
    id: r.id,
    eventId: r.eventId,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    status: r.status,
    registeredAt: r.registeredAt.toISOString(),
    cancelledAt: r.cancelledAt?.toISOString() ?? null,
  }))

  const totalConfirmed =
    internalRegs.filter((r) => r.status === 'confirmed').length +
    externalRegs.filter((r) => r.status === 'confirmed').length

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
      externalRegistrations={serializedExternalRegs}
      volunteers={volunteers}
      isFull={isFull}
      attendanceSummary={attendanceSummary}
    />
  )
}

function AdminEventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
