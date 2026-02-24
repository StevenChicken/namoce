import { Skeleton } from '@/components/ui/skeleton'

export default function AdminEventiLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header with title + create button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Table header */}
      <Skeleton className="h-10 w-full" />

      {/* Table rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}
