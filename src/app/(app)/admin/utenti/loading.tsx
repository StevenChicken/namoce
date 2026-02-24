import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function AdminUtentiLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-charcoal/10">
          <Users className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="page-header">Gestione utenti</h1>
      </div>

      {/* Pending approvals card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44 shimmer" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full shimmer" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-14 w-full shimmer" />
          ))}
        </CardContent>
      </Card>

      {/* All users card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32 shimmer" />
        </CardHeader>
        <CardContent>
          {/* Search + filter */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-9 flex-1 shimmer" />
            <Skeleton className="h-9 w-32 shimmer" />
          </div>
          {/* Table header */}
          <Skeleton className="h-10 w-full shimmer" />
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mt-2 h-14 w-full shimmer" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
