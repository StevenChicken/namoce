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
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Download className="h-7 w-7 text-namo-charcoal" />
        <h1 className="text-2xl font-bold">Export dati</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Esporta presenze</CardTitle>
          <CardDescription>
            Esporta le presenze dei volontari nel periodo selezionato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceExportForm />
        </CardContent>
      </Card>
    </div>
  )
}
