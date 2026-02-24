import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function AdminEventDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span>Torna alla lista</span>
      </div>

      {/* Title */}
      <Skeleton className="h-8 w-64 shimmer" />

      {/* Status badges */}
      <div className="flex gap-3">
        <Skeleton className="h-6 w-20 rounded-full shimmer" />
        <Skeleton className="h-6 w-24 rounded-full shimmer" />
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 shimmer" />
              <Skeleton className="h-5 w-48 shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-full shimmer" />
        <Skeleton className="h-10 w-28 rounded-full shimmer" />
      </div>

      {/* Registration rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full shimmer" />
        ))}
      </div>
    </div>
  )
}
