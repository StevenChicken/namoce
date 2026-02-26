import { requireAdmin } from '@/lib/auth'
import { getRecentDonations, getDonationTotalForYear } from '@/features/payments/queries'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Euro } from 'lucide-react'

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDonazioniPage() {
  await requireAdmin()
  const currentYear = new Date().getFullYear()

  const [recentDonations, yearTotal] = await Promise.all([
    getRecentDonations(50),
    getDonationTotalForYear(currentYear),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-namo-charcoal">Donazioni</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Panoramica delle donazioni ricevute
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-orange/10">
              <Euro className="h-5 w-5 text-namo-orange" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Totale {currentYear}
              </p>
              <p className="text-2xl font-bold text-namo-orange">
                EUR {formatCents(yearTotal.totalCents)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-cyan/10">
              <Heart className="h-5 w-5 text-namo-cyan" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Donazioni {currentYear}
              </p>
              <p className="text-2xl font-bold text-namo-cyan">
                {yearTotal.count}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent donations table */}
      <Card>
        <CardContent className="p-0">
          {recentDonations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Donatore
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Importo
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Messaggio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map((d) => {
                    const name = [d.firstName, d.lastName]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <tr key={d.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium text-namo-charcoal">
                          {name || 'Anonimo'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {d.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-namo-green/10 text-namo-green border-namo-green/20">
                            EUR {formatCents(d.amountCents)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {d.paidAt ? formatDate(d.paidAt) : '—'}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                          {d.message || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessuna donazione ricevuta
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
