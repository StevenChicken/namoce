import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Bell } from 'lucide-react'

export default function ProfiloLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="h-8 w-40 animate-pulse rounded bg-accent shimmer" />

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full shimmer" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-40 shimmer" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full shimmer" />
                <Skeleton className="h-5 w-20 rounded-full shimmer" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-52 shimmer" />
            <Skeleton className="h-4 w-44 shimmer" />
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-36 shimmer" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-24 rounded-full shimmer" />
              <Skeleton className="h-5 w-28 rounded-full shimmer" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-namo-cyan" />
            <Skeleton className="h-5 w-40 shimmer" />
          </div>
          <Skeleton className="h-4 w-56 shimmer" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48 shimmer" />
            <Skeleton className="h-6 w-10 rounded-full shimmer" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
