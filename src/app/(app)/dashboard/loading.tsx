import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, ClipboardCheck, History, Download } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="h-8 w-48 animate-pulse rounded bg-accent shimmer" />

      {/* Prossimi eventi */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-namo-cyan" />
          <h2 className="section-header">
            Prossimi eventi
          </h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-20 rounded-full shimmer" />
                  </div>
                  <Skeleton className="h-6 w-3/4 shimmer" />
                  <Skeleton className="h-4 w-48 shimmer" />
                  <Skeleton className="h-4 w-32 shimmer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Riepilogo presenze */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-namo-green" />
          <h2 className="section-header">
            Riepilogo presenze
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-4">
                <Skeleton className="h-4 w-28 shimmer" />
                <Skeleton className="h-7 w-16 shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Attivita recente */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-namo-orange" />
          <h2 className="section-header">
            Attività recente
          </h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-4 w-48 shimmer" />
                    <Skeleton className="h-3 w-24 shimmer" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full shimmer" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Esporta */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-namo-charcoal" />
          <h2 className="section-header">
            Esporta
          </h2>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Skeleton className="h-9 w-52 rounded-full shimmer" />
            <Skeleton className="h-9 w-52 rounded-full shimmer" />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
