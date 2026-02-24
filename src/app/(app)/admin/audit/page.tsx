import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { getAuditLogEntries, getAuditActors } from '@/features/audit/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { AuditLogFilters } from '@/components/admin/audit-log-filters'
import { AuditLogTable } from '@/components/admin/audit-log-table'
import { AuditPagination } from '@/components/admin/audit-pagination'

const ITEMS_PER_PAGE = 50

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  try {
    await requireSuperAdmin()
  } catch {
    redirect('/calendario')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const actorId = params.actor || undefined
  const actionType = params.actionType || undefined
  const startDate = params.startDate ? new Date(params.startDate) : undefined
  const endDate = params.endDate
    ? new Date(params.endDate + 'T23:59:59.999Z')
    : undefined

  const [{ entries, totalCount }, actors] = await Promise.all([
    getAuditLogEntries({
      actorId,
      actionType,
      startDate,
      endDate,
      page,
      limit: ITEMS_PER_PAGE,
    }),
    getAuditActors(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-namo-charcoal/5">
          <FileText className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="text-2xl font-bold text-namo-charcoal">Log audit</h1>
      </div>

      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Filtri</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Suspense fallback={null}>
            <AuditLogFilters actors={actors} />
          </Suspense>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base">
            Registro attività
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount} {totalCount === 1 ? 'voce' : 'voci'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessuna voce trovata
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AuditLogTable entries={entries} />
              <div className="px-6 pb-4">
                <Suspense fallback={null}>
                  <AuditPagination currentPage={page} totalPages={totalPages} />
                </Suspense>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
