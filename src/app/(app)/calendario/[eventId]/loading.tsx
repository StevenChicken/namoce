import { ArrowLeft } from 'lucide-react'

export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link */}
      <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Torna al calendario
      </div>

      {/* Sector badges skeleton */}
      <div className="flex gap-2">
        <div className="h-7 w-28 animate-pulse rounded-full bg-namo-cyan/10 shimmer" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-namo-cyan/10 shimmer" />
      </div>

      {/* Title skeleton */}
      <div className="h-9 w-3/4 animate-pulse rounded bg-accent shimmer" />

      {/* Info card skeleton */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 animate-pulse rounded bg-accent shimmer" />
            <div className="h-5 w-48 animate-pulse rounded bg-accent shimmer" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="h-14 w-full animate-pulse rounded-full bg-accent shimmer" />
    </div>
  )
}
