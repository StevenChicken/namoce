import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Download } from 'lucide-react'

export default function AdminExportLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Download className="h-7 w-7 text-namo-charcoal" />
        <h1 className="text-2xl font-bold">Export dati</h1>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-40" />
            </div>
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
