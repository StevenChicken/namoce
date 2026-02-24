import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Download } from 'lucide-react'

export default function AdminExportLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-charcoal/10">
          <Download className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="page-header">Export dati</h1>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36 shimmer" />
          <Skeleton className="h-4 w-64 shimmer" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 shimmer" />
              <Skeleton className="h-9 w-40 shimmer" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 shimmer" />
              <Skeleton className="h-9 w-40 shimmer" />
            </div>
            <Skeleton className="h-9 w-32 rounded-full shimmer" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
