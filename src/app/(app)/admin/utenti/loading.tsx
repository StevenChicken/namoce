import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function AdminUtentiLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-namo-charcoal" />
        <h1 className="text-2xl font-bold">Gestione utenti</h1>
      </div>

      {/* Pending approvals card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-14 w-full" />
          ))}
        </CardContent>
      </Card>

      {/* All users card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          {/* Search + filter */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-32" />
          </div>
          {/* Table header */}
          <Skeleton className="h-10 w-full" />
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mt-2 h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
