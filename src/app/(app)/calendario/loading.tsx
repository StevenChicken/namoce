import { CalendarDays } from 'lucide-react'
import { EventCardSkeleton } from '@/components/events/event-card'

export default function CalendarioLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-cyan/10">
          <CalendarDays className="h-5 w-5 text-namo-cyan" />
        </div>
        <h1 className="page-header">
          Calendario eventi
        </h1>
      </div>

      {/* Filter skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded bg-accent shimmer" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 animate-pulse rounded-full bg-accent shimmer"
            />
          ))}
        </div>
      </div>

      {/* Month header skeleton */}
      <div className="h-6 w-36 animate-pulse rounded bg-accent shimmer" />

      {/* Event card skeletons */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
