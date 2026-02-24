import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'

export default function AdminEventiLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header with title + create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-cyan/10">
            <CalendarDays className="h-5 w-5 text-namo-cyan" />
          </div>
          <h1 className="page-header">Gestione eventi</h1>
        </div>
        <Skeleton className="h-9 w-36 rounded-full shimmer" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full shimmer" />
        ))}
      </div>

      {/* Table header */}
      <Skeleton className="h-10 w-full shimmer" />

      {/* Table rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full shimmer" />
      ))}
    </div>
  )
}
