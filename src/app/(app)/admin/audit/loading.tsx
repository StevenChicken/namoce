import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function AdminAuditLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-charcoal/10">
          <FileText className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="page-header">Log audit</h1>
      </div>

      {/* Filters card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-16 shimmer" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-9 flex-1 shimmer" />
            <Skeleton className="h-9 w-40 shimmer" />
            <Skeleton className="h-9 w-36 shimmer" />
            <Skeleton className="h-9 w-36 shimmer" />
          </div>
        </CardContent>
      </Card>

      {/* Table card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44 shimmer" />
        </CardHeader>
        <CardContent>
          {/* Table header */}
          <Skeleton className="h-10 w-full shimmer" />
          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="mt-2 h-12 w-full shimmer" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
