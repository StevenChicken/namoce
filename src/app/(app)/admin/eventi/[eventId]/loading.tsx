import { Skeleton } from '@/components/ui/skeleton'

export default function AdminEventDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-36" />

      {/* Title */}
      <Skeleton className="h-8 w-64" />

      {/* Status badges */}
      <div className="flex gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Info card */}
      <Skeleton className="h-24 w-full rounded-lg" />

      {/* Actions bar */}
      <Skeleton className="h-10 w-full" />

      {/* Registration rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
