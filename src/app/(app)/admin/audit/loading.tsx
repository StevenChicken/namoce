import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function AdminAuditLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-namo-charcoal" />
        <h1 className="text-2xl font-bold">Log audit</h1>
      </div>

      {/* Filters card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
          </div>
        </CardContent>
      </Card>

      {/* Table card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          {/* Table header */}
          <Skeleton className="h-10 w-full" />
          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="mt-2 h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
