import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { AttendanceExportForm } from '@/components/admin/attendance-export-form'

export default async function AdminExportPage() {
  try {
    await requireSuperAdmin()
  } catch {
    redirect('/calendario')
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-namo-charcoal/5">
          <Download className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="text-2xl font-bold text-namo-charcoal">Export dati</h1>
      </div>

      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Esporta presenze</CardTitle>
          <CardDescription>
            Esporta le presenze dei volontari nel periodo selezionato
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AttendanceExportForm />
        </CardContent>
      </Card>
    </div>
  )
}
